# NexusAI — AI-Assisted Customer Support Platform

A bold, typography-first editorial marketing website and working prototype for **NexusAI**, an AI-assisted customer support platform where customers raise and track tickets, and AI helps support staff sort, prioritise, and answer them faster.

Built by **14 students in 6 days** based on the PRD by `@KAL-EL` (Nov 17, 2026).

---

## 🚀 Quick Access & How to Run

### Option 1: Direct Browser Access (No Server Required)
You can directly open `index.html` in any web browser (Chrome, Edge, Safari, Firefox):
```bash
# On Windows, simply double-click index.html or navigate to:
file:///d:/zeni/index.html
```

### Option 2: Run via Local HTTP Server
If you prefer running a local development server:
```bash
# Using Node.js npx serve
npx serve .

# Or using Python
python -m http.server 8000
```
Then visit: `http://localhost:8000` (or `http://localhost:3000`).

### Option 3: Deploy to GitHub Pages
1. Push this repository to GitHub.
2. In your repository settings, go to **Settings** → **Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`, then click **Save**.
4. Your site will immediately be live at: `https://<your-username>.github.io/<repo-name>/`.

---

## 📁 Repository Structure

The project code is separated into clean, modular files for easy maintenance and version control:

```
nexusai/
├── index.html              # Semantic HTML5 entry page with all sections
├── css/
│   └── styles.css          # Design system tokens, typography, layout, and animations
├── js/
│   ├── assets.js           # Vector SVG illustrations & data URI generation
│   ├── main.js             # Core UI controller (custom difference cursor, nav, toasts, reveals)
│   └── interactive.js      # Working prototype simulations, modals & form handlers
├── .gitignore              # Standard Git ignore rules
└── README.md               # Project documentation and guide
```

---

## 🎨 Design System & Editorial Rules

- **Palette**: Strict black and white editorial style. Color appears **exclusively inside product UI illustrations**.
  - Background: `#FFFFFF`
  - Text: `#000000`
  - Secondary Text: `#525252`
  - Metadata Text: `#737373`
  - Footer Background: `#0A0A0A` (Footer text `#FFFFFF`)
- **Borders & Dividers**: Strictly 1px with `rgba(0, 0, 0, 0.1)` (and `rgba(255, 255, 255, 0.1)` in the footer). Never thicker than 1px.
- **Universal Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` applied across every interaction. All hover transitions last at least 500ms.
- **Typography**:
  - Font: **Inter** (weights `400`, `500`, `600`, `700`) loaded from Google Fonts.
  - Headlines: weight `700`, letter-spacing `-0.05em`, line-height `0.9`.
  - Body: weight `400`, letter-spacing `-0.02em`, line-height `1.5`.
  - Metadata: monospace, `14px`, uppercase, letter-spacing `0.1em`.
- **Custom Difference Cursor**:
  - 32px by 32px fixed container with `mix-blend-mode: difference`.
  - Lags smoothly with linear interpolation (`lerp: 0.15`).
  - Scales to **2.5×** on hover over any button, link, or card.
  - Native cursor hidden on fine-pointer devices; touch devices fall back smoothly to default touch pointers.

---

## ⚡ Functional Features & Interactive Walkthrough

Every button, card, and icon on the website is completely functional:

1. **Header & Full-Screen Overlay**:
   - Logo `nx` smooth-scrolls to the top.
   - `+` menu button rotates 135° and opens a full-screen black menu overlay with 9vw staggered links.
   - Pressing `Escape` or clicking any link smoothly navigates to the section.

2. **Hero Staggered Letter Rise**:
   - The headline *"Support, reimagined."* splits into individual character spans rising from `translateY(100%)` with a 45ms per-character delay.
   - Line wrappers include bottom padding to preserve descenders in letters `"g"` and `"p"`.
   - Includes action buttons: **Try Live Prototype →** and **Explore 6 Modules ↓**.

3. **Infinite Marquee ("The life of a ticket")**:
   - 30s linear continuous loop with asymmetric card radii (`3n+1`, `3n+2`, `3n`).
   - Pauses on container hover; cards transition from 100% grayscale to vibrant color on hover.
   - Clicking any step card launches the live step simulator (Intake, Categorisation, Urgency countdown, AI Summary, Suggested Reply, and Lifecycle tracker).

4. **"Today's pain." Interactive Drawers**:
   - Clicking any of the 5 pain rows (*Lost*, *Queued*, *Repeated*, *Unseen*, *Blind*) reveals NexusAI's exact engineering solution drawer.

5. **"What we built." 6 Interactive Modules**:
   - **Customer Ticket Portal**: Working ticket submission form and search bar.
   - **Agent Dashboard**: Priority inbox queue (P1, P2, P3) with ticket assignment.
   - **AI Triage Engine**: Live semantic classifier with custom inputs and confidence scoring.
   - **Suggested Replies**: Tone switcher (*Empathetic*, *Concise*, *Formal*) and 1-click response approval.
   - **Knowledge-Base Chatbot**: Working chat assistant with documentation citations and human handover fallback.
   - **Manager Overview**: Operations board with 7D/30D/90D filters and interactive daily volume bar chart.

6. **"Five goals." Automated Verification**:
   - Clicking any goal row runs the synthetic test pipeline and displays verification metrics.

7. **Floating AI Assistant & Toasts**:
   - Persistent `Ask NexusAI` floating pill in the bottom right corner opens the instant support chatbot from anywhere on the page.
   - Real-time toast notifications confirm ticket creation, draft dispatch, and demo bookings.

---

## 📄 License
MIT License. Created for low-code AI product prototyping demonstration.
