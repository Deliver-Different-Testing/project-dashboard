# Project Dashboard — Handover Guide

**Date:** 2026-03-07
**Status:** ✅ Complete, deployed to GitHub Pages

---

## What It Is

Simple single-page dashboard listing all DFRNT projects with links to live demos, repos, and docs. Includes per-project runsheet (localStorage-based note-taking).

## Current State

- **Frontend-only** React 19 + Vite 7 + TypeScript, single `App.tsx` (120 lines)
- **8 projects listed**: CSP, Setup Dashboard, Agents & Partners, Reports, Dev Dashboard, Booking Redesign, Auto Dispatch, ECA Dallas
- **Runsheet feature**: Click a project card to expand, add timestamped notes (persisted in localStorage)
- **Search/filter** on runsheet entries
- Builds clean, no TS errors

## Architecture

- Everything in `src/App.tsx` — no routing, no state management library, no backend
- Project data is hardcoded in the component
- Runsheet entries stored in `localStorage` keyed by project slug

## Known Issues / Tech Debt

1. **Hardcoded project list** — Adding/removing projects requires code change
2. **localStorage only** — Runsheet notes are browser-local, not shared or backed up
3. **No README** — Only has the Vite template README, no project-specific docs

## What a Developer Needs to Know

1. `npm install && npm run dev` — that's it
2. To add a project, edit the `projects` array in `App.tsx`
3. Very simple codebase, easy to extend
