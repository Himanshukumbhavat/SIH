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

The backend uses MongoDB for authenticated case, user, document, and activity
routes. Start MongoDB locally and set `MONGODB_URI` in `backend/.env` before
using those routes. The health endpoint still starts without MongoDB so the
server can be checked independently. If port 3001 is already in use, stop the
old Node process or change `PORT` in `backend/.env`.

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

## Two-step sign-in

The demo login now requires a six-digit TOTP code from an authenticator app
(Google Authenticator, Microsoft Authenticator, or Authy). On the first login,
copy the displayed setup key into the authenticator app; later logins only ask
for the rotating code. Five invalid codes end the pending sign-in attempt.

This is a frontend demo implementation. Production security must move user
authentication, TOTP secrets, sessions, and rate limiting to the backend over
HTTPS; never store TOTP secrets in browser storage for a real deployment.