/**
 * BizAssist AI — Guided Tour Flow Controller (js/flow.js)
 * 
 * Manages the interactive 6-step guided walkthrough across the connected app.
 * Persists active tour state in sessionStorage['bizassist.tour_active'] and
 * sessionStorage['bizassist.tour_step'].
 */
(function (global) {
  'use strict';

  const TOUR_ACTIVE_KEY = 'bizassist.tour_active';
  const TOUR_STEP_KEY = 'bizassist.tour_step';

  const TOUR_STEPS = [
    {
      step: 1,
      route: '/portal',
      title: 'Customer Intake',
      instruction: 'Customer raises a ticket or checks tracker (#BA-1042, #BA-2089). Try submitting a new ticket.',
      buttonText: 'Next: AI Triage →'
    },
    {
      step: 2,
      route: '/ai-triage',
      title: 'AI Triage Engine',
      instruction: 'AI classifies category, priority, sentiment, and routes ticket with sub-100ms inference.',
      buttonText: 'Next: Agent Dashboard →'
    },
    {
      step: 3,
      route: '/agent-dashboard',
      title: 'Agent Workspace',
      instruction: 'Support lead reviews the triaged queue, customer 360 context, and AI investigation summary.',
      buttonText: 'Next: Suggested Replies →'
    },
    {
      step: 4,
      route: '/suggested-replies',
      title: 'AI Reply Studio',
      instruction: 'Review grounded citations, select tone (Empathetic, Concise, Executive), and click "Approve & Dispatch".',
      buttonText: 'Next: Verify Portal →'
    },
    {
      step: 5,
      route: '/portal',
      title: 'Real-Time Sync',
      instruction: 'Customer portal instantly reflects the "Replied" stage without manual page refresh.',
      buttonText: 'Next: Manager Overview →'
    },
    {
      step: 6,
      route: '/manager-overview',
      title: 'Executive Analytics',
      instruction: 'Manager reviews deflection rate, team roster capacity, SLA health, and volume breakdown.',
      buttonText: 'Finish Tour ✓'
    }
  ];

  function getActiveStepIndex() {
    const raw = sessionStorage.getItem(TOUR_STEP_KEY);
    const parsed = parseInt(raw, 10);
    return (isNaN(parsed) || parsed < 1 || parsed > 6) ? 1 : parsed;
  }

  function isTourActive() {
    return sessionStorage.getItem(TOUR_ACTIVE_KEY) === 'true';
  }

  function renderTourBanner() {
    // Remove old banner if exists
    const old = document.getElementById('biz-tour-banner');
    if (old) old.remove();

    if (!isTourActive()) return;

    const currentStepNum = getActiveStepIndex();
    const stepConfig = TOUR_STEPS[currentStepNum - 1];

    const banner = document.createElement('div');
    banner.id = 'biz-tour-banner';
    banner.className = 'biz-tour-banner is-active';

    banner.innerHTML = `
      <div class="biz-tour-inner">
        <div class="biz-tour-info">
          <span class="biz-tour-step-badge">Tour Step ${stepConfig.step} of 6</span>
          <div class="biz-tour-text">
            <strong>${stepConfig.title}:</strong> ${stepConfig.instruction}
          </div>
        </div>

        <div class="biz-tour-controls">
          <button type="button" class="biz-tour-btn" onclick="BizAssistFlow.prevStep()" ${currentStepNum === 1 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>
            ← Back
          </button>
          <button type="button" class="biz-tour-btn biz-tour-btn-primary" onclick="BizAssistFlow.nextStep()">
            ${stepConfig.buttonText}
          </button>
          <button type="button" class="biz-tour-btn biz-tour-btn-exit" onclick="BizAssistFlow.exitTour()" title="Close tour">
            Exit Tour
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
  }

  function renderCompletionModal() {
    const old = document.getElementById('biz-tour-modal');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'biz-tour-modal';
    overlay.className = 'biz-modal-overlay is-open';

    overlay.innerHTML = `
      <div class="biz-modal-card" role="dialog" aria-modal="true" aria-label="Guided Tour Complete">
        <span style="font-family:var(--shell-font-mono, monospace); font-size:11px; text-transform:uppercase; letter-spacing:0.12em; color:var(--shell-accent, #B3402A); font-weight:700; display:block; margin-bottom:8px;">
          Walkthrough Complete
        </span>
        <h2 style="font-family:var(--shell-font-serif, 'Cormorant Garamond', serif); font-size:32px; font-weight:400; color:var(--shell-ink, #111111); margin-bottom:12px;">
          End-to-End Flow Verified
        </h2>
        <p style="font-size:14px; color:var(--shell-secondary, #5E5A53); line-height:1.6; margin-bottom:20px;">
          You have seen the complete lifecycle across the single connected application:
        </p>
        <ul style="font-size:13px; color:var(--shell-ink, #111111); line-height:1.8; margin-bottom:28px; padding-left:18px;">
          <li><strong>1. Customer Intake:</strong> Tickets raised and tracked in real time.</li>
          <li><strong>2. AI Triage:</strong> Instant NLP categorization, priority, and team routing.</li>
          <li><strong>3. Agent Dashboard:</strong> 360° intelligence and live queue synchronization.</li>
          <li><strong>4. AI Reply Studio:</strong> Tone customization, RAG citations, and dispatch.</li>
          <li><strong>5. Reactive Data Sync:</strong> Shared state immediately reflects "Replied" stage.</li>
          <li><strong>6. Executive Analytics:</strong> Deflection rate, SLA adherence, and team KPIs.</li>
        </ul>
        <div style="display:flex; gap:12px; justify-content:flex-end; flex-wrap:wrap;">
          <button type="button" class="biz-tour-btn" style="border:1px solid #111111; color:#111111;" onclick="BizAssistFlow.restartTour()">
            Restart Tour
          </button>
          <button type="button" class="biz-tour-btn biz-tour-btn-primary" style="background:#111111; color:#FAF8F5;" onclick="BizAssistFlow.closeCompletionModal()">
            Explore Freely →
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  const BizAssistFlow = {
    init: function () {
      if (isTourActive()) {
        renderTourBanner();
      }
    },

    startTour: function () {
      sessionStorage.setItem(TOUR_ACTIVE_KEY, 'true');
      sessionStorage.setItem(TOUR_STEP_KEY, '1');
      global.location.href = TOUR_STEPS[0].route;
    },

    exitTour: function () {
      sessionStorage.removeItem(TOUR_ACTIVE_KEY);
      sessionStorage.removeItem(TOUR_STEP_KEY);
      const banner = document.getElementById('biz-tour-banner');
      if (banner) banner.remove();
    },

    nextStep: function () {
      const current = getActiveStepIndex();
      if (current >= 6) {
        // Complete tour
        sessionStorage.removeItem(TOUR_ACTIVE_KEY);
        sessionStorage.removeItem(TOUR_STEP_KEY);
        const banner = document.getElementById('biz-tour-banner');
        if (banner) banner.remove();
        renderCompletionModal();
        return;
      }
      const nextIdx = current + 1;
      sessionStorage.setItem(TOUR_STEP_KEY, String(nextIdx));
      global.location.href = TOUR_STEPS[nextIdx - 1].route;
    },

    prevStep: function () {
      const current = getActiveStepIndex();
      if (current <= 1) return;
      const prevIdx = current - 1;
      sessionStorage.setItem(TOUR_STEP_KEY, String(prevIdx));
      global.location.href = TOUR_STEPS[prevIdx - 1].route;
    },

    restartTour: function () {
      this.closeCompletionModal();
      this.startTour();
    },

    closeCompletionModal: function () {
      const modal = document.getElementById('biz-tour-modal');
      if (modal) modal.remove();
    }
  };

  global.BizAssistFlow = BizAssistFlow;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', BizAssistFlow.init);
  } else {
    BizAssistFlow.init();
  }

})(typeof window !== 'undefined' ? window : globalThis);
