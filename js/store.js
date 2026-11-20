/**
 * BizAssist AI — Shared Unified Data Store (js/store.js)
 * 
 * Provides a single reactive source of truth for tickets, knowledge base articles,
 * canned responses / macros, internal notes, activity timelines, SLA tracking,
 * callbacks, notifications, CSAT ratings, collision detection, and manager settings.
 * Backed by localStorage['bizassist.data'] and synchronized across tabs with storage events.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'bizassist.data';
  const STORE_VERSION = 'v4_redesign';

  // 12 Starter Knowledge Base Articles
  const STARTER_ARTICLES = [
    {
      id: 'kb-vat-01',
      title: 'EU VAT Reverse Charge & Invoicing Guidelines',
      category: 'Billing & Payments',
      summary: 'How to register an EU VAT number and apply reverse-charge exemption to recurring subscription invoices.',
      content: 'Enterprise customers registered in the European Union are eligible for reverse-charge VAT exemption under Article 196 of the EU VAT Directive. To apply reverse charge, navigate to Workspace Settings > Billing and enter your valid VIES VAT identification number. If an invoice was already processed with VAT, submit a request with your invoice number to receive an automated credit note within 24 hours.',
      tags: ['VAT', 'Invoicing', 'EU', 'Tax', 'Billing']
    },
    {
      id: 'kb-stripe-02',
      title: 'Resolving Stripe Payment & Card Renewal Failures',
      category: 'Billing & Payments',
      summary: 'Troubleshooting recurring subscription renewal decline codes including authentication required (3D Secure).',
      content: 'Renewal failures frequently occur when card issuers require Strong Customer Authentication (SCA / 3D Secure 2.0). To complete payment verification, click the secure verification link sent to the billing contact email, or update payment method directly in Billing > Payment Methods. Once updated, our gateway automatically re-attempts payment without interrupting service.',
      tags: ['Stripe', 'Payment', 'Renewal', 'Billing', 'Failed Payment']
    },
    {
      id: 'kb-refund-03',
      title: 'Subscription Cancellation & Prorated Refund Policy',
      category: 'Billing & Payments',
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
      category: 'General',
      summary: 'A fast visual walkthrough of how customer tickets progress from Raised to Resolved.',
      content: 'Every inquiry submitted to BizAssist moves through 5 transparent milestones: 1. Raised (logged with unique #BA-XXXX code), 2. Categorised (AI extracts key entities and tags category/urgency), 3. Assigned (routed to specialist support agent or tier queue), 4. Replied (investigation findings or solution provided), 5. Resolved (customer confirmation and CSAT evaluation).',
      tags: ['Quickstart', 'Lifecycle', 'Stages', 'Overview']
    },
    {
      id: 'kb-triage-11',
      title: 'How AI Auto-Triage & Confidence Scoring Operates',
      category: 'General',
      summary: 'Understanding NLP intent classification, urgency regression, and entity extraction.',
      content: 'BizAssist AI utilizes grounded semantic embeddings and an SLA classification regressor to evaluate customer inquiries in <120ms. It evaluates issue severity, business impact, and emotional sentiment to assign an urgency level (Normal: 8h, High: 1h, Urgent: 15m) and drafts an initial contextual reply for human agent sign-off.',
      tags: ['AI Triage', 'NLP', 'Machine Learning', 'Automation']
    },
    {
      id: 'kb-channels-12',
      title: 'Multi-Channel Intake Integration: Web, Email, Chat & WhatsApp',
      category: 'General',
      summary: 'Connecting inbound customer touchpoints into a unified triage stream.',
      content: 'BizAssist AI unifies 5 intake vectors into a single real-time queue: Customer Web Portal, Inbound Email forwarding, Knowledge Chatbot widget, Voice call-back requests, and WhatsApp Business API. Each ticket retains its origin channel tag, enabling channel-specific SLAs and resolution reporting.',
      tags: ['Omnichannel', 'WhatsApp', 'Email', 'Chatbot', 'Intake']
    }
  ];

  // 10+ Categorized Canned Responses / Macros
  const DEFAULT_MACROS = [
    {
      id: 'macro-sso-01',
      title: 'Okta SSO Certificate Re-sync Guide',
      category: 'Account & Security',
      shortcut: '/sso',
      content: 'Hi {{name}},\n\nI reviewed your SAML assertion failure logs. This occurs when your Okta IdP certificate fingerprint does not match the cached metadata on our gateway.\n\nTo resolve this immediately:\n1. Open Workspace Settings > Security > SSO.\n2. Paste your updated x509 cert from Okta Admin.\n3. Click "Save & Refresh Metadata".\n\nI have also flushed our auth cache for your tenant. Please try signing in again and let me know if you experience any further issues.\n\nBest regards,\n{{agent}}'
    },
    {
      id: 'macro-vat-02',
      title: 'EU VAT Reverse-Charge Credit Note',
      category: 'Billing & Payments',
      shortcut: '/vat',
      content: 'Hi {{name}},\n\nThank you for providing your valid VIES VAT registration number. I have verified your tax-exempt status under the EU Reverse Charge Directive.\n\nA credit note for the VAT portion on your recent invoice has been generated and queued for automated refund back to your original payment method within 3-5 business days. Your workspace billing profile is now permanently updated for 0% reverse-charge VAT.\n\nWarm regards,\n{{agent}}'
    },
    {
      id: 'macro-refund-03',
      title: 'Prorated Subscription Refund Confirmation',
      category: 'Billing & Payments',
      shortcut: '/refund',
      content: 'Hi {{name}},\n\nPer our conversation, I have processed a prorated refund of {{amount}} for your unused subscription period. The funds will be credited to your card within 5-10 business days.\n\nYour workspace will remain active with standard features until the conclusion of the billing cycle.\n\nSincerely,\n{{agent}}'
    },
    {
      id: 'macro-webhook-04',
      title: 'Webhook Retry & Latency Optimization',
      category: 'API & Infrastructure',
      shortcut: '/webhook',
      content: 'Hi {{name}},\n\nWe inspected your webhook delivery events. Your endpoint is taking >4.8s to respond, which causes our edge dispatcher to trigger retry backoff to prevent queue starvation.\n\nWe strongly recommend:\n1. Acknowledging inbound webhooks immediately with an HTTP 200 response.\n2. Offloading event payload processing asynchronously to background job workers (e.g., Redis Queue or SQS).\n\nPlease see our architecture guidelines at: https://docs.bizassist.ai/webhooks/backoff\n\nBest,\n{{agent}}'
    },
    {
      id: 'macro-ratelimit-05',
      title: 'API Rate Limit Temporary Quota Boost',
      category: 'API & Infrastructure',
      shortcut: '/quota',
      content: 'Hi {{name}},\n\nTo support your upcoming product launch, I have temporarily increased your REST API quota from 500 req/min to 2,500 req/min for the next 7 days.\n\nBe sure to monitor the `X-RateLimit-Remaining` header in your HTTP responses. If you anticipate sustained high traffic beyond next week, our Solutions team can transition your tenant to an Enterprise dedicated cluster.\n\nRegards,\n{{agent}}'
    },
    {
      id: 'macro-outage-06',
      title: 'Incident Apology & Resolution Confirmation',
      category: 'API & Infrastructure',
      shortcut: '/apology',
      content: 'Hi {{name}},\n\nI sincerely apologize for the disruption caused by today’s latency incident. Our Infrastructure SRE team resolved the upstream proxy bottleneck at 10:15 UTC, and all webhook delivery queues are now fully drained and normal.\n\nA full incident post-mortem will be published to our status page within 24 hours. Thank you for your patience and partnership.\n\nBest,\n{{agent}}'
    },
    {
      id: 'macro-2fa-07',
      title: '2FA Recovery & Temporary Bypass Code',
      category: 'Account & Security',
      shortcut: '/2fa',
      content: 'Hi {{name}},\n\nFollowing secondary verification through your organization administrator, your 2FA credential reset has been approved. A one-time 4-hour bypass code has been sent securely to your verified corporate mobile number.\n\nOnce logged in, please immediately enroll your new authenticator app or security key in Account Settings > Security.\n\nBest,\n{{agent}}'
    },
    {
      id: 'macro-waiting-08',
      title: 'Request Additional Logs / Details (Waiting)',
      category: 'General',
      shortcut: '/moreinfo',
      content: 'Hi {{name}},\n\nTo help our engineering team reproduce this behavior, could you please provide:\n1. The exact timestamp and timezone when the issue occurred.\n2. The request ID or full HTTP response headers.\n3. A full screenshot of your browser developer console errors.\n\nOnce we receive these details, we will immediately resume our investigation.\n\nThanks,\n{{agent}}'
    },
    {
      id: 'macro-escalation-09',
      title: 'Escalation Notice to Tier-3 Core Engineering',
      category: 'General',
      shortcut: '/escalate',
      content: 'Hi {{name}},\n\nI have reviewed the diagnostic logs and escalated your inquiry directly to our Tier-3 Senior Engineering on-call team. They are actively analyzing the memory traces under ticket reference #{{code}}.\n\nI will personally monitor this ticket and provide you with an updated progress report within 2 hours.\n\nBest regards,\n{{agent}}'
    },
    {
      id: 'macro-resolve-10',
      title: 'Issue Resolution & CSAT Feedback Request',
      category: 'General',
      shortcut: '/resolve',
      content: 'Hi {{name}},\n\nI am pleased to confirm that this issue has been resolved. You can now resume normal operations in your workspace.\n\nIf you have any further questions or if anything else comes up, simply reply to this message to reopen the ticket. We would also greatly appreciate 30 seconds of your feedback via the rating prompt below!\n\nThank you for choosing BizAssist AI,\n{{agent}}'
    }
  ];

  // 18 Realistic Canonical Tickets (#BA-1001 to #BA-1018)
  const DEFAULT_TICKETS = [
    {
      id: 'BA-1042',
      code: 'BA-1042',
      subject: 'Enterprise SSO integration failure with Okta SAML 2.0',
      description: 'Our staging Okta IdP cert was rotated but SAML assertion verification is failing with invalid signature on the metadata endpoint.',
      category: 'Account & Security',
      priority: 'High',
      priorityReason: 'Staging environment blocked; customer deploying to production in 48 hours.',
      status: 'High',
      stage: 'Assigned',
      channel: 'Web Portal',
      sentiment: 'Frustrated',
      sentimentTrend: 'Frustrated -> Neutral',
      assignedTo: 'Sarah Jenkins',
      assignedTeam: 'Tier-2 Infrastructure',
      contactName: 'Alex Rivera',
      contactEmail: 'alex.r@acme.com',
      company: 'Acme Corp',
      plan: 'Enterprise',
      arr: '$120,000 / yr',
      slaMinutes: 60,
      createdAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(), // ~12m remaining
      updatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      aiSummary: 'Okta SAML 2.0 x509 fingerprint mismatch following scheduled certificate rotation on customer staging environment.',
      suggestedReply: 'Hi Alex, I reviewed your Okta metadata endpoint. The x509 cert fingerprint needs manual re-sync in your SSO settings panel. I have refreshed the cache on our auth gateway. Ref: Enterprise SSO with Okta SAML 2.0.',
      citations: [{ title: 'Enterprise Single Sign-On (SSO) with Okta SAML 2.0', id: 'kb-saml-07' }],
      tags: ['SAML', 'SSO', 'Okta', 'Security', 'Enterprise'],
      attachments: [{ name: 'okta-saml-error.png', size: '245 KB', type: 'image/png', url: '' }],
      internalNotes: [
        { id: 'note-1', author: 'Sarah Jenkins', text: 'Verified Okta cert fingerprint mismatch in gateway auth logs. Cache purged.', createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString() }
      ],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Web Portal', actor: 'Alex Rivera', timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString() },
        { id: 'ev-2', type: 'triage', description: 'AI categorized as Account & Security, Priority High (60m SLA)', actor: 'AI Engine', timestamp: new Date(Date.now() - 47 * 60 * 1000).toISOString() },
        { id: 'ev-3', type: 'assigned', description: 'Assigned to Sarah Jenkins', actor: 'System Routing', timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString() }
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
      status: 'Urgent',
      stage: 'Replied',
      channel: 'Chatbot',
      sentiment: 'Critical',
      sentimentTrend: 'Critical -> Neutral',
      assignedTo: 'Sarah Jenkins',
      assignedTeam: 'Tier-3 Infrastructure SRE',
      contactName: 'Maya Patel',
      contactEmail: 'maya@orbitio.dev',
      company: 'OrbitIO',
      plan: 'Enterprise',
      arr: '$95,000 / yr',
      slaMinutes: 15,
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 7m remaining (pulsing critical!)
      updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      aiSummary: 'Edge proxy upstream socket timeout caused queued webhook backpressure; autoscaling group rebalanced.',
      suggestedReply: 'Hi Maya, our SRE team identified an edge proxy routing bottleneck and added 4 worker instances. Latency has returned to 68ms. A post-incident report is being prepared. Ref: Webhook Latency Optimization.',
      citations: [{ title: 'Webhook Latency Optimization & Retry Backoff Architecture', id: 'kb-webhook-04' }],
      tags: ['Webhooks', 'Latency', 'Outage', 'P1'],
      attachments: [],
      internalNotes: [
        { id: 'note-1', author: 'Sarah Jenkins', text: 'P1 incident room opened. Scaled up proxy workers from 8 to 12.', createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() }
      ],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Chatbot assistant', actor: 'Maya Patel', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
        { id: 'ev-2', type: 'triage', description: 'AI categorized as API & Infrastructure, Priority Urgent (15m SLA)', actor: 'AI Engine', timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString() }
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
      status: 'Normal',
      stage: 'Categorised',
      channel: 'Inbound Email',
      sentiment: 'Neutral',
      sentimentTrend: 'Neutral',
      assignedTo: 'Marcus Vance',
      assignedTeam: 'Billing & FinOps',
      contactName: 'Elena Rostova',
      contactEmail: 'elena@cloudcore.io',
      company: 'CloudCore Systems',
      plan: 'Pro',
      arr: '$36,000 / yr',
      slaMinutes: 480,
      createdAt: new Date(Date.now() - 78 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      aiSummary: 'Customer EU VAT ID was submitted after automated billing run; requires credit note and updated invoice generation.',
      suggestedReply: 'Hi Elena, I verified your reverse-charge EU VAT registration in VIES. A credit note for INV-2026-881 has been drafted and will be issued within 24 hours. Ref: EU VAT Reverse Charge & Invoicing Guidelines.',
      citations: [{ title: 'EU VAT Reverse Charge & Invoicing Guidelines', id: 'kb-vat-01' }],
      tags: ['Billing', 'VAT', 'Invoicing'],
      attachments: [{ name: 'invoice-INV-2026-881.pdf', size: '184 KB', type: 'application/pdf', url: '' }],
      internalNotes: [],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Inbound Email', actor: 'Elena Rostova', timestamp: new Date(Date.now() - 78 * 60 * 1000).toISOString() },
        { id: 'ev-2', type: 'triage', description: 'AI categorized as Billing & Payments, Priority Normal (8h SLA)', actor: 'AI Engine', timestamp: new Date(Date.now() - 77 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-1004',
      code: 'BA-1004',
      subject: 'Stripe 3D Secure recurring payment failure on renewal',
      description: 'Our annual subscription renewal failed with card decline code authentication_required. We need to complete verification without service disruption.',
      category: 'Billing & Payments',
      priority: 'Urgent',
      priorityReason: 'Subscription expires tonight; workspace will be downgraded to free tier.',
      status: 'Urgent',
      stage: 'Assigned',
      channel: 'Web Portal',
      sentiment: 'Frustrated',
      sentimentTrend: 'Frustrated',
      assignedTo: 'Marcus Vance',
      assignedTeam: 'Billing & FinOps',
      contactName: 'Liam O’Connor',
      contactEmail: 'liam@fintechhub.net',
      company: 'FintechHub',
      plan: 'Enterprise',
      arr: '$84,000 / yr',
      slaMinutes: 15,
      createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(), // 4m remaining (pulsing critical!)
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      aiSummary: 'SCA 3D Secure challenge failed; payment link needs immediate delivery to organization billing manager.',
      suggestedReply: 'Hi Liam, I generated a direct 3D Secure authentication link valid for 24 hours. Your enterprise workspace grace period is extended by 7 days so service remains completely uninterrupted.',
      citations: [{ title: 'Resolving Stripe Payment & Card Renewal Failures', id: 'kb-stripe-02' }],
      tags: ['Stripe', 'Billing', 'Renewal', 'Urgent'],
      attachments: [],
      internalNotes: [],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Web Portal', actor: 'Liam O’Connor', timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-1005',
      code: 'BA-1005',
      subject: 'Okta SAML assertion signature mismatch on secondary tenant',
      description: 'Similar to our primary domain, our secondary business unit domain is failing Okta SSO logins with XML signature verification error.',
      category: 'Account & Security',
      priority: 'High',
      priorityReason: 'Duplicate or related SSO cert rotation across multiple company domains.',
      status: 'High',
      stage: 'Assigned',
      channel: 'Web Portal',
      sentiment: 'Neutral',
      sentimentTrend: 'Neutral',
      assignedTo: 'Sarah Jenkins',
      assignedTeam: 'Tier-2 Infrastructure',
      contactName: 'Devon Lee',
      contactEmail: 'devon.l@acme.com',
      company: 'Acme Corp',
      plan: 'Enterprise',
      arr: '$120,000 / yr',
      slaMinutes: 60,
      createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      aiSummary: 'Second SSO ticket from Acme Corp; 92% similarity to #BA-1042.',
      suggestedReply: 'Hi Devon, we are currently resolving the primary Okta certificate mismatch for Acme Corp under #BA-1042. I have linked both tickets so the gateway cache refresh covers both tenant domains simultaneously.',
      citations: [{ title: 'Enterprise Single Sign-On (SSO) with Okta SAML 2.0', id: 'kb-saml-07' }],
      tags: ['SAML', 'SSO', 'DuplicateCandidate', 'Acme'],
      attachments: [],
      internalNotes: [
        { id: 'note-1', author: 'Sarah Jenkins', text: 'Candidate for merge into #BA-1042.', createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() }
      ],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Web Portal', actor: 'Devon Lee', timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-1006',
      code: 'BA-1006',
      subject: 'REST API 429 rate limit reached during batch customer sync',
      description: 'Our nightly ETL pipeline hit HTTP 429 Too Many Requests while synchronizing 140k customer contact records.',
      category: 'API & Infrastructure',
      priority: 'Normal',
      priorityReason: 'Batch process can retry; production traffic unaffected.',
      status: 'Waiting on Customer',
      stage: 'Replied',
      channel: 'WhatsApp',
      sentiment: 'Neutral',
      sentimentTrend: 'Neutral',
      assignedTo: 'Alex Chen',
      assignedTeam: 'Developer Experience',
      contactName: 'Carlos Gomez',
      contactEmail: 'carlos@vortexdata.co',
      company: 'Vortex Data',
      plan: 'Pro',
      arr: '$42,000 / yr',
      slaMinutes: 480,
      createdAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      aiSummary: 'Customer running sequential un-batched requests without checking Retry-After headers.',
      suggestedReply: 'Hi Carlos, I checked your usage logs. You are issuing un-batched queries. We offer a bulk sync endpoint `/v1/customers/bulk` that processes 1,000 records per call. Waiting for your confirmation on testing the bulk endpoint.',
      citations: [{ title: 'API Rate Limits, Quotas & Token Bucket Mechanics', id: 'kb-ratelimit-05' }],
      tags: ['API', 'RateLimit', 'BatchSync'],
      attachments: [],
      internalNotes: [],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via WhatsApp integration', actor: 'Carlos Gomez', timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString() },
        { id: 'ev-2', type: 'reply', description: 'Waiting for customer feedback on bulk endpoint', actor: 'Alex Chen', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-1007',
      code: 'BA-1007',
      subject: 'Security lead hardware FIDO2 key lost during transit',
      description: 'Emergency 2FA recovery needed for senior security analyst locked out before SOC2 audit.',
      category: 'Account & Security',
      priority: 'Normal',
      priorityReason: 'Verified identity via out-of-band hotline.',
      status: 'Resolved',
      stage: 'Resolved',
      channel: 'Phone',
      sentiment: 'Positive',
      sentimentTrend: 'Neutral -> Positive',
      assignedTo: 'Sarah Jenkins',
      assignedTeam: 'Security Operations',
      contactName: 'David Kim',
      contactEmail: 'david.k@bytewave.co',
      company: 'ByteWave Labs',
      plan: 'Enterprise',
      arr: '$110,000 / yr',
      slaMinutes: 480,
      createdAt: new Date(Date.now() - 420 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      aiSummary: '2FA bypass key issued and new hardware key registered successfully.',
      suggestedReply: 'Hi David, your temporary 2FA token has been issued and verified. Hardware token registered successfully.',
      citations: [{ title: 'Multi-Factor Authentication (2FA) Reset & Recovery Keys', id: 'kb-2fa-08' }],
      tags: ['2FA', 'Security', 'Resolved'],
      attachments: [],
      internalNotes: [],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Phone call', actor: 'David Kim', timestamp: new Date(Date.now() - 420 * 60 * 1000).toISOString() },
        { id: 'ev-2', type: 'resolved', description: 'Ticket marked resolved', actor: 'Sarah Jenkins', timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString() }
      ],
      csat: { rating: 5, comment: 'Incredible speed resolving our security key lockout.', submittedAt: new Date(Date.now() - 85 * 60 * 1000).toISOString() }
    },
    {
      id: 'BA-1008',
      code: 'BA-1008',
      subject: 'CSV export 504 gateway timeout on quarterly resolution report',
      description: 'Analytics dashboard fails when attempting to export 120,000 historical rows into CSV format.',
      category: 'Bug Reports',
      priority: 'Normal',
      priorityReason: 'Analytical export workaround available through background job.',
      status: 'Normal',
      stage: 'Assigned',
      channel: 'Web Portal',
      sentiment: 'Neutral',
      sentimentTrend: 'Neutral',
      assignedTo: 'Alex Chen',
      assignedTeam: 'Platform Analytics',
      contactName: 'Chloe Dupont',
      contactEmail: 'chloe.d@solas.tech',
      company: 'Solas Tech',
      plan: 'Pro',
      arr: '$30,000 / yr',
      slaMinutes: 480,
      createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      aiSummary: 'Database reporting query lacks index on resolved_at timestamp for multi-tenant range aggregations.',
      suggestedReply: 'Hi Chloe, our engineering team is optimizing large report queries. I have generated your 90-day export asynchronously and shared the download link.',
      citations: [],
      tags: ['Analytics', 'Export', 'Bug'],
      attachments: [],
      internalNotes: [],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Web Portal', actor: 'Chloe Dupont', timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-1009',
      code: 'BA-1009',
      subject: 'Critical data pipeline sync failure on Snowflake connector',
      description: 'Inbound customer events stopped streaming to our Snowflake data warehouse since 08:00 UTC.',
      category: 'Integrations',
      priority: 'Urgent',
      priorityReason: 'Production business intelligence reporting pipeline halted.',
      status: 'Urgent',
      stage: 'Assigned',
      channel: 'Web Portal',
      sentiment: 'Critical',
      sentimentTrend: 'Critical',
      assignedTo: 'Maya Lin',
      assignedTeam: 'Data Infrastructure',
      contactName: 'Sanjay Gupta',
      contactEmail: 'sanjay@prismhealth.io',
      company: 'Prism Health',
      plan: 'Enterprise',
      arr: '$140,000 / yr',
      slaMinutes: 15,
      createdAt: new Date(Date.now() - 13 * 60 * 1000).toISOString(), // 2m remaining (pulsing critical!)
      updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      aiSummary: 'Snowflake RSA key pair credentials expired; pipeline connection refused.',
      suggestedReply: 'Hi Sanjay, we verified your Snowflake connector. The private RSA key expired at 07:59 UTC. Please rotate your public key in Snowflake and update the private key in Integrations > Snowflake.',
      citations: [],
      tags: ['Snowflake', 'Integrations', 'P1', 'DataPipeline'],
      attachments: [],
      internalNotes: [
        { id: 'note-1', author: 'Maya Lin', text: 'Checked connector logs: JWT token generation failed due to expired private key.', createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString() }
      ],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Web Portal', actor: 'Sanjay Gupta', timestamp: new Date(Date.now() - 13 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-1010',
      code: 'BA-1010',
      subject: 'Inquiry regarding custom SLA tier and dedicated IP pools',
      description: 'We are expanding our tier from 500 agents to 1,500 agents and require 99.99% uptime guarantees and dedicated edge egress IPs.',
      category: 'General',
      priority: 'Normal',
      priorityReason: 'Commercial account expansion opportunity.',
      status: 'Normal',
      stage: 'Raised',
      channel: 'Inbound Email',
      sentiment: 'Positive',
      sentimentTrend: 'Positive',
      assignedTo: 'Unassigned',
      assignedTeam: 'Enterprise Accounts',
      contactName: 'Rachel Green',
      contactEmail: 'rachel.g@monolith.co',
      company: 'Monolith Global',
      plan: 'Enterprise',
      arr: '$210,000 / yr',
      slaMinutes: 480,
      createdAt: new Date(Date.now() - 200 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 200 * 60 * 1000).toISOString(),
      aiSummary: 'Enterprise contract expansion; requests dedicated egress IP CIDR blocks and custom SLA rider.',
      suggestedReply: 'Hi Rachel, thank you for reaching out! Dedicated IP pools and custom 99.99% SLA agreements are standard on our Enterprise Tier. Our Enterprise Solutions Director will connect with you today.',
      citations: [],
      tags: ['Expansion', 'DedicatedIP', 'SLA'],
      attachments: [],
      internalNotes: [],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Inbound email received from Monolith Global', actor: 'Rachel Green', timestamp: new Date(Date.now() - 200 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-1011',
      code: 'BA-1011',
      subject: 'Mobile iOS app crashes on ticket attachment camera preview',
      description: 'Users on iOS 18.1 experience a crash whenever tapping "Take Photo" in the support widget camera modal.',
      category: 'Bug Reports',
      priority: 'High',
      priorityReason: 'Affects mobile customer intake across all iOS 18 users.',
      status: 'High',
      stage: 'Assigned',
      channel: 'Web Portal',
      sentiment: 'Frustrated',
      sentimentTrend: 'Frustrated',
      assignedTo: 'Alex Chen',
      assignedTeam: 'Mobile SDK Team',
      contactName: 'Zoe Martinez',
      contactEmail: 'zoe@appflow.io',
      company: 'AppFlow Technologies',
      plan: 'Pro',
      arr: '$48,000 / yr',
      slaMinutes: 60,
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      aiSummary: 'NSCameraUsageDescription permission string missing in latest iOS SDK build 2.4.1.',
      suggestedReply: 'Hi Zoe, our mobile engineering team identified a missing camera permission entitlement in iOS SDK v2.4.1. Patch v2.4.2 has been deployed to CocoaPods and SPM.',
      citations: [],
      tags: ['Mobile', 'iOS', 'Crash', 'Bug'],
      attachments: [{ name: 'crash-log-ios18.txt', size: '42 KB', type: 'text/plain', url: '' }],
      internalNotes: [],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Web Portal', actor: 'Zoe Martinez', timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-1012',
      code: 'BA-1012',
      subject: 'Duplicate seat charge on quarterly expansion invoice',
      description: 'We were billed twice for adding 15 new agent seats in invoice INV-2026-904.',
      category: 'Billing & Payments',
      priority: 'Normal',
      priorityReason: 'Billing discrepancy requires accounting credit.',
      status: 'Waiting on Customer',
      stage: 'Replied',
      channel: 'Inbound Email',
      sentiment: 'Neutral',
      sentimentTrend: 'Neutral',
      assignedTo: 'Marcus Vance',
      assignedTeam: 'Billing & FinOps',
      contactName: 'Arthur Dent',
      contactEmail: 'arthur@galaxycorp.uk',
      company: 'Galaxy Corp',
      plan: 'Pro',
      arr: '$54,000 / yr',
      slaMinutes: 480,
      createdAt: new Date(Date.now() - 280 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      aiSummary: 'Double invoice generated during automated seat provisioning; credit note issued.',
      suggestedReply: 'Hi Arthur, I reviewed the invoice records. The duplicate charge has been voided and an amended invoice INV-2026-904-REV is attached. Awaiting your confirmation that the new total matches your records.',
      citations: [{ title: 'Subscription Cancellation & Prorated Refund Policy', id: 'kb-refund-03' }],
      tags: ['Billing', 'Invoice', 'Seats'],
      attachments: [],
      internalNotes: [],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Inbound Email', actor: 'Arthur Dent', timestamp: new Date(Date.now() - 280 * 60 * 1000).toISOString() },
        { id: 'ev-2', type: 'reply', description: 'Voided duplicate charge and sent amended invoice', actor: 'Marcus Vance', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-1013',
      code: 'BA-1013',
      subject: 'WhatsApp business API webhook message drop under high volume',
      description: 'Customer messages sent via WhatsApp occasionally drop during peak midday chat spikes.',
      category: 'Integrations',
      priority: 'High',
      priorityReason: 'Inbound customer communication drops during business hours.',
      status: 'High',
      stage: 'Assigned',
      channel: 'WhatsApp',
      sentiment: 'Frustrated',
      sentimentTrend: 'Frustrated',
      assignedTo: 'Maya Lin',
      assignedTeam: 'Messaging Infrastructure',
      contactName: 'Fatima Al-Sayed',
      contactEmail: 'fatima@mena-retail.com',
      company: 'MENA Retail Group',
      plan: 'Enterprise',
      arr: '$160,000 / yr',
      slaMinutes: 60,
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      aiSummary: 'Meta Cloud API webhook rate limit reached; webhook buffer consumer workers need scaling.',
      suggestedReply: 'Hi Fatima, our messaging engineers scaled the WhatsApp webhook ingest consumers from 4 to 16 workers. All queued messages are currently delivering without dropped events.',
      citations: [{ title: 'Webhook Latency Optimization & Retry Backoff Architecture', id: 'kb-webhook-04' }],
      tags: ['WhatsApp', 'Integrations', 'DropRate'],
      attachments: [],
      internalNotes: [],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via WhatsApp', actor: 'Fatima Al-Sayed', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-1014',
      code: 'BA-1014',
      subject: 'Request for SCIM user provisioning support in Azure AD',
      description: 'We need to automatically sync and de-provision user accounts from Microsoft Entra ID (Azure AD).',
      category: 'Account & Security',
      priority: 'Normal',
      priorityReason: 'Security feature request.',
      status: 'Normal',
      stage: 'Assigned',
      channel: 'Web Portal',
      sentiment: 'Positive',
      sentimentTrend: 'Positive',
      assignedTo: 'Sarah Jenkins',
      assignedTeam: 'Security Operations',
      contactName: 'Tobias Fünke',
      contactEmail: 'tobias@bluetech.co',
      company: 'BlueTech Solutions',
      plan: 'Enterprise',
      arr: '$90,000 / yr',
      slaMinutes: 480,
      createdAt: new Date(Date.now() - 310 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      aiSummary: 'Customer configuring SCIM 2.0 endpoint with Azure AD / Entra enterprise application.',
      suggestedReply: 'Hi Tobias, BizAssist supports standard SCIM 2.0 provisioning. You can generate a SCIM bearer token under Workspace Settings > Security > SCIM. Full setup steps are documented in our security guide.',
      citations: [{ title: 'Enterprise Single Sign-On (SSO) with Okta SAML 2.0', id: 'kb-saml-07' }],
      tags: ['SCIM', 'AzureAD', 'Security'],
      attachments: [],
      internalNotes: [],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Web Portal', actor: 'Tobias Fünke', timestamp: new Date(Date.now() - 310 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-1015',
      code: 'BA-1015',
      subject: 'Zendesk historical ticket data migration validation',
      description: 'Completed import of 45,000 tickets from Zendesk; 32 tickets show encoding error on special characters.',
      category: 'Integrations',
      priority: 'Normal',
      priorityReason: 'Post-migration non-blocking verification.',
      status: 'Normal',
      stage: 'Assigned',
      channel: 'Web Portal',
      sentiment: 'Neutral',
      sentimentTrend: 'Neutral',
      assignedTo: 'Alex Chen',
      assignedTeam: 'Migration Engineering',
      contactName: 'Nadia Benali',
      contactEmail: 'nadia@casbah.ma',
      company: 'Casbah Media',
      plan: 'Pro',
      arr: '$45,000 / yr',
      slaMinutes: 480,
      createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      aiSummary: 'ISO-8859-1 encoding in legacy export caused character garbling; auto-re-encoded in UTF-8.',
      suggestedReply: 'Hi Nadia, we re-ran our UTF-8 normalization worker on those 32 tickets. All accent and special characters now render cleanly in your dashboard.',
      citations: [],
      tags: ['Migration', 'Zendesk', 'UTF8'],
      attachments: [],
      internalNotes: [],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Web Portal', actor: 'Nadia Benali', timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-1016',
      code: 'BA-1016',
      subject: 'Security vulnerability disclosure policy & bounty inquiry',
      description: 'Independent researcher requesting submission guidelines for responsible disclosure of an SSRF finding in webhook test tool.',
      category: 'Account & Security',
      priority: 'High',
      priorityReason: 'Potential security vulnerability report.',
      status: 'High',
      stage: 'Replied',
      channel: 'Inbound Email',
      sentiment: 'Neutral',
      sentimentTrend: 'Neutral',
      assignedTo: 'Sarah Jenkins',
      assignedTeam: 'AppSec Team',
      contactName: 'Kasper V.',
      contactEmail: 'kasper@sectest.nl',
      company: 'Independent Researcher',
      plan: 'Starter',
      arr: '$0 / yr',
      slaMinutes: 60,
      createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      aiSummary: 'Responsible disclosure report; routed directly to AppSec lead.',
      suggestedReply: 'Hi Kasper, thank you for contacting our security team responsibly. Please send your encrypted proof-of-concept report via our PGP key published at security.bizassist.ai.',
      citations: [],
      tags: ['AppSec', 'Vulnerability', 'Security'],
      attachments: [],
      internalNotes: [
        { id: 'note-1', author: 'Sarah Jenkins', text: 'Checked AppSec queue. PGP key instructions shared.', createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() }
      ],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Inbound Email', actor: 'Kasper V.', timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-1017',
      code: 'BA-1017',
      subject: 'Custom domain SSL certificate renewal handshake error',
      description: 'Our customer support portal custom domain support.stride.co is showing an SSL certificate expired warning.',
      category: 'API & Infrastructure',
      priority: 'Urgent',
      priorityReason: 'Customers getting browser SSL security warnings on portal.',
      status: 'Urgent',
      stage: 'Assigned',
      channel: 'Web Portal',
      sentiment: 'Critical',
      sentimentTrend: 'Critical',
      assignedTo: 'Sarah Jenkins',
      assignedTeam: 'Edge Network Operations',
      contactName: 'Brian Stride',
      contactEmail: 'brian@stride.co',
      company: 'Stride Logistics',
      plan: 'Enterprise',
      arr: '$135,000 / yr',
      slaMinutes: 15,
      createdAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(), // 6m remaining (pulsing critical!)
      updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      aiSummary: 'Let’s Encrypt automated ACME HTTP-01 challenge failed due to missing CAA DNS record.',
      suggestedReply: 'Hi Brian, our edge team forced ACME DNS-01 verification and re-issued your custom domain wildcard certificate. The SSL cert is now active and secure globally.',
      citations: [{ title: 'Monitoring Platform Status & Incident Notification Channels', id: 'kb-status-06' }],
      tags: ['SSL', 'CustomDomain', 'P1', 'Edge'],
      attachments: [],
      internalNotes: [],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Web Portal', actor: 'Brian Stride', timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString() }
      ],
      csat: null
    },
    {
      id: 'BA-1018',
      code: 'BA-1018',
      subject: 'AI suggested reply model tone customization for German locale',
      description: 'Our DACH support team requires the AI assistant to default to formal German ("Sie" vs "du") for all enterprise suggested replies.',
      category: 'General',
      priority: 'Normal',
      priorityReason: 'Locale preference configuration.',
      status: 'Normal',
      stage: 'Assigned',
      channel: 'Chatbot',
      sentiment: 'Positive',
      sentimentTrend: 'Positive',
      assignedTo: 'Marcus Vance',
      assignedTeam: 'AI Model Alignment',
      contactName: 'Hannah Weber',
      contactEmail: 'hannah.w@berlin-tech.de',
      company: 'Berlin Tech Group',
      plan: 'Enterprise',
      arr: '$88,000 / yr',
      slaMinutes: 480,
      createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      aiSummary: 'Customer requires workspace-level system prompt instruction for German formal honorifics.',
      suggestedReply: 'Guten Tag Hannah, I have updated your workspace prompt rules in AI Settings to enforce formal German ("Sie") across all auto-generated drafts and chatbot responses.',
      citations: [{ title: 'How AI Auto-Triage & Confidence Scoring Operates', id: 'kb-triage-11' }],
      tags: ['AI', 'German', 'Locale', 'Tone'],
      attachments: [],
      internalNotes: [],
      timeline: [
        { id: 'ev-1', type: 'created', description: 'Ticket created via Chatbot', actor: 'Hannah Weber', timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString() }
      ],
      csat: null
    }
  ];

  // Collision indicators (e.g. "Maya Patel is viewing this ticket")
  const ACTIVE_COLLISIONS = {
    'BA-1042': 'Maya Patel is viewing this ticket',
    'BA-3310': 'Alex Chen is drafting an internal note',
    'BA-1004': 'Marcus Vance is reviewing payment logs'
  };

  function getInitialState() {
    return {
      version: STORE_VERSION,
      tickets: DEFAULT_TICKETS,
      articles: STARTER_ARTICLES,
      macros: DEFAULT_MACROS,
      callbacks: [
        {
          id: 'cb-1',
          name: 'Elena Rostova',
          phone: '+44 20 7946 0912',
          preferredTime: 'Afternoon (12:00 PM – 4:00 PM)',
          topic: 'Invoice VAT calculation mismatch on monthly billing (#BA-2089)',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'pending'
        }
      ],
      notifications: [
        {
          id: 'notif-1',
          title: 'SLA Risk: P1 Webhook Latency',
          message: 'Ticket #BA-3310 has less than 7 minutes before SLA breach.',
          createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
          read: false,
          link: '/agent-dashboard?ticket=BA-3310'
        },
        {
          id: 'notif-2',
          title: 'Duplicate Ticket Detected',
          message: 'Ticket #BA-1005 from Acme Corp has 92% similarity to #BA-1042.',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          read: false,
          link: '/agent-dashboard?ticket=BA-1005'
        },
        {
          id: 'notif-3',
          title: 'New Enterprise Inquiry',
          message: 'Monolith Global submitted inquiry #BA-1010 via Inbound Email.',
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          read: true,
          link: '/agent-dashboard?ticket=BA-1010'
        }
      ],
      settings: {
        slaUrgentMinutes: 15,
        slaHighMinutes: 60,
        slaNormalMinutes: 480,
        autoTriageEnabled: true,
        deflectionCount: 54
      }
    };
  }

  function loadState() {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const init = getInitialState();
        saveState(init);
        return init;
      }
      const parsed = JSON.parse(raw);
      if (parsed.version !== STORE_VERSION) {
        const fresh = getInitialState();
        saveState(fresh);
        return fresh;
      }
      return parsed;
    } catch (e) {
      console.warn('[BizAssistStore] Failed to parse local storage, resetting:', e);
      const init = getInitialState();
      saveState(init);
      return init;
    }
  }

  function saveState(state) {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      notifySubscribers();
    } catch (e) {
      console.error('[BizAssistStore] Save failed:', e);
    }
  }

  const subscribers = new Set();
  function notifySubscribers() {
    subscribers.forEach(fn => {
      try { fn(); } catch (e) { console.error(e); }
    });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) notifySubscribers();
    });
  }

  const BizAssistStore = {
    getTickets: function () {
      return loadState().tickets;
    },

    getTicket: function (idOrCode) {
      if (!idOrCode) return null;
      const clean = String(idOrCode).replace(/^#/, '').toUpperCase();
      const tickets = this.getTickets();
      return tickets.find(t => t.id.toUpperCase() === clean || t.code.toUpperCase() === clean) || null;
    },

    createTicket: function (data) {
      const state = loadState();
      const codeNum = 1000 + state.tickets.length + 1;
      const code = `BA-${codeNum}`;

      const newTicket = {
        id: code,
        code: code,
        subject: data.subject || 'New Support Ticket',
        description: data.description || '',
        category: data.category || 'General',
        priority: data.priority || 'Normal',
        priorityReason: data.priorityReason || 'Classified by customer intake form',
        status: data.priority || 'Normal',
        stage: 'Raised',
        channel: data.channel || 'Web Portal',
        sentiment: data.sentiment || 'Neutral',
        sentimentTrend: 'Neutral',
        assignedTo: 'Unassigned',
        assignedTeam: 'Triage Queue',
        contactName: data.contactName || 'Customer User',
        contactEmail: data.contactEmail || 'user@example.com',
        company: data.company || 'Customer Organization',
        plan: data.plan || 'Pro',
        arr: data.arr || '$36,000 / yr',
        slaMinutes: data.priority === 'Urgent' ? 15 : (data.priority === 'High' ? 60 : 480),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiSummary: data.aiSummary || 'New customer submission awaiting agent triage review.',
        suggestedReply: `Hi ${data.contactName || 'there'},\n\nThank you for reaching out to BizAssist AI Support. We have logged your request under #${code} and our specialized team is investigating.\n\nBest,\nBizAssist AI Team`,
        citations: [],
        tags: [data.category || 'General'],
        attachments: data.attachments || [],
        internalNotes: [],
        timeline: [
          {
            id: 'ev-1',
            type: 'created',
            description: `Ticket #${code} created via ${data.channel || 'Web Portal'}`,
            actor: data.contactName || 'Customer',
            timestamp: new Date().toISOString()
          }
        ],
        csat: null
      };

      state.tickets.unshift(newTicket);

      // Notification
      state.notifications.unshift({
        id: 'notif-' + Date.now(),
        title: `New Ticket Raised (#${code})`,
        message: `${newTicket.subject} (${newTicket.company})`,
        createdAt: new Date().toISOString(),
        read: false,
        link: `/agent-dashboard?ticket=${code}`
      });

      saveState(state);
      return newTicket;
    },

    updateTicket: function (idOrCode, patch) {
      const state = loadState();
      const clean = String(idOrCode).replace(/^#/, '').toUpperCase();
      const idx = state.tickets.findIndex(t => t.id.toUpperCase() === clean || t.code.toUpperCase() === clean);
      if (idx === -1) return null;

      state.tickets[idx] = {
        ...state.tickets[idx],
        ...patch,
        updatedAt: new Date().toISOString()
      };
      saveState(state);
      return state.tickets[idx];
    },

    advanceStage: function (idOrCode, actor = 'Support Agent') {
      const STAGES = ['Raised', 'Categorised', 'Assigned', 'Replied', 'Resolved'];
      const t = this.getTicket(idOrCode);
      if (!t) return null;

      const currentIdx = STAGES.indexOf(t.stage);
      if (currentIdx < STAGES.length - 1) {
        const nextStage = STAGES[currentIdx + 1];
        const timeline = [...(t.timeline || [])];
        timeline.push({
          id: 'ev-' + Date.now(),
          type: nextStage.toLowerCase(),
          description: `Stage advanced to ${nextStage}`,
          actor: actor,
          timestamp: new Date().toISOString()
        });

        return this.updateTicket(t.id, {
          stage: nextStage,
          status: nextStage === 'Resolved' ? 'Resolved' : t.status,
          timeline
        });
      }
      return t;
    },

    addInternalNote: function (idOrCode, text, author = 'Support Agent') {
      const t = this.getTicket(idOrCode);
      if (!t) return null;

      const notes = [...(t.internalNotes || [])];
      const newNote = {
        id: 'note-' + Date.now(),
        author: author,
        text: text,
        createdAt: new Date().toISOString()
      };
      notes.push(newNote);

      const timeline = [...(t.timeline || [])];
      timeline.push({
        id: 'ev-' + Date.now(),
        type: 'note',
        description: `Internal note added: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`,
        actor: author,
        timestamp: new Date().toISOString()
      });

      return this.updateTicket(t.id, { internalNotes: notes, timeline });
    },

    addPublicReply: function (idOrCode, replyText, author = 'Support Agent') {
      const t = this.getTicket(idOrCode);
      if (!t) return null;

      const timeline = [...(t.timeline || [])];
      timeline.push({
        id: 'ev-' + Date.now(),
        type: 'reply',
        description: `Public reply sent to customer: "${replyText.slice(0, 50)}${replyText.length > 50 ? '...' : ''}"`,
        actor: author,
        timestamp: new Date().toISOString()
      });

      let nextStage = t.stage;
      if (nextStage === 'Raised' || nextStage === 'Categorised' || nextStage === 'Assigned') {
        nextStage = 'Replied';
      }

      return this.updateTicket(t.id, {
        stage: nextStage,
        timeline,
        updatedAt: new Date().toISOString()
      });
    },

    customerReply: function (idOrCode, messageText, attachments = []) {
      const t = this.getTicket(idOrCode);
      if (!t) return null;

      const timeline = [...(t.timeline || [])];
      timeline.push({
        id: 'ev-' + Date.now(),
        type: 'customer-reply',
        description: `Customer added comment: "${messageText.slice(0, 50)}${messageText.length > 50 ? '...' : ''}"`,
        actor: t.contactName || 'Customer',
        timestamp: new Date().toISOString()
      });

      return this.updateTicket(t.id, {
        status: t.priority, // reactivates from waiting
        timeline,
        updatedAt: new Date().toISOString()
      });
    },

    reopenTicket: function (idOrCode, reason = 'Customer requested reopen') {
      const t = this.getTicket(idOrCode);
      if (!t) return null;

      const timeline = [...(t.timeline || [])];
      timeline.push({
        id: 'ev-' + Date.now(),
        type: 'reopened',
        description: `Ticket reopened: ${reason}`,
        actor: t.contactName || 'Customer',
        timestamp: new Date().toISOString()
      });

      return this.updateTicket(t.id, {
        status: t.priority || 'Normal',
        stage: 'Assigned',
        csat: null,
        timeline,
        updatedAt: new Date().toISOString()
      });
    },

    snoozeTicket: function (idOrCode, durationMinutes = 60) {
      const t = this.getTicket(idOrCode);
      if (!t) return null;

      const snoozedUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
      const timeline = [...(t.timeline || [])];
      timeline.push({
        id: 'ev-' + Date.now(),
        type: 'snoozed',
        description: `Ticket snoozed for ${durationMinutes} minutes`,
        actor: 'Support Agent',
        timestamp: new Date().toISOString()
      });

      return this.updateTicket(t.id, {
        snoozedUntil,
        timeline
      });
    },

    addTag: function (idOrCode, tag) {
      const t = this.getTicket(idOrCode);
      if (!t || !tag) return null;
      const tags = Array.from(new Set([...(t.tags || []), tag.trim()]));
      return this.updateTicket(t.id, { tags });
    },

    removeTag: function (idOrCode, tag) {
      const t = this.getTicket(idOrCode);
      if (!t || !tag) return null;
      const tags = (t.tags || []).filter(item => item.toLowerCase() !== tag.toLowerCase());
      return this.updateTicket(t.id, { tags });
    },

    getCollision: function (idOrCode) {
      if (!idOrCode) return null;
      const clean = String(idOrCode).replace(/^#/, '').toUpperCase();
      return ACTIVE_COLLISIONS[clean] || null;
    },

    getMacros: function (query = '', category = '') {
      const state = loadState();
      let list = state.macros || DEFAULT_MACROS;
      if (category) {
        list = list.filter(m => m.category.toLowerCase() === category.toLowerCase());
      }
      if (query) {
        const q = query.toLowerCase();
        list = list.filter(m => m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q) || (m.shortcut && m.shortcut.toLowerCase().includes(q)));
      }
      return list;
    },

    saveMacro: function ({ title, content, category, shortcut }) {
      const state = loadState();
      state.macros = state.macros || [...DEFAULT_MACROS];
      const newMacro = {
        id: 'macro-' + Date.now(),
        title: title || 'Custom Macro',
        category: category || 'General',
        shortcut: shortcut || '/custom',
        content: content || ''
      };
      state.macros.unshift(newMacro);
      saveState(state);
      return newMacro;
    },

    submitCsat: function (idOrCode, rating, comment = '') {
      const t = this.getTicket(idOrCode);
      if (!t) return null;

      const csatObj = {
        rating: Math.max(1, Math.min(5, Number(rating))),
        comment: comment.trim(),
        submittedAt: new Date().toISOString()
      };

      const timeline = [...(t.timeline || [])];
      timeline.push({
        id: 'ev-' + Date.now(),
        type: 'csat',
        description: `CSAT Rating submitted: ${csatObj.rating} / 5 stars`,
        actor: t.contactName || 'Customer',
        timestamp: new Date().toISOString()
      });

      return this.updateTicket(t.id, { csat: csatObj, timeline });
    },

    mergeTickets: function (primaryId, duplicateId) {
      const state = loadState();
      const pClean = String(primaryId).replace(/^#/, '').toUpperCase();
      const dClean = String(duplicateId).replace(/^#/, '').toUpperCase();

      const pIdx = state.tickets.findIndex(t => t.id.toUpperCase() === pClean || t.code.toUpperCase() === pClean);
      const dIdx = state.tickets.findIndex(t => t.id.toUpperCase() === dClean || t.code.toUpperCase() === dClean);

      if (pIdx === -1 || dIdx === -1) return false;

      const primary = state.tickets[pIdx];
      const duplicate = state.tickets[dIdx];

      primary.timeline.push({
        id: 'ev-' + Date.now(),
        type: 'merge',
        description: `Merged ticket #${duplicate.code} ("${duplicate.subject}") into this thread.`,
        actor: 'Support Agent',
        timestamp: new Date().toISOString()
      });

      primary.internalNotes.push({
        id: 'note-' + Date.now(),
        author: 'AI Merge Assist',
        text: `Ticket #${duplicate.code} merged into #${primary.code}. Customer ${duplicate.contactName} (${duplicate.contactEmail}) notified.`,
        createdAt: new Date().toISOString()
      });

      // Mark duplicate as resolved / merged
      duplicate.status = 'Resolved';
      duplicate.stage = 'Resolved';
      duplicate.timeline.push({
        id: 'ev-' + Date.now(),
        type: 'merge-closed',
        description: `Closed as duplicate; merged into #${primary.code}.`,
        actor: 'Support Agent',
        timestamp: new Date().toISOString()
      });

      saveState(state);
      return true;
    },

    findDuplicates: function (targetTicket) {
      if (!targetTicket) return [];
      const tickets = this.getTickets();
      const targetSub = targetTicket.subject.toLowerCase();
      const targetDomain = (targetTicket.contactEmail || '').split('@')[1] || '';

      return tickets.filter(t => {
        if (t.id === targetTicket.id) return false;
        if (t.status === 'Resolved') return false;

        const sub = t.subject.toLowerCase();
        const domain = (t.contactEmail || '').split('@')[1] || '';

        // Match if same company domain or high word overlap
        if (domain && domain === targetDomain && targetDomain !== 'gmail.com' && targetDomain !== 'example.com') {
          return true;
        }

        const words1 = targetSub.split(/\W+/).filter(w => w.length > 3);
        const words2 = sub.split(/\W+/).filter(w => w.length > 3);
        const overlap = words1.filter(w => words2.includes(w));
        return overlap.length >= 2;
      });
    },

    autoBalanceWorkload: function () {
      const state = loadState();
      const agents = ['Sarah Jenkins', 'Marcus Vance', 'Maya Lin', 'Alex Chen'];
      
      // Count active tickets per agent
      const counts = {};
      agents.forEach(a => { counts[a] = 0; });
      state.tickets.forEach(t => {
        if (t.status !== 'Resolved' && counts[t.assignedTo] !== undefined) {
          counts[t.assignedTo]++;
        }
      });

      let reassignments = 0;
      state.tickets.forEach(t => {
        if (t.status !== 'Resolved' && (t.assignedTo === 'Unassigned' || counts[t.assignedTo] > 4)) {
          // Find agent with lowest count
          let minAgent = agents[0];
          let minCount = counts[minAgent];
          agents.forEach(a => {
            if (counts[a] < minCount) {
              minCount = counts[a];
              minAgent = a;
            }
          });

          if (t.assignedTo !== minAgent) {
            if (counts[t.assignedTo]) counts[t.assignedTo]--;
            t.assignedTo = minAgent;
            counts[minAgent]++;
            t.timeline.push({
              id: 'ev-' + Date.now(),
              type: 'rebalanced',
              description: `Workload auto-rebalanced to ${minAgent}`,
              actor: 'AI Operations Manager',
              timestamp: new Date().toISOString()
            });
            reassignments++;
          }
        }
      });

      saveState(state);
      return reassignments;
    },

    getCallbacks: function () {
      return loadState().callbacks || [];
    },

    createCallbackRequest: function ({ name, phone, preferredTime, topic }) {
      const state = loadState();
      const cb = {
        id: 'cb-' + Date.now(),
        name,
        phone,
        preferredTime,
        topic,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      state.callbacks.unshift(cb);
      state.notifications.unshift({
        id: 'notif-' + Date.now(),
        title: 'New Call Back Scheduled',
        message: `${name} requested a call regarding "${topic}" (${preferredTime}).`,
        createdAt: new Date().toISOString(),
        read: false,
        link: '/agent-dashboard#callbacks'
      });
      saveState(state);
      return cb;
    },

    resolveCallback: function (id) {
      const state = loadState();
      const cb = state.callbacks.find(c => c.id === id);
      if (cb) {
        cb.status = 'completed';
        saveState(state);
      }
    },

    getArticles: function (query = '', category = '') {
      let list = loadState().articles || STARTER_ARTICLES;
      if (category) {
        list = list.filter(a => a.category.toLowerCase() === category.toLowerCase());
      }
      if (query) {
        const q = query.toLowerCase();
        list = list.filter(a => 
          a.title.toLowerCase().includes(q) || 
          a.summary.toLowerCase().includes(q) || 
          a.content.toLowerCase().includes(q) ||
          a.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return list;
    },

    getArticle: function (id) {
      const articles = this.getArticles();
      return articles.find(a => a.id === id) || null;
    },

    recordDeflection: function () {
      const state = loadState();
      state.settings.deflectionCount = (state.settings.deflectionCount || 0) + 1;
      saveState(state);
    },

    getNotifications: function () {
      return loadState().notifications || [];
    },

    addNotification: function (notif, stateRef = null) {
      const state = stateRef || loadState();
      state.notifications.unshift({
        id: 'notif-' + Date.now(),
        title: notif.title || 'Platform Notification',
        message: notif.message || '',
        createdAt: new Date().toISOString(),
        read: false,
        link: notif.link || '/app'
      });
      if (state.notifications.length > 25) {
        state.notifications.pop();
      }
      if (!stateRef) saveState(state);
    },

    markNotificationsAsRead: function () {
      const state = loadState();
      state.notifications.forEach(n => { n.read = true; });
      saveState(state);
    },

    getSettings: function () {
      return loadState().settings;
    },

    updateSettings: function (newSettings) {
      const state = loadState();
      state.settings = { ...state.settings, ...newSettings };
      saveState(state);
      return state.settings;
    },

    resetDemoData: function () {
      const initial = getInitialState();
      saveState(initial);
      return initial;
    },

    getMetrics: function () {
      const tickets = this.getTickets();
      const settings = this.getSettings();

      const total = tickets.length;
      const open = tickets.filter(t => t.status !== 'Resolved').length;
      const resolved = tickets.filter(t => t.status === 'Resolved').length;
      const urgent = tickets.filter(t => t.priority === 'Urgent' && t.status !== 'Resolved').length;
      const high = tickets.filter(t => t.priority === 'High' && t.status !== 'Resolved').length;
      const normal = tickets.filter(t => t.priority === 'Normal' && t.status !== 'Resolved').length;

      // Breaches
      let breaches = 0;
      const now = Date.now();
      tickets.forEach(t => {
        if (t.status !== 'Resolved') {
          const ageMinutes = (now - new Date(t.createdAt).getTime()) / 60000;
          if (ageMinutes > t.slaMinutes) breaches++;
        }
      });

      // CSAT
      const rated = tickets.filter(t => t.csat && t.csat.rating);
      const avgCsat = rated.length > 0 
        ? (rated.reduce((acc, t) => acc + t.csat.rating, 0) / rated.length).toFixed(1)
        : '4.9';

      return {
        total,
        open,
        resolved,
        urgent,
        high,
        normal,
        breaches,
        deflections: settings.deflectionCount || 54,
        avgCsat: `${avgCsat} / 5.0`
      };
    },

    subscribe: function (cb) {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    }
  };

  global.BizAssistStore = BizAssistStore;

})(typeof window !== 'undefined' ? window : globalThis);
