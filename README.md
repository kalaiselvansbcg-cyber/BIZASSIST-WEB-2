# BIZASSIST AI — Customer Support Platform

A modern, accessible, single-file landing page and working prototype for **BIZASSIST AI**, an AI-assisted customer support platform where customers raise tickets and AI categorises, prioritises, summarises, and suggests replies.

**GitHub Repository**: [https://github.com/kalaiselvansbcg-cyber/BIZASSIST-WEB-2](https://github.com/kalaiselvansbcg-cyber/BIZASSIST-WEB-2)

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
├── api/
│   └── chat.js               # Production Vercel Serverless Function (SSE streaming & tool calling)
├── knowledge/
│   └── bizassist.md          # Grounded Markdown knowledge base for the AI Assistant
├── prompts/
│   └── system.md             # Strict AI Assistant system prompt
├── index.html                # Main landing page with upgraded streaming AI Chat Assistant
├── login.html                # Dedicated single-file accessible authentication screen
├── portal.html             # Customer Ticket Portal (Ticket intake, live milestone tracker, search)
├── agent-dashboard.html    # Agent Dashboard (Split-pane inbox queue, customer 360, SLA countdown)
├── ai-triage.html          # AI Triage Engine (Real-time NLP classification, entity extractor, routing)
├── suggested-replies.html  # Suggested Replies Studio (Tone switcher, variable chips, RAG citations)
├── chatbot.html            # Knowledge-Based Chatbot (Vector doc index, AI chat, human handover)
├── manager-overview.html   # Manager Overview & Analytics (KPIs, 7-day throughput chart, agent roster)
├── css/
│   └── styles.css          # Design system tokens, typography, layout, and animations
├── js/
│   ├── assets.js           # Vector SVG illustrations & data URI generation
│   ├── main.js             # Core UI controller (custom difference cursor, nav, toasts, reveals)
│   ├── interactive.js      # Working prototype simulations, routing & form handlers
│   └── supabase-client.js  # Live Supabase backend sync
├── .env.example              # Environment variables template for LLM provider
├── .gitignore              # Standard Git ignore rules
├── package.json            # ES module manifest for Vercel Serverless Functions
└── README.md               # Project documentation and guide
```

---

## 🌐 Platform Modules & Links

Each of the platform modules and authentication screen has its own dedicated page with live data, interactive forms, and direct actions:

| Module | File | Local HTTP Link | Description |
|---|---|---|---|
| **0. Sign In / Authentication** | [`login.html`](file:///d:/zeni/login.html) | [http://localhost:3000/login.html](http://localhost:3000/login.html) | Single-screen accessible login with 4-role switcher (Customer, Agent, Admin, Manager), validation, password reveal, and role routing. |
| **1. Customer Ticket Portal** | [`portal.html`](file:///d:/zeni/portal.html) | [http://localhost:3000/portal.html](http://localhost:3000/portal.html) | Self-service intake form, active milestone tracker (Submitted → Triaged → Fix Approved → Resolved), knowledge base search bar, and ticket history. |
| **2. Agent Dashboard** | [`agent-dashboard.html`](file:///d:/zeni/agent-dashboard.html) | [http://localhost:3000/agent-dashboard.html](http://localhost:3000/agent-dashboard.html) | 3-pane agent workspace, filterable queue (P1/P2/Resolved), Customer 360 card, SLA countdown timer, AI draft injector, and Tier-3 escalation. |
| **3. AI Triage Engine** | [`ai-triage.html`](file:///d:/zeni/ai-triage.html) | [http://localhost:3000/ai-triage.html](http://localhost:3000/ai-triage.html) | Interactive NLP workbench with sample presets, entity tagger, confidence breakdown bar chart, priority regressor, and live streaming event log. |
| **4. Suggested Replies Studio** | [`suggested-replies.html`](file:///d:/zeni/suggested-replies.html) | [http://localhost:3000/suggested-replies.html](http://localhost:3000/suggested-replies.html) | Human-in-the-loop draft studio, 4 tone pills (*Empathetic*, *Concise*, *Executive*, *Technical*), dynamic variable tokens, and RAG citations. |
| **5. Knowledge-Based Chatbot** | [`chatbot.html`](file:///d:/zeni/chatbot.html) | [http://localhost:3000/chatbot.html](http://localhost:3000/chatbot.html) | Conversational assistant grounded in 12,840 vector embeddings, quick chips, formatted code/guidelines, feedback buttons, and 1-click human agent handover. |
| **6. Manager Overview** | [`manager-overview.html`](file:///d:/zeni/manager-overview.html) | [http://localhost:3000/manager-overview.html](http://localhost:3000/manager-overview.html) | Executive analytics command center, 24h/7d/30d/90d toggles, 5 KPI cards, interactive 7-day ingestion/deflection bar chart, and 6-agent roster table. |

---

## 🐙 Uploading to GitHub

To upload this project to your GitHub account:

```bash
# 1. Create a new repository on github.com (e.g. "nexusai-platform")
# 2. In your terminal inside d:\zeni:
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
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

## 🗄️ Supabase Backend Integration

The project is connected live to Supabase:
- **Project URL**: `https://imhfqkepsepiscyceoyk.supabase.co`
- **Project Ref**: `imhfqkepsepiscyceoyk`
- **Client Service**: [`js/supabase-client.js`](file:///d:/zeni/js/supabase-client.js)
- **Environment Config**: [`.env`](file:///d:/zeni/.env) & [`.env.example`](file:///d:/zeni/.env.example)

### Active Supabase Database Tables:
1. `public.tickets`: Stores customer tickets with code (`#NX-4092`), category, priority (P1-P3), SLA countdown, and AI inference metadata.
2. `public.ticket_messages`: Stores message threads and agent replies for each ticket.
3. `public.chat_messages`: Logs knowledge base chatbot queries, vector citation references, and user feedback.
4. `public.knowledge_articles`: Stores indexed engineering & support documentation articles with citations.
5. `public.demo_requests`: Captures lead bookings and demonstration requests submitted via landing page modals.

Row Level Security (RLS) is enabled across all tables with public policies configured for real-time customer and agent prototype interaction.

---

## 🤖 Production AI Assistant & Serverless Backend

The floating assistant widget is powered by a serverless function (`/api/chat.js`) supporting real natural language interactions, Server-Sent Events (SSE) streaming, tool calling, and rate limiting.

### 1. Setting Environment Variables on Vercel
1. Go to your project on the [Vercel Dashboard](https://vercel.com/dashboard).
2. Navigate to **Settings** → **Environment Variables**.
3. Add the following variables for **Production** and **Preview**:
   - `LLM_PROVIDER`: `google` (or `anthropic`, `openai`)
   - `LLM_API_KEY`: Your model API key
   - `LLM_MODEL`: `gemini-1.5-flash` (or `claude-3-5-haiku-20241022`, `gpt-4o-mini`)
4. Trigger a redeployment or push to `main` for the variables to take effect.

### 2. Running Locally with API Support
```bash
# 1. Copy template to local env file
cp .env.example .env.local

# 2. Start the local development server (supports /api/chat routing)
node scratch/server.cjs
```
Visit `http://localhost:3000` to interact with the streaming chat widget.

### 3. How to Edit the Knowledge Base
Edit [`knowledge/bizassist.md`](file:///d:/zeni/knowledge/bizassist.md). Any updates to platform features, metrics, or integration support are immediately injected into the serverless function's system prompt on subsequent requests.

### 4. How to Change the AI Model
Set `LLM_PROVIDER` and `LLM_MODEL` in your environment variables. `api/chat.js` natively supports Google Gemini (`google`), Anthropic (`anthropic`), and OpenAI (`openai`) behind a single unified `callModel()` pipeline with zero dependencies.

---

## 📄 License
MIT License. Created for low-code AI product prototyping demonstration.
