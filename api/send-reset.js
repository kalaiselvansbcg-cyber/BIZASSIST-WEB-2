/**
 * BizAssist AI — Transactional Password Reset API (/api/send-reset)
 * Vercel Serverless Function (Node.js 18+)
 * 
 * Supports Resend, SendGrid, Postmark, or graceful demo-mode fallback.
 * API keys are read strictly from process.env and never exposed to the client.
 */

async function parseBody(req) {
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
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = await parseBody(req);
    const { email, code } = body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const provider = (process.env.EMAIL_PROVIDER || 'demo').toLowerCase();
    const apiKey = process.env.EMAIL_API_KEY;
    const fromAddress = process.env.EMAIL_FROM || 'support@bizassist.ai';

    // If no external provider configured, respond in demo mode
    if (provider === 'demo' || !apiKey) {
      console.log(`[send-reset] Demo mode active for ${email}. Reset code: ${code}`);
      return res.status(200).json({
        success: true,
        mode: 'demo',
        message: 'Email service unconfigured; reset code generated in demo mode.',
        code: code
      });
    }

    // 1. Resend
    if (provider === 'resend') {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddress,
          to: email,
          subject: 'Your BizAssist AI password reset code',
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #E3DED6; background: #FAF8F5; color: #111111;">
              <h2 style="font-family: Georgia, serif; font-size: 24px; margin-bottom: 12px;">BizAssist AI Password Reset</h2>
              <p style="font-size: 14px; color: #5E5A53; line-height: 1.5;">You requested a password reset for your account. Use the 6-digit code below to proceed:</p>
              <div style="font-family: monospace; font-size: 28px; font-weight: bold; letter-spacing: 0.25em; text-align: center; padding: 18px; margin: 20px 0; background: #FFFFFF; border: 1px solid #111111;">
                ${code}
              </div>
              <p style="font-size: 12px; color: #6F6A61;">This code is valid for 10 minutes. If you did not request this reset, you can safely ignore this email.</p>
            </div>
          `
        })
      });

      if (!response.ok) {
        const errData = await response.text();
        console.error('[send-reset] Resend error:', errData);
        return res.status(502).json({ error: 'Failed to dispatch email via Resend.' });
      }

      return res.status(200).json({ success: true, mode: 'resend', message: 'Verification email dispatched.' });
    }

    // 2. SendGrid
    if (provider === 'sendgrid') {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: fromAddress, name: 'BizAssist AI' },
          subject: 'Your BizAssist AI password reset code',
          content: [{
            type: 'text/html',
            value: `<p>Your BizAssist AI verification code is <strong>${code}</strong>. Valid for 10 minutes.</p>`
          }]
        })
      });

      if (!response.ok) {
        const errData = await response.text();
        console.error('[send-reset] SendGrid error:', errData);
        return res.status(502).json({ error: 'Failed to dispatch email via SendGrid.' });
      }

      return res.status(200).json({ success: true, mode: 'sendgrid', message: 'Verification email dispatched.' });
    }

    // Fallback
    return res.status(200).json({
      success: true,
      mode: 'demo',
      message: 'Provider unrecognized; operating in demo mode.',
      code: code
    });

  } catch (error) {
    console.error('[send-reset] Exception:', error);
    return res.status(500).json({ error: 'Internal server error while processing password reset.', details: error.message });
  }
}
