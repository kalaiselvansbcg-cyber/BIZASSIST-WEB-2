/**
 * BizAssist AI — Secure Google Gemini API Chat Proxy (/api/chat)
 * Vercel Serverless Function (Node.js 18+ / ESM)
 */

// Model Name Constant (Free-tier Google Gemini Flash model per ai.google.dev/gemini-api/docs)
const GEMINI_MODEL = 'gemini-2.5-flash';

// System Instruction for BizAssist AI Knowledge Assistant
const SYSTEM_INSTRUCTION = 'You are the BizAssist AI Knowledge Assistant. Answer only questions about BizAssist AI: ticket triage, categorisation, priority/SLA, suggested replies, the customer portal, the agent dashboard, integrations (Zendesk, Slack, Okta SAML 2.0), pricing and setup. Be concise (under 120 words), friendly and accurate. If you do not know something or it is out of scope, say so and offer a human agent handover. Never invent ticket data, prices or features. Only use sample tickets #BA-1042, #BA-2089, #BA-3310.';

// In-memory sliding window rate limiter (10 requests per minute per IP)
const ipRateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(ip) {
  const now = Date.now();
  const timestamps = ipRateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  validTimestamps.push(now);
  ipRateLimitMap.set(ip, validTimestamps);
  return true;
}

// Memory maintenance: prune old rate limit timestamps periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of ipRateLimitMap.entries()) {
      const valid = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
      if (valid.length === 0) ipRateLimitMap.delete(ip);
      else ipRateLimitMap.set(ip, valid);
    }
  }, 5 * 60 * 1000).unref?.();
}

// Strip HTML tags for input sanitization
function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

// Helper to parse JSON body from incoming request
async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      if (!data || !data.trim()) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Accept POST only
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed. Only POST is accepted.',
      fallback: false
    });
  }

  // 2. Per-IP Rate Limiting (10 requests/minute)
  const clientIp = (req.headers && req.headers['x-forwarded-for'])
    ? req.headers['x-forwarded-for'].split(',')[0].trim()
    : (req.socket && req.socket.remoteAddress) || '127.0.0.1';

  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit of 10 requests per minute exceeded. Please pause briefly.',
      fallback: true
    });
  }

  // 3. Read process.env.GEMINI_API_KEY
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server is not configured: GEMINI_API_KEY is missing.',
      fallback: true
    });
  }

  // 4. Parse and Validate Request Payload
  const body = await parseJsonBody(req);
  const { messages } = body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: 'Bad Request. Expected JSON body with "messages" array.',
      fallback: false
    });
  }

  // Validate: max 20 messages, max 1,000 chars each, strip HTML
  const validMessages = messages
    .slice(-20)
    .filter(m => m && typeof m.content === 'string' && m.content.trim().length > 0)
    .map(m => ({
      role: (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user',
      content: stripHtml(m.content).slice(0, 1000)
    }))
    .filter(m => m.content.length > 0);

  if (validMessages.length === 0) {
    return res.status(400).json({
      error: 'Bad Request. No valid message content after sanitization.',
      fallback: false
    });
  }

  // 5. Construct Gemini REST contents (strictly alternating user / model)
  const geminiContents = [];
  let lastRole = null;

  for (const msg of validMessages) {
    if (msg.role === lastRole) {
      geminiContents[geminiContents.length - 1].parts[0].text += '\n\n' + msg.content;
    } else {
      geminiContents.push({
        role: msg.role,
        parts: [{ text: msg.content }]
      });
      lastRole = msg.role;
    }
  }

  // Ensure conversation begins with a 'user' message
  if (geminiContents.length > 0 && geminiContents[0].role !== 'user') {
    geminiContents.shift();
  }

  if (geminiContents.length === 0) {
    const fallbackText = validMessages[validMessages.length - 1].content;
    geminiContents.push({
      role: 'user',
      parts: [{ text: fallbackText }]
    });
  }

  // 6. Call Gemini REST API with 15s timeout
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const payload = {
      contents: geminiContents,
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500
      }
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // On HTTP 429 or any 5xx from Gemini, return status 503 with { error: "busy", fallback: true }
    if (!response.ok) {
      const status = response.status;
      if (status === 429 || status >= 500) {
        return res.status(503).json({
          error: 'busy',
          fallback: true
        });
      }

      return res.status(503).json({
        error: 'busy',
        fallback: true
      });
    }

    const data = await response.json();
    const candidate = data.candidates && data.candidates[0];
    const replyText = candidate?.content?.parts?.map(p => p.text).join('') || '';

    // On blocked or empty reply, return status 503 with { error: "busy", fallback: true }
    if (!replyText || !replyText.trim()) {
      return res.status(503).json({
        error: 'busy',
        fallback: true
      });
    }

    // On success return { reply: "..." }
    return res.status(200).json({
      reply: replyText.trim()
    });

  } catch (error) {
    clearTimeout(timeoutId);
    return res.status(503).json({
      error: 'busy',
      fallback: true
    });
  }
}
