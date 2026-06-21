# project-dashboard-api

Tiny Railway API for the project dashboard.

## Purpose

Provides shared persistence for:
- forward-work item status / notes
- forward-work ordering
- project runsheet entries

Each write stores a timestamp and user name.

## Environment

Required:
- `DATABASE_URL` - Railway Postgres connection string

Optional:
- `PORT` - defaults to `3001`
- `ALLOWED_ORIGIN` - e.g. `https://deliver-different-testing.github.io`

## Start

```bash
cd api
npm install
npm start
```

## Railway

Recommended service setup:
- Root Directory: `api`
- Build Command: `npm install`
- Start Command: `npm start`

## Frontend

Set this in the frontend build environment:

- `VITE_PROJECT_DASH_API_URL=https://<your-railway-service>.up.railway.app`

Once set, the GitHub Pages dashboard will use the shared API instead of local browser storage.
