/**
 * BizAssist AI — Authentication, Password Reset & Route Guard (js/guard.js)
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
  const RESET_CODES_KEY = 'bizassist.reset_codes';
  const RESET_RATE_KEY = 'bizassist.reset_rate_limit';

  // Seed demo accounts with verified SHA-256 hashes of ("salt" + "password123")
  const DEFAULT_ACCOUNTS = [
    {
      id: 'usr-customer-1',
      name: 'Elena Rostova',
      email: 'customer@bizassist.ai',
      role: 'Customer',
      company: 'CloudCore Systems',
      salt: 'salt_customer_9041',
      // Verified SHA-256 for ("salt_customer_9041" + "password123")
      hash: 'aafdc52f568714731e728763a8036e73fbf63cdb03bb5949eec0ca4a278e1b65',
      landingPage: '/portal'
    },
    {
      id: 'usr-agent-1',
      name: 'Sarah Jenkins',
      email: 'agent@bizassist.ai',
      role: 'Agent',
      company: 'BizAssist Operations',
      salt: 'salt_agent_8102',
      // Verified SHA-256 for ("salt_agent_8102" + "password123")
      hash: '1e2dc2b78b66fbb98f9bb4a8ad4f3d585db51ceea7906c322184d8c5c18b0e69',
      landingPage: '/agent-dashboard'
    },
    {
      id: 'usr-manager-1',
      name: 'Marcus Vance',
      email: 'manager@bizassist.ai',
      role: 'Manager',
      company: 'BizAssist Operations',
      salt: 'salt_manager_3310',
      // Verified SHA-256 for ("salt_manager_3310" + "password123")
      hash: 'a829d564b748d88f06a48d22583ad32bc2f4ae54834af21703e7e44b89c01786',
      landingPage: '/manager-overview'
    }
  ];

  // In-memory fallback if localStorage/sessionStorage is blocked
  const memoryStorage = {
    local: {},
    session: {}
  };

  function safeGetItem(type, key) {
    try {
      if (type === 'session' && global.sessionStorage) {
        return global.sessionStorage.getItem(key);
      }
      if (type === 'local' && global.localStorage) {
        return global.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[BizAssistAuth] Storage access restricted for ${key}`, e);
    }
    return memoryStorage[type][key] || null;
  }

  function safeSetItem(type, key, value) {
    try {
      if (type === 'session' && global.sessionStorage) {
        global.sessionStorage.setItem(key, value);
        return;
      }
      if (type === 'local' && global.localStorage) {
        global.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn(`[BizAssistAuth] Storage write restricted for ${key}`, e);
    }
    memoryStorage[type][key] = String(value);
  }

  function safeRemoveItem(type, key) {
    try {
      if (type === 'session' && global.sessionStorage) {
        global.sessionStorage.removeItem(key);
        return;
      }
      if (type === 'local' && global.localStorage) {
        global.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn(`[BizAssistAuth] Storage delete restricted for ${key}`, e);
    }
    delete memoryStorage[type][key];
  }

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
      const raw = safeGetItem('local', ACCOUNTS_KEY);
      if (raw) {
        let parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Self-heal / auto-migrate demo accounts if hashes are outdated
          let needsUpdate = false;
          DEFAULT_ACCOUNTS.forEach(seed => {
            const existingIdx = parsed.findIndex(a => a.email.toLowerCase() === seed.email.toLowerCase());
            if (existingIdx !== -1) {
              if (parsed[existingIdx].hash !== seed.hash) {
                parsed[existingIdx].salt = seed.salt;
                parsed[existingIdx].hash = seed.hash;
                needsUpdate = true;
              }
            } else {
              parsed.push(seed);
              needsUpdate = true;
            }
          });
          if (needsUpdate) {
            safeSetItem('local', ACCOUNTS_KEY, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[BizAssistAuth] Reading accounts failed, using defaults.', e);
    }
    safeSetItem('local', ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
    return DEFAULT_ACCOUNTS;
  }

  function saveAccounts(accs) {
    safeSetItem('local', ACCOUNTS_KEY, JSON.stringify(accs));
  }

  const BizAssistAuth = {
    /**
     * Get current authenticated session
     */
    getSession: function () {
      try {
        const raw = safeGetItem('session', SESSION_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn('[BizAssistAuth] Reading session failed', e);
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
      safeSetItem('session', SESSION_KEY, JSON.stringify(session));
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
        return { success: false, error: 'No account found with this email address.' };
      }

      const inputHash = await sha256(account.salt + password);
      if (inputHash !== account.hash) {
        return { success: false, error: 'Incorrect password. (For demo users: password123)' };
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
     * Create a new demo account
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
      safeRemoveItem('session', SESSION_KEY);
      safeRemoveItem('session', REDIRECT_KEY);
      global.location.href = '/';
    },

    /**
     * Request Password Reset Code
     * - Rate limits to 3 requests per 15 minutes per email
     * - Generates 6-digit code valid for 10 minutes
     * - Stores SHA-256 hash of the code + salt with attempt count (max 5)
     * - Dispatches via /api/send-reset if real email enabled
     */
    requestPasswordReset: async function (email) {
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }

      // Check Rate Limiting: max 3 requests per 15 mins
      const now = Date.now();
      let rateData = {};
      try {
        const rawRate = safeGetItem('local', RESET_RATE_KEY);
        if (rawRate) rateData = JSON.parse(rawRate);
      } catch (e) {}

      const history = rateData[cleanEmail] || [];
      const recentRequests = history.filter(t => now - t < 15 * 60 * 1000);
      if (recentRequests.length >= 3) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please wait 15 minutes before requesting another reset code.'
        };
      }
      recentRequests.push(now);
      rateData[cleanEmail] = recentRequests;
      safeSetItem('local', RESET_RATE_KEY, JSON.stringify(rateData));

      // Neutral security response message
      const neutralMessage = 'If an account exists for this email, a 6-digit reset code has been generated.';

      const accounts = getAccounts();
      const accountExists = accounts.some(a => a.email.toLowerCase() === cleanEmail);

      // If account does not exist, return neutral response without generating code
      if (!accountExists) {
        return {
          success: true,
          neutralMessage,
          demoCode: null,
          email: cleanEmail
        };
      }

      // Generate 6-digit code
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const codeHash = await sha256(cleanEmail + code + 'bizassist_reset_salt');
      const expiresAt = now + 10 * 60 * 1000; // 10 minutes

      let resetCodes = {};
      try {
        const rawCodes = safeGetItem('local', RESET_CODES_KEY);
        if (rawCodes) resetCodes = JSON.parse(rawCodes);
      } catch (e) {}

      resetCodes[cleanEmail] = {
        codeHash,
        expiresAt,
        attempts: 0
      };
      safeSetItem('local', RESET_CODES_KEY, JSON.stringify(resetCodes));

      // Check site config
      const siteConfig = global.BIZASSIST_SITE || global.SITE || {};
      const showDemoCode = siteConfig.DEMO_SHOW_RESET_CODE !== false;

      // Optional real email dispatch
      if (siteConfig.ENABLE_REAL_EMAIL) {
        try {
          fetch('/api/send-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, code })
          }).catch(err => console.warn('[send-reset] async dispatch warning', err));
        } catch (e) {}
      }

      return {
        success: true,
        neutralMessage,
        demoCode: showDemoCode ? code : null,
        email: cleanEmail
      };
    },

    /**
     * Verify 6-digit reset code
     * Max 5 wrong attempts allowed
     */
    verifyResetCode: async function (email, code) {
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanCode = String(code || '').trim();

      let resetCodes = {};
      try {
        const rawCodes = safeGetItem('local', RESET_CODES_KEY);
        if (rawCodes) resetCodes = JSON.parse(rawCodes);
      } catch (e) {}

      const record = resetCodes[cleanEmail];
      if (!record) {
        return { success: false, error: 'No active reset request found for this email. Please request a new code.' };
      }

      if (Date.now() > record.expiresAt) {
        delete resetCodes[cleanEmail];
        safeSetItem('local', RESET_CODES_KEY, JSON.stringify(resetCodes));
        return { success: false, error: 'The verification code has expired. Please request a new code.' };
      }

      if (record.attempts >= 5) {
        delete resetCodes[cleanEmail];
        safeSetItem('local', RESET_CODES_KEY, JSON.stringify(resetCodes));
        return { success: false, error: 'Maximum code attempts exceeded. Please request a new code.' };
      }

      const inputHash = await sha256(cleanEmail + cleanCode + 'bizassist_reset_salt');
      if (inputHash !== record.codeHash) {
        record.attempts += 1;
        safeSetItem('local', RESET_CODES_KEY, JSON.stringify(resetCodes));
        const remaining = 5 - record.attempts;
        return {
          success: false,
          error: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        };
      }

      return { success: true, email: cleanEmail };
    },

    /**
     * Complete password reset
     * Updates stored password hash, invalidates sessions, removes code
     */
    completePasswordReset: async function (email, code, newPassword) {
      const verifyRes = await this.verifyResetCode(email, code);
      if (!verifyRes.success) {
        return verifyRes;
      }

      if (!newPassword || newPassword.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters long.' };
      }

      const hasLetter = /[a-zA-Z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);
      if (!hasLetter || !hasNumber) {
        return { success: false, error: 'Password must contain a combination of letters and numbers.' };
      }

      const cleanEmail = String(email || '').trim().toLowerCase();
      const accounts = getAccounts();
      const accountIdx = accounts.findIndex(a => a.email.toLowerCase() === cleanEmail);

      if (accountIdx === -1) {
        return { success: false, error: 'Account not found.' };
      }

      // Generate new salt and new hash
      const newSalt = 'salt_' + Math.random().toString(36).substring(2, 10);
      const newHash = await sha256(newSalt + newPassword);

      accounts[accountIdx].salt = newSalt;
      accounts[accountIdx].hash = newHash;
      saveAccounts(accounts);

      // Invalidate code
      let resetCodes = {};
      try {
        const rawCodes = safeGetItem('local', RESET_CODES_KEY);
        if (rawCodes) resetCodes = JSON.parse(rawCodes);
        delete resetCodes[cleanEmail];
        safeSetItem('local', RESET_CODES_KEY, JSON.stringify(resetCodes));
      } catch (e) {}

      // Invalidate active session if it matches this user
      const currentSession = this.getSession();
      if (currentSession && currentSession.email && currentSession.email.toLowerCase() === cleanEmail) {
        safeRemoveItem('session', SESSION_KEY);
      }

      return { success: true };
    },

    /**
     * Get redirect destination after sign-in (deep link or default landing)
     */
    getPostLoginDestination: function (defaultLanding) {
      const saved = safeGetItem('session', REDIRECT_KEY);
      if (saved) {
        safeRemoveItem('session', REDIRECT_KEY);
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
        safeSetItem('session', REDIRECT_KEY, currentTarget);
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
