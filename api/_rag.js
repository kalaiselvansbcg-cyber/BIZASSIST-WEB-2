'use strict';
/**
 * BizAssist AI — RAG Retrieval Engine
 * Supports Supabase pgvector semantic search with local BM25 keyword matching fallback.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const kbPath = path.join(rootDir, 'kb', 'knowledge-base.json');
const KB = JSON.parse(fs.readFileSync(kbPath, 'utf8'));

let EMB = null;
try {
  const embPath = path.join(rootDir, 'kb', 'embeddings.json');
  if (fs.existsSync(embPath)) {
    EMB = JSON.parse(fs.readFileSync(embPath, 'utf8'));
  }
} catch (_) {
  EMB = null;
}

// Initialize Supabase client if credentials exist in environment
let supabase = null;
function getSupabaseClient() {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (url && key) {
    supabase = createClient(url, key);
  }
  return supabase;
}

/**
 * Retrieve semantically similar chunks from Supabase pgvector
 */
export async function retrieveFromSupabase(queryEmbedding, threshold = 0.5, limit = 4) {
  const sb = getSupabaseClient();
  if (!sb || !Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    return null;
  }

  try {
    const { data, error } = await sb.rpc('match_knowledge_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit
    });

    if (error || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    return data.map(item => ({
      id: item.article_id,
      title: item.title,
      category: item.category,
      text: item.content,
      score: Number(item.similarity.toFixed(3))
    }));
  } catch (err) {
    return null;
  }
}

const STOP = new Set(
  'a an and are as at be by can do does for from how i in is it its me my of on or our that the their there this to us we what when where which who will with you your about tell please work works working use used get make need want help know show give'.split(' ')
);

function stem(w) {
  return w.length > 4 ? w.replace(/(ing|ed|es|s)$/, '') : w;
}

export function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9#\-\s.]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^[.\-]+|[.\-]+$/g, ''))
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem);
}

// Pre-compute document term data once per cold start.
const DOCS = KB.map((d) => {
  const tokens = []
    .concat(tokenize(d.title), tokenize(d.title), tokenize(d.title))
    .concat(tokenize((d.keywords || []).join(' ')), tokenize((d.keywords || []).join(' ')))
    .concat(tokenize(d.text));
  const tf = new Map();
  tokens.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
  return { doc: d, tf, len: tokens.length };
});
const AVG_LEN = DOCS.reduce((s, x) => s + x.len, 0) / (DOCS.length || 1);
const DF = new Map();
DOCS.forEach((x) => x.tf.forEach((_, t) => DF.set(t, (DF.get(t) || 0) + 1)));

function bm25Scores(query) {
  const q = tokenize(query);
  const k1 = 1.4;
  const b = 0.75;
  const N = DOCS.length;
  const idMatches = String(query).toLowerCase().match(/#?ba-\d+/g) || [];
  return DOCS.map((x) => {
    let score = 0;
    q.forEach((t) => {
      const f = x.tf.get(t);
      if (!f) return;
      const idf = Math.log(1 + (N - (DF.get(t) || 0) + 0.5) / ((DF.get(t) || 0) + 0.5));
      score += (idf * f * (k1 + 1)) / (f + k1 * (1 - b + (b * x.len) / AVG_LEN));
    });
    // Exact ticket-id match gets a strong boost.
    const haystack = (x.doc.text + ' ' + (x.doc.keywords || []).join(' ')).toLowerCase();
    idMatches.forEach((m) => {
      if (haystack.includes(m.replace('#', ''))) score += 8;
    });
    return score;
  });
}

function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

export function embeddingsAvailable() {
  return !!(EMB && EMB.vectors && EMB.model);
}

export function embeddingModel() {
  return EMB ? EMB.model : 'gemini-embedding-001';
}

export function embeddingDim() {
  return EMB ? EMB.dim : 768;
}

// Local BM25 + cosine fallback
export function retrieve(query, queryEmbedding, k = 4) {
  const kw = bm25Scores(query);
  const maxKw = Math.max(...kw, 0);
  const useEmb = embeddingsAvailable() && Array.isArray(queryEmbedding);

  const ranked = DOCS.map((x, i) => {
    const kwNorm = maxKw > 0 ? kw[i] / maxKw : 0;
    let score = kwNorm;
    let semantic = 0;
    if (useEmb && EMB.vectors[x.doc.id]) {
      semantic = cosine(queryEmbedding, EMB.vectors[x.doc.id]);
      score = 0.7 * semantic + 0.3 * kwNorm;
    }
    return { doc: x.doc, score, kwRaw: kw[i], semantic };
  }).sort((a, b) => b.score - a.score);

  return ranked
    .filter((r) => (useEmb ? (r.semantic >= 0.4 || (r.kwRaw > 0 && r.score >= 0.25)) : r.kwRaw > 0 && r.score >= 0.25))
    .slice(0, k)
    .map((r) => ({ id: r.doc.id, title: r.doc.title, text: r.doc.text, score: Number(r.score.toFixed(3)) }));
}

export { KB };
