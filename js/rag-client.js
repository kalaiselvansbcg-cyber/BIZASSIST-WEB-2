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
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages })
      });
      const data = await r.json().catch(function () { return {}; });
      if (r.ok && data.reply) {
        return { reply: data.reply, sources: data.sources || [], grounded: !!data.grounded, fallback: false };
      }
      return { reply: '', sources: [], grounded: false, fallback: true, error: data.error || 'request_failed' };
    } catch (e) {
      return { reply: '', sources: [], grounded: false, fallback: true, error: 'network' };
    }
  }
  window.askBizAssist = askBizAssist;
})();
