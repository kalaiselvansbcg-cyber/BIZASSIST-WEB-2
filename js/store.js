/**
 * BizAssist AI — Shared Unified Data Store (js/store.js)
 * 
 * Provides a single reactive source of truth for tickets, accounts, and demo state
 * backed by localStorage['bizassist.data'] and synchronized across tabs with storage events.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'bizassist.data';
  const STORE_VERSION = 'v2';

  // Canonical Seed Tickets (#BA-1042, #BA-2089, #BA-3310, #BA-1039, #BA-1041)
  const DEFAULT_TICKETS = [
    {
      id: 'BA-1042',
      code: 'BA-1042',
      subject: 'Enterprise SSO integration failure with Okta SAML 2.0',
      description: 'Our staging Okta IdP cert was rotated but SAML assertion verification is failing with invalid signature on the metadata endpoint.',
      category: 'API & Infrastructure',
      priority: 'High',
      stage: 'Assigned', // Raised -> Categorised -> Assigned -> Replied -> Resolved
      status: 'Assigned',
      assignedTo: 'Sarah Jenkins',
      assignedTeam: 'Tier-2 Infrastructure',
      contactName: 'Alex Rivera',
      contactEmail: 'alex.r@acme.com',
      company: 'Acme Corp',
      slaMinutes: 60,
      createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      aiSummary: 'Okta SAML 2.0 x509 fingerprint mismatch following scheduled certificate rotation on customer staging environment.',
      suggestedReply: 'Hi Alex, I reviewed your Okta metadata endpoint. The x509 cert fingerprint needs manual re-sync in your SSO settings panel. I have refreshed the cache on our auth gateway.',
      tags: ['SAML', 'SSO', 'Okta', 'Security']
    },
    {
      id: 'BA-2089',
      code: 'BA-2089',
      subject: 'Invoice VAT calculation mismatch on monthly billing',
      description: 'October invoice INV-2026-881 charged standard 20% UK VAT instead of applying our reverse-charge EU VAT registration number.',
      category: 'Billing & Payments',
      priority: 'Normal',
      stage: 'Categorised',
      status: 'Categorised',
      assignedTo: 'Marcus Vance',
      assignedTeam: 'Billing & FinOps',
      contactName: 'Elena Rostova',
      contactEmail: 'elena@cloudcore.io',
      company: 'CloudCore Systems',
      slaMinutes: 120,
      createdAt: new Date(Date.now() - 78 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      aiSummary: 'Customer EU VAT ID was submitted after automated billing run; requires credit note and updated invoice generation.',
      suggestedReply: 'Hi Elena, I verified your reverse-charge EU VAT registration. A credit note for INV-2026-881 has been drafted and will be issued within 24 hours.',
      tags: ['Billing', 'VAT', 'Invoicing']
    },
    {
      id: 'BA-3310',
      code: 'BA-3310',
      subject: 'Production webhook latency spike on payment.completed events',
      description: 'Webhook delivery times spiked from 85ms to 4.2s across our US-East region starting at 09:30 UTC today.',
      category: 'API & Infrastructure',
      priority: 'Urgent',
      stage: 'Replied',
      status: 'Replied',
      assignedTo: 'Sarah Jenkins',
      assignedTeam: 'Tier-3 Infrastructure SRE',
      contactName: 'Maya Patel',
      contactEmail: 'maya@orbitio.dev',
      company: 'OrbitIO',
      slaMinutes: 15,
      createdAt: new Date(Date.now() - 130 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      aiSummary: 'Edge proxy upstream socket timeout caused queued webhook backpressure; autoscaling group rebalanced.',
      suggestedReply: 'Hi Maya, our SRE team identified an edge proxy routing bottleneck and added 4 worker instances. Latency has returned to 68ms. A post-incident report is being prepared.',
      tags: ['Webhooks', 'Latency', 'Outage', 'P1']
    },
    {
      id: 'BA-1039',
      code: 'BA-1039',
      subject: 'Multi-factor authentication device reset for security team lead',
      description: 'Lost hardware security key during travel; requires identity verification and temporary recovery code.',
      category: 'Account & Security',
      priority: 'Normal',
      stage: 'Resolved',
      status: 'Resolved',
      assignedTo: 'Sarah Jenkins',
      assignedTeam: 'Security Operations',
      contactName: 'David Kim',
      contactEmail: 'david.k@bytewave.co',
      company: 'ByteWave Labs',
      slaMinutes: 60,
      createdAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      aiSummary: 'Identity verified via secondary corporate channel; 2FA seed reset and backup codes generated.',
      suggestedReply: 'Hi David, your temporary 2FA recovery token has been sent via your verified corporate mobile number. Please register your new hardware key within 4 hours.',
      tags: ['2FA', 'Security', 'Resolved']
    },
    {
      id: 'BA-1041',
      code: 'BA-1041',
      subject: 'Custom reporting export timeout for large CSV queries (>50k rows)',
      description: 'When running the Quarterly Resolution Time report with date ranges exceeding 90 days, the export modal returns a 504 Gateway Timeout.',
      category: 'General',
      priority: 'Normal',
      stage: 'Raised',
      status: 'Raised',
      assignedTo: 'Unassigned',
      assignedTeam: 'General Support',
      contactName: 'Sarah Jenkins',
      contactEmail: 'sarah.j@acmecorp.com',
      company: 'Acme Corp',
      slaMinutes: 180,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      aiSummary: 'Database reporting query lacks index on resolved_at timestamp for multi-tenant range aggregations.',
      suggestedReply: 'Hi Sarah, our team is optimizing the large export worker to stream CSV chunks asynchronously. In the meantime, I have split your 90-day query into two 45-day reports.',
      tags: ['Reporting', 'Export', 'Performance']
    }
  ];

  const subscribers = new Set();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === STORE_VERSION && Array.isArray(parsed.tickets)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('BizAssistStore: Failed reading localStorage, resetting to default.', e);
    }
    const fresh = {
      version: STORE_VERSION,
      updatedAt: new Date().toISOString(),
      tickets: DEFAULT_TICKETS
    };
    saveState(fresh);
    return fresh;
  }

  function saveState(state) {
    state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('BizAssistStore: Failed saving localStorage.', e);
    }
    notifySubscribers(state);
  }

  function notifySubscribers(state) {
    subscribers.forEach(cb => {
      try {
        cb(state);
      } catch (err) {
        console.error('BizAssistStore: Subscriber callback error', err);
      }
    });
  }

  // Cross-tab synchronization
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY) {
        const current = loadState();
        notifySubscribers(current);
      }
    });
  }

  const BizAssistStore = {
    /**
     * Get list of all tickets (cloned array)
     */
    getTickets: function () {
      const state = loadState();
      return JSON.parse(JSON.stringify(state.tickets));
    },

    /**
     * Get a single ticket by ID or code (case-insensitive)
     */
    getTicket: function (idOrCode) {
      if (!idOrCode) return null;
      const clean = String(idOrCode).trim().replace(/^#/, '').toUpperCase();
      const state = loadState();
      const found = state.tickets.find(t => 
        t.id.toUpperCase() === clean || 
        t.code.toUpperCase() === clean || 
        t.id.toUpperCase() === 'BA-' + clean
      );
      return found ? JSON.parse(JSON.stringify(found)) : null;
    },

    /**
     * Create a new ticket
     */
    createTicket: function (data) {
      const state = loadState();
      const nextNum = Math.floor(4100 + Math.random() * 8900);
      const code = 'BA-' + nextNum;

      const newTicket = {
        id: code,
        code: code,
        subject: data.subject || data.summary || 'Customer inquiry',
        description: data.description || data.summary || '',
        category: data.category || 'General',
        priority: data.priority || 'Normal',
        stage: data.stage || 'Raised',
        status: data.status || 'Raised',
        assignedTo: data.assignedTo || 'Unassigned',
        assignedTeam: data.assignedTeam || (data.category === 'Billing & Payments' ? 'Billing & FinOps' : (data.category === 'API & Infrastructure' ? 'Tier-2 Infrastructure' : 'General Support')),
        contactName: data.contactName || (data.contactEmail ? data.contactEmail.split('@')[0] : 'Customer'),
        contactEmail: data.contactEmail || 'customer@bizassist.ai',
        company: data.company || 'Enterprise Client',
        slaMinutes: data.priority === 'Urgent' ? 15 : (data.priority === 'High' ? 60 : 180),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiSummary: data.aiSummary || 'New customer ticket ingested via BizAssist interface.',
        suggestedReply: data.suggestedReply || 'Hi, thank you for reaching out. We have logged ticket #' + code + ' and assigned it to our support team.',
        tags: data.tags || ['Customer-Portal']
      };

      state.tickets.unshift(newTicket);
      saveState(state);
      return newTicket;
    },

    /**
     * Update an existing ticket
     */
    updateTicket: function (idOrCode, patch) {
      const clean = String(idOrCode).trim().replace(/^#/, '').toUpperCase();
      const state = loadState();
      const idx = state.tickets.findIndex(t => 
        t.id.toUpperCase() === clean || 
        t.code.toUpperCase() === clean || 
        t.id.toUpperCase() === 'BA-' + clean
      );

      if (idx === -1) return null;

      const existing = state.tickets[idx];
      const updated = Object.assign({}, existing, patch, {
        updatedAt: new Date().toISOString()
      });

      // Synchronize status and stage if one is patched
      if (patch.stage && !patch.status) updated.status = patch.stage;
      if (patch.status && !patch.stage) updated.stage = patch.status;

      state.tickets[idx] = updated;
      saveState(state);
      return updated;
    },

    /**
     * Advance ticket through workflow stages:
     * Raised -> Categorised -> Assigned -> Replied -> Resolved
     */
    advanceStage: function (idOrCode) {
      const ticket = this.getTicket(idOrCode);
      if (!ticket) return null;

      const STAGES = ['Raised', 'Categorised', 'Assigned', 'Replied', 'Resolved'];
      const currentIdx = STAGES.indexOf(ticket.stage);
      if (currentIdx === -1 || currentIdx >= STAGES.length - 1) return ticket;

      const nextStage = STAGES[currentIdx + 1];
      const patch = { stage: nextStage, status: nextStage };
      if (nextStage === 'Assigned' && (!ticket.assignedTo || ticket.assignedTo === 'Unassigned')) {
        patch.assignedTo = 'Sarah Jenkins';
      }
      return this.updateTicket(ticket.id, patch);
    },

    /**
     * Merge duplicate tickets
     */
    mergeTickets: function (primaryId, duplicateId) {
      const primary = this.getTicket(primaryId);
      const duplicate = this.getTicket(duplicateId);
      if (!primary || !duplicate) return false;

      this.updateTicket(primary.id, {
        description: primary.description + '\n\n[Merged #' + duplicate.code + ']: ' + duplicate.description,
        aiSummary: primary.aiSummary + ' (Merged with duplicate #' + duplicate.code + ')'
      });

      this.updateTicket(duplicate.id, {
        stage: 'Resolved',
        status: 'Resolved',
        aiSummary: 'Merged into primary ticket #' + primary.code
      });

      return true;
    },

    /**
     * Reset demo data back to default initial state
     */
    resetDemoData: function () {
      const fresh = {
        version: STORE_VERSION,
        updatedAt: new Date().toISOString(),
        tickets: JSON.parse(JSON.stringify(DEFAULT_TICKETS))
      };
      saveState(fresh);
      return fresh;
    },

    /**
     * Calculate summary metrics across all tickets
     */
    getMetrics: function () {
      const tickets = this.getTickets();
      const total = tickets.length;
      const raised = tickets.filter(t => t.stage === 'Raised').length;
      const categorised = tickets.filter(t => t.stage === 'Categorised').length;
      const assigned = tickets.filter(t => t.stage === 'Assigned').length;
      const replied = tickets.filter(t => t.stage === 'Replied').length;
      const resolved = tickets.filter(t => t.stage === 'Resolved').length;
      const open = total - resolved;

      return {
        total,
        open,
        raised,
        categorised,
        assigned,
        replied,
        resolved,
        deflectionRate: '68.4%',
        avgHandleTime: '2m 45s',
        csatFit: '99.4%'
      };
    },

    /**
     * Subscribe to changes
     */
    subscribe: function (cb) {
      if (typeof cb === 'function') {
        subscribers.add(cb);
        // Invoke immediately with current state
        cb(loadState());
        return () => subscribers.delete(cb);
      }
      return () => {};
    }
  };

  // Expose globally
  global.BizAssistStore = BizAssistStore;

})(typeof window !== 'undefined' ? window : globalThis);
