'use strict';
/**
 * BizAssist AI — Knowledge Base Ingestion Pipeline
 * Chunks documents, generates Gemini embeddings (768-dim), and stores them in Supabase pgvector.
 * Run locally or in CI: node scripts/ingest.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// 1. Load environment variables
for (const envFile of ['.env.local', '.env']) {
  const envPath = path.join(rootDir, envFile);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (match && !process.env[match[1]]) {
        const val = match[2].trim().replace(/^['"]|['"]$/g, '');
        process.env[match[1]] = val;
      }
    }
  }
}

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!GEMINI_KEY) {
  console.error('Error: GEMINI_API_KEY is missing in environment.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || 'gemini-embedding-001';
const DIM = 768;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Text Chunking with overlap
 */
function chunkText(text, maxChars = 500, overlap = 60) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxChars) {
    return [clean];
  }

  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    let end = start + maxChars;
    if (end >= clean.length) {
      chunks.push(clean.slice(start).trim());
      break;
    }

    // Try finding sentence or period boundary near end
    let cut = clean.lastIndexOf('. ', end);
    if (cut === -1 || cut < start + maxChars * 0.5) {
      // Try space boundary
      cut = clean.lastIndexOf(' ', end);
    }
    if (cut === -1 || cut <= start) {
      cut = end;
    } else {
      cut += 1; // include period or space
    }

    chunks.push(clean.slice(start, cut).trim());
    start = cut - overlap;
    if (start < 0) start = 0;
  }
  return chunks.filter(c => c.length > 20);
}

/**
 * Generate 768-dim embedding with retry
 */
async function generateEmbedding(text, attempt = 1) {
  try {
    const res = await ai.models.embedContent({
      model: EMBED_MODEL,
      contents: text,
      config: { outputDimensionality: DIM }
    });
    return res.embeddings[0].values;
  } catch (err) {
    if (err.message && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED')) && attempt <= 5) {
      const waitTime = attempt * 2000;
      console.warn(`[Ingest] Rate limit hit. Backing off for ${waitTime}ms (attempt ${attempt})...`);
      await sleep(waitTime);
      return generateEmbedding(text, attempt + 1);
    }
    throw err;
  }
}

/**
 * Gather all knowledge documents from application content sources
 */
async function collectAllDocuments() {
  const allDocs = new Map();

  // A. kb/knowledge-base.json (13 core platform knowledge entries)
  const kbJsonPath = path.join(rootDir, 'kb', 'knowledge-base.json');
  if (fs.existsSync(kbJsonPath)) {
    try {
      const kbData = JSON.parse(fs.readFileSync(kbJsonPath, 'utf8'));
      kbData.forEach(d => {
        allDocs.set(d.id, {
          id: d.id,
          title: d.title,
          category: d.category || 'General',
          content: d.text,
          source: 'kb/knowledge-base.json',
          tags: d.keywords || []
        });
      });
    } catch (e) {
      console.warn('Could not read kb/knowledge-base.json:', e.message);
    }
  }

  // B. STARTER_ARTICLES from js/store.js (12 operational customer documentation articles)
  const storePath = path.join(rootDir, 'js', 'store.js');
  if (fs.existsSync(storePath)) {
    try {
      const content = fs.readFileSync(storePath, 'utf8');
      const match = content.match(/const STARTER_ARTICLES = (\[[\s\S]*?\]);\s*\/\//);
      if (match) {
        // Evaluate starter articles safely
        const articles = (new Function(`return ${match[1]}`))();
        articles.forEach(a => {
          if (!allDocs.has(a.id)) {
            allDocs.set(a.id, {
              id: a.id,
              title: a.title,
              category: a.category || 'Documentation',
              content: `${a.summary} ${a.content}`,
              source: 'js/store.js',
              tags: a.tags || []
            });
          }
        });
      }
    } catch (e) {
      console.warn('Could not parse starter articles from js/store.js:', e.message);
    }
  }

  // C. Supabase public.knowledge_articles table
  if (supabase) {
    try {
      const { data, error } = await supabase.from('knowledge_articles').select('*');
      if (!error && Array.isArray(data)) {
        data.forEach(a => {
          const docId = `db-${a.slug || a.id}`;
          if (!allDocs.has(docId)) {
            allDocs.set(docId, {
              id: docId,
              title: a.title,
              category: a.category || 'Documentation',
              content: a.content,
              source: 'supabase.knowledge_articles',
              tags: a.citations || []
            });
          }
        });
      }
    } catch (e) {
      console.warn('Could not query knowledge_articles from Supabase:', e.message);
    }
  }

  return Array.from(allDocs.values());
}

/**
 * Main Ingestion Pipeline
 */
async function runIngestion() {
  console.log(`\n======================================================`);
  console.log(`  BizAssist AI — Document Ingestion Pipeline`);
  console.log(`  Embedding Model: ${EMBED_MODEL} (${DIM} dimensions)`);
  console.log(`  Target: Supabase PostgreSQL (pgvector)`);
  console.log(`======================================================\n`);

  const docs = await collectAllDocuments();
  console.log(`Found ${docs.length} knowledge documentation articles across content sources.`);

  const chunksToIngest = [];
  const localVectorMap = {};

  for (const doc of docs) {
    const rawChunks = chunkText(doc.content);
    rawChunks.forEach((chunkContent, index) => {
      chunksToIngest.push({
        article_id: doc.id,
        title: doc.title,
        category: doc.category,
        chunk_index: index,
        content: chunkContent,
        metadata: {
          source: doc.source,
          tags: doc.tags,
          total_chunks: rawChunks.length
        }
      });
    });
  }

  console.log(`Divided ${docs.length} articles into ${chunksToIngest.length} semantic chunks.`);
  console.log(`Generating embeddings and writing to Supabase...\n`);

  let successCount = 0;

  for (let i = 0; i < chunksToIngest.length; i++) {
    const item = chunksToIngest[i];
    // Enrich chunk with title and category for optimal semantic retrieval
    const textToEmbed = `${item.title} (${item.category}): ${item.content}`;
    process.stdout.write(`[${i + 1}/${chunksToIngest.length}] Embedding "${item.title.slice(0, 32)}..." chunk #${item.chunk_index} ... `);

    try {
      const vector = await generateEmbedding(textToEmbed);

      // Save to Supabase pgvector if connected
      if (supabase) {
        const { error } = await supabase.from('knowledge_chunks').upsert({
          article_id: item.article_id,
          title: item.title,
          category: item.category,
          chunk_index: item.chunk_index,
          content: item.content,
          embedding: vector,
          metadata: item.metadata,
          updated_at: new Date().toISOString()
        }, { onConflict: 'article_id,chunk_index' });

        if (error) {
          console.error(`Supabase upsert failed: ${error.message}`);
        }
      }

      // Record in local vector map for hybrid offline backup
      if (!localVectorMap[item.article_id]) {
        localVectorMap[item.article_id] = vector;
      }

      successCount++;
      console.log('OK');
      await sleep(750); // Respect free-tier rate limits
    } catch (err) {
      console.error(`FAILED: ${err.message}`);
    }
  }

  // Update local embeddings.json for local/offline fallback
  const embOutPath = path.join(rootDir, 'kb', 'embeddings.json');
  fs.writeFileSync(embOutPath, JSON.stringify({
    model: EMBED_MODEL,
    dim: DIM,
    vectors: localVectorMap,
    updated_at: new Date().toISOString()
  }, null, 2));

  console.log(`\n======================================================`);
  console.log(`  Ingestion Complete!`);
  console.log(`  Successfully processed: ${successCount}/${chunksToIngest.length} chunks`);
  console.log(`  Supabase pgvector: Synced`);
  console.log(`  Local Backup: ${embOutPath}`);
  console.log(`======================================================\n`);
}

runIngestion().catch((err) => {
  console.error('\nFatal Ingestion Error:', err);
  process.exit(1);
});
