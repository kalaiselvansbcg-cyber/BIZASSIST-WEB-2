// Browser helper for the RAG chatbot. Include with: <script src="assets/rag-client.js"></script>
// Usage:
//   const res = await window.askBizAssist(history);   // history = [{role:'user'|'assistant', content:'...'}]
//   if (res.fallback) { /* use your old keyword answers */ }
//   else { bubble.textContent = res.reply; }           // always textContent, never innerHTML
(function () {
  async function askBizAssist(history) {
    const messages = (history || []).slice(-10).map(function (m) {
      return { role: m.role === 'assistant' || m.role === 'bot' ? 'assistant' : 'user', content: String(m.content || m.text || '') };
    });
    try {
      let r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages })
      });

      // If running on a static server (e.g. VS Code Live Server at 127.0.0.1:5500 or file://),
      // /api/chat returns 404. Transparently route to deployed Vercel endpoint to provide live AI answers:
      if (r.status === 404 && (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:')) {
        try {
          const prodRes = await fetch('https://bizassist69.vercel.app/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messages })
          });
          if (prodRes.ok) {
            r = prodRes;
          }
        } catch (_) {}
      }

      const data = await r.json().catch(function () { return {}; });

      if (r.ok && data.reply) {
        return { reply: data.reply, sources: data.sources || [], grounded: !!data.grounded, fallback: false };
      }

      if (data.error === 'server_not_configured' || r.status === 500) {
        console.warn('[BizAssist AI] GEMINI_API_KEY is not configured on the server. Falling back to offline assistant mode. Add GEMINI_API_KEY to your .env.local or Vercel Environment Variables.');
      } else if (r.status === 404) {
        console.warn('[BizAssist AI] /api/chat not found (HTTP 404). If using a static file server (e.g. Live Server), run `npm start` instead to serve both pages and API endpoints.');
      } else if (r.status === 429) {
        console.warn('[BizAssist AI] Rate limit reached (max 10 requests/min). Please wait a moment.');
      }

      return { reply: '', sources: [], grounded: false, fallback: true, error: data.error || 'request_failed' };
    } catch (e) {
      // If local network failed (e.g. file:// or unreachable host), try production endpoint fallback
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:') {
        try {
          const prodRes = await fetch('https://bizassist69.vercel.app/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messages })
          });
          const data = await prodRes.json().catch(function () { return {}; });
          if (prodRes.ok && data.reply) {
            return { reply: data.reply, sources: data.sources || [], grounded: !!data.grounded, fallback: false };
          }
        } catch (_) {}
      }
      console.warn('[BizAssist AI] Network request to /api/chat failed:', e.message);
      return { reply: '', sources: [], grounded: false, fallback: true, error: 'network' };
    }
  }
  window.askBizAssist = askBizAssist;
})();
