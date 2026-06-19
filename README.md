# ScamShield AI — Fraud & Scam Detection System (RAG + LLM)

Paste any suspicious message — a fake investment offer, prize-winning SMS, bank phishing link, or JazzCash/Easypaisa fraud attempt — and ScamShield AI analyzes it for scam intent, assigns a risk score, and explains the red flags in plain language. Detection is powered by a **RAG (Retrieval-Augmented Generation) pipeline**: known Pakistan-specific scam patterns are embedded and stored in Postgres (pgvector), retrieved by similarity at request time, and injected as grounding context into the Gemini LLM call.

Live Link: https://scamsheild-ai.netlify.app/

## Tech stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS v4, ShadCN-style UI primitives, Framer Motion
- **Backend:** Next.js API routes (Node runtime)
- **AI layer (LLM):** Google Gemini API (`gemini-2.5-flash`, free tier) via REST, with a deterministic rule-based heuristic engine as fallback
- **RAG layer:** Gemini embeddings (`gemini-embedding-001`) + a curated Pakistan-scam knowledge base, stored and similarity-searched via `pgvector` on Neon; retrieved context is injected into the Gemini prompt before analysis (`src/lib/rag/`)
- **Database:** Postgres via [Neon](https://neon.tech) (serverless, free tier) using `@neondatabase/serverless` (scan history + RAG vector store)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create `.env.local`:

```bash
GEMINI_API_KEY=AIza...
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

- **`GEMINI_API_KEY`** — free key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Used for both the LLM analysis call and the RAG embeddings. If missing, or the Gemini call fails for any reason (rate limit, network error, malformed JSON), `/api/analyze` transparently falls back to the built-in rule-based heuristic engine — the user never sees an error.
- **`DATABASE_URL`** — free Postgres connection string from [neon.tech](https://neon.tech). Required for scan history (`/history`) and the RAG vector store; the `scans` and `scam_knowledge` (pgvector) tables are created automatically on first use.

### Seeding the RAG knowledge base

The first time you run the app (or whenever `src/lib/rag/knowledge.ts` changes), seed the scam-pattern embeddings into Postgres:

```bash
curl -X POST http://localhost:3000/api/rag/seed
```

This embeds each knowledge-base doc with Gemini and upserts it into the `scam_knowledge` pgvector table. It's idempotent — safe to call again; it only re-embeds docs that changed.

## Architecture

### Data flow

```
┌──────────────┐      POST /api/analyze       ┌────────────────────┐
│  Browser UI   │ ────────────────────────────▶│  Next.js API route │
│  (Analyzer)   │   { message }                 │ src/app/api/analyze│
└──────▲────────┘                               └─────────┬──────────┘
       │                                                    │
       │  JSON: risk_level, risk_score,                     ▼
       │  confidence, red_flags,                  ┌────────────────────┐
       │  suspicious_phrases,                      │ analyzeMessage()   │
       │  explanation, recommendations             │ src/lib/ai/analyze │
       │                                            └─────────┬──────────┘
       │                                      has GEMINI_API_KEY?
       │                              ┌────────────────┴────────────────┐
       │                              ▼                                 ▼
       │                     ┌──────────────────┐             ┌──────────────────┐
       │                     │ Gemini API call     │  on error  │ Heuristic engine  │
       │                     │ (gemini-2.5-flash)  │ ─────────▶│ src/lib/ai/       │
       │                     │ JSON-mode prompt    │            │ heuristics.ts     │
       │                     └──────────────────┘             └──────────────────┘
       │                              │                                 │
       │                              └────────────┬────────────────────┘
       │                                            ▼
       │                                  saveScan() → Neon Postgres
       └────────────────────────────────────────────┘
```

### Folder structure

```
src/
  app/
    layout.tsx              Root layout: fonts, ThemeProvider, Nav
    page.tsx                Home page (Analyzer + SafetyTips)
    globals.css             Tailwind v4 theme tokens, dark mode variant, gradient bg
    history/
      page.tsx               Server component (force-dynamic): reads scan history from Postgres
    api/
      analyze/route.ts        POST — runs RAG retrieval + AI analysis, persists, returns result
      history/route.ts        GET/DELETE — list / remove past scans
      rag/seed/route.ts        POST — embeds and (re)seeds the scam knowledge base into Postgres
  components/
    analyzer.tsx              Main client component: input, results
    risk-meter.tsx             Animated circular risk gauge (Framer Motion + SVG)
    red-flag-card.tsx          Red flag card with icon + stagger animation
    safety-tips.tsx            Pakistan-specific scam awareness section
    history-list.tsx           Client list with delete for /history
    nav.tsx / theme-toggle.tsx / theme-provider.tsx
    ui/                        button, card, textarea, progress, badge (ShadCN-style)
  lib/
    types.ts                   AnalysisResult / ScanRecord types
    db.ts                       Neon Postgres client + CRUD for scans
    utils.ts                    cn() class merge helper
    ai/
      prompt.ts                 System + user prompt sent to Gemini (RAG context injected here)
      analyze.ts                Orchestrates RAG retrieval → Gemini call → JSON parse → fallback
      heuristics.ts              Rule-based scam detector (works with no API key)
      embeddings.ts              Gemini embeddings client (gemini-embedding-001)
    rag/
      knowledge.ts               Curated Pakistan-scam pattern knowledge base (RAG source docs)
      store.ts                   pgvector table + seed + similarity retrieval (Neon Postgres)
```

### Request pipeline (input → RAG → LLM → UI)

1. User pastes a message into the textarea.
2. `Analyzer` posts `{ message }` to `POST /api/analyze`.
3. The route calls `analyzeMessage()`, which first runs the **RAG retrieval step**: the message is embedded (`src/lib/ai/embeddings.ts`) and compared via cosine similarity against the scam-pattern knowledge base stored in Postgres/pgvector (`src/lib/rag/store.ts`). The top matching patterns are injected as extra context into the Gemini prompt (`src/lib/ai/prompt.ts`).
4. Gemini (`gemini-2.5-flash`) returns a strict JSON-only response grounded in that retrieved context. If Gemini is unavailable, returns invalid JSON, or retrieval fails, the heuristic engine (`heuristics.ts`) scores the message using weighted regex rules tuned for Pakistan-specific fraud patterns (Easypaisa/JazzCash, OTP/CNIC harvesting, fake prize draws, guaranteed-return investment scams) as a fallback.
5. The result is persisted to Neon Postgres (`saveScan`) and returned to the client.
6. The UI animates in: a circular risk meter, a Safe/Suspicious/Dangerous badge, an animated confidence bar, red flag cards, suspicious phrase chips, a chat-style explanation box, and safety recommendations.
7. `/history` reads all past scans server-side from Postgres and renders them with delete support.

### Risk classification

| Score    | Level       | Color  |
|----------|-------------|--------|
| 0–30     | Safe        | Green  |
| 31–70    | Suspicious  | Yellow |
| 71–100   | Dangerous   | Red    |

## Gemini prompt (internal)

**System prompt** (`src/lib/ai/prompt.ts`):

> You are ScamShield AI, a fraud and scam detection engine specialized in financial scams, with deep knowledge of Pakistan-specific fraud patterns (Easypaisa, JazzCash, bank phishing SMS, fake prize draws, fake investment schemes, OTP/PIN harvesting scams)... Respond with ONLY valid JSON matching: `{ risk_level, risk_score, confidence, red_flags, suspicious_phrases, explanation, recommendations }`

**User prompt:**

```
Analyze the following message for scam or fraud indicators:

"""
<message>
"""

Return only the JSON object described in your instructions.
```

## Example API response

`POST /api/analyze` with:

```json
{ "message": "Congratulations! You have won PKR 2,500,000. Send Rs 3500 via Easypaisa to claim your prize immediately." }
```

returns:

```json
{
  "id": 1,
  "message": "Congratulations! You have won PKR 2,500,000. Send Rs 3500 via Easypaisa to claim your prize immediately.",
  "risk_level": "Suspicious",
  "risk_score": 56,
  "confidence": 0.82,
  "red_flags": [
    "Urgent payment or time pressure",
    "Requests upfront payment or processing fee",
    "Unsolicited prize or lottery winning notification",
    "References mobile wallet transfer (Easypaisa/JazzCash) — common scam vector in Pakistan"
  ],
  "suspicious_phrases": ["immediately", "Send Rs 3500", "Congratulations", "Easypaisa"],
  "explanation": "This message shows 4 pattern(s) commonly associated with scams...",
  "recommendations": [
    "Do not click any links or call numbers provided in the message.",
    "Never share your OTP, CVV, PIN, or CNIC with anyone.",
    "Verify directly with your bank or telecom operator using their official helpline.",
    "Report the message to your bank's fraud hotline or PTA."
  ],
  "created_at": "2026-06-17 20:48:16",
  "source": "heuristic"
}
```

## Deploying to Netlify

1. Create a free Postgres database at [neon.tech](https://neon.tech) and copy its connection string (you've already done this if you're following along with the live project).
2. Push this repo to GitHub.
3. On [app.netlify.com](https://app.netlify.com), "Add new site" → "Import an existing project" → connect the GitHub repo. Netlify auto-detects Next.js and installs its Next.js Runtime plugin — no extra config needed.
4. In Site settings → Environment variables, add `GEMINI_API_KEY` and `DATABASE_URL`.
5. Deploy. API routes run as Netlify serverless functions; Postgres (not the filesystem) is what makes scan history persist across deploys and function invocations.

## Bonus / future scope

- **Saved history** — implemented (`/history`, Postgres-backed via Neon, delete support).
- **Share result as image** — not implemented; could use `html-to-image` on the results card.
- **Browser extension** — future scope: a content script could scan SMS/clipboard text and call `/api/analyze` directly, surfacing a badge overlay for Dangerous messages.
