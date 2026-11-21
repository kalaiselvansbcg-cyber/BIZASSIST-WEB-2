/**
 * BizAssist AI — Shared Layout & Shell Component (js/shell.js)
 * 
 * Injects the shared Modern SaaS header, role-based navigation, breadcrumbs,
 * dark mode toggle, command palette (Cmd+K), notification centre bell,
 * user dropdown, call-back request modal, and intelligent streaming AI assistant.
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

  // Theme Management
  function initTheme() {
    const saved = global.localStorage ? global.localStorage.getItem('bizassist.theme') : null;
    const prefersDark = global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    return theme;
  }

  const currentTheme = initTheme();

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

        <!-- Role Quick Switcher -->
        <div class="biz-shell-role-switcher" title="Quickly preview workspace in different roles">
          <button type="button" class="biz-shell-role-btn ${userRole === 'Customer' ? 'active' : ''}" onclick="BizAssistShell.switchRole('Customer')">Customer</button>
          <button type="button" class="biz-shell-role-btn ${userRole === 'Agent' ? 'active' : ''}" onclick="BizAssistShell.switchRole('Agent')">Agent</button>
          <button type="button" class="biz-shell-role-btn ${userRole === 'Manager' || userRole === 'Admin' ? 'active' : ''}" onclick="BizAssistShell.switchRole('Manager')">Manager</button>
        </div>

        <nav class="biz-shell-nav" aria-label="Main Navigation">
          ${navLinks.map(link => {
      const isActive = currentRoute === link.href ? 'active' : '';
      return `<a href="${link.href}" class="biz-shell-nav-link ${isActive}">${link.label}</a>`;
    }).join('')}
        </nav>

        <div class="biz-shell-actions">
          
          <!-- SEARCH / COMMAND PALETTE TRIGGER -->
          <button type="button" class="biz-shell-search-btn" onclick="BizAssistShell.openCommandPalette()" aria-label="Search or Quick Command">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Search</span>
            <span class="biz-shell-kbd">⌘K</span>
          </button>

          <!-- THEME TOGGLE (LIGHT / DARK) -->
          <button type="button" class="biz-shell-theme-btn" id="biz-theme-btn" onclick="BizAssistShell.toggleTheme()" aria-label="Toggle Light / Dark theme" title="Toggle theme">
            <svg id="theme-icon-moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${document.documentElement.getAttribute('data-theme') === 'dark' ? 'display:none;' : 'display:block;'}">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <svg id="theme-icon-sun" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${document.documentElement.getAttribute('data-theme') === 'dark' ? 'display:block;' : 'display:none;'}">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </button>

          <!-- NOTIFICATION CENTRE BELL -->
          <div class="biz-shell-notif-wrapper">
            <button type="button" class="biz-shell-notif-btn" id="biz-notif-btn" onclick="BizAssistShell.toggleNotifMenu()" aria-label="Notifications" aria-expanded="false" aria-haspopup="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
            </svg>
            <span>Ask AI</span>
          </button>

          <!-- USER MENU -->
          <div class="biz-shell-user-wrapper">
            <button type="button" class="biz-shell-user-btn" id="biz-user-menu-btn" onclick="BizAssistShell.toggleUserMenu()" aria-expanded="false" aria-haspopup="true">
              <span style="font-weight:600; font-size:13px;">${session ? session.name : 'Demo User'}</span>
              <span class="biz-shell-user-role-badge">${userRole}</span>
              <span style="font-size:10px; color:var(--shell-muted);">▼</span>
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
              <button type="button" class="biz-shell-user-menu-item" onclick="BizAssistShell.openShortcutsModal()">
                <span>Keyboard Shortcuts</span>
                <span style="font-size:11px; color:var(--shell-muted);"><kbd>?</kbd></span>
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
              <button type="button" class="biz-shell-user-menu-item danger" onclick="BizAssistAuth.signOut()">
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

    // Keyboard shortcuts listener
    document.addEventListener('keydown', (e) => {
      // 1. Cmd/Ctrl + K => Open Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        BizAssistShell.openCommandPalette();
        return;
      }

      // If typing in input, don't trigger global shortcuts
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      // 2. '?' => Open Shortcuts Cheat Sheet
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        BizAssistShell.openShortcutsModal();
        return;
      }

      // 3. '/' => Focus search or trigger palette
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('ticket-search') || document.getElementById('search-input') || document.querySelector('input[type="search"]');
        if (searchInput) {
          searchInput.focus();
        } else {
          BizAssistShell.openCommandPalette();
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

  function injectCommandPalette() {
    if (document.getElementById('biz-command-palette')) return;

    const modal = document.createElement('div');
    modal.id = 'biz-command-palette';
    modal.className = 'biz-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Command Palette');

    modal.innerHTML = `
      <div class="command-palette-card" onclick="event.stopPropagation()">
        <input type="text" id="command-palette-input" class="command-palette-input" placeholder="Search tickets, customers, articles, or jump to page... (Esc to close)" autocomplete="off">
        <ul id="command-palette-results" class="command-results-list">
          <!-- Populated dynamically -->
        </ul>
      </div>
    `;

    modal.addEventListener('click', () => {
      BizAssistShell.closeCommandPalette();
    });

    document.body.appendChild(modal);

    const input = document.getElementById('command-palette-input');
    input.addEventListener('input', (e) => {
      BizAssistShell.filterCommandResults(e.target.value.trim());
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        BizAssistShell.closeCommandPalette();
      }
    });
  }

  function injectShortcutsModal() {
    if (document.getElementById('biz-shortcuts-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'biz-shortcuts-modal';
    modal.className = 'biz-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Keyboard Shortcuts');

    modal.innerHTML = `
      <div class="biz-modal-card" onclick="event.stopPropagation()">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h2 style="font-size:18px;">Keyboard Shortcuts</h2>
          <button type="button" onclick="BizAssistShell.closeShortcutsModal()" style="background:none; border:none; font-size:18px; cursor:pointer; color:var(--muted);">✕</button>
        </div>
        <p style="font-size:13px; color:var(--ink-soft); margin-bottom:16px;">
          Navigate and process customer inquiries at high speed without touching your mouse.
        </p>

        <table class="shortcuts-table">
          <tbody>
            <tr>
              <td><span class="shortcuts-key">J</span></td>
              <td>Select next ticket in agent queue</td>
            </tr>
            <tr>
              <td><span class="shortcuts-key">K</span></td>
              <td>Select previous ticket in agent queue</td>
            </tr>
            <tr>
              <td><span class="shortcuts-key">R</span></td>
              <td>Focus reply composer</td>
            </tr>
            <tr>
              <td><span class="shortcuts-key">E</span></td>
              <td>Mark selected ticket as Resolved</td>
            </tr>
            <tr>
              <td><span class="shortcuts-key">/</span></td>
              <td>Focus queue search box / canned responses menu</td>
            </tr>
            <tr>
              <td><span class="shortcuts-key">⌘K</span> / <span class="shortcuts-key">Ctrl+K</span></td>
              <td>Open global command palette & universal search</td>
            </tr>
            <tr>
              <td><span class="shortcuts-key">?</span></td>
              <td>Open this shortcuts cheat sheet</td>
            </tr>
            <tr>
              <td><span class="shortcuts-key">Esc</span></td>
              <td>Close active modal or drawer</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:20px; text-align:right;">
          <button type="button" class="btn-primary" onclick="BizAssistShell.closeShortcutsModal()">Got it</button>
        </div>
      </div>
    `;

    modal.addEventListener('click', () => {
      BizAssistShell.closeShortcutsModal();
    });

    document.body.appendChild(modal);
  }

  function injectFloatingChat() {
    if (document.getElementById('biz-floating-chat')) return;

    const session = global.BizAssistAuth ? global.BizAssistAuth.getSession() : null;
    const userName = session ? session.name : 'Customer';

    const wrap = document.createElement('div');
    wrap.id = 'biz-floating-chat';
    wrap.innerHTML = `
      <button type="button" class="biz-floating-chat-trigger" onclick="BizAssistShell.toggleFloatingChat()" aria-label="Toggle AI Assistant Drawer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
        </svg>
        <span>AI Assistant</span>
      </button>

      <div class="biz-floating-chat-drawer" id="biz-chat-drawer" role="dialog" aria-modal="true" aria-label="BizAssist AI Assistant">
        <div class="biz-floating-chat-header">
          <div style="font-size:14px; font-weight:700;">BizAssist AI Assistant</div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button type="button" class="biz-chat-bubble-tool-btn" onclick="window.clearUserData()" title="Clear personal data and chat history">Clear Data</button>
            <button type="button" class="biz-chat-bubble-tool-btn" onclick="BizAssistShell.downloadTranscript()" title="Download conversation transcript">Export</button>
            <button type="button" onclick="BizAssistShell.toggleFloatingChat()" aria-label="Close Assistant" style="background:none; border:none; font-size:16px; cursor:pointer; color:var(--muted);">✕</button>
          </div>
        </div>
        
        <div class="biz-floating-chat-body" id="biz-drawer-messages">
          <div class="biz-chat-bubble bot">
            Hello, ${userName}. I am grounded in BizAssist AI knowledge. I can look up ticket status, draft inquiries, find documentation, or connect you with human support.
            
            <div class="biz-chat-quick-actions">
              <button type="button" class="biz-chat-chip" onclick="BizAssistShell.sendQuickMessage('Track ticket #BA-1042')">Track #BA-1042</button>
              <button type="button" class="biz-chat-chip" onclick="BizAssistShell.sendQuickMessage('Track ticket #BA-3310')">Track #BA-3310</button>
              <button type="button" class="biz-chat-chip" onclick="BizAssistShell.sendQuickMessage('Browse knowledge base articles')">Browse Knowledge Base</button>
              <button type="button" class="biz-chat-chip" onclick="BizAssistShell.openCallbackModal()">Request Call Back</button>
              <button type="button" class="biz-chat-chip" onclick="BizAssistShell.sendQuickMessage('I need to speak with a human support agent')">Speak with Human</button>
            </div>
          </div>
        </div>

        <form class="biz-floating-chat-input-row" onsubmit="BizAssistShell.handleDrawerSubmit(event)">
          <input type="text" id="biz-drawer-input" class="biz-floating-chat-input" placeholder="Ask a question or track #BA-..." autocomplete="off">
          <button type="submit" id="biz-drawer-send-btn" class="biz-floating-chat-send">Send</button>
        </form>

        <div class="biz-floating-chat-privacy" style="font-size:10.5px; color:var(--shell-muted, #71717A); padding:6px 14px 10px 14px; background:var(--shell-surface, #FFFFFF); border-top:1px solid var(--shell-line, #E4E4E7); display:flex; justify-content:space-between; align-items:center;">
          <span>Don't enter passwords or card numbers. Messages are sent to Google Gemini to generate replies.</span>
          <button type="button" onclick="window.clearUserData()" style="background:none; border:none; color:var(--shell-ink, #18181B); font-size:10px; text-decoration:underline; cursor:pointer; padding:0; margin-left:6px; flex-shrink:0;">Clear my data</button>
        </div>
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
        injectCommandPalette();
        injectShortcutsModal();
        injectFloatingChat();
      }
    },

    toggleTheme: function () {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      if (global.localStorage) {
        global.localStorage.setItem('bizassist.theme', next);
      }

      // Update sun/moon icons
      const moon = document.getElementById('theme-icon-moon');
      const sun = document.getElementById('theme-icon-sun');
      if (moon && sun) {
        if (next === 'dark') {
          moon.style.display = 'none';
          sun.style.display = 'block';
        } else {
          moon.style.display = 'block';
          sun.style.display = 'none';
        }
      }
    },

    switchRole: function (role) {
      if (global.BizAssistAuth) {
        const session = global.BizAssistAuth.getSession() || { name: 'Demo User', email: 'user@bizassist.ai' };
        session.role = role;
        global.BizAssistAuth.setSession(session);

        // Route to default view
        if (role === 'Customer') global.location.href = '/portal';
        else if (role === 'Agent') global.location.href = '/agent-dashboard';
        else global.location.href = '/manager-overview';
      }
    },

    openCommandPalette: function () {
      const modal = document.getElementById('biz-command-palette');
      if (modal) {
        modal.classList.add('active');
        const input = document.getElementById('command-palette-input');
        if (input) {
          input.value = '';
          input.focus();
          this.filterCommandResults('');
        }
      }
    },

    closeCommandPalette: function () {
      const modal = document.getElementById('biz-command-palette');
      if (modal) modal.classList.remove('active');
    },

    filterCommandResults: function (query) {
      const list = document.getElementById('command-palette-results');
      if (!list) return;

      const q = query.toLowerCase();
      const results = [];

      // 1. Navigation items
      const NAV_ITEMS = [
        { title: 'Agent Queue Dashboard', category: 'Navigation', url: '/agent-dashboard' },
        { title: 'Customer Ticket Portal', category: 'Navigation', url: '/portal' },
        { title: 'Manager Overview & SLA Analytics', category: 'Navigation', url: '/manager-overview' },
        { title: 'AI Triage Engine Studio', category: 'Navigation', url: '/ai-triage' },
        { title: 'AI Suggested Replies Studio', category: 'Navigation', url: '/suggested-replies' },
        { title: 'Knowledge Assistant Chatbot', category: 'Navigation', url: '/chatbot' },
        { title: 'Home Hub', category: 'Navigation', url: '/app' }
      ];

      NAV_ITEMS.forEach(item => {
        if (!q || item.title.toLowerCase().includes(q)) {
          results.push(item);
        }
      });

      // 2. Tickets
      if (global.BizAssistStore) {
        const tickets = global.BizAssistStore.getTickets();
        tickets.forEach(t => {
          if (!q || t.code.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.contactName.toLowerCase().includes(q)) {
            results.push({
              title: `#${t.code} — ${t.subject}`,
              category: `Ticket (${t.priority})`,
              url: `/agent-dashboard?ticket=${t.code}`
            });
          }
        });

        // 3. Articles
        const articles = global.BizAssistStore.getArticles();
        articles.forEach(a => {
          if (!q || a.title.toLowerCase().includes(q) || a.tags.some(tag => tag.toLowerCase().includes(q))) {
            results.push({
              title: a.title,
              category: `Knowledge Base (${a.category})`,
              url: `/portal#knowledge`
            });
          }
        });
      }

      const display = results.slice(0, 10);
      if (display.length === 0) {
        list.innerHTML = `<li style="padding:16px 20px; font-size:13px; color:var(--muted); text-align:center;">No matching results for "${query}".</li>`;
        return;
      }

      list.innerHTML = display.map(r => `
        <li class="command-result-item" onclick="window.location.href='${r.url}'">
          <div style="font-weight:500; font-size:13px; color:var(--ink);">${r.title}</div>
          <div style="font-size:11px; color:var(--muted); font-family:var(--font-mono);">${r.category}</div>
        </li>
      `).join('');
    },

    openShortcutsModal: function () {
      const modal = document.getElementById('biz-shortcuts-modal');
      if (modal) modal.classList.add('active');
    },

    closeShortcutsModal: function () {
      const modal = document.getElementById('biz-shortcuts-modal');
      if (modal) modal.classList.remove('active');
    },

    toggleUserMenu: function () {
      const menu = document.getElementById('biz-user-menu');
      const btn = document.getElementById('biz-user-menu-btn');
      if (!menu) return;
      const isOpen = menu.classList.toggle('is-open');
      if (btn) btn.setAttribute('aria-expanded', String(isOpen));

      const notifMenu = document.getElementById('biz-notif-menu');
      if (notifMenu) notifMenu.classList.remove('is-open');
    },

    toggleNotifMenu: function () {
      const menu = document.getElementById('biz-notif-menu');
      const btn = document.getElementById('biz-notif-btn');
      if (!menu) return;
      const isOpen = menu.classList.toggle('is-open');
      if (btn) btn.setAttribute('aria-expanded', String(isOpen));

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
        modal.classList.add('active');
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
      if (modal) modal.classList.remove('active');
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

      const userBubble = document.createElement('div');
      userBubble.className = 'biz-chat-bubble user';
      userBubble.textContent = text;
      messagesContainer.appendChild(userBubble);
      input.value = '';
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      drawerChatHistory.push({ role: 'user', content: text });
      if (drawerChatHistory.length > 12) drawerChatHistory.shift();

      const site = getSiteConfig();

      // Ticket lookup #BA-XXXX
      const match = text.match(/#?(BA-\d{4})/i);
      if (match && global.BizAssistStore) {
        const t = global.BizAssistStore.getTicket(match[1]);
        if (t) {
          const STAGES = ['Raised', 'Categorised', 'Assigned', 'Replied', 'Resolved'];
          const currentIdx = STAGES.indexOf(t.stage);

          const replyBubble = document.createElement('div');
          replyBubble.className = 'biz-chat-bubble bot';
          replyBubble.innerHTML = `
            <div style="font-weight:700; margin-bottom:4px;">Ticket #${t.code}</div>
            <div><strong>Subject:</strong> ${t.subject}</div>
            <div style="margin:4px 0;"><strong>Category:</strong> ${t.category} · <strong>Priority:</strong> ${t.priority}</div>
            <div><strong>Assigned to:</strong> ${t.assignedTo} (${t.assignedTeam})</div>

            <div class="biz-chat-tracker" style="margin:10px 0;">
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

      // Knowledge Base keyword
      if (text.toLowerCase().includes('browse') || text.toLowerCase().includes('knowledge base') || text.toLowerCase().includes('help articles')) {
        const articles = global.BizAssistStore ? global.BizAssistStore.getArticles().slice(0, 3) : [];
        const replyBubble = document.createElement('div');
        replyBubble.className = 'biz-chat-bubble bot';
        replyBubble.innerHTML = `
          <div style="font-weight:700; margin-bottom:4px;">Knowledge Base Articles</div>
          <p style="margin-bottom:8px; font-size:12px;">Here are articles from our verified documentation:</p>
          ${articles.map(a => `
            <div style="background:var(--surface); border:1px solid var(--shell-line); border-radius:6px; padding:8px; margin-bottom:6px;">
              <div style="font-weight:600; color:var(--shell-ink); font-size:12px;">${a.title}</div>
              <div style="font-size:11px; color:var(--shell-muted); margin-top:2px;">${a.summary}</div>
            </div>
          `).join('')}
          <div class="biz-chat-card-actions">
            <a href="/portal#knowledge" class="biz-chat-card-btn">Browse All Articles</a>
          </div>
        `;
        messagesContainer.appendChild(replyBubble);
        drawerChatHistory.push({ role: 'assistant', content: 'Presented knowledge base articles.' });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return;
      }

      // Handover / Call
      if (text.toLowerCase().includes('human') || text.toLowerCase().includes('call') || text.toLowerCase().includes('phone') || text.toLowerCase().includes('whatsapp') || text.toLowerCase().includes('person')) {
        const replyBubble = document.createElement('div');
        replyBubble.className = 'biz-chat-bubble bot';
        replyBubble.innerHTML = `
          <div style="font-weight:700; margin-bottom:4px;">Connect with Support Team</div>
          <p style="margin-bottom:8px; font-size:12px;">You can reach our human operations team via phone, WhatsApp, or schedule an automated call back:</p>
          
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

      // Server /api/chat invocation with typing indicator and textContent rendering
      const sendBtn = document.getElementById('biz-drawer-send-btn');
      if (sendBtn) sendBtn.disabled = true;
      input.disabled = true;

      const thinkingBubble = document.createElement('div');
      thinkingBubble.className = 'biz-chat-bubble bot';
      thinkingBubble.textContent = 'Thinking...';
      messagesContainer.appendChild(thinkingBubble);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: drawerChatHistory.slice(-10),
            page: 'widget'
          })
        });

        const data = await res.json().catch(() => ({}));
        const botText = data.reply || data.text || 'Thank you for reaching out. You can raise a ticket in the Customer Portal or track existing tickets #BA-1042, #BA-3310, or #BA-2089.';
        
        thinkingBubble.textContent = botText;
        drawerChatHistory.push({ role: 'assistant', content: botText });
        if (global.sessionStorage) {
          global.sessionStorage.setItem('bizassist.drawer_history', JSON.stringify(drawerChatHistory.slice(-20)));
        }

        const toolsBar = document.createElement('div');
        toolsBar.className = 'biz-chat-bubble-tools';
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'biz-chat-bubble-tool-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = () => navigator.clipboard.writeText(botText);
        toolsBar.appendChild(copyBtn);
        thinkingBubble.appendChild(toolsBar);

      } catch (err) {
        thinkingBubble.textContent = `Prototype Mode: To check status, enter ticket ID (e.g. #BA-1042). For direct support, call ${site.supportPhoneDisplay || site.supportPhone || '+91 00000 00000'}.`;
      } finally {
        if (sendBtn) sendBtn.disabled = false;
        input.disabled = false;
        input.focus();
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  };

  /**
   * Clears all user-generated data from localStorage and sessionStorage.
   * Resets chat history, demo state, and ticket overrides to defaults.
   * Shows confirmation before proceeding.
   */
  function clearUserData() {
    const confirmed = global.confirm("This will permanently delete your chat history and tickets from this browser. Continue?");
    if (!confirmed) return false;

    try {
      if (global.sessionStorage) {
        global.sessionStorage.removeItem('bizassist.chat_history');
        global.sessionStorage.removeItem('bizassist.drawer_history');
        global.sessionStorage.removeItem('bizassist_chat_history');
        global.sessionStorage.removeItem('bizassist.tour_active');
        global.sessionStorage.removeItem('bizassist.tour_step');
      }

      if (global.localStorage) {
        global.localStorage.removeItem('bizassist.data');
        global.localStorage.removeItem('bizassist.chat_history');
        global.localStorage.removeItem('bizassist.demo_state');
        global.localStorage.removeItem('bizassist_tickets');
        global.localStorage.removeItem('bizassist.custom_tickets');
      }

      document.querySelectorAll('input:not([type="submit"]):not([type="button"]):not([type="radio"]):not([type="checkbox"]), textarea').forEach(el => {
        if (el.id !== 'tracker-input-id') el.value = '';
      });

      if (global.BizAssistStore && typeof global.BizAssistStore.resetStore === 'function') {
        global.BizAssistStore.resetStore();
      }

      if (global.BizAssistShowToast) {
        global.BizAssistShowToast("All personal data, chat history, and ticket overrides cleared.");
      } else {
        alert("All personal data, chat history, and ticket overrides cleared.");
      }

      setTimeout(() => {
        global.location.reload();
      }, 500);

      return true;
    } catch (err) {
      console.error('Failed to clear user data:', err);
      return false;
    }
  }

  global.clearUserData = clearUserData;
  BizAssistShell.clearUserData = clearUserData;

  global.BizAssistShell = BizAssistShell;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', BizAssistShell.init);
  } else {
    BizAssistShell.init();
  }

})(typeof window !== 'undefined' ? window : globalThis);
