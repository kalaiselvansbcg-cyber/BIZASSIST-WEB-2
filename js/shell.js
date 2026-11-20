/**
 * BizAssist AI — Shared Layout & Shell Component (js/shell.js)
 * 
 * Injects the shared Quiet Luxury header, role-based navigation, breadcrumbs,
 * user dropdown, and persistent floating AI assistant across all app pages.
 */
(function (global) {
  'use strict';

  const PAGE_MAP = {
    '/app': { title: 'Home Hub', breadcrumb: 'Overview' },
    '/portal': { title: 'Customer Portal', breadcrumb: 'Customer Portal' },
    '/agent-dashboard': { title: 'Agent Dashboard', breadcrumb: 'Agent Queue' },
    '/ai-triage': { title: 'AI Triage Engine', breadcrumb: 'Triage Studio' },
    '/suggested-replies': { title: 'Suggested Replies', breadcrumb: 'Reply Studio' },
    '/chatbot': { title: 'Knowledge Assistant', breadcrumb: 'Chatbot' },
    '/manager-overview': { title: 'Manager Overview', breadcrumb: 'Analytics & SLA' }
  };

  function getCurrentRoute() {
    let p = global.location.pathname.replace(/\.html$/, '');
    if (p === '' || p === '/index') p = '/';
    return p;
  }

  function renderShellHeader(session) {
    // If existing shell header already present, avoid duplicating
    if (document.querySelector('.biz-shell-header')) return;

    const currentRoute = getCurrentRoute();
    const pageMeta = PAGE_MAP[currentRoute] || { title: 'Workspace', breadcrumb: 'Workspace' };
    const userRole = (session ? session.role : 'Customer');

    // Role-filtered navigation links
    let navLinks = [
      { href: '/app', label: 'Home' }
    ];

    if (userRole === 'Customer') {
      navLinks.push(
        { href: '/portal', label: 'Ticket Portal' },
        { href: '/chatbot', label: 'Ask AI' }
      );
    } else if (userRole === 'Agent') {
      navLinks.push(
        { href: '/agent-dashboard', label: 'Agent Queue' },
        { href: '/ai-triage', label: 'AI Triage' },
        { href: '/suggested-replies', label: 'Suggested Replies' },
        { href: '/portal', label: 'Customer View' },
        { href: '/chatbot', label: 'Knowledge Chat' }
      );
    } else {
      // Manager or Admin
      navLinks.push(
        { href: '/manager-overview', label: 'Manager Overview' },
        { href: '/agent-dashboard', label: 'Agent Queue' },
        { href: '/ai-triage', label: 'AI Triage' },
        { href: '/suggested-replies', label: 'Suggested Replies' },
        { href: '/portal', label: 'Customer View' },
        { href: '/chatbot', label: 'Knowledge Chat' }
      );
    }

    const header = document.createElement('header');
    header.className = 'biz-shell-header';
    header.setAttribute('role', 'banner');

    header.innerHTML = `
      <div class="biz-shell-header-inner">
        <div class="biz-shell-brand-group">
          <a href="/app" class="biz-shell-logo">
            <span>BIZASSIST AI</span>
            <span class="biz-shell-logo-badge">PROTOTYPE</span>
          </a>
          <div class="biz-shell-separator"></div>
          <nav class="biz-shell-breadcrumbs" aria-label="Breadcrumb">
            <a href="/app">Home</a>
            <span style="color:var(--shell-line);">&gt;</span>
            <span class="biz-shell-breadcrumbs-current">${pageMeta.breadcrumb}</span>
          </nav>
        </div>

        <nav class="biz-shell-nav" aria-label="Main Navigation">
          ${navLinks.map(link => {
            const isActive = currentRoute === link.href ? 'active' : '';
            return `<a href="${link.href}" class="biz-shell-nav-link ${isActive}">${link.label}</a>`;
          }).join('')}
        </nav>

        <div class="biz-shell-actions">
          <button type="button" class="biz-shell-ask-ai-btn" onclick="BizAssistShell.toggleFloatingChat()" aria-label="Open AI Assistant">
            <span>Ask AI</span>
          </button>

          <div class="biz-shell-user-wrapper">
            <button type="button" class="biz-shell-user-btn" id="biz-user-menu-btn" onclick="BizAssistShell.toggleUserMenu()" aria-expanded="false" aria-haspopup="true">
              <span style="font-weight:600; font-size:13px;">${session ? session.name : 'Demo User'}</span>
              <span class="biz-shell-user-role-badge">${userRole}</span>
              <span style="font-size:10px;">▼</span>
            </button>

            <div class="biz-shell-user-menu" id="biz-user-menu" role="menu" aria-label="User profile options">
              <div class="biz-shell-user-menu-header">
                <div class="biz-shell-user-menu-name">${session ? session.name : 'Demo User'}</div>
                <div class="biz-shell-user-menu-email">${session ? session.email : 'user@bizassist.ai'}</div>
                <div style="margin-top:6px; font-family:var(--shell-font-mono); font-size:11px; color:var(--shell-secondary);">Role: ${userRole}</div>
              </div>
              <button type="button" class="biz-shell-user-menu-item" onclick="BizAssistShell.handleResetData()">
                <span>Reset Demo Data</span>
                <span style="font-size:11px; color:var(--shell-muted);">(Re-seed)</span>
              </button>
              <button type="button" class="biz-shell-user-menu-item" onclick="BizAssistFlow.startTour()">
                <span>Start Guided Tour</span>
                <span style="font-size:11px; color:var(--shell-muted);">(6 Steps)</span>
              </button>
              <a href="/about" class="biz-shell-user-menu-item" style="text-decoration:none;">
                <span>About BizAssist</span>
                <span style="font-size:11px; color:var(--shell-muted);">Marketing</span>
              </a>
              <button type="button" class="biz-shell-user-menu-item" onclick="BizAssistAuth.signOut()">
                <span>Sign Out</span>
                <span style="font-size:12px;">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertBefore(header, document.body.firstChild);

    // Close user menu when clicking outside
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('biz-user-menu');
      const btn = document.getElementById('biz-user-menu-btn');
      if (menu && btn && !btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function injectFloatingChat() {
    if (document.getElementById('biz-floating-chat')) return;

    const wrap = document.createElement('div');
    wrap.id = 'biz-floating-chat';
    wrap.innerHTML = `
      <button type="button" class="biz-floating-chat-trigger" onclick="BizAssistShell.toggleFloatingChat()" aria-label="Toggle AI Assistant Drawer">
        <span>●</span>
        <span>AI Assistant</span>
      </button>

      <div class="biz-floating-chat-drawer" id="biz-chat-drawer" role="dialog" aria-modal="true" aria-label="BizAssist AI Assistant">
        <div class="biz-chat-drawer-header">
          <div class="biz-chat-drawer-title">BizAssist AI Assistant</div>
          <button type="button" class="biz-chat-drawer-close" onclick="BizAssistShell.toggleFloatingChat()" aria-label="Close Assistant">✕</button>
        </div>
        <div class="biz-chat-drawer-messages" id="biz-drawer-messages">
          <div class="biz-chat-bubble assistant">
            Hello. I am the BizAssist AI Assistant. I can help answer questions, look up tickets (#BA-1042, #BA-2089, #BA-3310), or raise a new ticket for you. How can I assist you today?
          </div>
        </div>
        <form class="biz-chat-drawer-input-row" onsubmit="BizAssistShell.handleDrawerSubmit(event)">
          <input type="text" id="biz-drawer-input" class="biz-chat-drawer-input" placeholder="Ask a question or track ticket #BA-..." autocomplete="off">
          <button type="submit" class="biz-chat-drawer-send">Send</button>
        </form>
      </div>
    `;
    document.body.appendChild(wrap);
  }

  const BizAssistShell = {
    init: function () {
      const path = global.location.pathname;
      const isPublic = path === '/' || path.endsWith('index.html') || path.endsWith('login.html') || path.endsWith('about.html') || path.endsWith('about');
      
      const session = global.BizAssistAuth ? global.BizAssistAuth.getSession() : null;
      if (session && !isPublic) {
        renderShellHeader(session);
        injectFloatingChat();
      }
    },

    toggleUserMenu: function () {
      const menu = document.getElementById('biz-user-menu');
      const btn = document.getElementById('biz-user-menu-btn');
      if (!menu) return;
      const isOpen = menu.classList.toggle('is-open');
      if (btn) btn.setAttribute('aria-expanded', String(isOpen));
    },

    toggleFloatingChat: function () {
      const drawer = document.getElementById('biz-chat-drawer');
      if (!drawer) return;
      drawer.classList.toggle('is-open');
      if (drawer.classList.contains('is-open')) {
        const input = document.getElementById('biz-drawer-input');
        if (input) input.focus();
      }
    },

    handleResetData: function () {
      if (confirm('Reset all ticket data and metrics back to default demo state?')) {
        if (global.BizAssistStore) {
          global.BizAssistStore.resetDemoData();
        }
        alert('Demo data reset successfully.');
        global.location.reload();
      }
    },

    handleDrawerSubmit: async function (e) {
      e.preventDefault();
      const input = document.getElementById('biz-drawer-input');
      const messagesContainer = document.getElementById('biz-drawer-messages');
      const text = input ? input.value.trim() : '';
      if (!text) return;

      // Append user bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'biz-chat-bubble user';
      userBubble.textContent = text;
      messagesContainer.appendChild(userBubble);
      input.value = '';
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      // Handle ticket lookup client-side quickly if pattern matches or call server
      const match = text.match(/#?(BA-\d{4})/i);
      if (match && global.BizAssistStore) {
        const t = global.BizAssistStore.getTicket(match[1]);
        if (t) {
          const replyBubble = document.createElement('div');
          replyBubble.className = 'biz-chat-bubble assistant';
          replyBubble.innerHTML = `
            <strong>Ticket #${t.code} Found</strong><br>
            • Subject: ${t.subject}<br>
            • Status: <strong>${t.stage}</strong><br>
            • Category: ${t.category}<br>
            • Priority: ${t.priority}<br>
            • Assigned to: ${t.assignedTo} (${t.assignedTeam})<br>
            • Last update: ${new Date(t.updatedAt).toLocaleTimeString()}
          `;
          messagesContainer.appendChild(replyBubble);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
          return;
        }
      }

      // Check for raising a ticket
      if (text.toLowerCase().includes('raise') || text.toLowerCase().includes('create ticket')) {
        const replyBubble = document.createElement('div');
        replyBubble.className = 'biz-chat-bubble assistant';
        replyBubble.innerHTML = `
          I can raise that ticket for you. You can also raise tickets directly from the <a href="/portal" style="color:var(--shell-accent); text-decoration:underline;">Customer Portal</a>. Would you like me to log: "<em>${text.replace(/"/g, '&quot;')}</em>"?
        `;
        messagesContainer.appendChild(replyBubble);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return;
      }

      // Query server-side /api/chat if available
      const thinkingBubble = document.createElement('div');
      thinkingBubble.className = 'biz-chat-bubble assistant';
      thinkingBubble.textContent = 'Thinking...';
      messagesContainer.appendChild(thinkingBubble);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'user', content: text }
            ]
          })
        });

        if (res.ok) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let fullText = '';
          thinkingBubble.textContent = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr === '[DONE]') break;
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.delta) {
                    fullText += parsed.delta;
                    thinkingBubble.textContent = fullText;
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                  }
                } catch (e) {}
              }
            }
          }
          if (!fullText) {
            thinkingBubble.textContent = 'Thank you for your question. You can raise a ticket in the Customer Portal or browse knowledge base articles.';
          }
        } else {
          thinkingBubble.textContent = 'I am currently operating in prototype mode. You can track tickets #BA-1042, #BA-2089, and #BA-3310 directly or raise a new inquiry via the Customer Portal.';
        }
      } catch (err) {
        thinkingBubble.textContent = 'Prototype Assistant: To check ticket status, enter #BA-1042, #BA-2089, or #BA-3310. To create a ticket, visit the Customer Portal.';
      }
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  global.BizAssistShell = BizAssistShell;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', BizAssistShell.init);
  } else {
    BizAssistShell.init();
  }

})(typeof window !== 'undefined' ? window : globalThis);
