'use strict';
// Builds kb/embeddings.json from kb/knowledge-base.json using the Gemini embedding API.
// Run locally (Node 20.6+), then commit kb/embeddings.json:
//   node --env-file=.env.local scripts/build-embeddings.js
// Re-run whenever you edit the knowledge base.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEY = process.env.GEMINI_API_KEY;
// Default to text-embedding-004 or gemini-embedding-001
const MODEL = process.env.GEMINI_EMBED_MODEL || 'text-embedding-004';
const DIM = Number(process.env.GEMINI_EMBED_DIM || 768);

if (!KEY) {
  console.error('GEMINI_API_KEY is not set. Put it in .env.local and run with --env-file=.env.local');
  process.exit(1);
}

const kb = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'kb', 'knowledge-base.json'), 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function embed(text, attempt = 1) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      taskType: 'RETRIEVAL_DOCUMENT',
      outputDimensionality: DIM
    })
  });
  if (r.status === 429 && attempt <= 5) {
    await sleep(2000 * attempt);
    return embed(text, attempt + 1);
  }
  if (!r.ok) throw new Error(`Embedding failed (${r.status}): ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  return j.embedding.values;
}

(async () => {
  const vectors = {};
  for (const doc of kb) {
    process.stdout.write(`Embedding ${doc.id} ... `);
    vectors[doc.id] = await embed(`${doc.title}\n${doc.text}`);
    console.log('ok');
    await sleep(700); // stay under free-tier rate limits
  }
  const out = path.join(__dirname, '..', 'kb', 'embeddings.json');
  fs.writeFileSync(out, JSON.stringify({ model: MODEL, dim: DIM, vectors }, null, 2));
  console.log(`Wrote ${out} (${Object.keys(vectors).length} vectors)`);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
