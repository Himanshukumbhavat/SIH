# DEMS — Digital Evidence Management System

A clean React frontend and Node.js backend for the **Digital Evidence Management
System**, built for Smart India Hackathon 2026.

The UI uses mock data for a complete evidence-management demo.

## Pages

| Route | Page | Notes |
|------|------|-------|
| `/` | Landing | Public portal — hero + features |
| `/login` | Sign in | Pick a demo role (viewer / officer / investigator / admin) |
| `/dashboard` | Dashboard | KPIs, case overview, case-load trend, activity feed |
| `/cases` | Cases | Searchable, filterable case list |
| `/documents` | Evidence | File library + real in-browser SHA-256 hashing |
| `/activity` | Activity | Chain-of-custody audit feed |

## Tech stack

Frontend: Vite · React 18 · React Router · Tailwind CSS · Recharts  
Backend: Node.js HTTP API

## Run it

```bash
npm install
npm run dev
```

This starts both services:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:3001/api/health

Build the frontend with `npm run build`.

## Project structure

```
frontend/
  package.json              Frontend dependencies and package metadata
  index.html
  vite.config.js
  tailwind.config.js
  postcss.config.js
  src/
    main.jsx                 React entry point
    App.jsx                  Routes and route guard
    index.css                Design system
    data/mockData.js         Demo roles, cases, documents, activity, trends
    context/AuthContext.jsx  Demo session and permissions
    lib/hash.js              Browser SHA-256 hashing
    components/              Reusable UI components
    pages/                   Application pages

backend/
  package.json               Backend package metadata
  server.js                  Node.js API and health endpoint

scripts/
  dev.js                     Starts frontend and backend together
```

The current application intentionally uses demo data in the frontend. The
backend is separated and ready for real authentication, database, case, and
document endpoints to be added without mixing server code into the UI.