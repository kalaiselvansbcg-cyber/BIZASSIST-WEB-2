/**
 * BizAssist AI — Global Site & Support Configuration (config/site.js)
 * 
 * Central source of truth for support contact channels, WhatsApp links,
 * operational hours, and demo flags across the entire platform.
 */
export const SITE = {
  name: "BizAssist AI",
  supportPhone: "+91 00000 00000",
  supportPhoneDisplay: "+91 00000 00000",
  supportWhatsApp: "910000000000",
  supportEmail: "support@bizassist.ai",
  supportHours: "Monday to Friday, 9:00 AM – 6:00 PM IST",
  DEMO_SHOW_RESET_CODE: true,
  ENABLE_REAL_EMAIL: false
};

// Browser global attachment for non-module script tags
if (typeof window !== 'undefined') {
  window.BIZASSIST_SITE = SITE;
  window.SITE = SITE;

  // Placeholder check: Show a small warning in browser console only, never in the UI
  if (SITE.supportPhone === "+91 00000 00000" || SITE.supportPhone.includes("00000")) {
    console.warn(
      "[BizAssist AI] Support phone is currently using placeholder (+91 00000 00000). Update config/site.js with your real number."
    );
  }
}

if (typeof globalThis !== 'undefined' && typeof window === 'undefined') {
  globalThis.BIZASSIST_SITE = SITE;
}
