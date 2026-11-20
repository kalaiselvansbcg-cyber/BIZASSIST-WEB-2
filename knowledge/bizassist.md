# BizAssist AI Knowledge Base

## Product Overview
BizAssist AI is an AI-assisted customer support platform designed for modern support teams and enterprise organizations. It automates ticket intake, natural language classification (NLP), priority triage, issue summarization, contextual draft replies, and real-time status tracking so support agents and managers resolve inquiries faster and with higher customer satisfaction.

## Core Ticket Lifecycle (6 Stages)
1. **Raised**: Inbound inquiry submitted via customer portal, API, email, or chat widget.
2. **Categorised**: Deep learning NLP model extracts key entities and tags category (Billing & Payments, API & Infrastructure, Account & Security, General Technical).
3. **Prioritised**: SLA regressor evaluates urgency (Normal / P3, High / P2, Urgent / P1) and sets response SLA timer (e.g., 15 minutes for Urgent P1).
4. **Summarised**: AI generates an executive 2-line technical abstract of the issue.
5. **Reply Suggested**: Grounded drafts prepared for agent review with tone selection (Friendly, Formal, Short, Empathetic, Technical).
6. **Status Tracked**: Live milestone progression exposed transparently to the customer.

## Five Ticket Tracker Stages
Customers can look up any ticket code (e.g., `#BA-1042`, `#BA-2089`, `#BA-3310`) to view progress across 5 stages:
1. **Raised**: Ticket received and logged in the system.
2. **Categorised**: AI extracted entities, intent, and assigned priority.
3. **Assigned**: Routed to the specialized engineering or tier-2 support queue.
4. **Replied**: Assigned agent sent update or investigation findings.
5. **Resolved**: Solution delivered and verified; ticket closed.

### Sample Tickets in System
- **#BA-1042**: "Payment failure during enterprise renewal checkout" — Stripe transaction `ch_3Ox948aL`, Invoice `#INV-2026-904`. Status: Stage 4 (Replied). Assigned to Agent Sarah.
- **#BA-2089**: "API Gateway HTTP 500 error on webhook endpoint" — SRE cluster back-fill completed, circuit breaker restored. Status: Stage 5 (Resolved).
- **#BA-3310**: "Update invoice billing address & EU VAT number" — Tax registration updated and synchronized with invoicing database. Status: Stage 5 (Resolved).

## The Six Platform Workspaces & Pages
1. **Customer Ticket Portal (`portal.html`)**: Self-service intake form, active milestone tracker, documentation search bar, and ticket history.
2. **Agent Dashboard (`agent-dashboard.html`)**: 3-pane agent workspace with filterable queue (P1 Urgent / P2 High / Resolved), Customer 360 inspector, SLA countdown timers, and 1-click AI draft insertion.
3. **AI Triage Engine (`ai-triage.html`)**: Interactive NLP workbench with sample presets, entity tagger, confidence breakdown bar chart, priority regressor, and live streaming event log.
4. **Suggested Replies Studio (`suggested-replies.html`)**: Human-in-the-loop draft studio with tone switchers (Empathetic, Concise, Executive, Technical), dynamic variable tokens, and RAG knowledge citations.
5. **Knowledge-Based Chatbot (`chatbot.html`)**: Conversational assistant grounded in support documentation, quick chips, formatted code/guidelines, feedback buttons, and 1-click human agent handover.
6. **Manager Overview (`manager-overview.html`)**: Executive analytics command center with 24h/7d/30d/90d toggles, 5 KPI cards, interactive 7-day ingestion/deflection bar chart, and 6-agent roster table.

## Customer Problems & BizAssist Solutions
- **Lost Tickets**: Inquiries slipping through fragmented inboxes. *Solution*: Centralized intake with immediate automated ticket ID issuance.
- **Queued Tickets**: Hours spent waiting in unprioritized queues. *Solution*: Real-time NLP triage and SLA routing in <120ms.
- **Repeated Inquiries**: Agents typing the same answers repeatedly. *Solution*: Retrieval-augmented suggested replies and knowledge base deflection.
- **Unseen Bottlenecks**: Lack of visibility into queue spikes and SLAs. *Solution*: Real-time manager analytics and SLA countdown monitors.

## Project Goals (G1 to G5)
- **G1**: Instant self-service ticket intake and automated status notification.
- **G2**: Under 120ms NLP classification and SLA priority prediction.
- **G3**: Contextual AI drafts with tone customization and RAG citations.
- **G4**: Transparent 5-stage tracking for customer peace of mind.
- **G5**: Executive workforce analytics and throughput optimization.

## Key Platform Metrics
- **Average Resolution Time**: 3 minutes 12 seconds with BizAssist AI vs 48 minutes industry baseline.
- **NLP Triage Latency**: <120ms end-to-end inference.
- **First Contact Resolution (FCR)**: 68%.
- **Ticket Deflection Rate**: 42% handled through self-service and AI knowledge search.

## Verified Integrations
BizAssist AI integrates with:
- **Zendesk** (webhooks, two-way sync)
- **Freshdesk** (webhooks, ticket sync)
- **Slack** (agent alerts, collaborative triage channels)
- **Salesforce Service Cloud** (CRM record binding, bi-directional sync)

## How to Book a Demo
Visitors can click the **"Book a demo"** button located on the top navigation bar or the footer of any page. The demo request form collects:
- Full Name
- Work Email
- Company Name
- Team Size (1-10, 11-50, 51-200, 201+)
Our solutions engineering team reviews the request and sends a calendar invitation within one business day.

## Contact Information
- Support & General Inquiries: `support@bizassist.ai`
- Sales & Enterprise Demos: `demo@bizassist.ai`

---

## Not available yet
For any of the following topics, say you are not sure and offer to connect the user to a human support agent or suggest booking a demo. Do not invent details.
- Specific subscription pricing amounts or tier costs (the site states simple tier-based volume pricing; custom pricing requires booking a demo).
- Integrations beyond Zendesk, Freshdesk, Slack, and Salesforce (e.g., Jira, ServiceNow, HubSpot, Intercom) — `TODO: confirm with owner`.
- Self-hosted on-premise deployments or custom private cloud requirements — `TODO: confirm with owner`.
- Exact migration timeframes for bespoke legacy CRM systems — `TODO: confirm with owner`.
- Formal SLA credit guarantees or contractual penalty clauses — `TODO: confirm with owner`.
