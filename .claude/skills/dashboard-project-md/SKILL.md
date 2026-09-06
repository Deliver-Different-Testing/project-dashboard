---
name: dashboard-project-md
description: >-
  How we write a developer handover / overview Markdown doc for a DFRNT project and make it
  show up on the project dashboard. Use this whenever someone asks to "write an MD for
  <developer>", "add a project to the dashboard", "make this available to Garry/Kevin/Kerran/Jacob
  on his dashboard", "put a handover on the dashboard", or otherwise wants a project write-up that a
  developer will find and link to. Trigger it even if the person only says "save an MD for X" — on
  this team an MD for a developer means a doc in the project's own repo PLUS a project card on the
  dashboard, not a loose file. Also use it when updating an existing dashboard project card.
---

# Surfacing a project MD on the DFRNT dashboard

## The one thing to get right

The dashboard is **not** a folder of Markdown files. Dropping an `.md` into the
`project-dashboard` repo does **not** make it appear. The dashboard is a React app whose
project list is a hardcoded array in `src/App.tsx` on the **`master`** branch, deployed to
GitHub Pages. A Railway Postgres database sits on top for mutable per-developer state
(forward-work item status/notes, release notes) — but the **projects themselves live in
code**, not the database.

So "put an MD on <dev>'s dashboard" is two deliverables:

1. **The MD** — written into the *project's own* repo under `docs/` (the repo the doc is
   about, e.g. `dfrntdrive_scanning`, `Accounts`, `routed-operations`), so the doc lives
   with the code it describes.
2. **A project card** — an entry in the `projects` array in `project-dashboard/src/App.tsx`
   on `master`, owned by that developer, with a short summary and a `docs:` link pointing at
   the MD's GitHub URL.

Do both. One without the other either hides the doc (no card) or links to nothing (no MD).

## Branch awareness — important

`project-dashboard` has several branches that are **different products**:

- **`master`** — the project dashboard (this is what you edit; GitHub Pages builds from it).
- **`main`** — the Automation Engine app. Not the dashboard. Do not put dashboard changes here.
- `gh-pages` — build output. Never edit by hand.

Always confirm you're on `master` before touching `src/App.tsx`. A card committed to `main`
will never appear on the dashboard.

## Step 1 — Write the MD in the project's repo

Put a single overview/handover doc in that repo's `docs/` folder. A good name follows the
team convention seen across repos: `HANDOVER-<DEV>.md`, or `STEVE-<TOPIC>-<DEV>-<YYYY-MM-DD>.md`
for a dated, from-Steve-to-<dev> note. Keep it a genuine overview a developer can act on:

- **TL;DR** — what this is and its current state, in two lines.
- **Why** — the business reason (cost saved, problem solved), with the concrete number if there is one.
- **What's here** — a small table of the repo's projects/folders and what each is.
- **How to wire it in / how to use it** — the actual next steps.
- **Verified vs not** — be honest about what compiles/tests/passed and what still needs a real run.
- **What I need from you** — anything blocking (repo access, a decision, a deadline).

Commit and push to that repo's default branch. Note the raw GitHub URL of the file — you'll
link it from the card. The URL shape is:
`https://github.com/Deliver-Different-Testing/<repo>/blob/<branch>/docs/<file>.md`

## Step 2 — Add the project card on `master`

In `project-dashboard/src/App.tsx`, the `projects` array holds one object per project. The
type (top of the file) is:

```ts
type DevKey = 'garry' | 'kevin' | 'kerran' | 'jacob' | 'strategy'

interface Project {
  name: string
  emoji: string
  slug: string                       // kebab-case, unique
  status: 'Active' | 'Complete' | 'Paused'
  description: string                // the short summary shown under the card
  owner: DevKey                      // whose tab it appears on
  live?: string                      // deployed URL, if any
  repo?: string                      // GitHub repo URL
  docs?: string                      // <-- link to the MD from Step 1
  extraLinks?: { label: string; emoji: string; url: string }[]
}
```

Insert a new entry next to that developer's other projects. Match the exact one-line shape
of the surrounding entries — the array is dense and consistent, so a well-formed sibling is
the safest edit. Example (the DFRNT Drive Scanning card that established this pattern):

```ts
{ name: 'DFRNT Drive Scanning', emoji: '📷', slug: 'dfrntdrive-scanning', status: 'Active', owner: 'garry', description: 'Self-owned MAUI scanning library (barcode/QR, PDF docs, pallet Matrix Scan) to replace Scanbot (~US$30k/yr). Core logic built and unit-tested; ready to wire into the Drive app.', repo: 'https://github.com/Deliver-Different-Testing/dfrntdrive_scanning', docs: 'https://github.com/Deliver-Different-Testing/dfrntdrive_scanning/blob/main/docs/HANDOVER-GARRY.md' },
```

Keep `description` to one or two sentences — it's the summary under the card, not the whole
story. The full story is the MD you link in `docs:`.

For a doc that lives in the dashboard repo's own `docs/` folder there are `*_DOC(f)` URL
helpers near the top of `App.tsx` (e.g. `CONFIG_DOC`, `ROUTED_OPS_DOC`); most cards just
inline the full GitHub URL, which is fine.

## Step 3 — Validate and push

- The change is a single object literal; the biggest risk is a syntax slip. If `node_modules`
  is present, `npx tsc --noEmit` is the quick check. If not, re-read your inserted line against
  its siblings — every field valid, `owner` a real `DevKey`, `status` one of the three values,
  string quotes balanced.
- Commit and push to `master`. GitHub Pages redeploys automatically; the card appears after
  the build finishes.
- Never edit `gh-pages`. Never push dashboard changes to `main`.

## Optional — announce it in Railway (only if asked)

The dashboard also reads per-developer **release notes** from the Railway API. Projects and
forward-work items are code (Steps 1–2); release notes are pure database rows and are the
right tool only when the ask is specifically "post an announcement/note to <dev>", not "add
a project". The API base is `VITE_PROJECT_DASH_API_URL` (a public Railway URL used by the
Pages build; the value is in the frontend build env, not a secret to hunt for in `.env`).
Relevant endpoint: `POST /api/release-notes/<devKey>/entries` with `{ title, body, createdBy }`.
Writing to it is a production database write — confirm with the user before doing it, and
don't reach for it unless a project card is the wrong fit.

## Common mistakes this skill exists to prevent

- Committing the MD only into `project-dashboard` and expecting it to show — it won't; the
  dashboard renders the `projects` array, not repo files.
- Editing `main` (Automation Engine) instead of `master` (dashboard).
- Writing a huge card `description` instead of a short summary + a linked MD.
- Linking `docs:` to a file that isn't pushed yet, or to the wrong branch (`main` vs `master`
  vs `master`-of-another-repo) — always paste the URL of the file you actually pushed.
