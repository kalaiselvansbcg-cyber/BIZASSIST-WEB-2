/**
 * NexusAI Vector Graphic Assets
 * Generates colorful abstract UI scenes as inline SVG data URIs
 * Gradient backgrounds: orange, blue, green, pink, yellow, teal
 */
(function () {
  'use strict';

  function svgToDataUri(svg) {
    const clean = svg.replace(/\s+/g, ' ').trim();
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(clean);
  }

  // Marquee Step SVGs (Aspect Ratio 5:7)
  const marquee1 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
    <defs>
      <linearGradient id="m1_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FF5E3A" /><stop offset="50%" stop-color="#FF2A6D" /><stop offset="100%" stop-color="#FF7A00" />
      </linearGradient>
      <filter id="m1_glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="30" result="blur" /></filter>
    </defs>
    <rect width="500" height="700" fill="url(#m1_bg)" />
    <circle cx="100" cy="150" r="140" fill="#FFA07A" opacity="0.3" filter="url(#m1_glow)" />
    <circle cx="420" cy="450" r="160" fill="#FF1493" opacity="0.25" filter="url(#m1_glow)" />
    <g transform="translate(36, 44)">
      <rect x="0" y="0" width="160" height="28" rx="14" fill="#ffffff" fill-opacity="0.25" />
      <circle cx="14" cy="14" r="5" fill="#ffffff" />
      <text x="28" y="19" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff" letter-spacing="1">INTAKE PORTAL</text>
      <rect x="0" y="44" width="428" height="380" rx="20" fill="#ffffff" fill-opacity="0.95" />
      <circle cx="24" cy="68" r="5" fill="#FF5E3A" /><circle cx="40" cy="68" r="5" fill="#FFA07A" /><circle cx="56" cy="68" r="5" fill="#10B981" />
      <text x="80" y="72" font-family="monospace" font-size="11" fill="#737373">TICKET #4092 · NEW</text>
      <rect x="24" y="96" width="380" height="40" rx="8" fill="#F4F4F5" />
      <text x="40" y="121" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#18181B">Payment failure during enterprise renewal</text>
      <rect x="24" y="148" width="180" height="34" rx="8" fill="#F4F4F5" />
      <text x="38" y="170" font-family="Inter, sans-serif" font-size="11" fill="#71717A">CUSTOMER: </text><text x="108" y="170" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#18181B">sarah@acme.co</text>
      <rect x="216" y="148" width="188" height="34" rx="8" fill="#F4F4F5" />
      <text x="230" y="170" font-family="Inter, sans-serif" font-size="11" fill="#71717A">PLAN: </text><text x="274" y="170" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#18181B">Enterprise Tier 2</text>
      <rect x="24" y="196" width="380" height="106" rx="12" fill="#FAFAFA" stroke="#E4E4E7" stroke-width="1" />
      <text x="40" y="224" font-family="Inter, sans-serif" font-size="12" fill="#27272A" font-weight="500">"Our renewal payment failed with error code 502.</text>
      <text x="40" y="246" font-family="Inter, sans-serif" font-size="12" fill="#27272A" font-weight="500">We were charged $1,200 on our card statement but</text>
      <text x="40" y="268" font-family="Inter, sans-serif" font-size="12" fill="#27272A" font-weight="500">our account shows Expired. Please help urgently!"</text>
      <rect x="24" y="320" width="380" height="44" rx="10" fill="#FF5E3A" />
      <text x="160" y="347" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#ffffff" letter-spacing="0.5">RAISE TICKET →</text>
    </g>
    <g transform="translate(140, 480)">
      <rect x="0" y="0" width="220" height="50" rx="25" fill="#ffffff" fill-opacity="0.9" />
      <circle cx="25" cy="25" r="8" fill="#10B981" />
      <text x="44" y="29" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#18181B">Live Intake Active</text>
      <text x="44" y="42" font-family="monospace" font-size="9" fill="#71717A">TIME: 10:14:02 AM</text>
    </g>
  </svg>`;

  const marquee2 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
    <defs>
      <linearGradient id="m2_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E3A8A" /><stop offset="50%" stop-color="#3B82F6" /><stop offset="100%" stop-color="#60A5FA" />
      </linearGradient>
      <filter id="m2_glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="35" result="blur" /></filter>
    </defs>
    <rect width="500" height="700" fill="url(#m2_bg)" />
    <circle cx="200" cy="180" r="160" fill="#3B82F6" opacity="0.3" filter="url(#m2_glow)" />
    <g transform="translate(36, 44)">
      <rect x="0" y="0" width="180" height="28" rx="14" fill="#ffffff" fill-opacity="0.25" />
      <circle cx="14" cy="14" r="5" fill="#60A5FA" />
      <text x="28" y="19" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff" letter-spacing="1">AI CLASSIFIER</text>
      <rect x="0" y="44" width="428" height="390" rx="20" fill="#ffffff" fill-opacity="0.95" />
      <text x="24" y="80" font-family="monospace" font-size="11" fill="#737373">CONFIDENCE SCORE · 99.4%</text>
      <g transform="translate(24, 100)">
        <rect x="0" y="0" width="380" height="76" rx="12" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1.5" />
        <circle cx="24" cy="38" r="12" fill="#3B82F6" /><path d="M19 38 L22 42 L29 33" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" />
        <text x="48" y="32" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="#1E3A8A">Billing &amp; Payments</text>
        <text x="48" y="52" font-family="monospace" font-size="11" fill="#3B82F6">Confidence 99.4% · High Certainty</text>
        <rect x="250" y="32" width="110" height="10" rx="5" fill="#DBEAFE" /><rect x="250" y="32" width="108" height="10" rx="5" fill="#3B82F6" />
      </g>
      <g transform="translate(24, 188)">
        <rect x="0" y="0" width="380" height="64" rx="12" fill="#F4F4F5" />
        <circle cx="24" cy="32" r="10" fill="#D4D4D8" />
        <text x="48" y="28" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#52525B">Technical Infrastructure</text>
        <text x="48" y="46" font-family="monospace" font-size="10" fill="#71717A">Confidence 0.4%</text>
        <rect x="250" y="26" width="110" height="8" rx="4" fill="#E4E4E7" /><rect x="250" y="26" width="4" height="8" rx="4" fill="#A1A1AA" />
      </g>
      <g transform="translate(24, 264)">
        <rect x="0" y="0" width="380" height="64" rx="12" fill="#F4F4F5" />
        <circle cx="24" cy="32" r="10" fill="#D4D4D8" />
        <text x="48" y="28" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#52525B">Account Administration</text>
        <text x="48" y="46" font-family="monospace" font-size="10" fill="#71717A">Confidence 0.2%</text>
        <rect x="250" y="26" width="110" height="8" rx="4" fill="#E4E4E7" /><rect x="250" y="26" width="3" height="8" rx="4" fill="#A1A1AA" />
      </g>
      <g transform="translate(24, 346)">
        <rect x="0" y="0" width="180" height="28" rx="6" fill="#DBEAFE" />
        <text x="14" y="19" font-family="monospace" font-size="10" font-weight="700" fill="#1E40AF">→ ROUTED: BILLING T2</text>
        <rect x="190" y="0" width="190" height="28" rx="6" fill="#F4F4F5" />
        <text x="204" y="19" font-family="monospace" font-size="10" font-weight="700" fill="#52525B">TAGS: STRIPE, 502, VIP</text>
      </g>
    </g>
  </svg>`;

  const marquee3 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
    <defs>
      <linearGradient id="m3_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F59E0B" /><stop offset="50%" stop-color="#EA580C" /><stop offset="100%" stop-color="#DC2626" />
      </linearGradient>
      <filter id="m3_glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="30" result="blur" /></filter>
    </defs>
    <rect width="500" height="700" fill="url(#m3_bg)" />
    <circle cx="350" cy="200" r="140" fill="#FEF08A" opacity="0.25" filter="url(#m3_glow)" />
    <g transform="translate(36, 44)">
      <rect x="0" y="0" width="170" height="28" rx="14" fill="#ffffff" fill-opacity="0.25" />
      <circle cx="14" cy="14" r="5" fill="#EF4444" />
      <text x="28" y="19" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff" letter-spacing="1">PRIORITY ENGINE</text>
      <rect x="0" y="44" width="428" height="390" rx="20" fill="#ffffff" fill-opacity="0.95" />
      <rect x="24" y="70" width="380" height="70" rx="14" fill="#FEF2F2" stroke="#EF4444" stroke-width="1.5" />
      <text x="44" y="100" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="#991B1B">P1 · CRITICAL URGENCY</text>
      <text x="44" y="122" font-family="monospace" font-size="11" fill="#B91C1C">REVENUE AT RISK · SLA &lt; 15 MINS</text>
      <g transform="translate(24, 156)">
        <rect x="0" y="0" width="380" height="110" rx="12" fill="#F4F4F5" />
        <text x="20" y="32" font-family="monospace" font-size="11" fill="#71717A">SLA TIME REMAINING</text>
        <text x="20" y="72" font-family="Inter, sans-serif" font-size="34" font-weight="700" fill="#18181B">14m 28s</text>
        <text x="20" y="94" font-family="Inter, sans-serif" font-size="11" fill="#10B981">✓ On Track for 15-min SLA guarantee</text>
        <circle cx="310" cy="55" r="35" stroke="#E4E4E7" stroke-width="6" fill="none" />
        <circle cx="310" cy="55" r="35" stroke="#EF4444" stroke-width="6" fill="none" stroke-dasharray="220" stroke-dashoffset="40" stroke-linecap="round" />
        <text x="310" y="60" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#EF4444">92%</text>
      </g>
      <g transform="translate(24, 282)">
        <rect x="0" y="0" width="380" height="60" rx="10" fill="#FFFBEB" stroke="#F59E0B" stroke-width="1" />
        <text x="20" y="34" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#92400E">Queue Position: #1 of 42 tickets</text>
        <text x="20" y="48" font-family="monospace" font-size="10" fill="#B45309">BUMPED PAST GENERAL QUERIES AUTOMATICALLY</text>
      </g>
      <text x="24" y="375" font-family="monospace" font-size="10" fill="#71717A">ALGORITHM: WEIGHTED ENTERPRISE VIP + DOWNTIME HAZARD</text>
    </g>
  </svg>`;

  const marquee4 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
    <defs>
      <linearGradient id="m4_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6D28D9" /><stop offset="50%" stop-color="#A21CAF" /><stop offset="100%" stop-color="#EC4899" />
      </linearGradient>
      <filter id="m4_glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="30" result="blur" /></filter>
    </defs>
    <rect width="500" height="700" fill="url(#m4_bg)" />
    <circle cx="150" cy="400" r="160" fill="#F472B6" opacity="0.25" filter="url(#m4_glow)" />
    <g transform="translate(36, 44)">
      <rect x="0" y="0" width="170" height="28" rx="14" fill="#ffffff" fill-opacity="0.25" />
      <circle cx="14" cy="14" r="5" fill="#F472B6" />
      <text x="28" y="19" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff" letter-spacing="1">AI SUMMARISER</text>
      <rect x="0" y="44" width="428" height="400" rx="20" fill="#ffffff" fill-opacity="0.95" />
      <text x="24" y="80" font-family="monospace" font-size="11" fill="#737373">CONDENSED CONTEXT · 3 KEY BULLETS</text>
      <g transform="translate(24, 100)">
        <rect x="0" y="0" width="380" height="66" rx="10" fill="#FDF4FF" stroke="#F0ABFC" stroke-width="1" />
        <circle cx="20" cy="24" r="8" fill="#A21CAF" /><text x="17" y="28" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff">1</text>
        <text x="38" y="24" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#701A75">Accidental Duplicate Billing</text>
        <text x="38" y="44" font-family="Inter, sans-serif" font-size="11" fill="#4A044E">Stripe webhook timed out; customer was billed $1,200.</text>
      </g>
      <g transform="translate(24, 178)">
        <rect x="0" y="0" width="380" height="66" rx="10" fill="#FDF4FF" stroke="#F0ABFC" stroke-width="1" />
        <circle cx="20" cy="24" r="8" fill="#A21CAF" /><text x="16" y="28" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff">2</text>
        <text x="38" y="24" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#701A75">Current Account Status</text>
        <text x="38" y="44" font-family="Inter, sans-serif" font-size="11" fill="#4A044E">Plan marked Expired; user cannot access team dashboard.</text>
      </g>
      <g transform="translate(24, 256)">
        <rect x="0" y="0" width="380" height="66" rx="10" fill="#FDF4FF" stroke="#F0ABFC" stroke-width="1" />
        <circle cx="20" cy="24" r="8" fill="#A21CAF" /><text x="16" y="28" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff">3</text>
        <text x="38" y="24" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#701A75">Required Action</text>
        <text x="38" y="44" font-family="Inter, sans-serif" font-size="11" fill="#4A044E">Refund duplicate &amp; manually re-enable Enterprise Tier.</text>
      </g>
      <g transform="translate(24, 340)">
        <rect x="0" y="0" width="180" height="40" rx="8" fill="#F4F4F5" />
        <text x="16" y="20" font-family="monospace" font-size="10" fill="#71717A">SENTIMENT</text><text x="16" y="33" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#BE185D">Frustrated (-0.84)</text>
        <rect x="195" y="0" width="185" height="40" rx="8" fill="#F4F4F5" />
        <text x="210" y="20" font-family="monospace" font-size="10" fill="#71717A">TIME SAVED</text><text x="210" y="33" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#059669">3.5 mins reading time</text>
      </g>
    </g>
  </svg>`;

  const marquee5 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
    <defs>
      <linearGradient id="m5_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F766E" /><stop offset="50%" stop-color="#06B6D4" /><stop offset="100%" stop-color="#10B981" />
      </linearGradient>
      <filter id="m5_glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="30" result="blur" /></filter>
    </defs>
    <rect width="500" height="700" fill="url(#m5_bg)" />
    <circle cx="350" cy="180" r="160" fill="#2DD4BF" opacity="0.3" filter="url(#m5_glow)" />
    <g transform="translate(36, 44)">
      <rect x="0" y="0" width="180" height="28" rx="14" fill="#ffffff" fill-opacity="0.25" />
      <circle cx="14" cy="14" r="5" fill="#6EE7B7" />
      <text x="28" y="19" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff" letter-spacing="1">DRAFT COPILOT</text>
      <rect x="0" y="44" width="428" height="400" rx="20" fill="#ffffff" fill-opacity="0.95" />
      <text x="24" y="78" font-family="monospace" font-size="11" fill="#737373">AI PROPOSED RESPONSE · 98% MATCH</text>
      <g transform="translate(24, 94)">
        <rect x="0" y="0" width="100" height="26" rx="13" fill="#CCFBF1" /><text x="16" y="17" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#0F766E">Empathetic ✓</text>
        <rect x="110" y="0" width="80" height="26" rx="13" fill="#F4F4F5" /><text x="124" y="17" font-family="Inter, sans-serif" font-size="11" fill="#71717A">Formal</text>
        <rect x="200" y="0" width="80" height="26" rx="13" fill="#F4F4F5" /><text x="214" y="17" font-family="Inter, sans-serif" font-size="11" fill="#71717A">Short</text>
      </g>
      <g transform="translate(24, 134)">
        <rect x="0" y="0" width="380" height="170" rx="12" fill="#F0FDFA" stroke="#99F6E4" stroke-width="1" />
        <text x="18" y="28" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#134E4A">Hi Sarah,</text>
        <text x="18" y="52" font-family="Inter, sans-serif" font-size="11.5" fill="#115E59">I sincerely apologize for the checkout hiccup today.</text>
        <text x="18" y="74" font-family="Inter, sans-serif" font-size="11.5" fill="#115E59">I have verified your payment of $1,200 and immediately</text>
        <text x="18" y="96" font-family="Inter, sans-serif" font-size="11.5" fill="#115E59">restored full Enterprise Tier 2 access to your team.</text>
        <text x="18" y="118" font-family="Inter, sans-serif" font-size="11.5" fill="#115E59">No duplicate charges were captured. You are all set!</text>
        <text x="18" y="148" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#134E4A">— NexusAI Support Team</text>
      </g>
      <g transform="translate(24, 320)">
        <rect x="0" y="0" width="260" height="46" rx="10" fill="#0D9488" /><text x="46" y="28" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#ffffff">APPROVE &amp; SEND (1-CLICK)</text>
        <rect x="272" y="0" width="108" height="46" rx="10" fill="#F4F4F5" /><text x="304" y="28" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#52525B">Edit Draft</text>
      </g>
      <text x="24" y="390" font-family="monospace" font-size="10" fill="#71717A">READY FOR AGENT REVIEW IN UNDER 2 SECONDS</text>
    </g>
  </svg>`;

  const marquee6 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%">
    <defs>
      <linearGradient id="m6_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#047857" /><stop offset="50%" stop-color="#10B981" /><stop offset="100%" stop-color="#34D399" />
      </linearGradient>
      <filter id="m6_glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="30" result="blur" /></filter>
    </defs>
    <rect width="500" height="700" fill="url(#m6_bg)" />
    <circle cx="200" cy="200" r="160" fill="#6EE7B7" opacity="0.3" filter="url(#m6_glow)" />
    <g transform="translate(36, 44)">
      <rect x="0" y="0" width="180" height="28" rx="14" fill="#ffffff" fill-opacity="0.25" />
      <circle cx="14" cy="14" r="5" fill="#ffffff" />
      <text x="28" y="19" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff" letter-spacing="1">LIVE TRACKER</text>
      <rect x="0" y="44" width="428" height="400" rx="20" fill="#ffffff" fill-opacity="0.95" />
      <text x="24" y="78" font-family="monospace" font-size="11" fill="#737373">LIFECYCLE TIMELINE · TOTAL 6 MINS</text>
      <g transform="translate(24, 96)">
        <line x1="16" y1="20" x2="16" y2="200" stroke="#10B981" stroke-width="2" />
        <circle cx="16" cy="20" r="10" fill="#10B981" /><path d="M12 20 L15 23 L20 17" stroke="#ffffff" stroke-width="1.5" fill="none" />
        <text x="36" y="18" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#18181B">10:14 AM · Ticket Raised</text>
        <text x="36" y="32" font-family="monospace" font-size="10" fill="#71717A">Ingested via web widget</text>
        <circle cx="16" cy="80" r="10" fill="#10B981" /><path d="M12 80 L15 83 L20 77" stroke="#ffffff" stroke-width="1.5" fill="none" />
        <text x="36" y="78" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#18181B">10:15 AM · AI Triage &amp; Prioritised</text>
        <text x="36" y="92" font-family="monospace" font-size="10" fill="#71717A">P1 Billing, 3-bullet summary generated</text>
        <circle cx="16" cy="140" r="10" fill="#10B981" /><path d="M12 140 L15 143 L20 137" stroke="#ffffff" stroke-width="1.5" fill="none" />
        <text x="36" y="138" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#18181B">10:17 AM · Reply Approved</text>
        <text x="36" y="152" font-family="monospace" font-size="10" fill="#71717A">Support Agent 1-click sent</text>
        <circle cx="16" cy="200" r="10" fill="#10B981" /><path d="M12 200 L15 203 L20 197" stroke="#ffffff" stroke-width="1.5" fill="none" />
        <text x="36" y="198" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#047857">10:20 AM · Resolved &amp; Confirmed</text>
        <text x="36" y="212" font-family="monospace" font-size="10" fill="#059669">Customer confirmed restored access</text>
      </g>
      <g transform="translate(24, 330)">
        <rect x="0" y="0" width="380" height="54" rx="10" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1" />
        <text x="18" y="24" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#065F46">Customer Feedback: ★★★★★ (5.0 / 5.0)</text>
        <text x="18" y="42" font-family="Inter, sans-serif" font-size="11" fill="#047857">"Resolved in 6 minutes. Super impressed!"</text>
      </g>
      <text x="24" y="415" font-family="monospace" font-size="10" fill="#71717A">STATUS: CLOSED · SLA COMPLIED 100%</text>
    </g>
  </svg>`;

  // Project Grid SVGs (Aspect Ratio 4:3)
  const proj1 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <linearGradient id="p1_bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#312E81" /><stop offset="60%" stop-color="#4F46E5" /><stop offset="100%" stop-color="#818CF8" /></linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#p1_bg)" />
    <g transform="translate(60, 50)">
      <rect width="680" height="500" rx="16" fill="#ffffff" fill-opacity="0.96" />
      <rect width="680" height="48" rx="16" fill="#F4F4F5" />
      <circle cx="28" cy="24" r="6" fill="#EF4444" /><circle cx="48" cy="24" r="6" fill="#F59E0B" /><circle cx="68" cy="24" r="6" fill="#10B981" />
      <text x="96" y="29" font-family="monospace" font-size="12" fill="#71717A">nexusai.app/portal/my-tickets</text>
      <text x="32" y="85" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="#18181B">Customer Support Portal</text>
      <text x="32" y="106" font-family="Inter, sans-serif" font-size="13" fill="#71717A">Track active requests or raise a new ticket anytime</text>
      <rect x="520" y="70" width="128" height="38" rx="8" fill="#4F46E5" /><text x="542" y="94" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#ffffff">+ NEW TICKET</text>
      <rect x="32" y="128" width="616" height="42" rx="8" fill="#F4F4F5" />
      <text x="52" y="154" font-family="Inter, sans-serif" font-size="13" fill="#A1A1AA">Search help articles or enter ticket reference ID...</text>
      <g transform="translate(32, 186)">
        <rect x="0" y="0" width="194" height="68" rx="10" fill="#EEF2FF" /><text x="16" y="28" font-family="monospace" font-size="11" fill="#4F46E5">ACTIVE TICKETS</text><text x="16" y="54" font-family="Inter, sans-serif" font-size="22" font-weight="700" fill="#1E1B4B">1 Pending</text>
        <rect x="210" y="0" width="194" height="68" rx="10" fill="#F4F4F5" /><text x="226" y="28" font-family="monospace" font-size="11" fill="#71717A">RESOLVED</text><text x="226" y="54" font-family="Inter, sans-serif" font-size="22" font-weight="700" fill="#18181B">14 Tickets</text>
        <rect x="420" y="0" width="196" height="68" rx="10" fill="#ECFDF5" /><text x="436" y="28" font-family="monospace" font-size="11" fill="#059669">AVG WAIT TIME</text><text x="436" y="54" font-family="Inter, sans-serif" font-size="22" font-weight="700" fill="#064E3B">&lt; 4 Mins</text>
      </g>
      <g transform="translate(32, 274)">
        <rect x="0" y="0" width="616" height="186" rx="12" fill="#FAFAFA" stroke="#E4E4E7" stroke-width="1" />
        <text x="24" y="34" font-family="monospace" font-size="11" fill="#6366F1">TICKET #NX-8941</text><text x="24" y="60" font-family="Inter, sans-serif" font-size="15" font-weight="700" fill="#18181B">Payment failure during enterprise renewal</text>
        <text x="24" y="82" font-family="Inter, sans-serif" font-size="12" fill="#52525B">Status: In Review · AI suggested draft approved by Tier-2 Agent</text>
        <g transform="translate(24, 110)">
          <line x1="30" y1="12" x2="540" y2="12" stroke="#E4E4E7" stroke-width="3" /><line x1="30" y1="12" x2="380" y2="12" stroke="#4F46E5" stroke-width="3" />
          <circle cx="30" cy="12" r="10" fill="#4F46E5" /><text x="30" y="34" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#4F46E5">Submitted</text>
          <circle cx="200" cy="12" r="10" fill="#4F46E5" /><text x="200" y="34" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#4F46E5">AI Triaged</text>
          <circle cx="380" cy="12" r="10" fill="#4F46E5" /><text x="380" y="34" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#4F46E5">Fix Ready</text>
          <circle cx="540" cy="12" r="10" fill="#E4E4E7" /><text x="540" y="34" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#A1A1AA">Resolved</text>
        </g>
      </g>
    </g>
  </svg>`;

  const proj2 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs><linearGradient id="p2_bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#064E3B" /><stop offset="60%" stop-color="#0D9488" /><stop offset="100%" stop-color="#14B8A6" /></linearGradient></defs>
    <rect width="800" height="600" fill="url(#p2_bg)" />
    <g transform="translate(60, 50)">
      <rect width="680" height="500" rx="16" fill="#ffffff" fill-opacity="0.96" />
      <rect width="680" height="48" rx="16" fill="#F4F4F5" />
      <circle cx="28" cy="24" r="6" fill="#EF4444" /><circle cx="48" cy="24" r="6" fill="#F59E0B" /><circle cx="68" cy="24" r="6" fill="#10B981" />
      <text x="96" y="29" font-family="monospace" font-size="12" fill="#71717A">nexusai.app/agent/console</text>
      <g transform="translate(24, 68)">
        <text x="0" y="20" font-family="Inter, sans-serif" font-size="15" font-weight="700" fill="#18181B">Ticket Queue (18)</text>
        <g transform="translate(0, 36)">
          <rect width="240" height="80" rx="8" fill="#F0FDFA" stroke="#0D9488" stroke-width="1.5" />
          <rect x="12" y="12" width="32" height="18" rx="4" fill="#EF4444" /><text x="18" y="24" font-family="monospace" font-size="9" font-weight="700" fill="#ffffff">P1</text>
          <text x="52" y="25" font-family="monospace" font-size="10" fill="#71717A">#4092 · 14m left</text>
          <text x="12" y="46" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#134E4A">Payment failure renew</text>
          <text x="12" y="64" font-family="Inter, sans-serif" font-size="10" fill="#0F766E">sarah@acme.co · Billing</text>
        </g>
        <g transform="translate(0, 126)">
          <rect width="240" height="74" rx="8" fill="#F4F4F5" />
          <rect x="12" y="12" width="32" height="18" rx="4" fill="#F59E0B" /><text x="18" y="24" font-family="monospace" font-size="9" font-weight="700" fill="#ffffff">P2</text>
          <text x="52" y="25" font-family="monospace" font-size="10" fill="#71717A">#4091 · 42m left</text>
          <text x="12" y="46" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#27272A">SSO SAML certificate update</text>
          <text x="12" y="62" font-family="Inter, sans-serif" font-size="10" fill="#71717A">dev@techcorp.io · Auth</text>
        </g>
        <g transform="translate(0, 210)">
          <rect width="240" height="74" rx="8" fill="#F4F4F5" />
          <rect x="12" y="12" width="32" height="18" rx="4" fill="#10B981" /><text x="18" y="24" font-family="monospace" font-size="9" font-weight="700" fill="#ffffff">P3</text>
          <text x="52" y="25" font-family="monospace" font-size="10" fill="#71717A">#4090 · 2h left</text>
          <text x="12" y="46" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#27272A">Invoice receipt request</text>
          <text x="12" y="62" font-family="Inter, sans-serif" font-size="10" fill="#71717A">billing@startup.dev · Fin</text>
        </g>
      </g>
      <line x1="288" y1="64" x2="288" y2="480" stroke="#E4E4E7" stroke-width="1" />
      <g transform="translate(308, 68)">
        <text x="0" y="20" font-family="Inter, sans-serif" font-size="17" font-weight="700" fill="#18181B">Payment failure during renewal</text>
        <text x="0" y="38" font-family="monospace" font-size="11" fill="#0D9488">CUSTOMER: SARAH (ENTERPRISE VIP) · SLA: 14M REMAINING</text>
        <rect x="0" y="56" width="348" height="90" rx="10" fill="#F4F4F5" />
        <text x="14" y="80" font-family="Inter, sans-serif" font-size="11.5" font-weight="500" fill="#27272A">"Our renewal payment failed with error code 502.</text>
        <text x="14" y="100" font-family="Inter, sans-serif" font-size="11.5" font-weight="500" fill="#27272A">We were charged $1,200 on card statement but</text>
        <text x="14" y="120" font-family="Inter, sans-serif" font-size="11.5" font-weight="500" fill="#27272A">our account shows expired. Urgent please!"</text>
        <g transform="translate(0, 160)">
          <rect width="348" height="110" rx="10" fill="#F0FDFA" stroke="#99F6E4" stroke-width="1" />
          <text x="14" y="24" font-family="monospace" font-size="10" font-weight="700" fill="#0F766E">AI SUGGESTION READY (1-CLICK)</text>
          <text x="14" y="46" font-family="Inter, sans-serif" font-size="11" fill="#115E59">"Verified transaction. Restored Enterprise Tier 2."</text>
          <rect x="14" y="64" width="180" height="34" rx="6" fill="#0D9488" /><text x="32" y="86" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff">APPROVE &amp; SEND →</text>
          <rect x="204" y="64" width="130" height="34" rx="6" fill="#ffffff" stroke="#CBD5E1" stroke-width="1" /><text x="228" y="85" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#475569">Modify Reply</text>
        </g>
      </g>
    </g>
  </svg>`;

  const proj3 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs><linearGradient id="p3_bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#991B1B" /><stop offset="50%" stop-color="#EA580C" /><stop offset="100%" stop-color="#F59E0B" /></linearGradient></defs>
    <rect width="800" height="600" fill="url(#p3_bg)" />
    <g transform="translate(60, 50)">
      <rect width="680" height="500" rx="16" fill="#ffffff" fill-opacity="0.96" />
      <rect width="680" height="48" rx="16" fill="#F4F4F5" />
      <circle cx="28" cy="24" r="6" fill="#EF4444" /><circle cx="48" cy="24" r="6" fill="#F59E0B" /><circle cx="68" cy="24" r="6" fill="#10B981" />
      <text x="96" y="29" font-family="monospace" font-size="12" fill="#71717A">nexusai.app/ai/triage-pipeline</text>
      <text x="32" y="85" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="#18181B">Autonomous AI Triage Engine</text>
      <text x="32" y="106" font-family="Inter, sans-serif" font-size="13" fill="#71717A">Live semantic parsing, categorization &amp; priority assignment</text>
      <g transform="translate(32, 130)">
        <rect x="0" y="0" width="180" height="130" rx="10" fill="#FEF2F2" stroke="#EF4444" stroke-width="1" />
        <text x="14" y="26" font-family="monospace" font-size="10" font-weight="700" fill="#991B1B">STAGE 1: INGESTION</text><text x="14" y="52" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#18181B">Ticket Stream</text>
        <text x="14" y="72" font-family="Inter, sans-serif" font-size="10" fill="#71717A">Tokens: 382</text><text x="14" y="90" font-family="Inter, sans-serif" font-size="10" fill="#71717A">Entities: Stripe, $1200</text>
        <text x="14" y="112" font-family="monospace" font-size="10" fill="#EF4444">0.12s latency</text>
        <text x="194" y="70" font-family="Inter, sans-serif" font-size="20" fill="#EA580C">→</text>
        <rect x="218" y="0" width="180" height="130" rx="10" fill="#FFFBEB" stroke="#F59E0B" stroke-width="1" />
        <text x="232" y="26" font-family="monospace" font-size="10" font-weight="700" fill="#B45309">STAGE 2: CLASSIFY</text><text x="232" y="52" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#18181B">Intent Model</text>
        <text x="232" y="72" font-family="Inter, sans-serif" font-size="10" fill="#71717A">Billing: 99.4%</text><text x="232" y="90" font-family="Inter, sans-serif" font-size="10" fill="#71717A">Urgency: P1 Critical</text>
        <text x="232" y="112" font-family="monospace" font-size="10" fill="#D97706">0.24s latency</text>
        <text x="412" y="70" font-family="Inter, sans-serif" font-size="20" fill="#EA580C">→</text>
        <rect x="436" y="0" width="180" height="130" rx="10" fill="#F0FDF4" stroke="#10B981" stroke-width="1" />
        <text x="450" y="26" font-family="monospace" font-size="10" font-weight="700" fill="#065F46">STAGE 3: ROUTE</text><text x="450" y="52" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#18181B">Queue Dispatch</text>
        <text x="450" y="72" font-family="Inter, sans-serif" font-size="10" fill="#71717A">Target: Billing T2</text><text x="450" y="90" font-family="Inter, sans-serif" font-size="10" fill="#71717A">Draft ready: Yes</text>
        <text x="450" y="112" font-family="monospace" font-size="10" fill="#059669">Total: 0.36s</text>
      </g>
      <g transform="translate(32, 280)">
        <rect width="616" height="170" rx="12" fill="#F4F4F5" />
        <text x="20" y="28" font-family="monospace" font-size="11" fill="#71717A">CONFIDENCE DISTRIBUTION (LAST 1,000 TICKETS)</text>
        <text x="20" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#18181B">Billing &amp; Refunds</text>
        <rect x="180" y="46" width="380" height="14" rx="7" fill="#E4E4E7" /><rect x="180" y="46" width="360" height="14" rx="7" fill="#EA580C" /><text x="570" y="58" font-family="monospace" font-size="11" font-weight="700" fill="#EA580C">94.7%</text>
        <text x="20" y="94" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#18181B">Technical &amp; API</text>
        <rect x="180" y="82" width="380" height="14" rx="7" fill="#E4E4E7" /><rect x="180" y="82" width="345" height="14" rx="7" fill="#F59E0B" /><text x="570" y="94" font-family="monospace" font-size="11" font-weight="700" fill="#F59E0B">91.2%</text>
        <text x="20" y="130" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#18181B">Account &amp; SSO</text>
        <rect x="180" y="118" width="380" height="14" rx="7" fill="#E4E4E7" /><rect x="180" y="118" width="372" height="14" rx="7" fill="#10B981" /><text x="570" y="130" font-family="monospace" font-size="11" font-weight="700" fill="#10B981">98.1%</text>
      </g>
    </g>
  </svg>`;

  const proj4 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs><linearGradient id="p4_bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#831843" /><stop offset="50%" stop-color="#C026D3" /><stop offset="100%" stop-color="#7C3AED" /></linearGradient></defs>
    <rect width="800" height="600" fill="url(#p4_bg)" />
    <g transform="translate(60, 50)">
      <rect width="680" height="500" rx="16" fill="#ffffff" fill-opacity="0.96" />
      <rect width="680" height="48" rx="16" fill="#F4F4F5" />
      <circle cx="28" cy="24" r="6" fill="#EF4444" /><circle cx="48" cy="24" r="6" fill="#F59E0B" /><circle cx="68" cy="24" r="6" fill="#10B981" />
      <text x="96" y="29" font-family="monospace" font-size="12" fill="#71717A">nexusai.app/copilot/draft-studio</text>
      <text x="32" y="85" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="#18181B">AI Copilot Suggested Replies</text>
      <text x="32" y="106" font-family="Inter, sans-serif" font-size="13" fill="#71717A">High-accuracy human-in-the-loop responses ready to approve</text>
      <g transform="translate(32, 126)">
        <rect x="0" y="0" width="116" height="30" rx="15" fill="#FDF4FF" stroke="#C026D3" stroke-width="1.5" /><text x="16" y="20" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#A21CAF">Empathetic ✓</text>
        <rect x="126" y="0" width="90" height="30" rx="15" fill="#F4F4F5" /><text x="146" y="20" font-family="Inter, sans-serif" font-size="11" fill="#71717A">Direct</text>
        <rect x="226" y="0" width="90" height="30" rx="15" fill="#F4F4F5" /><text x="246" y="20" font-family="Inter, sans-serif" font-size="11" fill="#71717A">Formal</text>
      </g>
      <g transform="translate(32, 172)">
        <rect width="616" height="210" rx="12" fill="#FAFAFA" stroke="#E4E4E7" stroke-width="1" />
        <text x="24" y="32" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#18181B">Generated Draft (Confidence: 98.4%)</text>
        <text x="24" y="66" font-family="Inter, sans-serif" font-size="13" fill="#27272A">Dear Sarah,</text>
        <text x="24" y="92" font-family="Inter, sans-serif" font-size="13" fill="#27272A">Thank you for contacting NexusAI Support. We understand how critical Enterprise renewal is.</text>
        <text x="24" y="118" font-family="Inter, sans-serif" font-size="13" fill="#27272A">Our finance system verified your renewal payment of $1,200. We have manually cleared the 502</text>
        <text x="24" y="144" font-family="Inter, sans-serif" font-size="13" fill="#27272A">timeout status and unlocked your enterprise workspace immediately.</text>
        <g transform="translate(24, 166)">
          <rect width="260" height="26" rx="6" fill="#F3E8FF" /><text x="12" y="17" font-family="monospace" font-size="10" font-weight="700" fill="#7E22CE">CITATION: STRIPE_INVOICE_#4092</text>
        </g>
      </g>
      <g transform="translate(32, 400)">
        <rect width="220" height="44" rx="8" fill="#C026D3" /><text x="36" y="27" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#ffffff">APPROVE &amp; SEND (1-CLICK)</text>
        <rect x="236" y="0" width="130" height="44" rx="8" fill="#F4F4F5" /><text x="268" y="27" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#52525B">Edit Response</text>
        <text x="440" y="27" font-family="monospace" font-size="11" fill="#71717A">AVERAGE AGENT EDIT TIME: 12 SECS</text>
      </g>
    </g>
  </svg>`;

  const proj5 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs><linearGradient id="p5_bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1E3A8A" /><stop offset="50%" stop-color="#2563EB" /><stop offset="100%" stop-color="#38BDF8" /></linearGradient></defs>
    <rect width="800" height="600" fill="url(#p5_bg)" />
    <g transform="translate(60, 50)">
      <rect width="680" height="500" rx="16" fill="#ffffff" fill-opacity="0.96" />
      <rect width="680" height="48" rx="16" fill="#F4F4F5" />
      <circle cx="28" cy="24" r="6" fill="#EF4444" /><circle cx="48" cy="24" r="6" fill="#F59E0B" /><circle cx="68" cy="24" r="6" fill="#10B981" />
      <text x="96" y="29" font-family="monospace" font-size="12" fill="#71717A">nexusai.app/ai/instant-assistant</text>
      <text x="32" y="85" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="#18181B">Knowledge-Base Chatbot</text>
      <text x="32" y="106" font-family="Inter, sans-serif" font-size="13" fill="#71717A">Instant answers with citations &amp; seamless human handover</text>
      <g transform="translate(32, 130)">
        <g transform="translate(180, 0)">
          <rect width="436" height="52" rx="12" fill="#2563EB" />
          <text x="20" y="31" font-family="Inter, sans-serif" font-size="13" fill="#ffffff">How do I invite team members and configure SSO on my plan?</text>
        </g>
        <g transform="translate(0, 72)">
          <rect width="520" height="150" rx="12" fill="#F0F9FF" stroke="#BAE6FD" stroke-width="1" />
          <circle cx="24" cy="24" r="10" fill="#0284C7" /><text x="20" y="28" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff">AI</text>
          <text x="44" y="28" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#0369A1">NexusAI Assistant</text>
          <text x="24" y="56" font-family="Inter, sans-serif" font-size="12.5" fill="#0C4A6E">1. Go to Settings → Team &amp; Permissions and click "Invite Member".</text>
          <text x="24" y="78" font-family="Inter, sans-serif" font-size="12.5" fill="#0C4A6E">2. Enter their corporate email and select role (Admin / Agent).</text>
          <text x="24" y="100" font-family="Inter, sans-serif" font-size="12.5" fill="#0C4A6E">3. For SAML SSO, upload your IdP metadata in Settings → Security.</text>
          <rect x="24" y="114" width="230" height="24" rx="4" fill="#E0F2FE" /><text x="34" y="130" font-family="monospace" font-size="10" font-weight="700" fill="#0284C7">DOC: /DOCS/SSO-SAML-SETUP</text>
        </g>
      </g>
      <g transform="translate(32, 384)">
        <rect width="616" height="66" rx="10" fill="#F4F4F5" />
        <text x="20" y="28" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#18181B">Was this answer helpful?</text>
        <rect x="20" y="36" width="60" height="22" rx="4" fill="#ffffff" stroke="#CBD5E1" stroke-width="1" /><text x="36" y="51" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#18181B">YES</text>
        <rect x="88" y="36" width="60" height="22" rx="4" fill="#ffffff" stroke="#CBD5E1" stroke-width="1" /><text x="106" y="51" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#18181B">NO</text>
        <rect x="390" y="18" width="206" height="34" rx="6" fill="#0284C7" /><text x="416" y="39" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff">HANDOVER TO HUMAN →</text>
      </g>
    </g>
  </svg>`;

  const proj6 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs><linearGradient id="p6_bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0F172A" /><stop offset="50%" stop-color="#1E293B" /><stop offset="100%" stop-color="#0F766E" /></linearGradient></defs>
    <rect width="800" height="600" fill="url(#p6_bg)" />
    <g transform="translate(60, 50)">
      <rect width="680" height="500" rx="16" fill="#ffffff" fill-opacity="0.96" />
      <rect width="680" height="48" rx="16" fill="#F4F4F5" />
      <circle cx="28" cy="24" r="6" fill="#EF4444" /><circle cx="48" cy="24" r="6" fill="#F59E0B" /><circle cx="68" cy="24" r="6" fill="#10B981" />
      <text x="96" y="29" font-family="monospace" font-size="12" fill="#71717A">nexusai.app/manager/overview</text>
      <text x="32" y="85" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="#18181B">Manager Operations Overview</text>
      <text x="32" y="106" font-family="Inter, sans-serif" font-size="13" fill="#71717A">Real-time team workload, SLA response times &amp; AI resolution analytics</text>
      <g transform="translate(32, 126)">
        <rect x="0" y="0" width="194" height="78" rx="10" fill="#F0FDFA" stroke="#99F6E4" stroke-width="1" />
        <text x="16" y="24" font-family="monospace" font-size="10" fill="#0D9488">AVG FIRST RESPONSE</text><text x="16" y="54" font-family="Inter, sans-serif" font-size="26" font-weight="700" fill="#134E4A">1m 24s</text>
        <text x="16" y="70" font-family="monospace" font-size="10" fill="#059669">-84% vs industry average</text>
        <rect x="210" y="0" width="194" height="78" rx="10" fill="#EEF2FF" stroke="#C7D2FE" stroke-width="1" />
        <text x="226" y="24" font-family="monospace" font-size="10" fill="#4F46E5">AI RESOLUTION RATE</text><text x="226" y="54" font-family="Inter, sans-serif" font-size="26" font-weight="700" fill="#1E1B4B">68.4%</text>
        <text x="226" y="70" font-family="monospace" font-size="10" fill="#4338CA">Automated without agent edit</text>
        <rect x="420" y="0" width="196" height="78" rx="10" fill="#F4F4F5" />
        <text x="436" y="24" font-family="monospace" font-size="10" fill="#71717A">SLA COMPLIANCE</text><text x="436" y="54" font-family="Inter, sans-serif" font-size="26" font-weight="700" fill="#18181B">99.8%</text>
        <text x="436" y="70" font-family="monospace" font-size="10" fill="#10B981">0 Breaches this week</text>
      </g>
      <g transform="translate(32, 224)">
        <rect width="616" height="226" rx="12" fill="#F4F4F5" />
        <text x="20" y="28" font-family="monospace" font-size="11" fill="#71717A">7-DAY INGESTION &amp; DEFLECTION VOLUME</text>
        <line x1="60" y1="60" x2="570" y2="60" stroke="#E4E4E7" stroke-width="1" stroke-dasharray="4" />
        <line x1="60" y1="100" x2="570" y2="100" stroke="#E4E4E7" stroke-width="1" stroke-dasharray="4" />
        <line x1="60" y1="140" x2="570" y2="140" stroke="#E4E4E7" stroke-width="1" stroke-dasharray="4" />
        <line x1="60" y1="180" x2="570" y2="180" stroke="#E4E4E7" stroke-width="1" />
        <text x="28" y="64" font-family="monospace" font-size="9" fill="#A1A1AA">300</text><text x="28" y="104" font-family="monospace" font-size="9" fill="#A1A1AA">200</text>
        <text x="28" y="144" font-family="monospace" font-size="9" fill="#A1A1AA">100</text><text x="34" y="184" font-family="monospace" font-size="9" fill="#A1A1AA">0</text>
        <rect x="80" y="90" width="36" height="90" rx="4" fill="#0F766E" /><text x="88" y="200" font-family="monospace" font-size="10" fill="#71717A">MON</text>
        <rect x="150" y="70" width="36" height="110" rx="4" fill="#0F766E" /><text x="158" y="200" font-family="monospace" font-size="10" fill="#71717A">TUE</text>
        <rect x="220" y="55" width="36" height="125" rx="4" fill="#0F766E" /><text x="228" y="200" font-family="monospace" font-size="10" fill="#71717A">WED</text>
        <rect x="290" y="62" width="36" height="118" rx="4" fill="#0F766E" /><text x="298" y="200" font-family="monospace" font-size="10" fill="#71717A">THU</text>
        <rect x="360" y="48" width="36" height="132" rx="4" fill="#0F766E" /><text x="368" y="200" font-family="monospace" font-size="10" fill="#71717A">FRI</text>
        <rect x="430" y="120" width="36" height="60" rx="4" fill="#0D9488" /><text x="438" y="200" font-family="monospace" font-size="10" fill="#71717A">SAT</text>
        <rect x="500" y="135" width="36" height="45" rx="4" fill="#0D9488" /><text x="508" y="200" font-family="monospace" font-size="10" fill="#71717A">SUN</text>
      </g>
    </g>
  </svg>`;

  const marqueeUris = [
    svgToDataUri(marquee1),
    svgToDataUri(marquee2),
    svgToDataUri(marquee3),
    svgToDataUri(marquee4),
    svgToDataUri(marquee5),
    svgToDataUri(marquee6)
  ];

  const projectUris = [
    svgToDataUri(proj1),
    svgToDataUri(proj2),
    svgToDataUri(proj3),
    svgToDataUri(proj4),
    svgToDataUri(proj5),
    svgToDataUri(proj6)
  ];

  window.NexusAssets = {
    marqueeUris: marqueeUris,
    projectUris: projectUris
  };

  // Populate images on load
  function initImages() {
    const cardImgs = document.querySelectorAll('.card-img');
    cardImgs.forEach((img, i) => {
      const uriIndex = i % 6;
      img.src = marqueeUris[uriIndex];
    });

    const projectImgs = document.querySelectorAll('.project-img');
    projectImgs.forEach((img, i) => {
      if (projectUris[i]) {
        img.src = projectUris[i];
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImages);
  } else {
    initImages();
  }
})();
