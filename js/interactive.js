/**
 * NexusAI Interactive Workflows & Modals
 * Supports full prototype simulations: ticket intake, NLP triage, suggested replies,
 * chatbot with citations, executive dashboard, and demo booking.
 */
(function () {
  'use strict';

  // Modal references
  const modalOverlay = document.getElementById('interactive-modal');
  const modalMeta = document.getElementById('modal-meta-label');
  const modalTitle = document.getElementById('modal-title-label');
  const modalContentSlot = document.getElementById('modal-content-slot');
  const modalCloseBtn = document.getElementById('modal-close-button');

  function openModal(metaText, titleText, htmlContent) {
    if (!modalOverlay) return;
    modalMeta.textContent = metaText;
    modalTitle.textContent = titleText;
    modalContentSlot.innerHTML = htmlContent;
    modalOverlay.classList.add('is-active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('is-active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  window.NexusOpenModal = openModal;
  window.NexusCloseModal = closeModal;

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Dedicated Page Maps
  const modulePageMap = {
    'portal': 'portal.html',
    'dashboard': 'agent-dashboard.html',
    'triage': 'ai-triage.html',
    'replies': 'suggested-replies.html',
    'chatbot': 'chatbot.html',
    'manager': 'manager-overview.html'
  };

  const stepPageMap = {
    '1': 'portal.html',
    '2': 'ai-triage.html',
    '3': 'ai-triage.html',
    '4': 'ai-triage.html',
    '5': 'suggested-replies.html',
    '6': 'agent-dashboard.html'
  };

  const goalPageMap = {
    'G1': 'portal.html',
    'G2': 'agent-dashboard.html',
    'G3': 'ai-triage.html',
    'G4': 'chatbot.html',
    'G5': 'manager-overview.html'
  };

  // 8. Project cards click navigate directly to dedicated pages
  document.querySelectorAll('.project-card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      const mod = card.getAttribute('data-module');
      if (modulePageMap[mod]) {
        window.location.href = modulePageMap[mod];
      }
    });
  });

  // 5. Marquee cards click navigate directly to dedicated step pages
  document.querySelectorAll('.marquee-card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      const stepNum = card.getAttribute('data-step');
      if (stepPageMap[stepNum]) {
        window.location.href = stepPageMap[stepNum];
      }
    });
  });

  // Goal rows click navigate directly to dedicated goal pages
  document.querySelectorAll('.goal-row').forEach(function (row) {
    row.addEventListener('click', function () {
      const g = row.getAttribute('data-goal');
      if (goalPageMap[g]) {
        window.location.href = goalPageMap[g];
      }
    });
  });

  // Hero Button & Footer buttons
  const heroBtn = document.getElementById('btn-hero-prototype');
  if (heroBtn) {
    heroBtn.addEventListener('click', function () {
      window.location.href = 'portal.html';
    });
  }

  const footerDemoBtn = document.getElementById('footer-btn-demo');
  if (footerDemoBtn) {
    footerDemoBtn.addEventListener('click', function () {
      openBookDemoModal();
    });
  }

  const footerEmailBtn = document.getElementById('footer-btn-email');
  if (footerEmailBtn) {
    footerEmailBtn.addEventListener('click', function () {
      openContactModal();
    });
  }

  const footerPortalBtn = document.getElementById('footer-btn-portal');
  if (footerPortalBtn) {
    footerPortalBtn.addEventListener('click', function () {
      window.location.href = 'portal.html';
    });
  }

  // Social Links buttons
  document.querySelectorAll('.footer-action-btn[data-social]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const platform = btn.getAttribute('data-social');
      window.NexusShowToast('Opening NexusAI official ' + platform + ' handle...');
      setTimeout(function () {
        window.open('https://github.com', '_blank');
      }, 400);
    });
  });

  // Floating Chat Trigger
  const floatingChatBtn = document.getElementById('floating-chat-btn');
  if (floatingChatBtn) {
    floatingChatBtn.addEventListener('click', function () {
      window.location.href = 'chatbot.html';
    });
  }

  function openStepModal(stepNum) {
    const stepMap = {
      '1': { mod: 'portal' },
      '2': { mod: 'triage' },
      '3': { mod: 'priority' },
      '4': { mod: 'summary' },
      '5': { mod: 'replies' },
      '6': { mod: 'status' }
    };
    const s = stepMap[stepNum] || stepMap['1'];
    openModuleModal(s.mod);
  }

  function openModuleModal(moduleType) {
    switch (moduleType) {
      case 'portal':
        openModal(
          'CUSTOMER PORTAL · GOAL G1',
          'Raise & Track Support Tickets',
          '<div style="display:flex; flex-direction:column; gap:20px;">' +
            '<p style="color:var(--text-secondary); font-size:15px;">Experience the customer intake flow. Raise a simulated ticket to trigger immediate AI triage.</p>' +
            '<form id="ticket-submit-form" onsubmit="window.NexusHandleTicketSubmit(event)">' +
              '<div class="interactive-field">' +
                '<label class="interactive-label">Subject</label>' +
                '<input type="text" id="ticket-subject-input" class="interactive-input" value="Payment failure during checkout" required />' +
              '</div>' +
              '<div class="interactive-field">' +
                '<label class="interactive-label">Category</label>' +
                '<select id="ticket-cat-input" class="interactive-select">' +
                  '<option>Billing &amp; Payments</option>' +
                  '<option>Authentication / SSO</option>' +
                  '<option>Technical Bug</option>' +
                  '<option>Feature Request</option>' +
                '</select>' +
              '</div>' +
              '<div class="interactive-field">' +
                '<label class="interactive-label">Details</label>' +
                '<textarea id="ticket-body-input" class="interactive-textarea" required>' +
                  'Our team was billed $1,200 during checkout upgrade but the license key still says pending.' +
                '</textarea>' +
              '</div>' +
              '<button type="submit" class="interactive-btn-primary">Submit Ticket to AI Triage →</button>' +
            '</form>' +
            '<div id="ticket-response-preview" style="display:none; background:#F0FDFA; border:1px solid #99F6E4; padding:16px; border-radius:8px;">' +
              '<strong style="color:#0F766E;">✓ TICKET SUBMITTED &amp; TRIAGED:</strong>' +
              '<p style="color:#115E59; margin-top:6px; font-size:13px;" id="ticket-response-text"></p>' +
            '</div>' +
          '</div>'
        );
        break;

      case 'dashboard':
        openModal(
          'AGENT WORKSPACE · GOAL G2',
          'Unified Ticket Management Console',
          '<div style="display:flex; flex-direction:column; gap:20px;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<span class="interactive-label">ACTIVE INBOX (18 OPEN)</span>' +
              '<span style="font-family:var(--font-mono); font-size:11px; color:#10B981;">● 14 AGENTS ONLINE</span>' +
            '</div>' +
            '<div style="border:1px solid var(--border); border-radius:8px; overflow:hidden;">' +
              '<div style="background:#F4F4F5; padding:12px 16px; border-bottom:1px solid var(--border); font-family:var(--font-mono); font-size:11px; display:grid; grid-template-columns:60px 1.5fr 1fr 100px;">' +
                '<div>SLA</div><div>TITLE</div><div>CUSTOMER</div><div>ACTION</div>' +
              '</div>' +
              '<div style="padding:14px 16px; border-bottom:1px solid var(--border); display:grid; grid-template-columns:60px 1.5fr 1fr 100px; align-items:center; font-size:13px;">' +
                '<div><span style="background:#FEF2F2; color:#DC2626; padding:2px 6px; border-radius:4px; font-weight:700; font-size:10px;">P1</span></div>' +
                '<div><strong>Stripe webhook timeout</strong></div>' +
                '<div style="color:#71717A;">sarah@acme.co</div>' +
                '<div><button class="interactive-btn-secondary" onclick="window.NexusShowToast(\'Assigned Ticket #4092 to your inbox!\')">Assign</button></div>' +
              '</div>' +
              '<div style="padding:14px 16px; border-bottom:1px solid var(--border); display:grid; grid-template-columns:60px 1.5fr 1fr 100px; align-items:center; font-size:13px;">' +
                '<div><span style="background:#FFFBEB; color:#D97706; padding:2px 6px; border-radius:4px; font-weight:700; font-size:10px;">P2</span></div>' +
                '<div>SAML SSO metadata cert renewal</div>' +
                '<div style="color:#71717A;">alex@techcorp.io</div>' +
                '<div><button class="interactive-btn-secondary" onclick="window.NexusShowToast(\'Assigned Ticket #4091 to your inbox!\')">Assign</button></div>' +
              '</div>' +
              '<div style="padding:14px 16px; display:grid; grid-template-columns:60px 1.5fr 1fr 100px; align-items:center; font-size:13px;">' +
                '<div><span style="background:#F0FDF4; color:#16A34A; padding:2px 6px; border-radius:4px; font-weight:700; font-size:10px;">P3</span></div>' +
                '<div>Invoice receipt request</div>' +
                '<div style="color:#71717A;">billing@startup.dev</div>' +
                '<div><button class="interactive-btn-secondary" onclick="window.NexusShowToast(\'Assigned Ticket #4090 to your inbox!\')">Assign</button></div>' +
              '</div>' +
            '</div>' +
            '<button class="interactive-btn-primary" onclick="window.NexusShowToast(\'Processed all 18 pending tickets with zero SLA breaches!\')">Batch Auto-Assign by AI Specialization →</button>' +
          '</div>'
        );
        break;

      case 'triage':
        openModal(
          'AI INFERENCE · GOAL G3',
          'Autonomous Triage & Intent Classifier',
          '<div style="display:flex; flex-direction:column; gap:20px;">' +
            '<p style="color:var(--text-secondary); font-size:14px;">Select a prompt or write custom customer complaint to test the live semantic classification model.</p>' +
            '<div class="interactive-chip-row">' +
              '<button class="interactive-chip is-active" onclick="window.NexusFillTriage(\'Billing\')">Duplicate $1,200 Charge</button>' +
              '<button class="interactive-chip" onclick="window.NexusFillTriage(\'SSO\')">Okta SAML 500 Error</button>' +
              '<button class="interactive-chip" onclick="window.NexusFillTriage(\'Quota\')">API Rate Limit Increase</button>' +
            '</div>' +
            '<textarea id="triage-test-input" class="interactive-textarea">Customer received 502 Bad Gateway during checkout and card was debited twice.</textarea>' +
            '<button class="interactive-btn-primary" onclick="window.NexusRunTriageTest()">Run AI Triage Classification →</button>' +
            '<div id="triage-result-card" style="background:#FAFAFA; border:1px solid var(--border); padding:20px; border-radius:8px; display:flex; flex-direction:column; gap:12px;">' +
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<span class="interactive-label">CLASSIFICATION RESULT</span>' +
                '<span style="font-family:var(--font-mono); font-size:11px; color:#2563EB; font-weight:700;" id="triage-conf">CONFIDENCE: 99.4%</span>' +
              '</div>' +
              '<div style="font-size:16px; font-weight:700;" id="triage-intent">Intent: Billing &amp; Invoicing (Priority P1 Critical)</div>' +
              '<div style="font-size:13px; color:#52525B;" id="triage-route">Target Routing: Escalated directly to Finance Tier-2 Support Specialists.</div>' +
            '</div>' +
          '</div>'
        );
        break;

      case 'priority':
        openModal(
          'PRIORITY ENGINE · STEP 3',
          'Dynamic Urgency & SLA Calculator',
          '<div style="display:flex; flex-direction:column; gap:20px;">' +
            '<div style="background:#FEF2F2; border:1px solid #F87171; padding:20px; border-radius:8px; text-align:center;">' +
              '<span style="font-family:var(--font-mono); font-size:12px; color:#DC2626; font-weight:700;">CURRENT TICKET SLA COUNTDOWN</span>' +
              '<div style="font-size:42px; font-weight:700; color:#991B1B; margin:8px 0;" id="sla-timer-display">14m : 28s</div>' +
              '<span style="font-size:12px; color:#B91C1C;">P1 Guarantee: First human response under 15 minutes</span>' +
            '</div>' +
            '<div class="interactive-field">' +
              '<label class="interactive-label">Simulate Customer Urgency Score (1 - 100)</label>' +
              '<input type="range" min="1" max="100" value="92" id="urgency-slider" oninput="window.NexusUpdateSlaSlider(this.value)" style="width:100%; accent-color:#000000;" />' +
              '<div style="display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:11px; color:#71717A; margin-top:4px;">' +
                '<span>General Query</span><span id="urgency-score-val">Urgency: 92/100 (Critical)</span><span>System Down</span>' +
              '</div>' +
            '</div>' +
            '<button class="interactive-btn-primary" onclick="window.NexusShowToast(\'Queue position locked: #1 of 42 tickets.\')">Lock Queue Priority at #1</button>' +
          '</div>'
        );
        break;

      case 'summary':
        openModal(
          'EXECUTIVE CONDENSER · STEP 4',
          'AI 3-Bullet Context Extraction',
          '<div style="display:flex; flex-direction:column; gap:20px;">' +
            '<div style="background:#FDF4FF; border:1px solid #F0ABFC; padding:20px; border-radius:8px;">' +
              '<span class="interactive-label" style="color:#A21CAF;">RAW TICKET INPUT (380 WORDS)</span>' +
              '<p style="font-size:13px; color:#701A75; margin-top:8px;">"I am writing to express my extreme frustration with the enterprise checkout upgrade. Yesterday at 3pm our accounting team attempted payment..."</p>' +
            '</div>' +
            '<div style="background:#FAFAFA; border:1px solid var(--border); padding:20px; border-radius:8px; display:flex; flex-direction:column; gap:10px;">' +
              '<span class="interactive-label">AI COPILOT EXTRACTED CONTEXT (SAVED 3.8 MINS)</span>' +
              '<div style="font-size:14px; color:#18181B; display:flex; gap:8px;"><strong>1.</strong> Double billing of $1,200 confirmed on Stripe webhook deadlock.</div>' +
              '<div style="font-size:14px; color:#18181B; display:flex; gap:8px;"><strong>2.</strong> Customer unable to access team dashboard for 12 hours.</div>' +
              '<div style="font-size:14px; color:#18181B; display:flex; gap:8px;"><strong>3.</strong> Resolution required: Clear hold, provision tier 2 license.</div>' +
            '</div>' +
            '<button class="interactive-btn-primary" onclick="window.NexusShowToast(\'Summary pinned to agent sidebar context.\')">Pin Context to Agent Ticket</button>' +
          '</div>'
        );
        break;

      case 'replies':
        openModal(
          'SMART COMPOSER · GOAL G3',
          'Suggested Replies & Tone Variants',
          '<div style="display:flex; flex-direction:column; gap:20px;">' +
            '<div class="interactive-chip-row">' +
              '<button class="interactive-chip is-active" id="tone-btn-emp" onclick="window.NexusSwitchTone(\'Empathetic\')">Empathetic Tone ✓</button>' +
              '<button class="interactive-chip" id="tone-btn-con" onclick="window.NexusSwitchTone(\'Concise\')">Concise Tone</button>' +
              '<button class="interactive-chip" id="tone-btn-for" onclick="window.NexusSwitchTone(\'Formal\')">Formal Tone</button>' +
            '</div>' +
            '<div class="interactive-field">' +
              '<label class="interactive-label">AI DRAFT (EDITABLE BEFORE SENDING)</label>' +
              '<textarea id="reply-draft-editor" class="interactive-textarea" style="min-height:130px;">' +
                'Hi Sarah,\n\nI sincerely apologize for the checkout hurdle. I verified your transaction of $1,200 and immediately released the temporary hold on invoice #4092. Your Enterprise access is fully restored!\n\nBest,\nNexusAI Team' +
              '</textarea>' +
            '</div>' +
            '<div style="display:flex; gap:12px;">' +
              '<button class="interactive-btn-primary" onclick="window.NexusApproveReply()">Approve &amp; Send (1-Click) →</button>' +
              '<button class="interactive-btn-secondary" onclick="window.NexusShowToast(\'Draft updated with custom attachments.\')">Add Attachment</button>' +
            '</div>' +
          '</div>'
        );
        break;

      case 'chatbot':
        openModal(
          'INSTANT KB ASSISTANT · GOAL G4',
          'Knowledge-Base Chatbot & Human Handover',
          '<div style="display:flex; flex-direction:column; gap:16px;">' +
            '<div class="chat-bubble-stream" id="chatbot-stream">' +
              '<div class="chat-bubble-msg ai">' +
                'Hello! I am your NexusAI Support Assistant. How can I help you today?' +
              '</div>' +
            '</div>' +
            '<div class="interactive-chip-row">' +
              '<button class="interactive-chip" onclick="window.NexusSendQuickChat(\'How do I configure SAML SSO?\')">SSO Setup Guide</button>' +
              '<button class="interactive-chip" onclick="window.NexusSendQuickChat(\'What is your refund policy?\')">Refund Policy</button>' +
              '<button class="interactive-chip" onclick="window.NexusSendQuickChat(\'Can I add more agent seats?\')">Add Agent Seats</button>' +
            '</div>' +
            '<form onsubmit="window.NexusSubmitChat(event)" style="display:flex; gap:10px;">' +
              '<input type="text" id="chat-user-input" class="interactive-input" placeholder="Ask any question..." required />' +
              '<button type="submit" class="interactive-btn-primary">Send</button>' +
            '</form>' +
            '<div style="border-top:1px solid var(--border); padding-top:12px; display:flex; justify-content:space-between; align-items:center;">' +
              '<span style="font-size:12px; color:#71717A;">Unsatisfied with the bot answer?</span>' +
              '<button class="interactive-btn-secondary" onclick="window.NexusHandoverHuman()">Handover to Human Agent →</button>' +
            '</div>' +
          '</div>'
        );
        break;

      case 'manager':
        openModal(
          'OPERATIONS CONTROL · GOAL G2',
          'Executive Operations & SLA Dashboard',
          '<div style="display:flex; flex-direction:column; gap:20px;">' +
            '<div class="interactive-chip-row">' +
              '<button class="interactive-chip is-active" onclick="window.NexusSwitchManagerPeriod(\'7D\')">Last 7 Days</button>' +
              '<button class="interactive-chip" onclick="window.NexusSwitchManagerPeriod(\'30D\')">Last 30 Days</button>' +
              '<button class="interactive-chip" onclick="window.NexusSwitchManagerPeriod(\'90D\')">Quarter to Date</button>' +
            '</div>' +
            '<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px;">' +
              '<div style="background:#F0FDFA; border:1px solid #99F6E4; padding:16px; border-radius:8px;">' +
                '<span class="interactive-label" style="color:#0D9488;">AVG FIRST RESPONSE</span>' +
                '<div style="font-size:24px; font-weight:700; color:#134E4A; margin-top:4px;" id="mgr-stat-1">1m 24s</div>' +
                '<span style="font-size:11px; color:#059669;">-84% vs industry baseline</span>' +
              '</div>' +
              '<div style="background:#EEF2FF; border:1px solid #C7D2FE; padding:16px; border-radius:8px;">' +
                '<span class="interactive-label" style="color:#4F46E5;">AI DEFLECTION</span>' +
                '<div style="font-size:24px; font-weight:700; color:#1E1B4B; margin-top:4px;" id="mgr-stat-2">68.4%</div>' +
                '<span style="font-size:11px; color:#4338CA;">Automated instant answers</span>' +
              '</div>' +
              '<div style="background:#F4F4F5; border:1px solid var(--border); padding:16px; border-radius:8px;">' +
                '<span class="interactive-label">SLA COMPLIANCE</span>' +
                '<div style="font-size:24px; font-weight:700; color:#18181B; margin-top:4px;" id="mgr-stat-3">99.8%</div>' +
                '<span style="font-size:11px; color:#10B981;">0 Breaches this period</span>' +
              '</div>' +
            '</div>' +
            '<div style="background:#FAFAFA; border:1px solid var(--border); padding:20px; border-radius:8px;">' +
              '<span class="interactive-label">DAILY VOLUME BY DAY (CLICK BARS TO INSPECT)</span>' +
              '<div style="display:flex; justify-content:space-between; align-items:flex-end; height:120px; padding-top:20px; gap:12px;">' +
                '<div style="flex:1; background:#0F766E; height:60%; border-radius:4px; text-align:center; color:#fff; font-size:10px; padding-top:4px; cursor:pointer;" onclick="window.NexusShowToast(\'Mon: 240 Tickets (72% AI resolved)\')">M</div>' +
                '<div style="flex:1; background:#0F766E; height:85%; border-radius:4px; text-align:center; color:#fff; font-size:10px; padding-top:4px; cursor:pointer;" onclick="window.NexusShowToast(\'Tue: 310 Tickets (69% AI resolved)\')">T</div>' +
                '<div style="flex:1; background:#0F766E; height:95%; border-radius:4px; text-align:center; color:#fff; font-size:10px; padding-top:4px; cursor:pointer;" onclick="window.NexusShowToast(\'Wed: 340 Tickets (74% AI resolved)\')">W</div>' +
                '<div style="flex:1; background:#0F766E; height:90%; border-radius:4px; text-align:center; color:#fff; font-size:10px; padding-top:4px; cursor:pointer;" onclick="window.NexusShowToast(\'Thu: 325 Tickets (70% AI resolved)\')">T</div>' +
                '<div style="flex:1; background:#0F766E; height:100%; border-radius:4px; text-align:center; color:#fff; font-size:10px; padding-top:4px; cursor:pointer;" onclick="window.NexusShowToast(\'Fri: 380 Tickets (71% AI resolved)\')">F</div>' +
                '<div style="flex:1; background:#0D9488; height:40%; border-radius:4px; text-align:center; color:#fff; font-size:10px; padding-top:4px; cursor:pointer;" onclick="window.NexusShowToast(\'Sat: 120 Tickets (82% AI resolved)\')">S</div>' +
                '<div style="flex:1; background:#0D9488; height:35%; border-radius:4px; text-align:center; color:#fff; font-size:10px; padding-top:4px; cursor:pointer;" onclick="window.NexusShowToast(\'Sun: 98 Tickets (85% AI resolved)\')">S</div>' +
              '</div>' +
            '</div>' +
            '<button class="interactive-btn-primary" onclick="window.NexusShowToast(\'Exported executive analytics PDF.\')">Export PDF Executive Report ↓</button>' +
          '</div>'
        );
        break;

      case 'status':
        openModal(
          'LIFECYCLE TRACKER · STEP 6',
          'Real-Time Ticket Status & Checkpoints',
          '<div style="display:flex; flex-direction:column; gap:20px;">' +
            '<div style="border:1px solid var(--border); padding:20px; border-radius:8px;">' +
              '<div style="display:flex; justify-content:space-between; margin-bottom:12px;">' +
                '<strong>Ticket #NX-4092: Payment Gateway Stalled</strong>' +
                '<span style="font-family:var(--font-mono); font-size:12px; color:#10B981; font-weight:700;">● RESOLVED</span>' +
              '</div>' +
              '<div style="display:flex; flex-direction:column; gap:12px; margin-top:16px;">' +
                '<div style="display:flex; gap:12px; align-items:center;">' +
                  '<span style="width:20px; height:20px; border-radius:50%; background:#10B981; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px;">✓</span>' +
                  '<span style="font-size:13px;">10:14 AM — Customer Ticket Submitted</span>' +
                '</div>' +
                '<div style="display:flex; gap:12px; align-items:center;">' +
                  '<span style="width:20px; height:20px; border-radius:50%; background:#10B981; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px;">✓</span>' +
                  '<span style="font-size:13px;">10:15 AM — AI Ingestion &amp; Priority Scoring (P1)</span>' +
                '</div>' +
                '<div style="display:flex; gap:12px; align-items:center;">' +
                  '<span style="width:20px; height:20px; border-radius:50%; background:#10B981; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px;">✓</span>' +
                  '<span style="font-size:13px;">10:17 AM — Support Agent Approved Response</span>' +
                '</div>' +
                '<div style="display:flex; gap:12px; align-items:center;">' +
                  '<span style="width:20px; height:20px; border-radius:50%; background:#10B981; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px;">✓</span>' +
                  '<span style="font-size:13px;">10:20 AM — Resolution Confirmed by Customer (6m Total)</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div style="background:#FAFAFA; border:1px solid var(--border); padding:16px; border-radius:8px; text-align:center;">' +
              '<div style="font-size:13px; font-weight:600; margin-bottom:8px;">Rate Your Support Experience</div>' +
              '<div style="font-size:24px; cursor:pointer;" onclick="window.NexusShowToast(\'Thank you for rating 5/5 stars!\')">★★★★★</div>' +
            '</div>' +
          '</div>'
        );
        break;
    }
  }

  function openBookDemoModal() {
    openModal(
      'BOOK A DEMONSTRATION',
      'Experience NexusAI with a Specialist',
      '<div style="display:flex; flex-direction:column; gap:20px;">' +
        '<p style="color:var(--text-secondary); font-size:14px;">Select a preferred time slot to see our 14-student low-code prototype in action with real data.</p>' +
        '<div class="interactive-field">' +
          '<label class="interactive-label">Select Date</label>' +
          '<input type="date" class="interactive-input" value="2026-11-24" />' +
        '</div>' +
        '<div class="interactive-field">' +
          '<label class="interactive-label">Select Time Slot</label>' +
          '<div class="interactive-chip-row">' +
            '<button class="interactive-chip is-active" type="button">10:00 AM EST</button>' +
            '<button class="interactive-chip" type="button">01:30 PM EST</button>' +
            '<button class="interactive-chip" type="button">03:00 PM EST</button>' +
            '<button class="interactive-chip" type="button">04:30 PM EST</button>' +
          '</div>' +
        '</div>' +
        '<div class="interactive-field">' +
          '<label class="interactive-label">Your Work Email</label>' +
          '<input type="email" class="interactive-input" placeholder="name@company.com" required />' +
        '</div>' +
        '<button class="interactive-btn-primary" onclick="window.NexusConfirmDemo()">Confirm Demo Booking →</button>' +
      '</div>'
    );
  }

  function openContactModal() {
    openModal(
      'CONTACT & INQUIRIES',
      'Send Message to Project Team',
      '<div style="display:flex; flex-direction:column; gap:20px;">' +
        '<div class="interactive-field">' +
          '<label class="interactive-label">Email Address</label>' +
          '<input type="email" class="interactive-input" placeholder="you@example.com" required />' +
        '</div>' +
        '<div class="interactive-field">' +
          '<label class="interactive-label">Message</label>' +
          '<textarea class="interactive-textarea" placeholder="How can the NexusAI team assist your support operations?"></textarea>' +
        '</div>' +
        '<button class="interactive-btn-primary" onclick="window.NexusSendContact()">Send Inquiry to hello@nexusai.example →</button>' +
      '</div>'
    );
  }

  // 7. Today's pain interactive row toggle
  const painRows = document.querySelectorAll('.pain-row');
  painRows.forEach(function (row) {
    row.addEventListener('click', function () {
      const isExp = row.classList.contains('is-expanded');
      painRows.forEach(r => {
        r.classList.remove('is-expanded');
        r.setAttribute('aria-expanded', 'false');
      });
      if (!isExp) {
        row.classList.add('is-expanded');
        row.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 9. Five Goals interactive validation
  const goalRows = document.querySelectorAll('.goal-row');
  goalRows.forEach(function (row) {
    row.addEventListener('click', function () {
      const goalId = row.getAttribute('data-goal');
      const goalName = row.querySelector('.goal-name').textContent;
      openModal('GOAL VERIFICATION · ' + goalId, goalName, renderGoalVerificationHtml(goalId));
    });
  });

  function renderGoalVerificationHtml(goalId) {
    const tests = {
      G1: { desc: 'Customer registers, files a ticket, receives reference code NX-4092, and checks live status without manual staff intervention.', result: 'PASSED (0.4s response latency)' },
      G2: { desc: 'Admin and Support Agent log in to unified console; ticket appears in priority queue with automatic assignment.', result: 'PASSED (Zero drop rate across 1,000 synthetic tickets)' },
      G3: { desc: 'NLP model tags intent as Billing (99.4%), sets priority to P1, drafts concise 3-bullet summary, and attaches reply draft.', result: 'PASSED (Average triage time 1.2s)' },
      G4: { desc: 'Knowledge Base chatbot answers question regarding SSO SAML configuration with doc citation; fallback button routes to human.', result: 'PASSED (Instant verified citation)' },
      G5: { desc: 'End-to-end simulated ticket lifecycle executed across all 6 stages within 6 build days.', result: 'PASSED (Completed Nov 17, 2026)' }
    };
    const cur = tests[goalId] || tests.G1;
    return '<div style="display:flex; flex-direction:column; gap:20px;">' +
      '<div style="background:#FAFAFA; border:1px solid var(--border); padding:20px; border-radius:8px;">' +
        '<span class="interactive-label">AUTOMATED TEST SPECIFICATION</span>' +
        '<p style="margin-top:8px; font-size:15px; color:#18181B; line-height:1.5;">' + cur.desc + '</p>' +
      '</div>' +
      '<div style="background:#F0FDF4; border:1px solid #BBF7D0; padding:16px 20px; border-radius:8px; display:flex; align-items:center; justify-content:space-between;">' +
        '<div style="display:flex; align-items:center; gap:10px;">' +
          '<span style="color:#16A34A; font-size:18px;">✓</span>' +
          '<strong style="color:#15803D; font-size:14px;">STATUS: ' + cur.result + '</strong>' +
        '</div>' +
        '<span style="font-family:var(--font-mono); font-size:11px; color:#166534;">VERIFIED 100%</span>' +
      '</div>' +
      '<button class="interactive-btn-primary" onclick="window.NexusTriggerGoalRun(\\'' + goalId + '\\')">Re-run Automated Test Pipeline ↻</button>' +
    '</div>';
  }

  // Global Interactive Helper Functions
  window.NexusTriggerGoalRun = function (id) {
    window.NexusShowToast('Running synthetic validation pipeline for ' + id + '...');
    setTimeout(function () {
      window.NexusShowToast('✓ Goal ' + id + ' passed all 12 test assertions in 142ms!');
    }, 800);
  };

  window.NexusHandleTicketSubmit = function (e) {
    e.preventDefault();
    const subject = document.getElementById('ticket-subject-input').value;
    const cat = document.getElementById('ticket-cat-input').value;
    const bodyEl = document.getElementById('ticket-body-input');
    const body = bodyEl ? bodyEl.value : '';
    const prev = document.getElementById('ticket-response-preview');
    const text = document.getElementById('ticket-response-text');
    
    text.innerHTML = 'Assigned Ticket #NX-4093 to <strong>' + cat + '</strong>. Subject: "' + subject + '". Auto-routed with P1 priority.';
    prev.style.display = 'block';
    window.NexusShowToast('✓ Ticket #NX-4093 submitted! Auto-triage initiated in 0.2s.');

    if (window.NexusSupabase && window.NexusSupabase.isConnected()) {
      window.NexusSupabase.createTicket({
        ticket_code: 'NX-' + Math.floor(4100 + Math.random() * 900),
        subject: subject,
        category: cat,
        priority: 'P1',
        description: body,
        customer_name: 'Sarah Jenkins',
        customer_email: 'sarah@acme.co',
        ai_intent: cat,
        ai_summary: subject,
        sla_minutes: 15
      }).then(function (res) {
        if (!res.error) {
          window.NexusShowToast('☁ Ticket synced to Supabase database!');
        }
      });
    }
  };

  window.NexusFillTriage = function (type) {
    const inp = document.getElementById('triage-test-input');
    if (type === 'Billing') {
      inp.value = 'Customer received 502 Bad Gateway during checkout and credit card was debited $1,200 twice.';
    } else if (type === 'SSO') {
      inp.value = 'Users receiving SAML SSO Certificate Expiration error when logging in via Okta identity provider.';
    } else {
      inp.value = 'Our engineering team is building automated integration and hitting 429 Too Many Requests rate limit.';
    }
  };

  window.NexusRunTriageTest = function () {
    const conf = document.getElementById('triage-conf');
    const intent = document.getElementById('triage-intent');
    const route = document.getElementById('triage-route');
    const inp = document.getElementById('triage-test-input').value;

    window.NexusShowToast('Running NLP embedding & classification...');
    setTimeout(function () {
      if (inp.toLowerCase().includes('sso') || inp.toLowerCase().includes('okta')) {
        conf.textContent = 'CONFIDENCE: 98.7%';
        intent.textContent = 'Intent: Authentication & Security (Priority P2 High)';
        route.textContent = 'Target Routing: Security & Identity Administration Squad';
      } else if (inp.toLowerCase().includes('rate') || inp.toLowerCase().includes('api')) {
        conf.textContent = 'CONFIDENCE: 96.2%';
        intent.textContent = 'Intent: Developer API & Quota (Priority P3 Normal)';
        route.textContent = 'Target Routing: Developer Platform Technical Support';
      } else {
        conf.textContent = 'CONFIDENCE: 99.4%';
        intent.textContent = 'Intent: Billing & Invoicing (Priority P1 Critical)';
        route.textContent = 'Target Routing: Escalated directly to Finance Tier-2 Support Specialists.';
      }
      window.NexusShowToast('✓ AI Triage completed in 0.18 seconds.');
    }, 300);
  };

  window.NexusUpdateSlaSlider = function (val) {
    const display = document.getElementById('sla-timer-display');
    const score = document.getElementById('urgency-score-val');
    if (val > 80) {
      display.textContent = '14m : 28s';
      display.style.color = '#991B1B';
      score.textContent = 'Urgency: ' + val + '/100 (Critical P1)';
    } else if (val > 40) {
      display.textContent = '58m : 12s';
      display.style.color = '#B45309';
      score.textContent = 'Urgency: ' + val + '/100 (High P2)';
    } else {
      display.textContent = '3h : 45m';
      display.style.color = '#15803D';
      score.textContent = 'Urgency: ' + val + '/100 (Normal P3)';
    }
  };

  window.NexusSwitchTone = function (tone) {
    const editor = document.getElementById('reply-draft-editor');
    if (tone === 'Concise') {
      editor.value = 'Hi Sarah,\n\nWe refunded the duplicate $1,200 charge and unlocked your Enterprise plan.\n\nRegards,\nNexusAI';
    } else if (tone === 'Formal') {
      editor.value = 'Dear Ms. Sarah,\n\nWe acknowledge the inconvenience caused by the transaction deadlock. Our billing division has released the pre-authorization hold and updated your license to active standing.\n\nSincerely,\nNexusAI Support Operations';
    } else {
      editor.value = 'Hi Sarah,\n\nI sincerely apologize for the checkout hurdle. I verified your transaction of $1,200 and immediately released the temporary hold on invoice #4092. Your Enterprise access is fully restored!\n\nBest,\nNexusAI Team';
    }
    window.NexusShowToast('Switched draft tone to ' + tone + '.');
  };

  window.NexusApproveReply = function () {
    window.NexusShowToast('✓ Response approved & sent to customer. Ticket resolved!');
    setTimeout(function () {
      closeModal();
    }, 800);
  };

  window.NexusSendQuickChat = function (question) {
    const stream = document.getElementById('chatbot-stream');
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-bubble-msg user';
    userMsg.textContent = question;
    stream.appendChild(userMsg);

    setTimeout(function () {
      const aiMsg = document.createElement('div');
      aiMsg.className = 'chat-bubble-msg ai';
      if (question.includes('SSO')) {
        aiMsg.innerHTML = 'To configure SAML SSO, navigate to Settings → Security and upload your IdP metadata XML file.<span class="chat-bubble-citation">SOURCE: /DOCS/SSO-SAML-SETUP</span>';
      } else if (question.includes('refund')) {
        aiMsg.innerHTML = 'Refunds for duplicate or failed charges are processed within 1–3 business days back to your original payment method.<span class="chat-bubble-citation">SOURCE: /DOCS/BILLING-REFUNDS</span>';
      } else {
        aiMsg.innerHTML = 'Admins can add seats anytime from Settings → Team with immediate prorated billing.<span class="chat-bubble-citation">SOURCE: /DOCS/SEAT-MANAGEMENT</span>';
      }
      stream.appendChild(aiMsg);
      stream.scrollTop = stream.scrollHeight;
    }, 400);
  };

  window.NexusSubmitChat = function (e) {
    e.preventDefault();
    const input = document.getElementById('chat-user-input');
    const q = input.value;
    input.value = '';
    window.NexusSendQuickChat(q);
  };

  window.NexusHandoverHuman = function () {
    window.NexusShowToast('✓ Connecting you to an online Support Agent...');
    setTimeout(function () {
      window.NexusShowToast('Agent Kala joined the conversation.');
    }, 1200);
  };

  window.NexusSwitchManagerPeriod = function (period) {
    const s1 = document.getElementById('mgr-stat-1');
    const s2 = document.getElementById('mgr-stat-2');
    const s3 = document.getElementById('mgr-stat-3');
    if (period === '30D') {
      s1.textContent = '1m 38s';
      s2.textContent = '71.2%';
      s3.textContent = '99.9%';
    } else if (period === '90D') {
      s1.textContent = '1m 45s';
      s2.textContent = '73.8%';
      s3.textContent = '99.7%';
    } else {
      s1.textContent = '1m 24s';
      s2.textContent = '68.4%';
      s3.textContent = '99.8%';
    }
    window.NexusShowToast('Updated operations metrics for ' + period + '.');
  };

  window.NexusConfirmDemo = function () {
    const emailInput = document.querySelector('input[type="email"]');
    const email = emailInput ? emailInput.value : 'demo@company.com';

    if (window.NexusSupabase && window.NexusSupabase.isConnected()) {
      window.NexusSupabase.submitDemoRequest({
        work_email: email,
        notes: 'Interactive Modal Demo booking'
      });
    }

    window.NexusShowToast('✓ Demonstration booked! Confirmation sent to your inbox.');
    setTimeout(function () {
      closeModal();
    }, 800);
  };

  window.NexusSendContact = function () {
    const emailInput = document.querySelector('input[type="email"]');
    const textarea = document.querySelector('.interactive-textarea');
    const email = emailInput ? emailInput.value : 'user@example.com';
    const msg = textarea ? textarea.value : '';

    if (window.NexusSupabase && window.NexusSupabase.isConnected()) {
      window.NexusSupabase.submitDemoRequest({
        work_email: email,
        notes: 'Interactive Modal Contact: ' + msg
      });
    }

    window.NexusShowToast('✓ Inquiry sent to hello@nexusai.example. We reply in < 15m.');
    setTimeout(function () {
      closeModal();
    }, 800);
  };
})();
