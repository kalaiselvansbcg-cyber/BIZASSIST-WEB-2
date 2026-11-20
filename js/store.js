/**
 * BizAssist AI — Shared Unified Data Store (js/store.js)
 * 
 * Provides a single reactive source of truth for tickets, knowledge base articles,
 * internal notes, activity timelines, SLA tracking, callbacks, notifications,
 * CSAT ratings, and manager settings.
 * Backed by localStorage['bizassist.data'] and synchronized across tabs with storage events.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'bizassist.data';
  const STORE_VERSION = 'v3';

  // 12 Starter Knowledge Base Articles
  const STARTER_ARTICLES = [
    {
      id: 'kb-vat-01',
      title: 'EU VAT Reverse Charge & Invoicing Guidelines',
      category: 'Billing & Invoicing',
      summary: 'How to register an EU VAT number and apply reverse-charge exemption to recurring subscription invoices.',
      content: 'Enterprise customers registered in the European Union are eligible for reverse-charge VAT exemption under Article 196 of the EU VAT Directive. To apply reverse charge, navigate to Workspace Settings > Billing and enter your valid VIES VAT identification number. If an invoice was already processed with VAT, submit a request with your invoice number to receive an automated credit note within 24 hours.',
      tags: ['VAT', 'Invoicing', 'EU', 'Tax', 'Billing']
    },
    {
      id: 'kb-stripe-02',
      title: 'Resolving Stripe Payment & Card Renewal Failures',
      category: 'Billing & Invoicing',
      summary: 'Troubleshooting recurring subscription renewal decline codes including authentication required (3D Secure).',
      content: 'Renewal failures frequently occur when card issuers require Strong Customer Authentication (SCA / 3D Secure 2.0). To complete payment verification, click the secure verification link sent to the billing contact email, or update payment method directly in Billing > Payment Methods. Once updated, our gateway automatically re-attempts payment without interrupting service.',
      tags: ['Stripe', 'Payment', 'Renewal', 'Billing', 'Failed Payment']
    },
    {
      id: 'kb-refund-03',
      title: 'Subscription Cancellation & Prorated Refund Policy',
      category: 'Billing & Invoicing',
      summary: 'Policy overview on monthly cancellations, annual license adjustments, and refund timelines.',
      content: 'Subscriptions can be cancelled at any time from Workspace Settings > Plans. Cancellations take effect at the end of the current billing cycle. Annual enterprise agreements qualify for prorated account credits when downgraded within the first 30 days of renewal. Refunds to original payment methods typically process in 5-10 business days.',
      tags: ['Refund', 'Cancellation', 'Billing', 'Subscription']
    },
    {
      id: 'kb-webhook-04',
      title: 'Webhook Latency Optimization & Retry Backoff Architecture',
      category: 'API & Infrastructure',
      summary: 'Handling high-volume payment.completed and ticket.created webhook spikes with exponential backoff.',
      content: 'BizAssist webhooks are delivered from our global edge network with standard timeouts of 5 seconds. If your receiving endpoint responds with a status outside 200-299, our dispatcher initiates exponential retry backoff at intervals of 15s, 1m, 5m, 30m, and 2h. To prevent latency accumulation, acknowledge inbound webhooks immediately with HTTP 200 and process payload processing asynchronously via internal message queues.',
      tags: ['Webhooks', 'Latency', 'API', 'Architecture', 'SRE']
    },
    {
      id: 'kb-ratelimit-05',
      title: 'API Rate Limits, Quotas & Token Bucket Mechanics',
      category: 'API & Infrastructure',
      summary: 'Understanding standard and enterprise rate limits across REST endpoints and WebSocket channels.',
      content: 'The BizAssist REST API enforces token-bucket rate limiting based on your workspace tier: Starter (100 req/min), Professional (500 req/min), Enterprise (2,500 req/min). Every API response contains X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset headers. When receiving HTTP 429 Too Many Requests, inspect the Retry-After header before issuing subsequent queries.',
      tags: ['Rate Limits', 'API', 'HTTP 429', 'Quotas']
    },
    {
      id: 'kb-status-06',
      title: 'Monitoring Platform Status & Incident Notification Channels',
      category: 'API & Infrastructure',
      summary: 'Where to subscribe to real-time uptime status, planned maintenance windows, and incident webhooks.',
      content: 'Real-time service health, cluster latency, and scheduled maintenance windows are broadcast 24/7 at status.bizassist.ai. You can subscribe via email, Slack alerts, or webhook to receive immediate push updates regarding Tier-1 outages, DNS failovers, or degradation events.',
      tags: ['Status', 'Outage', 'Uptime', 'Maintenance']
    },
    {
      id: 'kb-saml-07',
      title: 'Enterprise Single Sign-On (SSO) with Okta SAML 2.0',
      category: 'Account & Security',
      summary: 'Step-by-step instructions for SAML 2.0 assertion configuration and x509 certificate rotation.',
      content: 'To connect Okta SSO: In Okta Admin, add BizAssist AI as a SAML 2.0 Application. Copy your Identity Provider Single Sign-On URL, Issuer ID, and x509 Certificate into BizAssist Workspace Settings > Security > SSO. When rotating your x509 certificate, upload the secondary certificate at least 48 hours prior to retirement to avoid metadata signature verification errors.',
      tags: ['SSO', 'Okta', 'SAML', 'Security', 'Authentication']
    },
    {
      id: 'kb-2fa-08',
      title: 'Multi-Factor Authentication (2FA) Reset & Recovery Keys',
      category: 'Account & Security',
      summary: 'Procedure for replacing lost hardware security keys or authenticator apps without lockout.',
      content: 'Users who lose their registered TOTP authenticator device or FIDO2 hardware key must utilize one of their 8-digit emergency recovery codes generated during 2FA enrollment. If recovery codes are unavailable, an Organization Administrator must verify identity through a secondary verified corporate channel and generate a temporary 4-hour bypass code.',
      tags: ['2FA', 'MFA', 'Security', 'Recovery', 'Auth']
    },
    {
      id: 'kb-rbac-09',
      title: 'Role-Based Access Control (RBAC): Customer, Agent & Manager',
      category: 'Account & Security',
      summary: 'Detailed permissions breakdown across the three primary workspace roles.',
      content: 'BizAssist provides three distinct access tiers: Customer (can raise and track own tickets, view public KB, submit CSAT), Support Agent (can view triage queues, draft AI suggested replies, execute public replies, and add internal notes), and Operations Manager (can view cross-team SLA metrics, reassign workload, manage SLA targets, and configure categories).',
      tags: ['RBAC', 'Roles', 'Security', 'Permissions']
    },
    {
      id: 'kb-quickstart-10',
      title: 'Platform Quickstart: The 5-Stage Ticket Lifecycle',
      category: 'Getting Started',
      summary: 'A fast visual walkthrough of how customer tickets progress from Raised to Resolved.',
      content: 'Every inquiry submitted to BizAssist moves through 5 transparent milestones: 1. Raised (logged with unique #BA-XXXX code), 2. Categorised (AI extracts key entities and tags category/urgency), 3. Assigned (routed to specialist support agent or tier queue), 4. Replied (investigation findings or solution provided), 5. Resolved (customer confirmation and CSAT evaluation).',
      tags: ['Quickstart', 'Lifecycle', 'Stages', 'Overview']
    },
    {
      id: 'kb-triage-11',
      title: 'How AI Auto-Triage & Confidence Scoring Operates',
      category: 'Getting Started',
      summary: 'Understanding NLP intent classification, urgency regression, and entity extraction.',
      content: 'BizAssist AI utilizes grounded semantic embeddings and an SLA classification regressor to evaluate customer inquiries in <120ms. It evaluates issue severity, business impact, and emotional sentiment to assign an urgency level (Normal: 8h, High: 1h, Urgent: 15m) and drafts an initial contextual reply for human agent sign-off.',
      tags: ['AI Triage', 'NLP', 'Machine Learning', 'Automation']
    },
    {
      id: 'kb-channels-12',
      title: 'Multi-Channel Intake Integration: Web, Email, Chat & WhatsApp',
      category: 'Getting Started',
      summary: 'Connecting inbound customer touchpoints into a unified triage stream.',
      content: 'BizAssist AI unifies 5 intake vectors into a single real-time queue: Customer Web Portal, Inbound Email forwarding, Knowledge Chatbot widget, Voice call-back requests, and WhatsApp Business API. Each ticket retains its origin channel tag, enabling channel-specific SLAs and resolution reporting.',
      tags: ['Omnichannel', 'WhatsApp', 'Email', 'Chatbot', 'Intake']
    }
  ];

  // Canonical Seed Tickets (#BA-1042, #BA-2089, #BA-3310, #BA-1039, #BA-1041)
  const DEFAULT_TICKETS = [
    {
      id: 'BA-1042',
      code: 'BA-1042',
      subject: 'Enterprise SSO integration failure with Okta SAML 2.0',
      description: 'Our staging Okta IdP cert was rotated but SAML assertion verification is failing with invalid signature on the metadata endpoint.',
      category: 'API & Infrastructure',
      priority: 'High',
      priorityReason: 'Staging environment blocked; customer deploying to production in 48 hours.',
      stage: 'Assigned', // Raised -> Categorised -> Assigned -> Replied -> Resolved
      status: 'Assigned',
      channel: 'Web Portal',
      sentiment: 'Frustrated',
      sentimentTrend: 'Frustrated -> Neutral',
      assignedTo: 'Sarah Jenkins',
      assignedTeam: 'Tier-2 Infrastructure',
      contactName: 'Alex Rivera',
      contactEmail: 'alex.r@acme.com',
      company: 'Acme Corp',
      slaMinutes: 60,
      createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      aiSummary: 'Okta SAML 2.0 x509 fingerprint mismatch following scheduled certificate rotation on customer staging environment.',
      suggestedReply: 'Hi Alex, I reviewed your Okta metadata endpoint. The x509 cert fingerprint needs manual re-sync in your SSO settings panel. I have refreshed the cache on our auth gateway. [1] Ref: Enterprise SSO with Okta SAML 2.0.',
      citations: [
        { title: 'Enterprise Single Sign-On (SSO) with Okta SAML 2.0', id: 'kb-saml-07' }
      ],
      tags: ['SAML', 'SSO', 'Okta', 'Security'],
      attachments: [
        { name: 'okta-saml-error.png', size: '245 KB', type: 'image/png', url: '' }
      ],
      internalNotes: [
        {
          id: 'note-1',
          author: 'Sarah Jenkins',
          text: 'Verified Okta cert fingerprint mismatch in gateway auth logs. Cache purged.',
          createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString()
        }
      ],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Web Portal', actor: 'Alex Rivera', timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString() },
        { id: 'ev-2', type: 'triage', description: 'AI categorized as API & Infrastructure, Priority High (60m SLA)', actor: 'AI Engine', timestamp: new Date(Date.now() - 41 * 60 * 1000).toISOString() },
        { id: 'ev-3', type: 'assigned', description: 'Assigned to Sarah Jenkins (Tier-2 Infrastructure)', actor: 'System Routing', timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString() },
        { id: 'ev-4', type: 'note', description: 'Internal note added by Sarah Jenkins', actor: 'Sarah Jenkins', timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-2089',
      code: 'BA-2089',
      subject: 'Invoice VAT calculation mismatch on monthly billing',
      description: 'October invoice INV-2026-881 charged standard 20% UK VAT instead of applying our reverse-charge EU VAT registration number.',
      category: 'Billing & Payments',
      priority: 'Normal',
      priorityReason: 'Non-blocking accounting request; customer billing cycle ends on 30th.',
      stage: 'Categorised',
      status: 'Categorised',
      channel: 'Email',
      sentiment: 'Neutral',
      sentimentTrend: 'Neutral',
      assignedTo: 'Marcus Vance',
      assignedTeam: 'Billing & FinOps',
      contactName: 'Elena Rostova',
      contactEmail: 'elena@cloudcore.io',
      company: 'CloudCore Systems',
      slaMinutes: 480,
      createdAt: new Date(Date.now() - 78 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      aiSummary: 'Customer EU VAT ID was submitted after automated billing run; requires credit note and updated invoice generation.',
      suggestedReply: 'Hi Elena, I verified your reverse-charge EU VAT registration in VIES. A credit note for INV-2026-881 has been drafted and will be issued within 24 hours. [1] Ref: EU VAT Reverse Charge & Invoicing Guidelines.',
      citations: [
        { title: 'EU VAT Reverse Charge & Invoicing Guidelines', id: 'kb-vat-01' }
      ],
      tags: ['Billing', 'VAT', 'Invoicing'],
      attachments: [
        { name: 'invoice-INV-2026-881.pdf', size: '184 KB', type: 'application/pdf', url: '' }
      ],
      internalNotes: [],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Inbound Email', actor: 'Elena Rostova', timestamp: new Date(Date.now() - 78 * 60 * 1000).toISOString() },
        { id: 'ev-2', type: 'triage', description: 'AI categorized as Billing & Payments, Priority Normal (8h SLA)', actor: 'AI Engine', timestamp: new Date(Date.now() - 77 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-3310',
      code: 'BA-3310',
      subject: 'Production webhook latency spike on payment.completed events',
      description: 'Webhook delivery times spiked from 85ms to 4.2s across our US-East region starting at 09:30 UTC today.',
      category: 'API & Infrastructure',
      priority: 'Urgent',
      priorityReason: 'Production latency spike affecting real-time payment notifications.',
      stage: 'Replied',
      status: 'Replied',
      channel: 'Chatbot',
      sentiment: 'Critical',
      sentimentTrend: 'Critical -> Neutral',
      assignedTo: 'Sarah Jenkins',
      assignedTeam: 'Tier-3 Infrastructure SRE',
      contactName: 'Maya Patel',
      contactEmail: 'maya@orbitio.dev',
      company: 'OrbitIO',
      slaMinutes: 15,
      createdAt: new Date(Date.now() - 130 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      aiSummary: 'Edge proxy upstream socket timeout caused queued webhook backpressure; autoscaling group rebalanced.',
      suggestedReply: 'Hi Maya, our SRE team identified an edge proxy routing bottleneck and added 4 worker instances. Latency has returned to 68ms. A post-incident report is being prepared. [1] Ref: Webhook Latency Optimization.',
      citations: [
        { title: 'Webhook Latency Optimization & Retry Backoff Architecture', id: 'kb-webhook-04' }
      ],
      tags: ['Webhooks', 'Latency', 'Outage', 'P1'],
      attachments: [],
      internalNotes: [
        {
          id: 'note-1',
          author: 'Sarah Jenkins',
          text: 'P1 incident room opened. Scaled up proxy workers from 8 to 12. Socket metrics normalized.',
          createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString()
        }
      ],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Chatbot assistant', actor: 'Maya Patel', timestamp: new Date(Date.now() - 130 * 60 * 1000).toISOString() },
        { id: 'ev-2', type: 'triage', description: 'AI categorized as API & Infrastructure, Priority Urgent (15m SLA)', actor: 'AI Engine', timestamp: new Date(Date.now() - 129 * 60 * 1000).toISOString() },
        { id: 'ev-3', type: 'assigned', description: 'Routed to Sarah Jenkins (Tier-3 SRE)', actor: 'SRE Router', timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString() },
        { id: 'ev-4', type: 'reply', description: 'Public investigation update dispatched to customer', actor: 'Sarah Jenkins', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-1039',
      code: 'BA-1039',
      subject: 'Multi-factor authentication device reset for security team lead',
      description: 'Lost hardware security key during travel; requires identity verification and temporary recovery code.',
      category: 'Account & Security',
      priority: 'Normal',
      priorityReason: 'Identity confirmed via verified secondary mobile contact.',
      stage: 'Resolved',
      status: 'Resolved',
      channel: 'Phone',
      sentiment: 'Positive',
      sentimentTrend: 'Neutral -> Positive',
      assignedTo: 'Sarah Jenkins',
      assignedTeam: 'Security Operations',
      contactName: 'David Kim',
      contactEmail: 'david.k@bytewave.co',
      company: 'ByteWave Labs',
      slaMinutes: 480,
      createdAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      aiSummary: 'Identity verified via secondary corporate channel; 2FA seed reset and backup codes generated.',
      suggestedReply: 'Hi David, your temporary 2FA recovery token has been sent via your verified corporate mobile number. Please register your new hardware key within 4 hours. [1] Ref: Multi-Factor Authentication (2FA) Reset.',
      citations: [
        { title: 'Multi-Factor Authentication (2FA) Reset & Recovery Keys', id: 'kb-2fa-08' }
      ],
      tags: ['2FA', 'Security', 'Resolved'],
      attachments: [],
      internalNotes: [
        {
          id: 'note-1',
          author: 'Sarah Jenkins',
          text: 'Verified employee ID through company admin hotline. Bypass token issued.',
          createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString()
        }
      ],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Inbound phone ticket logged by agent', actor: 'Sarah Jenkins', timestamp: new Date(Date.now() - 360 * 60 * 1000).toISOString() },
        { id: 'ev-2', type: 'resolved', description: 'Ticket resolved and recovery keys generated', actor: 'Sarah Jenkins', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() }
      ],
      csat: {
        rating: 5,
        comment: 'Sarah handled our security key recovery immediately and professionally.',
        submittedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      }
    },
    {
      id: 'BA-1041',
      code: 'BA-1041',
      subject: 'Custom reporting export timeout for large CSV queries (>50k rows)',
      description: 'When running the Quarterly Resolution Time report with date ranges exceeding 90 days, the export modal returns a 504 Gateway Timeout.',
      category: 'General',
      priority: 'Normal',
      priorityReason: 'Non-blocking analytical export issue.',
      stage: 'Raised',
      status: 'Raised',
      channel: 'Web Portal',
      sentiment: 'Neutral',
      sentimentTrend: 'Neutral',
      assignedTo: 'Unassigned',
      assignedTeam: 'General Support',
      contactName: 'Chloe Dupont',
      contactEmail: 'chloe.d@solas.tech',
      company: 'Solas Tech',
      slaMinutes: 480,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      aiSummary: 'Database reporting query lacks index on resolved_at timestamp for multi-tenant range aggregations.',
      suggestedReply: 'Hi Chloe, our engineering team is optimizing large report queries. I have generated your 90-day export asynchronously and shared the download link.',
      citations: [],
      tags: ['Reporting', 'Export', 'Performance'],
      attachments: [],
      internalNotes: [],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Web Portal', actor: 'Chloe Dupont', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() }
      ],
      csat: null
    }
  ];

  // Default Callbacks Queue
  const DEFAULT_CALLBACKS = [
    {
      id: 'cb-1',
      name: 'Alex Rivera',
      phone: '+1 415 555 0192',
      preferredTime: 'Afternoon',
      topic: 'Okta SAML 2.0 integration assistance and SSL cert audit',
      status: 'Pending',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ];

  // Default Notifications
  const DEFAULT_NOTIFICATIONS = [
    {
      id: 'notif-1',
      title: 'Ticket #BA-3310 Assigned',
      message: 'Urgent ticket #BA-3310 (Production webhook latency) was routed to your queue.',
      link: '/agent-dashboard?ticket=BA-3310',
      read: false,
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
    },
    {
      id: 'notif-2',
      title: 'Call Back Requested',
      message: 'Alex Rivera requested a call back regarding Okta SAML 2.0.',
      link: '/agent-dashboard#callbacks',
      read: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: 'notif-3',
      title: 'CSAT Rating Received',
      message: 'David Kim rated ticket #BA-1039 5/5 stars.',
      link: '/manager-overview',
      read: true,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    }
  ];

  // Default Settings
  const DEFAULT_SETTINGS = {
    sla: {
      Urgent: 15,
      High: 60,
      Normal: 480
    },
    categories: [
      'Billing & Payments',
      'API & Infrastructure',
      'Account & Security',
      'General'
    ],
    cannedReplies: [
      { id: 'cr-1', title: 'Acknowledge Receipt', text: 'Thank you for contacting BizAssist support. We have received your request and an engineer has begun investigating.' },
      { id: 'cr-2', title: 'Request More Information', text: 'To help us resolve this swiftly, could you provide relevant log snippets, timestamp in UTC, or the specific endpoint URI?' },
      { id: 'cr-3', title: 'Issue Resolved Confirmation', text: 'We have applied the fix and verified that operations are functioning normally. Please confirm if everything is working on your end.' }
    ],
    autoTriage: true
  };

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
      console.warn('[BizAssistStore] Failed reading localStorage, resetting to default.', e);
    }

    const fresh = {
      version: STORE_VERSION,
      updatedAt: new Date().toISOString(),
      tickets: JSON.parse(JSON.stringify(DEFAULT_TICKETS)),
      callbacks: JSON.parse(JSON.stringify(DEFAULT_CALLBACKS)),
      notifications: JSON.parse(JSON.stringify(DEFAULT_NOTIFICATIONS)),
      articles: JSON.parse(JSON.stringify(STARTER_ARTICLES)),
      settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
      deflectionsCount: 42
    };
    saveState(fresh);
    return fresh;
  }

  function saveState(state) {
    state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('[BizAssistStore] Failed saving localStorage.', e);
    }
    notifySubscribers(state);
  }

  function notifySubscribers(state) {
    subscribers.forEach(cb => {
      try {
        cb(state);
      } catch (err) {
        console.error('[BizAssistStore] Subscriber callback error', err);
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
     * Get list of all tickets
     */
    getTickets: function () {
      const state = loadState();
      return JSON.parse(JSON.stringify(state.tickets || []));
    },

    /**
     * Get single ticket by ID or code
     */
    getTicket: function (idOrCode) {
      if (!idOrCode) return null;
      const clean = String(idOrCode).trim().replace(/^#/, '').toUpperCase();
      const state = loadState();
      const found = (state.tickets || []).find(t => 
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
      const prio = data.priority || 'Normal';
      const targetSla = (state.settings && state.settings.sla && state.settings.sla[prio]) || (prio === 'Urgent' ? 15 : (prio === 'High' ? 60 : 480));

      const newTicket = {
        id: code,
        code: code,
        subject: data.subject || data.summary || 'Customer inquiry',
        description: data.description || data.summary || '',
        category: data.category || 'General',
        priority: prio,
        priorityReason: data.priorityReason || (prio === 'Urgent' ? 'Evaluated Urgent due to high business impact.' : 'Standard operational severity.'),
        stage: data.stage || 'Raised',
        status: data.status || 'Raised',
        channel: data.channel || 'Web Portal',
        sentiment: data.sentiment || 'Neutral',
        sentimentTrend: data.sentiment || 'Neutral',
        assignedTo: data.assignedTo || 'Unassigned',
        assignedTeam: data.assignedTeam || (data.category === 'Billing & Payments' ? 'Billing & FinOps' : (data.category === 'API & Infrastructure' ? 'Tier-2 Infrastructure' : 'General Support')),
        contactName: data.contactName || (data.contactEmail ? data.contactEmail.split('@')[0] : 'Customer'),
        contactEmail: data.contactEmail || 'customer@bizassist.ai',
        company: data.company || 'Enterprise Client',
        slaMinutes: targetSla,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiSummary: data.aiSummary || 'Inquiry ingested and queued for support review.',
        suggestedReply: data.suggestedReply || 'Hi, thank you for reaching out. We have logged ticket #' + code + ' and assigned it to our support team.',
        citations: data.citations || [],
        tags: data.tags || ['Customer-Portal'],
        attachments: data.attachments || [],
        internalNotes: [],
        timeline: [
          {
            id: 'ev-' + Date.now(),
            type: 'created',
            description: `Ticket created via ${data.channel || 'Web Portal'}`,
            actor: data.contactName || 'Customer',
            timestamp: new Date().toISOString()
          }
        ],
        csat: null
      };

      state.tickets.unshift(newTicket);

      // Create notification for team
      this.addNotification({
        title: `New Ticket #${code} Logged`,
        message: `${newTicket.subject} (${newTicket.priority})`,
        link: `/agent-dashboard?ticket=${code}`
      }, state);

      saveState(state);
      return newTicket;
    },

    /**
     * Update an existing ticket
     */
    updateTicket: function (idOrCode, patch) {
      const clean = String(idOrCode).trim().replace(/^#/, '').toUpperCase();
      const state = loadState();
      const idx = (state.tickets || []).findIndex(t => 
        t.id.toUpperCase() === clean || 
        t.code.toUpperCase() === clean || 
        t.id.toUpperCase() === 'BA-' + clean
      );

      if (idx === -1) return null;

      const existing = state.tickets[idx];
      const updated = Object.assign({}, existing, patch, {
        updatedAt: new Date().toISOString()
      });

      if (patch.stage && !patch.status) updated.status = patch.stage;
      if (patch.status && !patch.stage) updated.stage = patch.status;

      state.tickets[idx] = updated;
      saveState(state);
      return updated;
    },

    /**
     * Advance ticket workflow stages
     */
    advanceStage: function (idOrCode, actor = 'Support Agent') {
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

      // Add timeline event
      const timeline = ticket.timeline || [];
      timeline.push({
        id: 'ev-' + Date.now(),
        type: 'stage_change',
        description: `Stage moved from ${ticket.stage} to ${nextStage}`,
        actor: actor,
        timestamp: new Date().toISOString()
      });
      patch.timeline = timeline;

      return this.updateTicket(ticket.id, patch);
    },

    /**
     * Add an internal note to a ticket
     */
    addInternalNote: function (idOrCode, text, author = 'Support Agent') {
      const ticket = this.getTicket(idOrCode);
      if (!ticket || !text) return null;

      const notes = ticket.internalNotes || [];
      const newNote = {
        id: 'note-' + Date.now(),
        author: author,
        text: text,
        createdAt: new Date().toISOString()
      };
      notes.unshift(newNote);

      const timeline = ticket.timeline || [];
      timeline.push({
        id: 'ev-' + Date.now(),
        type: 'note',
        description: `Internal note added by ${author}`,
        actor: author,
        timestamp: new Date().toISOString()
      });

      return this.updateTicket(ticket.id, { internalNotes: notes, timeline });
    },

    /**
     * Add a public reply to a ticket
     */
    addPublicReply: function (idOrCode, replyText, author = 'Support Agent') {
      const ticket = this.getTicket(idOrCode);
      if (!ticket || !replyText) return null;

      const timeline = ticket.timeline || [];
      timeline.push({
        id: 'ev-' + Date.now(),
        type: 'reply',
        description: `Public reply dispatched by ${author}`,
        actor: author,
        timestamp: new Date().toISOString()
      });

      const patch = {
        suggestedReply: replyText,
        stage: 'Replied',
        status: 'Replied',
        timeline: timeline
      };
      if (ticket.sentiment === 'Frustrated' || ticket.sentiment === 'Critical') {
        patch.sentiment = 'Neutral';
        patch.sentimentTrend = `${ticket.sentiment} -> Neutral`;
      }
      return this.updateTicket(ticket.id, patch);
    },

    /**
     * Submit CSAT rating for a resolved ticket
     */
    submitCsat: function (idOrCode, rating, comment = '') {
      const ticket = this.getTicket(idOrCode);
      if (!ticket) return null;

      const csatData = {
        rating: Math.min(Math.max(Number(rating), 1), 5),
        comment: comment.trim(),
        submittedAt: new Date().toISOString()
      };

      const timeline = ticket.timeline || [];
      timeline.push({
        id: 'ev-' + Date.now(),
        type: 'csat',
        description: `Customer submitted CSAT: ${csatData.rating}/5 stars`,
        actor: ticket.contactName || 'Customer',
        timestamp: new Date().toISOString()
      });

      this.addNotification({
        title: `CSAT Rating on #${ticket.code}`,
        message: `${csatData.rating}/5 stars: "${csatData.comment || 'No comment provided'}"`,
        link: '/manager-overview'
      });

      return this.updateTicket(ticket.id, { csat: csatData, timeline });
    },

    /**
     * Merge duplicate tickets
     */
    mergeTickets: function (primaryId, duplicateId) {
      const primary = this.getTicket(primaryId);
      const duplicate = this.getTicket(duplicateId);
      if (!primary || !duplicate) return false;

      const timeline = primary.timeline || [];
      timeline.push({
        id: 'ev-' + Date.now(),
        type: 'merge',
        description: `Merged with duplicate ticket #${duplicate.code}`,
        actor: 'Support Agent',
        timestamp: new Date().toISOString()
      });

      this.updateTicket(primary.id, {
        description: primary.description + '\n\n[Merged #' + duplicate.code + ']: ' + duplicate.description,
        aiSummary: primary.aiSummary + ' (Merged with duplicate #' + duplicate.code + ')',
        timeline
      });

      const dupTimeline = duplicate.timeline || [];
      dupTimeline.push({
        id: 'ev-' + Date.now(),
        type: 'merged_away',
        description: `Closed as duplicate; merged into #${primary.code}`,
        actor: 'Support Agent',
        timestamp: new Date().toISOString()
      });

      this.updateTicket(duplicate.id, {
        stage: 'Resolved',
        status: 'Resolved',
        aiSummary: 'Merged into primary ticket #' + primary.code,
        timeline: dupTimeline
      });

      return true;
    },

    /**
     * Find potential duplicate tickets in the store
     */
    findDuplicates: function (targetTicket) {
      if (!targetTicket) return [];
      const tickets = this.getTickets();
      return tickets.filter(t => {
        if (t.id === targetTicket.id) return false;
        // Same customer or similar subject keywords
        const sameContact = t.contactEmail && targetTicket.contactEmail && t.contactEmail.toLowerCase() === targetTicket.contactEmail.toLowerCase();
        const sameCategory = t.category === targetTicket.category;
        const wordsA = (targetTicket.subject || '').toLowerCase().split(/\s+/).filter(w => w.length > 4);
        const wordsB = (t.subject || '').toLowerCase();
        const keywordMatch = wordsA.some(w => wordsB.includes(w));
        return (sameContact && sameCategory) || (sameContact && keywordMatch);
      });
    },

    /**
     * Auto-balance workload across roster
     */
    autoBalanceWorkload: function () {
      const state = loadState();
      const agents = ['Sarah Jenkins', 'Marcus Vance', 'Elena Rostova'];
      let roundRobin = 0;
      let reassignedCount = 0;

      state.tickets.forEach(t => {
        if (t.stage !== 'Resolved' && (!t.assignedTo || t.assignedTo === 'Unassigned')) {
          t.assignedTo = agents[roundRobin % agents.length];
          roundRobin++;
          reassignedCount++;
        }
      });

      if (reassignedCount > 0) {
        saveState(state);
      }
      return reassignedCount;
    },

    /**
     * Callbacks Queue Methods
     */
    getCallbacks: function () {
      const state = loadState();
      return JSON.parse(JSON.stringify(state.callbacks || []));
    },

    createCallbackRequest: function ({ name, phone, preferredTime, topic }) {
      const state = loadState();
      const newCb = {
        id: 'cb-' + Date.now(),
        name: name || 'Customer',
        phone: phone || '',
        preferredTime: preferredTime || 'Morning',
        topic: topic || 'General inquiry',
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      state.callbacks.unshift(newCb);

      this.addNotification({
        title: `Call Back Requested: ${newCb.name}`,
        message: `${newCb.phone} (${newCb.preferredTime}) - ${newCb.topic}`,
        link: '/agent-dashboard#callbacks'
      }, state);

      saveState(state);
      return newCb;
    },

    resolveCallback: function (id) {
      const state = loadState();
      const idx = (state.callbacks || []).findIndex(c => c.id === id);
      if (idx !== -1) {
        state.callbacks[idx].status = 'Completed';
        saveState(state);
        return true;
      }
      return false;
    },

    /**
     * Knowledge Base Methods
     */
    getArticles: function (query = '', category = '') {
      const state = loadState();
      let list = state.articles || [];
      if (category && category !== 'All') {
        list = list.filter(a => a.category.toLowerCase() === category.toLowerCase());
      }
      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        list = list.filter(a => 
          a.title.toLowerCase().includes(q) || 
          a.summary.toLowerCase().includes(q) || 
          a.content.toLowerCase().includes(q) ||
          (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
        );
      }
      return JSON.parse(JSON.stringify(list));
    },

    getArticle: function (id) {
      const state = loadState();
      const found = (state.articles || []).find(a => a.id === id);
      return found ? JSON.parse(JSON.stringify(found)) : null;
    },

    recordDeflection: function () {
      const state = loadState();
      state.deflectionsCount = (state.deflectionsCount || 0) + 1;
      saveState(state);
      return state.deflectionsCount;
    },

    /**
     * Notification Centre Methods
     */
    getNotifications: function () {
      const state = loadState();
      return JSON.parse(JSON.stringify(state.notifications || []));
    },

    addNotification: function (notif, stateRef = null) {
      const state = stateRef || loadState();
      const item = {
        id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: notif.title || 'Platform Notification',
        message: notif.message || '',
        link: notif.link || '/app',
        read: false,
        createdAt: new Date().toISOString()
      };
      if (!state.notifications) state.notifications = [];
      state.notifications.unshift(item);
      if (!stateRef) saveState(state);
      return item;
    },

    markNotificationsAsRead: function () {
      const state = loadState();
      (state.notifications || []).forEach(n => { n.read = true; });
      saveState(state);
    },

    /**
     * Settings Workspace Methods
     */
    getSettings: function () {
      const state = loadState();
      return JSON.parse(JSON.stringify(state.settings || DEFAULT_SETTINGS));
    },

    updateSettings: function (newSettings) {
      const state = loadState();
      state.settings = Object.assign({}, state.settings, newSettings);
      saveState(state);
      return state.settings;
    },

    /**
     * Reset Demo Data Back to Clean Initial Seed
     */
    resetDemoData: function () {
      const fresh = {
        version: STORE_VERSION,
        updatedAt: new Date().toISOString(),
        tickets: JSON.parse(JSON.stringify(DEFAULT_TICKETS)),
        callbacks: JSON.parse(JSON.stringify(DEFAULT_CALLBACKS)),
        notifications: JSON.parse(JSON.stringify(DEFAULT_NOTIFICATIONS)),
        articles: JSON.parse(JSON.stringify(STARTER_ARTICLES)),
        settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
        deflectionsCount: 42
      };
      saveState(fresh);
      return fresh;
    },

    /**
     * Calculate summary metrics across all tickets
     */
    getMetrics: function () {
      const state = loadState();
      const tickets = state.tickets || [];
      const total = tickets.length;
      const raised = tickets.filter(t => t.stage === 'Raised').length;
      const categorised = tickets.filter(t => t.stage === 'Categorised').length;
      const assigned = tickets.filter(t => t.stage === 'Assigned').length;
      const replied = tickets.filter(t => t.stage === 'Replied').length;
      const resolved = tickets.filter(t => t.stage === 'Resolved').length;
      const open = total - resolved;

      // SLA Breach calculation
      const now = Date.now();
      const breachedCount = tickets.filter(t => {
        if (t.stage === 'Resolved') return false;
        const elapsedMin = (now - new Date(t.createdAt).getTime()) / (60 * 1000);
        return elapsedMin > (t.slaMinutes || 180);
      }).length;

      // CSAT Average
      const ratedTickets = tickets.filter(t => t.csat && t.csat.rating);
      const avgCsat = ratedTickets.length > 0
        ? (ratedTickets.reduce((sum, t) => sum + Number(t.csat.rating), 0) / ratedTickets.length).toFixed(1)
        : '4.9';

      return {
        total,
        open,
        raised,
        categorised,
        assigned,
        replied,
        resolved,
        breachedCount,
        deflectionsCount: state.deflectionsCount || 42,
        deflectionRate: '68.4%',
        avgHandleTime: '2m 45s',
        csatScore: avgCsat
      };
    },

    /**
     * Subscribe to changes
     */
    subscribe: function (cb) {
      if (typeof cb === 'function') {
        subscribers.add(cb);
        cb(loadState());
        return () => subscribers.delete(cb);
      }
      return () => {};
    }
  };

  // Expose globally
  global.BizAssistStore = BizAssistStore;

})(typeof window !== 'undefined' ? window : globalThis);
