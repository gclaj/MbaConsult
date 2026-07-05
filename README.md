# AdComPilot — MBA Consultant & AdCom

An AI application that acts as both a top-tier MBA admissions consultant and a
seasoned AdCom member for any target school. Powered by Claude Opus 4.8 with
live web search.

## What it does

1. **Profile** — you enter your target program, stats (GPA, GMAT/GRE, work
   experience), goals, leadership/community background, and a writing sample
   (used to match your voice).
2. **School Research** — Claude researches the school live on the web: the
   current cycle's essay prompts and requirements (verbatim), the Class
   Profile, the employment report, institutes & centers, clubs, culture, and
   ClearAdmit / AdCom commentary — and structures it into a dossier.
3. **Fit Profile** — cross-references your profile against the dossier and
   scores fit (0–100) across six dimensions: academic readiness, professional
   trajectory, leadership evidence, community/values alignment, goals ↔
   employment-pipeline fit, and uniqueness of contribution. Includes strengths,
   gaps, positioning, and a per-essay strategy with the story types each essay
   needs.
4. **Story Interview** — asks tailored behavioral questions per essay. Every
   story you tell is scored against the school's fit profile. Weak-fit stories
   get honest pushback plus a suggestion for the type of story that would show
   deeper fit; you can revise, replace, or override.
5. **Essays** — generates final essay drafts in *your* voice (analyzed from
   your writing sample), weaving your accepted stories together with specific
   school detail (institutes, clubs, culture) and respecting word limits.
   Iterate with free-form revision requests.

All progress is saved in your browser (localStorage).

## Setup

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

Requirements: Node 20+, an Anthropic API key with access to Claude Opus 4.8
and the web search server tool.

## Architecture

- **Next.js 15 (App Router) + TypeScript**, no external UI deps.
- `app/api/research` — Claude + `web_search_20260209` server tool streams a
  research dossier (SSE), then a second structured-output call converts it to
  typed `SchoolIntel` JSON.
- `app/api/fit` — structured-output call producing the `FitProfile`.
- `app/api/interview` — two actions: `generate_questions` (per-essay,
  fit-aware question plan) and `evaluate_answer` (story fit scoring with
  pushback / alternative-story suggestions).
- `app/api/essays` — streaming essay generation with voice matching, story
  weaving, and revision support.
- All calls use `claude-opus-4-8` with adaptive thinking; structured outputs
  use `output_config.format` JSON schemas (`lib/schemas.ts`).
