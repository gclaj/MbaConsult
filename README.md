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

## Built-in application playbooks

`knowledge/` holds per-school playbooks (from the owner's MBA master research
doc): Tuck, Columbia, Wharton, Booth, Kellogg, and Duke Fuqua. When the target
school matches one, its insider guidance — the brand traits the AdCom screens
for, essay-by-essay advice and traps, interview/recommendation strategy — is
automatically injected into the research extraction, fit analysis, story
interview, and essay generation. Add more schools by dropping a `<key>.md`
file in `knowledge/` and registering aliases in `lib/knowledge.ts`.

`knowledge/candidate.md` holds standing strategic context about the candidate
(application history, reapplicant status, career thesis, narrative guidance).
It is injected alongside the profile form into fit analysis, the story
interview, and essay generation — edit it as your strategy evolves.

## Setup

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

Requirements: Node 20+, an Anthropic API key with access to Claude Opus 4.8
and the web search server tool.

## Deploy on Railway

The repo is Railway-ready (`railway.json`; the start script binds Railway's
`$PORT`). One-time setup:

1. In Railway: **New Project → Deploy from GitHub repo** → select
   `gclaj/MbaConsult`, branch `claude/mba-essay-generator-kn7nbu` (or your
   default branch after merging).
2. In the service → **Variables**, add:
   `ANTHROPIC_API_KEY = sk-ant-...` (your key — set it here, never in code:
   GitHub scans for Anthropic keys and they get revoked if committed).
3. Deploy. Railway builds with `npm run build` and runs `npm run start`.
   Every push to the connected branch auto-deploys.
4. Optional: Settings → Networking → **Generate Domain** for a public URL.

Note: long research/essay requests stream for several minutes; Railway's
always-on server handles this fine (no serverless timeout).

**Access control:** the app has no login. Anyone with the URL can use it and
spend against your API key — and the Chris profile's context is visible to
anyone who opens it. Keep the URL private, or ask for basic-auth to be added
before sharing it.

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
