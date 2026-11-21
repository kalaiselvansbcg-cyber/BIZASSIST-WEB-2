/**
 * BizAssist AI — Live Ticket Auto-Triage Endpoint (/api/triage)
 * Vercel Serverless Function (Node.js 18+)
 * 
 * Uses Google Gemini API with Structured Output (JSON Schema)
 * to categorize, prioritize, evaluate confidence, suggest routing,
 * provide reasoning, and draft replies for inbound customer support inquiries.
 */

function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

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

// Deterministic heuristic fallback when Gemini API key is missing or service is offline
function generateLocalTriage(subject, text) {
  const combined = ((subject || '') + ' ' + (text || '')).toLowerCase();

  let category = 'General Inquiry';
  let priority = 'P3 - Normal';
  let confidence = 0.94;
  let suggestedRoute = 'general-tier1';
  let reasoning = 'Standard customer inquiry classified based on keyword semantics.';
  let suggestedReply = 'Thank you for contacting BizAssist AI support. We have logged your inquiry and a support representative is reviewing your details.';

  if (combined.includes('vat') || combined.includes('invoice') || combined.includes('billing') || combined.includes('charge') || combined.includes('stripe') || combined.includes('card')) {
    category = 'Billing & Payments';
    priority = combined.includes('fail') || combined.includes('decline') || combined.includes('cancel') ? 'P1 - Urgent' : 'P2 - High';
    confidence = 0.98;
    suggestedRoute = 'billing-finops-tier2';
    reasoning = 'Payment processing or invoice inquiry detected. High financial impact.';
    suggestedReply = 'Hi there, thank you for reaching out regarding your billing inquiry. We are reviewing the transaction logs on our payment gateway and will resolve this promptly.';
  } else if (combined.includes('sso') || combined.includes('saml') || combined.includes('okta') || combined.includes('login') || combined.includes('2fa') || combined.includes('auth')) {
    category = 'Account & Security';
    priority = 'P2 - High';
    confidence = 0.96;
    suggestedRoute = 'security-auth-tier2';
    reasoning = 'Enterprise authentication or credential access issue detected.';
    suggestedReply = 'Hi there, our identity operations team has received your SSO/Authentication inquiry. We have initiated a metadata verification check on our auth gateway.';
  } else if (combined.includes('webhook') || combined.includes('latency') || combined.includes('500') || combined.includes('502') || combined.includes('api') || combined.includes('down')) {
    category = 'API & Infrastructure';
    priority = combined.includes('down') || combined.includes('spike') || combined.includes('500') ? 'P1 - Urgent' : 'P2 - High';
    confidence = 0.97;
    suggestedRoute = 'infra-sre-oncall';
    reasoning = 'API integration latency or cluster error detected affecting production traffic.';
    suggestedReply = 'Hi there, our SRE team is investigating the API/Webhook latency behavior. We are inspecting edge proxy metrics and telemetry traces.';
  }

  return {
    category,
    priority,
    confidence,
    suggestedRoute,
    reasoning,
    suggestedReply
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const body = await parseJsonBody(req);
  const subject = stripHtml(body.subject || '');
  const text = stripHtml(body.text || body.description || '');

  if (!text && !subject) {
    return res.status(400).json({ error: 'Either subject or text is required for triage.' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  // If no Gemini API key configured, use deterministic heuristic fallback
  if (!apiKey) {
    const localResult = generateLocalTriage(subject, text);
    return res.status(200).json({
      success: true,
      triage: localResult,
      model: 'local-heuristic',
      fallback: true
    });
  }

  const modelName = (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim();
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  const promptText = `Analyze this customer support inquiry for BizAssist AI:
Subject: ${subject || 'N/A'}
Inquiry Content: ${text}

Perform accurate classification:
- category: one of "Billing & Payments", "API & Infrastructure", "Account & Security", "Bug Reports", "Integrations", "General Inquiry".
- priority: one of "P1 - Urgent", "P2 - High", "P3 - Normal", "P4 - Low".
- confidence: number between 0.85 and 0.99 reflecting model certainty.
- suggestedRoute: queue destination e.g. "billing-finops", "infra-sre", "security-auth", "tier-1-support".
- reasoning: concise 1-sentence technical explanation of why this priority and category were assigned.
- suggestedReply: concise (under 60 words), professional grounded support response.`;

  const structuredSchema = {
    type: "OBJECT",
    properties: {
      category: { type: "STRING" },
      priority: { type: "STRING", enum: ["P1 - Urgent", "P2 - High", "P3 - Normal", "P4 - Low"] },
      confidence: { type: "NUMBER" },
      suggestedRoute: { type: "STRING" },
      reasoning: { type: "STRING" },
      suggestedReply: { type: "STRING" }
    },
    required: ["category", "priority", "confidence", "suggestedRoute", "reasoning", "suggestedReply"]
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600,
          responseMimeType: "application/json",
          responseSchema: structuredSchema
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const fallbackResult = generateLocalTriage(subject, text);
      return res.status(200).json({
        success: true,
        triage: fallbackResult,
        model: 'local-fallback',
        fallback: true
      });
    }

    const data = await response.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawJson);

    return res.status(200).json({
      success: true,
      triage: parsed,
      model: modelName,
      fallback: false
    });

  } catch (err) {
    clearTimeout(timeoutId);
    const fallbackResult = generateLocalTriage(subject, text);
    return res.status(200).json({
      success: true,
      triage: fallbackResult,
      model: 'local-fallback',
      fallback: true
    });
  }
}
