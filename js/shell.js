/**
 * BizAssist AI — Shared Layout & Shell Component (js/shell.js)
 * 
 * Injects the shared Quiet Luxury header, role-based navigation, breadcrumbs,
 * notification centre bell, user dropdown, global keyboard shortcut (/),
 * call-back request modal, and intelligent streaming AI assistant.
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

  // Persistent session chat history for the drawer (capped at 12 turns)
  let drawerChatHistory = [];

  function getCurrentRoute() {
    let p = global.location.pathname.replace(/\.html$/, '');
    if (p === '' || p === '/index') p = '/';
    return p;
  }

  function getSiteConfig() {
    return global.BIZASSIST_SITE || global.SITE || {
      supportPhone: '+91 00000 00000',
      supportPhoneDisplay: '+91 00000 00000',
      supportWhatsApp: '910000000000'
    };
  }

  function renderShellHeader(session) {
    if (document.querySelector('.biz-shell-header')) return;

    const currentRoute = getCurrentRoute();
    const pageMeta = PAGE_MAP[currentRoute] || { title: 'Workspace', breadcrumb: 'Workspace' };
    const userRole = (session ? session.role : 'Customer');
    const site = getSiteConfig();

    // Role-filtered navigation links
    let navLinks = [
      { href: '/app', label: 'Home' }
    ];

    if (userRole === 'Customer') {
      navLinks.push(
        { href: '/portal', label: 'Ticket Portal' },
        { href: '/chatbot', label: 'Knowledge Chat' }
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
          
          <!-- NOTIFICATION CENTRE BELL -->
          <div class="biz-shell-notif-wrapper">
            <button type="button" class="biz-shell-notif-btn" id="biz-notif-btn" onclick="BizAssistShell.toggleNotifMenu()" aria-label="Notifications" aria-expanded="false" aria-haspopup="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span class="biz-shell-notif-badge" id="biz-notif-badge" style="display:none;">0</span>
            </button>

            <div class="biz-shell-notif-menu" id="biz-notif-menu" role="menu" aria-label="Recent platform notifications">
              <div class="biz-shell-notif-header">
                <span class="biz-shell-notif-title">Notifications</span>
                <button type="button" class="biz-shell-notif-clear-btn" onclick="BizAssistShell.markAllRead()">Mark all read</button>
              </div>
              <ul class="biz-shell-notif-list" id="biz-notif-list">
                <li class="biz-shell-notif-empty">No notifications yet.</li>
              </ul>
            </div>
          </div>

          <!-- ASK AI TRIGGER -->
          <button type="button" class="biz-shell-ask-ai-btn" onclick="BizAssistShell.toggleFloatingChat()" aria-label="Open AI Assistant">
            <span>Ask AI</span>
          </button>

          <!-- USER MENU -->
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
              <button type="button" class="biz-shell-user-menu-item" onclick="BizAssistShell.openCallbackModal()">
                <span>Request a Call Back</span>
                <span style="font-size:11px; color:var(--shell-muted);">Phone support</span>
              </button>
              <button type="button" class="biz-shell-user-menu-item" onclick="BizAssistShell.handleResetData()">
                <span>Reset Demo Data</span>
                <span style="font-size:11px; color:var(--shell-muted);">(Re-seed)</span>
              </button>
              <button type="button" class="biz-shell-user-menu-item" onclick="window.BizAssistFlow ? window.BizAssistFlow.startTour() : alert('Guided tour available on Home Hub.');">
                <span>Start Guided Tour</span>
                <span style="font-size:11px; color:var(--shell-muted);">(6 Steps)</span>
              </button>
              <a href="/about" class="biz-shell-user-menu-item" style="text-decoration:none;">
                <span>About BizAssist</span>
                <span style="font-size:11px; color:var(--shell-muted);">Product Overview</span>
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

    // Click outside to close menus
    document.addEventListener('click', (e) => {
      const userMenu = document.getElementById('biz-user-menu');
      const userBtn = document.getElementById('biz-user-menu-btn');
      if (userMenu && userBtn && !userBtn.contains(e.target) && !userMenu.contains(e.target)) {
        userMenu.classList.remove('is-open');
        userBtn.setAttribute('aria-expanded', 'false');
      }

      const notifMenu = document.getElementById('biz-notif-menu');
      const notifBtn = document.getElementById('biz-notif-btn');
      if (notifMenu && notifBtn && !notifBtn.contains(e.target) && !notifMenu.contains(e.target)) {
        notifMenu.classList.remove('is-open');
        notifBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Global keyboard shortcut '/' to focus search or open chat
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        const searchInput = document.getElementById('ticket-search') || document.getElementById('search-input') || document.querySelector('input[type="search"]');
        if (searchInput) {
          searchInput.focus();
        } else {
          BizAssistShell.toggleFloatingChat();
        }
      }
    });

    // Update notifications immediately and listen for changes
    BizAssistShell.refreshNotifications();
    if (global.BizAssistStore) {
      global.BizAssistStore.subscribe(() => {
        BizAssistShell.refreshNotifications();
      });
    }
  }

  function injectCallbackModal() {
    if (document.getElementById('biz-callback-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'biz-callback-modal';
    modal.className = 'biz-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Request a Call Back');

    modal.innerHTML = `
      <div class="biz-callback-modal-card">
        <h2 class="biz-callback-modal-title">Request a call back</h2>
        <p class="biz-callback-modal-sub">
          Our specialized support team will contact you directly during your preferred time window.
        </p>

        <form onsubmit="BizAssistShell.handleCallbackSubmit(event)">
          <div class="biz-callback-form-row">
            <label class="biz-callback-label" for="cb-name">Your Full Name</label>
            <input type="text" id="cb-name" class="biz-callback-input" placeholder="e.g. Alex Rivera" required>
          </div>

          <div class="biz-callback-form-row">
            <label class="biz-callback-label" for="cb-phone">Phone Number</label>
            <input type="tel" id="cb-phone" class="biz-callback-input" placeholder="e.g. +1 415 555 0192 or +91 98765 43210" required>
          </div>

          <div class="biz-callback-form-row">
            <label class="biz-callback-label" for="cb-time">Preferred Contact Window</label>
            <select id="cb-time" class="biz-callback-select">
              <option value="Morning (9:00 AM – 12:00 PM)">Morning (9:00 AM – 12:00 PM)</option>
              <option value="Afternoon (12:00 PM – 4:00 PM)" selected>Afternoon (12:00 PM – 4:00 PM)</option>
              <option value="Evening (4:00 PM – 7:00 PM)">Evening (4:00 PM – 7:00 PM)</option>
            </select>
          </div>

          <div class="biz-callback-form-row">
            <label class="biz-callback-label" for="cb-topic">Topic or Ticket Number</label>
            <input type="text" id="cb-topic" class="biz-callback-input" placeholder="e.g. Okta SAML error or #BA-1042" required>
          </div>

          <div class="biz-callback-btn-row">
            <button type="submit" id="btn-cb-submit" class="biz-callback-submit-btn">
              Schedule Call Back
            </button>
            <button type="button" class="biz-callback-cancel-btn" onclick="BizAssistShell.closeCallbackModal()">
              Cancel
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
  }

  function injectFloatingChat() {
    if (document.getElementById('biz-floating-chat')) return;

    const session = global.BizAssistAuth ? global.BizAssistAuth.getSession() : null;
    const userName = session ? session.name : 'Customer';
    const userRole = session ? session.role : 'Customer';

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
          <div style="display:flex; align-items:center; gap:8px;">
            <button type="button" class="biz-chat-bubble-tool-btn" onclick="BizAssistShell.downloadTranscript()" title="Download conversation transcript">Export</button>
            <button type="button" class="biz-chat-drawer-close" onclick="BizAssistShell.toggleFloatingChat()" aria-label="Close Assistant">✕</button>
          </div>
        </div>
        
        <div class="biz-chat-drawer-messages" id="biz-drawer-messages">
          <div class="biz-chat-bubble assistant">
            Hello, ${userName}. I am grounded in BizAssist AI knowledge. I can look up ticket status, draft inquiries, find documentation, or connect you with support.
            
            <div class="biz-chat-quick-actions">
              <button type="button" class="biz-chat-chip" onclick="BizAssistShell.sendQuickMessage('Track ticket #BA-1042')">Track #BA-1042</button>
              <button type="button" class="biz-chat-chip" onclick="BizAssistShell.sendQuickMessage('Track ticket #BA-2089')">Track #BA-2089</button>
              <button type="button" class="biz-chat-chip" onclick="BizAssistShell.sendQuickMessage('Browse knowledge base articles')">Browse Knowledge Base</button>
              <button type="button" class="biz-chat-chip" onclick="BizAssistShell.openCallbackModal()">Request Call Back</button>
              <button type="button" class="biz-chat-chip" onclick="BizAssistShell.sendQuickMessage('I need to speak with a human support agent')">Speak with Human</button>
            </div>
          </div>
        </div>

        <form class="biz-chat-drawer-input-row" onsubmit="BizAssistShell.handleDrawerSubmit(event)">
          <input type="text" id="biz-drawer-input" class="biz-chat-drawer-input" placeholder="Ask a question or track #BA-..." autocomplete="off">
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
        injectCallbackModal();
        injectFloatingChat();
      }
    },

    toggleUserMenu: function () {
      const menu = document.getElementById('biz-user-menu');
      const btn = document.getElementById('biz-user-menu-btn');
      if (!menu) return;
      const isOpen = menu.classList.toggle('is-open');
      if (btn) btn.setAttribute('aria-expanded', String(isOpen));
      
      // Close notif menu if open
      const notifMenu = document.getElementById('biz-notif-menu');
      if (notifMenu) notifMenu.classList.remove('is-open');
    },

    toggleNotifMenu: function () {
      const menu = document.getElementById('biz-notif-menu');
      const btn = document.getElementById('biz-notif-btn');
      if (!menu) return;
      const isOpen = menu.classList.toggle('is-open');
      if (btn) btn.setAttribute('aria-expanded', String(isOpen));
      
      // Close user menu if open
      const userMenu = document.getElementById('biz-user-menu');
      if (userMenu) userMenu.classList.remove('is-open');
    },

    refreshNotifications: function () {
      if (!global.BizAssistStore) return;
      const notifs = global.BizAssistStore.getNotifications();
      const badge = document.getElementById('biz-notif-badge');
      const list = document.getElementById('biz-notif-list');
      if (!badge || !list) return;

      const unread = notifs.filter(n => !n.read);
      if (unread.length > 0) {
        badge.style.display = 'block';
        badge.textContent = unread.length > 9 ? '9+' : unread.length;
      } else {
        badge.style.display = 'none';
      }

      if (notifs.length === 0) {
        list.innerHTML = `<li class="biz-shell-notif-empty">No notifications yet.</li>`;
        return;
      }

      list.innerHTML = notifs.map(n => `
        <li class="biz-shell-notif-item ${!n.read ? 'is-unread' : ''}" onclick="window.location.href='${n.link}'">
          <div class="biz-shell-notif-item-title">${n.title}</div>
          <div class="biz-shell-notif-item-msg">${n.message}</div>
          <div class="biz-shell-notif-item-time">${new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </li>
      `).join('');
    },

    markAllRead: function () {
      if (global.BizAssistStore) {
        global.BizAssistStore.markNotificationsAsRead();
        this.refreshNotifications();
      }
    },

    openCallbackModal: function () {
      const modal = document.getElementById('biz-callback-modal');
      if (modal) {
        modal.classList.add('is-open');
        const session = global.BizAssistAuth ? global.BizAssistAuth.getSession() : null;
        if (session && session.name) {
          const nameInput = document.getElementById('cb-name');
          if (nameInput) nameInput.value = session.name;
        }
        setTimeout(() => {
          const phoneInput = document.getElementById('cb-phone');
          if (phoneInput) phoneInput.focus();
        }, 50);
      }
    },

    closeCallbackModal: function () {
      const modal = document.getElementById('biz-callback-modal');
      if (modal) modal.classList.remove('is-open');
    },

    handleCallbackSubmit: function (e) {
      e.preventDefault();
      const name = document.getElementById('cb-name').value.trim();
      const phone = document.getElementById('cb-phone').value.trim();
      const preferredTime = document.getElementById('cb-time').value;
      const topic = document.getElementById('cb-topic').value.trim();

      if (!name || !phone || !topic) {
        alert('Please complete all fields.');
        return;
      }

      if (global.BizAssistStore) {
        global.BizAssistStore.createCallbackRequest({ name, phone, preferredTime, topic });
      }

      this.closeCallbackModal();
      alert(`Call back requested successfully. Our support team will call ${phone} during ${preferredTime}.`);
    },

    toggleFloatingChat: function () {
      const drawer = document.getElementById('biz-chat-drawer');
      if (!drawer) return;
      const isOpen = drawer.classList.toggle('is-open');
      if (isOpen) {
        const input = document.getElementById('biz-drawer-input');
        if (input) input.focus();
      }
    },

    handleResetData: function () {
      if (confirm('Reset all ticket data, internal notes, activity timelines, and metrics back to initial seed state?')) {
        if (global.BizAssistStore) {
          global.BizAssistStore.resetDemoData();
        }
        alert('Demo data re-seeded successfully.');
        global.location.reload();
      }
    },

    sendQuickMessage: function (msgText) {
      const input = document.getElementById('biz-drawer-input');
      if (input) {
        input.value = msgText;
        this.handleDrawerSubmit(new Event('submit'));
      }
    },

    downloadTranscript: function () {
      if (drawerChatHistory.length === 0) {
        alert('No conversation transcript to export.');
        return;
      }
      let content = `BIZASSIST AI — CONVERSATION TRANSCRIPT\nDate: ${new Date().toLocaleString()}\n\n`;
      drawerChatHistory.forEach(m => {
        content += `[${m.role.toUpperCase()}]: ${m.content}\n\n`;
      });
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bizassist-chat-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    },

    handleDrawerSubmit: async function (e) {
      if (e) e.preventDefault();
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

      // Append to session memory
      drawerChatHistory.push({ role: 'user', content: text });
      if (drawerChatHistory.length > 12) drawerChatHistory.shift();

      const site = getSiteConfig();

      // 1. Check for immediate ticket lookup #BA-XXXX
      const match = text.match(/#?(BA-\d{4})/i);
      if (match && global.BizAssistStore) {
        const t = global.BizAssistStore.getTicket(match[1]);
        if (t) {
          const STAGES = ['Raised', 'Categorised', 'Assigned', 'Replied', 'Resolved'];
          const currentIdx = STAGES.indexOf(t.stage);

          const replyBubble = document.createElement('div');
          replyBubble.className = 'biz-chat-bubble assistant';
          replyBubble.innerHTML = `
            <div class="biz-chat-card-title">Ticket #${t.code}</div>
            <div><strong>Subject:</strong> ${t.subject}</div>
            <div style="margin:4px 0;"><strong>Category:</strong> ${t.category} · <strong>Priority:</strong> ${t.priority}</div>
            <div><strong>Assigned to:</strong> ${t.assignedTo} (${t.assignedTeam})</div>

            <!-- 5-Stage Tracker Card -->
            <div class="biz-chat-tracker">
              ${STAGES.map((s, idx) => {
                let cls = '';
                if (idx < currentIdx) cls = 'completed';
                else if (idx === currentIdx) cls = 'active';
                return `
                  <div class="biz-chat-tracker-step ${cls}">
                    <div class="biz-chat-tracker-dot"></div>
                    <span>${s}</span>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="biz-chat-card-actions">
              <a href="/portal?ticket=${t.code}" class="biz-chat-card-btn">Open in Portal</a>
              <button type="button" class="biz-chat-card-btn secondary" onclick="BizAssistShell.openCallbackModal()">Request Call Back</button>
            </div>
          `;
          messagesContainer.appendChild(replyBubble);
          drawerChatHistory.push({ role: 'assistant', content: `Ticket #${t.code}: ${t.subject} is currently ${t.stage}.` });
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
          return;
        }
      }

      // 2. Check for Knowledge Base Search keyword
      if (text.toLowerCase().includes('browse') || text.toLowerCase().includes('knowledge base') || text.toLowerCase().includes('help articles')) {
        const articles = global.BizAssistStore ? global.BizAssistStore.getArticles().slice(0, 3) : [];
        const replyBubble = document.createElement('div');
        replyBubble.className = 'biz-chat-bubble assistant';
        replyBubble.innerHTML = `
          <div class="biz-chat-card-title">Knowledge Base Articles</div>
          <p style="margin-bottom:8px;">Here are starter articles from our documentation:</p>
          ${articles.map(a => `
            <div class="biz-chat-card">
              <div style="font-weight:600; color:var(--shell-ink);">${a.title}</div>
              <div style="color:var(--shell-secondary); font-size:11px; margin:2px 0;">${a.category}</div>
              <div style="font-size:11px; color:var(--shell-muted);">${a.summary}</div>
            </div>
          `).join('')}
          <div class="biz-chat-card-actions">
            <a href="/portal#knowledge" class="biz-chat-card-btn">Browse All 12 Articles</a>
          </div>
        `;
        messagesContainer.appendChild(replyBubble);
        drawerChatHistory.push({ role: 'assistant', content: 'Presented knowledge base articles.' });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return;
      }

      // 3. Check for Human Handover / Call / Phone
      if (text.toLowerCase().includes('human') || text.toLowerCase().includes('call') || text.toLowerCase().includes('phone') || text.toLowerCase().includes('whatsapp') || text.toLowerCase().includes('person')) {
        const replyBubble = document.createElement('div');
        replyBubble.className = 'biz-chat-bubble assistant';
        replyBubble.innerHTML = `
          <div class="biz-chat-card-title">Connect with Support Team</div>
          <p style="margin-bottom:8px;">You can reach our human operations team via phone, WhatsApp, or schedule an automated call back:</p>
          
          <div class="biz-chat-card-actions">
            <a href="tel:${site.supportPhone.replace(/\s+/g, '')}" class="biz-chat-card-btn">Call: ${site.supportPhoneDisplay || site.supportPhone}</a>
            <a href="https://wa.me/${site.supportWhatsApp}?text=Hi%20BizAssist%2C%20I%20need%20assistance" target="_blank" rel="noopener" class="biz-chat-card-btn secondary">WhatsApp Us</a>
            <button type="button" class="biz-chat-card-btn secondary" onclick="BizAssistShell.openCallbackModal()">Schedule Call Back</button>
          </div>
        `;
        messagesContainer.appendChild(replyBubble);
        drawerChatHistory.push({ role: 'assistant', content: 'Offered human contact channels via phone, WhatsApp, and call back.' });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return;
      }

      // 4. Server-Side /api/chat invocation with streaming
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
            messages: drawerChatHistory
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

          if (fullText) {
            drawerChatHistory.push({ role: 'assistant', content: fullText });
            // Add copy button
            const toolsBar = document.createElement('div');
            toolsBar.className = 'biz-chat-bubble-tools';
            toolsBar.innerHTML = `<button type="button" class="biz-chat-bubble-tool-btn" onclick="navigator.clipboard.writeText('${fullText.replace(/'/g, "\\'").replace(/\n/g, ' ')}')">Copy</button>`;
            thinkingBubble.appendChild(toolsBar);
          } else {
            thinkingBubble.textContent = 'Thank you for reaching out. You can raise a ticket in the Customer Portal or track existing tickets #BA-1042, #BA-2089, or #BA-3310.';
          }
        } else {
          thinkingBubble.innerHTML = `
            I am currently operating in prototype mode. You can check ticket status (#BA-1042, #BA-2089, #BA-3310), search articles, or request a call back from support.
            <div class="biz-chat-card-actions">
              <button type="button" class="biz-chat-card-btn secondary" onclick="BizAssistShell.openCallbackModal()">Schedule Call Back</button>
            </div>
          `;
        }
      } catch (err) {
        thinkingBubble.innerHTML = `
          Prototype Mode: To check status, enter ticket ID (e.g. #BA-1042). For phone assistance, call ${site.supportPhoneDisplay || site.supportPhone}.
        `;
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
