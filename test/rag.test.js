'use strict';
// Offline tests: run with `node test/rag.test.js`. No network or API key needed.
import assert from 'node:assert';

process.env.GEMINI_API_KEY = 'test-key-not-real';

import { retrieve, KB } from '../api/_rag.js';
import handler from '../api/chat.js';

function top(q) {
  const r = retrieve(q, null, 3);
  return r.length ? r[0].id : null;
}

// ---- Retrieval (keyword mode) ----
assert.strictEqual(top('How does AI triage work?'), 'ai-triage');
assert.strictEqual(top('what are the SLA times for P1 tickets'), 'priority-sla');
assert.strictEqual(top('Tell me about ticket #BA-1042'), 'sample-tickets');
assert.strictEqual(top('Is there an Okta SAML guide?'), 'okta-saml');
assert.strictEqual(top('Can I change the tone of a reply to formal?'), 'suggested-replies');
assert.strictEqual(top('how do I merge duplicate tickets'), 'duplicates');
assert.strictEqual(top('what is the weather in Paris'), null, 'out-of-scope must retrieve nothing');
assert.ok(KB.length >= 12);

// ---- Handler with mocked Gemini ----
function mockRes() {
  return {
    code: 200, body: null, headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(c) { this.code = c; return this; },
    json(b) { this.body = b; return this; }
  };
}
const req = (messages, method = 'POST', ip = '1.1.1.1') => ({
  method, body: { messages }, headers: { 'x-forwarded-for': ip }, socket: {}
});

(async () => {
  let calls = [];
  global.fetch = async (url, opts) => {
    calls.push({ url, body: JSON.parse(opts.body), headers: opts.headers });
    return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: 'Mocked answer.' }] } }] }) };
  };

  // Grounded question -> model is called with context, key is in header not URL.
  let res = mockRes();
  await handler(req([{ role: 'user', content: 'How does AI triage work?' }]), res);
  assert.strictEqual(res.code, 200);
  assert.strictEqual(res.body.reply, 'Mocked answer.');
  assert.strictEqual(res.body.grounded, true);
  assert.strictEqual(res.body.sources[0].id, 'ai-triage');
  assert.strictEqual(calls.length, 1);
  assert.ok(!calls[0].url.includes('test-key'), 'key must not be in URL');
  assert.strictEqual(calls[0].headers['x-goog-api-key'], 'test-key-not-real');
  assert.ok(calls[0].body.system_instruction.parts[0].text.includes('120ms'), 'context injected');
  assert.strictEqual(calls[0].body.contents[0].role, 'user');

  // Out of scope -> no model call, canned handover answer.
  calls = [];
  res = mockRes();
  await handler(req([{ role: 'user', content: 'what is the weather in Paris' }], 'POST', '2.2.2.2'), res);
  assert.strictEqual(res.code, 200);
  assert.strictEqual(res.body.grounded, false);
  assert.strictEqual(calls.length, 0, 'no quota spent on out-of-scope');

  // Assistant role is mapped to "model" and HTML is stripped.
  calls = [];
  res = mockRes();
  await handler(req([
    { role: 'user', content: 'What is the priority <b>SLA</b>?' },
    { role: 'assistant', content: 'P1 is under 15 minutes.' },
    { role: 'user', content: 'and P2?' }
  ], 'POST', '3.3.3.3'), res);
  assert.strictEqual(res.code, 200);
  assert.deepStrictEqual(calls[0].body.contents.map((c) => c.role), ['user', 'model', 'user']);
  assert.ok(!calls[0].body.contents[0].parts[0].text.includes('<b>'));

  // Gemini quota error -> 503 + fallback flag.
  global.fetch = async () => ({ ok: false, status: 429, json: async () => ({}) });
  res = mockRes();
  await handler(req([{ role: 'user', content: 'How does AI triage work?' }], 'POST', '4.4.4.4'), res);
  assert.strictEqual(res.code, 503);
  assert.strictEqual(res.body.fallback, true);

  // Validation.
  res = mockRes();
  await handler(req([], 'POST', '5.5.5.5'), res);
  assert.strictEqual(res.code, 400);
  res = mockRes();
  await handler(req([{ role: 'user', content: 'hi' }], 'GET', '5.5.5.5'), res);
  assert.strictEqual(res.code, 405);

  // Missing key -> 500, no crash.
  delete process.env.GEMINI_API_KEY;
  res = mockRes();
  await handler(req([{ role: 'user', content: 'hi' }], 'POST', '6.6.6.6'), res);
  assert.strictEqual(res.code, 500);
  process.env.GEMINI_API_KEY = 'test-key-not-real';

  // Rate limit: 11th call from one IP in a minute is refused.
  global.fetch = async () => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] }) });
  let last;
  for (let i = 0; i < 11; i++) {
    last = mockRes();
    await handler(req([{ role: 'user', content: 'How does AI triage work?' }], 'POST', '9.9.9.9'), last);
  }
  assert.strictEqual(last.code, 429);

  console.log('All tests passed.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
