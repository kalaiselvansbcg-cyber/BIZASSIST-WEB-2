/**
 * BizAssist AI — Authentication & Route Guard (js/guard.js)
 * 
 * IMPORTANT SECURITY DISCLAIMER:
 * This is client-side prototype demo authentication for demonstration and UX prototyping.
 * Passwords are salted and hashed with the browser's Web Crypto API (SHA-256) to demonstrate
 * defensive coding without storing plaintext credentials, but client-side storage must never
 * be mistaken for production server-side authentication.
 */
(function (global) {
  'use strict';

  const ACCOUNTS_KEY = 'bizassist.accounts';
  const SESSION_KEY = 'bizassist.session';
  const REDIRECT_KEY = 'bizassist.redirect_after_login';

  // Seed demo accounts
  const DEFAULT_ACCOUNTS = [
    {
      id: 'usr-customer-1',
      name: 'Elena Rostova',
      email: 'customer@bizassist.ai',
      role: 'Customer',
      company: 'CloudCore Systems',
      salt: 'salt_customer_9041',
      // Precomputed SHA-256 for ("salt_customer_9041" + "password123")
      hash: '96041ec352fc875ce13175659891ea5136fa89c09d5ebfe5aa4955b2d2871f9f',
      landingPage: '/portal'
    },
    {
      id: 'usr-agent-1',
      name: 'Sarah Jenkins',
      email: 'agent@bizassist.ai',
      role: 'Agent',
      company: 'BizAssist Operations',
      salt: 'salt_agent_8102',
      // Precomputed SHA-256 for ("salt_agent_8102" + "password123")
      hash: 'fcceba4849a37e171cb9fc52eec89e92dca21ce2cfa0c1bf6212e367876a3a9b',
      landingPage: '/agent-dashboard'
    },
    {
      id: 'usr-manager-1',
      name: 'Marcus Vance',
      email: 'manager@bizassist.ai',
      role: 'Manager',
      company: 'BizAssist Operations',
      salt: 'salt_manager_3310',
      // Precomputed SHA-256 for ("salt_manager_3310" + "password123")
      hash: '3e37f96556b6cc665bc7f4ff68e5e8e8aecececa7b2bbdfab2fb62bfaf758362',
      landingPage: '/manager-overview'
    }
  ];

  async function sha256(text) {
    if (global.crypto && global.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(text);
      const hashBuffer = await global.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback hash simulation if Web Crypto is unavailable
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }

  function getAccounts() {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('BizAssistAuth: reading accounts failed', e);
    }
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
    return DEFAULT_ACCOUNTS;
  }

  function saveAccounts(accs) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accs));
  }

  const BizAssistAuth = {
    /**
     * Get current authenticated session from sessionStorage
     */
    getSession: function () {
      try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn('BizAssistAuth: reading session failed', e);
      }
      return null;
    },

    /**
     * Set active user session
     */
    setSession: function (sessionData) {
      const session = {
        id: sessionData.id || 'usr-' + Date.now(),
        name: sessionData.name || 'User',
        email: sessionData.email,
        role: sessionData.role || 'Customer',
        company: sessionData.company || 'Enterprise Workspace',
        signedInAt: new Date().toISOString()
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    },

    /**
     * Check if user is currently signed in
     */
    isAuthenticated: function () {
      return Boolean(this.getSession());
    },

    /**
     * Sign in with email and password
     */
    signIn: async function (email, password) {
      const cleanEmail = String(email || '').trim().toLowerCase();
      const accounts = getAccounts();
      const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);

      if (!account) {
        return { success: false, error: 'No account found with that email address.' };
      }

      const inputHash = await sha256(account.salt + password);
      if (inputHash !== account.hash) {
        return { success: false, error: 'Incorrect password. Try "password123" for demo users.' };
      }

      const session = this.setSession(account);
      return { success: true, session, landingPage: account.landingPage || '/app' };
    },

    /**
     * One-click demo sign in for Customer, Agent, or Manager
     */
    signInAsDemo: async function (role) {
      const roleCapitalized = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
      const email = roleCapitalized.toLowerCase() + '@bizassist.ai';
      return await this.signIn(email, 'password123');
    },

    /**
     * Create a new demo account (stored in localStorage)
     */
    createAccount: async function ({ name, email, password, role, company }) {
      const cleanEmail = String(email || '').trim().toLowerCase();
      const accounts = getAccounts();
      if (accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      const salt = 'salt_' + Math.random().toString(36).substring(2, 10);
      const hash = await sha256(salt + password);
      const roleVal = role || 'Customer';
      const landing = roleVal === 'Manager' ? '/manager-overview' : (roleVal === 'Agent' ? '/agent-dashboard' : '/portal');

      const newAccount = {
        id: 'usr-' + Date.now(),
        name: name || 'Demo User',
        email: cleanEmail,
        role: roleVal,
        company: company || 'Enterprise Client',
        salt,
        hash,
        landingPage: landing
      };

      accounts.push(newAccount);
      saveAccounts(accounts);

      const session = this.setSession(newAccount);
      return { success: true, session, landingPage: landing };
    },

    /**
     * Sign out current user and redirect to login
     */
    signOut: function () {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(REDIRECT_KEY);
      global.location.href = '/';
    },

    /**
     * Get redirect destination after sign-in (deep link or default landing)
     */
    getPostLoginDestination: function (defaultLanding) {
      const saved = sessionStorage.getItem(REDIRECT_KEY);
      if (saved) {
        sessionStorage.removeItem(REDIRECT_KEY);
        return saved;
      }
      return defaultLanding || '/app';
    },

    /**
     * Guard execution for protected pages
     */
    guardPage: function (allowedRoles) {
      const path = global.location.pathname;
      const isPublic = path === '/' || path.endsWith('index.html') || path.endsWith('about.html') || path.endsWith('about') || path.endsWith('404.html');

      // If user is on login page and already logged in, redirect to /app
      if ((path === '/' || path.endsWith('index.html') || path.endsWith('login.html')) && this.isAuthenticated()) {
        const session = this.getSession();
        const dest = session.role === 'Manager' ? '/manager-overview' : (session.role === 'Agent' ? '/agent-dashboard' : '/portal');
        global.location.href = dest;
        return;
      }

      if (isPublic) return;

      const session = this.getSession();
      if (!session) {
        // Save current relative URL for post-login redirection
        const currentTarget = global.location.pathname + global.location.search + global.location.hash;
        sessionStorage.setItem(REDIRECT_KEY, currentTarget);
        global.location.href = '/';
        return;
      }

      // Check role authorization if specified
      if (allowedRoles && allowedRoles.length > 0) {
        const normalized = allowedRoles.map(r => r.toLowerCase());
        const userRole = (session.role || '').toLowerCase();
        if (!normalized.includes(userRole) && userRole !== 'admin') {
          this.renderAccessDenied(session.role, allowedRoles);
        }
      }
    },

    renderAccessDenied: function (userRole, allowedRoles) {
      document.addEventListener('DOMContentLoaded', () => {
        const main = document.querySelector('main') || document.body;
        main.innerHTML = `
          <div style="min-height:70vh; display:flex; align-items:center; justify-content:center; padding:40px 24px;">
            <div style="max-width:520px; width:100%; border:1px solid var(--line, #E3DED6); background:#FFFFFF; padding:40px; text-align:center;">
              <span style="font-family:var(--font-mono, monospace); font-size:12px; text-transform:uppercase; letter-spacing:0.1em; color:var(--text-muted, #6F6A61); display:block; margin-bottom:12px;">Restricted Access</span>
              <h1 style="font-family:var(--font-serif, 'Cormorant Garamond', Georgia, serif); font-size:32px; font-weight:400; margin-bottom:16px;">Role Permission Required</h1>
              <p style="font-size:14px; color:var(--text-secondary, #5E5A53); line-height:1.6; margin-bottom:28px;">
                Your current session role is <strong>${userRole}</strong>. This section requires <strong>${allowedRoles.join(' or ')}</strong> clearance.
              </p>
              <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
                <a href="${userRole === 'Customer' ? '/portal' : '/app'}" class="ql-btn" style="display:inline-block; padding:12px 24px; background:#111111; color:#FAF8F5; text-decoration:none; font-size:13px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase;">
                  Return to My Workspace
                </a>
                <button onclick="BizAssistAuth.signOut()" class="ql-btn" style="padding:12px 24px; background:transparent; border:1px solid #111111; color:#111111; font-size:13px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; cursor:pointer;">
                  Switch User
                </button>
              </div>
            </div>
          </div>
        `;
      });
    }
  };

  // Expose globally
  global.BizAssistAuth = BizAssistAuth;

  // Auto-run guard on page load
  BizAssistAuth.guardPage();

})(typeof window !== 'undefined' ? window : globalThis);
