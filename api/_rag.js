'use strict';
// Retrieval for the BizAssist AI chatbot.
// - Always works with keyword (BM25) search, no API needed.
// - If kb/embeddings.json exists (built by scripts/build-embeddings.js) it blends
//   semantic similarity with keyword scores for better recall.
// Files starting with "_" in /api are not exposed as Vercel routes.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const kbPath = path.join(__dirname, '..', 'kb', 'knowledge-base.json');
const KB = JSON.parse(fs.readFileSync(kbPath, 'utf8'));

let EMB = null;
try {
  const embPath = path.join(__dirname, '..', 'kb', 'embeddings.json');
  if (fs.existsSync(embPath)) {
    EMB = JSON.parse(fs.readFileSync(embPath, 'utf8'));
  }
} catch (_) {
  EMB = null; // keyword-only mode
}

const STOP = new Set(
  'a an and are as at be by can do does for from how i in is it its me my of on or our that the their there this to us we what when where which who will with you your about tell please work works working use used get make need want help know show give'.split(' ')
);

function stem(w) {
  return w.length > 4 ? w.replace(/(ing|ed|es|s)$/, '') : w;
}

function tokenize(text) {
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

function embeddingsAvailable() {
  return !!(EMB && EMB.vectors && EMB.model);
}

function embeddingModel() {
  return EMB ? EMB.model : null;
}

function embeddingDim() {
  return EMB ? EMB.dim : null;
}

// Returns up to k KB entries, best first. queryEmbedding is optional.
function retrieve(query, queryEmbedding, k = 4) {
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
    .filter((r) => (useEmb ? r.score >= 0.3 && (r.semantic >= 0.4 || r.kwRaw > 0) : r.kwRaw > 0 && r.score >= 0.25))
    .slice(0, k)
    .map((r) => ({ id: r.doc.id, title: r.doc.title, text: r.doc.text, score: Number(r.score.toFixed(3)) }));
}

export { retrieve, tokenize, embeddingsAvailable, embeddingModel, embeddingDim, KB };
