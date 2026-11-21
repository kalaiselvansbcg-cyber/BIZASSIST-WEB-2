/**
 * BizAssist AI — Secure Google Gemini API Chat Proxy (/api/chat)
 * Vercel Serverless Function (Node.js 18+)
 * 
 * Security & Platform Rules:
 * - The Gemini API key is read strictly from process.env.GEMINI_API_KEY and never exposed to the client.
 * - Free-tier model: gemini-2.0-flash (configurable via process.env.GEMINI_MODEL, falls back to gemini-1.5-flash).
 * - REST Endpoint: https://generativelanguage.googleapis.com/v1beta/models/<MODEL>:generateContent
 * - Header authentication: x-goog-api-key: process.env.GEMINI_API_KEY
 * - generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
 * - System Instruction: Grounded knowledge assistant for BizAssist AI.
 * - Validation: POST only, max 20 messages, max 1,000 chars per message, strip HTML tags.
 * - Rate limiting: In-memory per-IP sliding window (10 requests/minute).
 * - 15-second AbortController timeout.
 * - Error handling: Returns status 503 { error: "busy", fallback: true } on Gemini 429/5xx/timeout.
 * - No logging of message contents or API keys.
 * - Zero external npm dependencies.
 */

// In-memory sliding window rate limiter (10 req/min per IP)
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

// Clean old IP records periodically to prevent memory leaks
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

// Grounded BizAssist AI System Prompt
const SYSTEM_PROMPT = `You are the BizAssist AI Knowledge Assistant. Answer only questions about BizAssist AI: ticket triage, categorisation, priority/SLA, suggested replies, the customer portal, the agent dashboard, integrations (Zendesk, Slack, Okta SAML 2.0), pricing and setup. Be concise (under 120 words), friendly and accurate. If asked something unrelated to BizAssist AI, politely decline and steer back. For ticket lookups, only use sample tickets #BA-1042, #BA-2089, #BA-3310.

GROUNDING CONTEXT:
- Platform Overview: BizAssist AI is an AI-assisted customer support platform with sub-120ms NLP ticket classification, priority SLA prediction, contextual draft replies with tone adjustment, and transparent 5-stage customer tracking.
- The 5 Ticket Tracker Stages: 1. Raised, 2. Categorised, 3. Assigned, 4. Replied, 5. Resolved.
- Sample Tickets:
  * #BA-1042: "Enterprise SSO integration failure with Okta SAML 2.0" — Staging Okta cert rotated, x509 fingerprint mismatch. Assigned to Sarah Jenkins. Stage 4 (Replied).
  * #BA-2089: "Invoice VAT calculation mismatch on monthly billing" — Reverse-charge EU VAT registration number verified in VIES; credit note drafted. Stage 5 (Resolved).
  * #BA-3310: "Production webhook latency spike on payment.completed events" — Latency spiked to 4.2s. Autoscaling group rebalanced. SRE Sarah Jenkins. Stage 4 (Replied).
- Six Workspaces:
  1. Customer Portal (portal.html): Self-service intake wizard, live milestone tracker, doc search.
  2. Agent Dashboard (agent-dashboard.html): 3-pane workstation, queue filters (Urgent/Normal/Resolved), Customer 360, SLA countdown.
  3. AI Triage Engine (ai-triage.html): NLP intent classification, confidence scores, priority regressor.
  4. Suggested Replies Studio (suggested-replies.html): 4 tone switchers (Empathetic, Concise, Executive, Technical), RAG doc citations.
  5. Knowledge Chatbot (chatbot.html): Grounded Q&A assistant with quick chips and human handover.
  6. Manager Overview (manager-overview.html): 5 KPI cards, daily volume bar charts, agent throughput.
- Verified Integrations: Zendesk, Freshdesk, Slack, Salesforce Service Cloud, Okta SAML 2.0.
- Human Handover: Direct support phone and WhatsApp available on website; users can also click "Request Call Back".
- Not Available Yet: Custom private cloud/on-premise deployments or custom SLAs require booking a product demo.`;

// In-memory fallback responses for sample tickets and common topics
const LOCAL_KEYWORD_FALLBACKS = {
  '1042': 'Ticket #BA-1042 is an Enterprise SSO integration inquiry with Okta SAML 2.0. It is currently at Stage 4 (Replied), assigned to Agent Sarah Jenkins. Note: x509 cert fingerprint mismatch identified and auth gateway cache cleared.',
  '2089': 'Ticket #BA-2089 concerns an EU VAT calculation mismatch on invoice INV-2026-881. It is currently at Stage 5 (Resolved). Elena Rostova\'s reverse-charge VAT ID was verified in VIES and a credit note was issued.',
  '3310': 'Ticket #BA-3310 reports production webhook latency on payment.completed events. It is at Stage 4 (Replied), assigned to Tier-3 SRE Sarah Jenkins. Autoscaling clusters were rebalanced and latency normalized to 68ms.',
  'pricing': 'BizAssist AI offers flexible tier-based volume pricing starting from Starter to Enterprise plans. For detailed seat pricing or custom enterprise contracts, click "Book a demo" on any page.',
  'demo': 'You can book a product demo by clicking the "Book a demo" button in the navigation bar. Our solutions engineering team reviews inquiries and reaches out within 1 business day.',
  'integration': 'BizAssist AI integrates natively with Zendesk, Freshdesk, Slack, Salesforce Service Cloud, and Okta SAML 2.0. Additional custom webhook integrations are supported.',
  'human': 'Our human operations team is available via direct phone line and WhatsApp, or you can click "Request Call Back" in the menu to have an engineer call you back.'
};

function getLocalFallback(userText) {
  const lower = (userText || '').toLowerCase();
  for (const [kw, resp] of Object.entries(LOCAL_KEYWORD_FALLBACKS)) {
    if (lower.includes(kw)) return resp;
  }
  return 'Thank you for your question about BizAssist AI. You can track tickets #BA-1042, #BA-2089, #BA-3310 in the Customer Portal, explore the Agent Dashboard, or connect with our support team.';
}

// Strip HTML tags for defensive sanitation
function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

// Helper to parse JSON body from Node request
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
  // CORS and Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Reject non-POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed. Only POST is accepted.',
      fallback: false
    });
  }

  // 1. IP Rate Limiting (10 req/min)
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

  // 2. Parse and Validate Request Payload
  const body = await parseJsonBody(req);
  let { messages, page } = body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: 'Bad Request. Expected JSON with "messages" array.',
      fallback: false
    });
  }

  // Cap at max 20 messages, each max 1,000 chars, strip HTML
  const validMessages = messages
    .slice(-20)
    .filter(m => m && typeof m.content === 'string' && m.content.trim().length > 0)
    .map(m => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      content: stripHtml(m.content).slice(0, 1000)
    }))
    .filter(m => m.content.length > 0);

  if (validMessages.length === 0) {
    return res.status(400).json({
      error: 'Bad Request. No valid message content after sanitization.',
      fallback: false
    });
  }

  const latestUserMessage = validMessages[validMessages.length - 1].content;

  // 3. Verify Server Gemini API Key
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    // Return 500 JSON error as required, with local fallback reply provided for prototype continuity
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
      message: 'Set GEMINI_API_KEY in your Vercel project environment variables.',
      reply: getLocalFallback(latestUserMessage),
      text: getLocalFallback(latestUserMessage),
      fallback: true
    });
  }

  // 4. Construct Gemini REST API Contents (strictly alternating user/model)
  const geminiContents = [];
  let lastRole = null;

  for (const msg of validMessages) {
    if (msg.role === lastRole) {
      // Merge consecutive identical roles with double newline
      geminiContents[geminiContents.length - 1].parts[0].text += '\n\n' + msg.content;
    } else {
      geminiContents.push({
        role: msg.role,
        parts: [{ text: msg.content }]
      });
      lastRole = msg.role;
    }
  }

  // Ensure first message is from 'user'
  if (geminiContents.length > 0 && geminiContents[0].role !== 'user') {
    geminiContents.shift();
  }

  // Ensure there is at least one message and last is 'user'
  if (geminiContents.length === 0) {
    geminiContents.push({
      role: 'user',
      parts: [{ text: latestUserMessage }]
    });
  }

  // 5. Call Google Gemini REST API with 15s Timeout
  const modelName = (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim();
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const geminiPayload = {
      contents: geminiContents,
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
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
      body: JSON.stringify(geminiPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errStatus = response.status;
      // On 429 or 5xx, return status 503 as requested
      if (errStatus === 429 || errStatus >= 500) {
        return res.status(503).json({
          error: 'busy',
          message: 'The AI model is currently busy. Falling back to local assistant.',
          reply: getLocalFallback(latestUserMessage),
          text: getLocalFallback(latestUserMessage),
          fallback: true
        });
      }

      // Other API errors
      return res.status(503).json({
        error: 'busy',
        status: errStatus,
        reply: getLocalFallback(latestUserMessage),
        text: getLocalFallback(latestUserMessage),
        fallback: true
      });
    }

    const data = await response.json();
    const candidate = data.candidates && data.candidates[0];
    const replyText = candidate?.content?.parts?.map(p => p.text).join('') || '';

    if (!replyText) {
      return res.status(200).json({
        reply: getLocalFallback(latestUserMessage),
        text: getLocalFallback(latestUserMessage),
        model: modelName,
        fallback: true
      });
    }

    return res.status(200).json({
      reply: replyText.trim(),
      text: replyText.trim(),
      model: modelName,
      fallback: false
    });

  } catch (error) {
    clearTimeout(timeoutId);
    const isTimeout = error.name === 'AbortError';

    return res.status(503).json({
      error: 'busy',
      message: isTimeout ? 'Request timed out after 15s.' : 'Failed to reach AI service.',
      reply: getLocalFallback(latestUserMessage),
      text: getLocalFallback(latestUserMessage),
      fallback: true
    });
  }
}
