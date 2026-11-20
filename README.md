# BIZASSIST AI — Customer Support Platform

A modern, accessible, zero-build unified application for **BIZASSIST AI**, an AI-assisted customer support platform where customers raise tickets and AI categorises, prioritises, summarises, and suggests replies for modern operations teams.

**Live Application**: [https://bizassist69.vercel.app/](https://bizassist69.vercel.app/)  
**GitHub Repository**: [https://github.com/kalaiselvansbcg-cyber/BIZASSIST-WEB-2](https://github.com/kalaiselvansbcg-cyber/BIZASSIST-WEB-2)

---

## 🔒 Security & Prototype Authentication Disclaimer

> **IMPORTANT SECURITY NOTICE**:  
> The authentication and password reset systems in this prototype are **client-side demo authentication** designed for presentation, interactive demonstrations, and rapid UX prototyping.  
> Passwords and verification codes are salted and hashed using the browser's native **Web Crypto API (SHA-256)** with per-user cryptographic salts to ensure defensive coding without storing credentials in plain text.  
> However, client-side storage (`localStorage` / `sessionStorage`) must **never** be mistaken for production server-side authentication. In a production environment, authentication and password reset tokens should be managed by a secure server-side session backend (such as Supabase Auth, Clerk, or NextAuth).

---

## 🛠️ Root Cause Diagnosis & Fix Report (Priority 0)

### Bug 1: "The Sign in button does nothing"
- **Root Cause 1 (Hash Mismatch)**: The pre-seeded SHA-256 hashes for default demo accounts in `js/guard.js` did not match the runtime hash of `salt + "password123"`. When users entered valid credentials or clicked fast-track demo buttons, authentication failed with an internal hash mismatch error.
- **Root Cause 2 (Invisible Error State)**: In `index.html`, when `BizAssistAuth.signIn()` returned an authentication failure, the error was assigned to `#status-live`, but `#status-live` had `.field-error` CSS which was `display: none` by default because `.is-visible` was not added. The button briefly disabled and re-enabled without any visible feedback.
- **Root Cause 3 (HTML5 Validation Suppression)**: Form `novalidate` suppressed native browser bubbles, and inline field error alerts were unstyled or missed when fields were left blank.
- **Root Cause 4 (Stale Storage Cache)**: Browsers that had already loaded the old build retained the bad hashes in `localStorage['bizassist.accounts']`.
- **Fix Applied**:
  - Re-computed and verified SHA-256 hashes for all seed demo accounts.
  - Implemented auto-migration / self-healing in `js/guard.js` to update any stale account hashes in storage automatically.
  - Created a prominent `.status-alert.error` banner in `index.html` with explicit `.is-visible` toggling.
  - Added button loading state (`"Signing in..."` / `"Creating account..."`) and defensive error handling.

### Bug 2: "'Forgot password?' does nothing"
- **Root Cause**: The "Forgot password?" link only invoked `showForgotNotice()`, which un-hid a static, non-interactive disclaimer notice box at the top of the card. No actual password reset view, code input, or password reset logic existed.
- **Fix Applied**: Built a complete 3-step password reset view (`#view-reset-password`) directly within `index.html`, backed by cryptographic methods in `js/guard.js` and an optional serverless dispatch function `api/send-reset.js`.

---

## 🔑 Priority 1: Working Password Reset Flow

A complete, accessible 3-step password reset experience:
1. **Step 1 (Email Entry)**:
   - User enters account email.
   - Neutral security response: *"If an account exists for this email, a 6-digit reset code has been generated."*
   - Rate limiting: Max 3 code requests per 15 minutes per email (`bizassist.reset_rate_limit`).
   - Generates a random 6-digit code valid for 10 minutes. Stores only the SHA-256 hash of the code + salt with attempt counter (max 5 failed attempts).
   - **Demo Mode**: Because no third-party email service is required by default, a clean demo panel displays:  
     `Demo mode: your reset code is [482913]` with a 1-click **Copy Code** button (controlled by `SITE.DEMO_SHOW_RESET_CODE` in `config/site.js`).
   - **Real Email Mode (Optional)**: `api/send-reset.js` handles email dispatch via Resend or SendGrid when configured with environment variables (`EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM`).
2. **Step 2 (6-Digit Code Entry)**:
   - 6 individual digit input boxes with auto-advance on key entry, backspace navigation, paste support (distributes 6 digits across boxes), and cooldown resend button.
3. **Step 3 (New Password)**:
   - New password and confirmation inputs with show/hide password toggles.
   - Real-time password strength meter (Weak, Good, Strong) with minimum 8 characters and letter + number validation.
   - On success: updates stored password hash with a fresh salt, destroys active sessions for the user, shows a green success banner (*"Password updated. Please sign in with your new password"*), and returns to the Sign In tab with email prefilled.

---

## 📞 Priority 2: Unified Contact Configuration (`config/site.js`)

Central configuration object exported in `config/site.js`:
```javascript
export const SITE = {
  name: "BizAssist AI",
  supportPhone: "+91 00000 00000",   // Replace with your real phone number
  supportPhoneDisplay: "+91 00000 00000",
  supportWhatsApp: "910000000000",   // Digits only for wa.me links
  supportEmail: "support@bizassist.ai",
  supportHours: "Monday to Friday, 9:00 AM – 6:00 PM IST",
  DEMO_SHOW_RESET_CODE: true,
  ENABLE_REAL_EMAIL: false
};
```
- **Placeholder Warning**: If the phone number is set to placeholder (`+91 00000 00000`), a warning is logged to the browser console only—never shown in the UI.
- **Universal Contact Links**: Every telephone link uses `tel:`, and WhatsApp links use `https://wa.me/910000000000`.
- **Request a Call Back Modal**: Accessible from the top navigation user menu, Customer Portal, and AI Chatbot. Allows visitors to schedule a phone call-back (Name, Phone, Preferred Window, Topic) which feeds directly into the Agent Dashboard's **Call Back Queue**.

---

## 🚀 Priority 3: 12 Support Platform Features

1. **Ticket Attachments**: Drag-and-drop or file selector on the ticket intake form; supports PNG, JPEG, WebP, and PDF up to 3 files (max 5MB each); previews chips with file size and type; persisted in `store.js`.
2. **Live SLA Countdown & Auto-Escalation**: Target SLAs by priority (Urgent 15m, High 60m, Normal 480m); dynamic real-time countdown on every ticket; visual At-Risk (<20% time) and Breached badges; auto-escalates to on-call manager when breached.
3. **Search, Filters & Sorting**: Global search input with keyboard shortcut `/` to focus; saved filter chips (All, My Tickets, Urgent, At Risk, Unassigned, Resolved); multi-attribute filters across Category, Priority, Channel, and Sentiment.
4. **Internal Notes & Audit Activity Timeline**: Toggle between Public Reply and Internal Note (distinct yellow styling with *"Not visible to customer"* badge); complete chronological audit trail on every ticket.
5. **Assign / Reassign & Workload Balance**: Reassign tickets between Sarah Jenkins, Marcus Vance, Elena Rostova, or Unassigned; live agent capacity counter; Manager **Auto-balance** button evenly redistributes unassigned tickets.
6. **Knowledge Base & Dynamic Deflection**: 12 starter articles across Billing, API, Security, and Getting Started; as customer types in ticket intake, real-time deflection cards suggest relevant articles with a *"This solved my issue"* button that records deflection without queue wait.
7. **Notification Centre**: Header bell icon with unread badge counter; dropdown menu of recent events; cross-tab synchronization via storage events.
8. **CSAT Rating & Review**: Interactive 1 to 5 star rating prompt and feedback textarea displayed automatically when a ticket reaches **Resolved** stage.
9. **Multi-Channel Intake Tags**: Every ticket tracks its inbound channel (Web Portal, Email, Chatbot, Phone, WhatsApp); breakdown analytics in Manager Overview.
10. **Reports Export**: 1-click **Export CSV** generating a spreadsheet of all tickets, SLAs, and CSAT scores; **Print Report** applying a print stylesheet for an executive 1-page summary.
11. **AI Quality Features**: Duplicate ticket detection banner with 1-click Merge; customer sentiment trend indicator; grounded RAG citations in AI drafts (`[1] Ref: ...`); *"Why this priority?"* explanation popover.
12. **Manager Settings Workspace**: Modal dialog to configure SLA target minutes per priority, manage categories, and toggle AI auto-triage.

---

## 🤖 Priority 4: Chatbot Assistant Upgrade (`/api/chat`)

- **Server-Sent Events (SSE)** streaming with `delta` and `text` properties.
- **6 Native Serverless Tools**: `lookup_ticket`, `create_ticket`, `add_ticket_comment`, `request_callback`, `search_knowledge_base`, `handover_to_human`.
- **Rich Cards**: 5-stage ticket tracker card, knowledge article cards, human support contact triggers, and ticket confirmation dialogs.
- **Prompt Injection Defense**: Guardrail checks refuse instructions attempting to alter role or extract system prompts.
- **Quick Action Chips**: No-emoji prompt buttons for fast navigation.
- **Conversation Memory**: Maintains up to 12 turns of context.
- **Utilities**: 1-click **Copy Message** and **Download Transcript** buttons.

---

## 🎨 Quiet Luxury Design Tokens
- Background: Warm Cream (`#FAF8F5`)
- Ink: Deep Ink (`#111111`)
- Line: Hairline Stone (`#E3DED6`)
- Accent: Burnt Terracotta (`#B3402A`)
- Typography: Cormorant Garamond (Serif), Inter (Sans-Serif), SFMono (Monospace)
- Corners: Sharp (`border-radius: 0`)
- **Zero emojis in the UI** (all icons use clean SVGs or typographical symbols).

---

## 👥 Demo Accounts
- **Customer**: `customer@bizassist.ai` / `password123` (Elena Rostova) → Lands on `/portal`
- **Support Agent**: `agent@bizassist.ai` / `password123` (Sarah Jenkins) → Lands on `/agent-dashboard`
- **Operations Manager**: `manager@bizassist.ai` / `password123` (Marcus Vance) → Lands on `/manager-overview`
