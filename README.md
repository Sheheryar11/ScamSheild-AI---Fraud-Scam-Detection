# ScamShield AI — Fraud & Scam Detection System

Paste any suspicious message — a fake investment offer, prize-winning SMS, bank phishing link, or JazzCash/Easypaisa fraud attempt — and ScamShield AI analyzes it for scam intent, assigns a risk score, and explains the red flags in plain language.

## Tech stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS v4, ShadCN-style UI primitives, Framer Motion
- **Backend:** Next.js API routes (Node runtime)
- **AI layer:** Google Gemini API (`gemini-2.5-flash`, free tier) via REST, with a deterministic rule-based heuristic engine as fallback
- **Database:** Postgres via [Neon](https://neon.tech) (serverless, free tier) using `@neondatabase/serverless` (scan history)

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

- **`GEMINI_API_KEY`** — free key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey). If missing, or the Gemini call fails for any reason (rate limit, network error, malformed JSON), `/api/analyze` transparently falls back to the built-in rule-based heuristic engine — the user never sees an error.
- **`DATABASE_URL`** — free Postgres connection string from [neon.tech](https://neon.tech). Required for scan history (`/history`) to persist; the `scans` table is created automatically on first use.

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
      analyze/route.ts        POST — runs AI analysis, persists, returns result
      history/route.ts        GET/DELETE — list / remove past scans
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
      prompt.ts                 System + user prompt sent to Gemini
      analyze.ts                Orchestrates Gemini call → JSON parse → fallback
      heuristics.ts              Rule-based scam detector (works with no API key)
```

### Request pipeline (input → LLM → UI)

1. User pastes a message into the textarea.
2. `Analyzer` posts `{ message }` to `POST /api/analyze`.
3. The route calls `analyzeMessage()`, which sends the message to Gemini with a strict JSON-only system prompt (see `src/lib/ai/prompt.ts`). If Gemini is unavailable or returns invalid JSON, the heuristic engine (`heuristics.ts`) scores the message using weighted regex rules tuned for Pakistan-specific fraud patterns (Easypaisa/JazzCash, OTP/CNIC harvesting, fake prize draws, guaranteed-return investment scams).
4. The result is persisted to Neon Postgres (`saveScan`) and returned to the client.
5. The UI animates in: a circular risk meter, a Safe/Suspicious/Dangerous badge, an animated confidence bar, red flag cards, suspicious phrase chips, a chat-style explanation box, and safety recommendations.
6. `/history` reads all past scans server-side from Postgres and renders them with delete support.

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
