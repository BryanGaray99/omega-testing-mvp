# Omega Testing

**Local dashboard for API testing administration.** Manage projects, register endpoints, create and run test cases and test suites, track bugs, and monitor test executions—all from your browser, with a NestJS backend and optional AI-assisted test generation.

[npm](https://www.npmjs.com/package/omega-testing-mvp)

### Install from npm

```bash
npm install omega-testing-mvp
npx omega-testing-mvp start-local
```

**Package:** [omega-testing-mvp](https://www.npmjs.com/package/omega-testing-mvp) · Runs the app (frontend + backend) and opens the browser. Use `--no-open` to skip. More options in [Using as npm Package](#using-as-npm-package).

---

## Table of Contents

- [Install from npm](#install-from-npm)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Development](#development)
- [Build & Production](#build--production)
- [Using as npm Package](#using-as-npm-package)
- [Testing](#testing)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Dashboard** — Welcome and key metrics: total projects, endpoints, success rate, passed/failed tests, average execution time.
- **Projects** — Top-level containers with name, base URL, base path, and type (Playwright BDD or API-only). Create, edit, run tests, or open in VS Code/Cursor.
- **Endpoints** — Register API routes (path + HTTP methods), section/entity, analyze APIs, and generate testing artifacts.
- **Test Cases** — Create and run individual API tests (positive/negative). Use predefined steps, AI generation, or AI suggestions; scenario editor with Given/When/Then.
- **Test Suites** — Group test cases (test sets) or test sets (test plans). Run suites and view executions.
- **Bugs** — Defect records linked to projects and optional failed executions; severity, priority, status, Jira link.
- **Test Executions** — List every run (by test case or suite). Filter by status, entity, date; view details, logs, and statistics.
- **AI Assistant** — OpenAI-powered test generation and suggestions (requires API key in Settings).
- **Settings** — OpenAI configuration, appearance (light/dark), Danger Zone (reset all data).
- **In-app Documentation** — Full reference for every page and action (Settings → Documentation).

Demo screenshot:

![Omega Testing dashboard](https://github.com/BryanGaray99/omega-testing-mvp/blob/main/resources/Dashboard.png)

The backend generates Playwright + Cucumber (BDD) projects with ready-to-run structure and exposes a **REST API** with **Swagger** at `/docs`.

---

## Quick Start

From the repo root:

```bash
npm install
npm run dev
```

- **App:** [http://localhost:5173](http://localhost:5173)  
- **API:** [http://localhost:3000](http://localhost:3000)  
- **Swagger:** [http://localhost:3000/docs](http://localhost:3000/docs)

Then: create a project → register endpoints → create test cases → run tests → view executions (or use the in-app Documentation for step-by-step flows).

---

## Architecture

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, TanStack Query, Radix UI. Dev server proxies `/v1/api` to the backend.
- **Backend:** NestJS 11, TypeScript, TypeORM (SQLite), Swagger, Helmet, Compression. API base: `/v1/api`.
- **Data:** SQLite at `<playwright-workspaces>/central-backend.sqlite`. Playwright workspaces live **outside** the repo (e.g. sibling folder `playwright-workspaces`).

Modules: workspace management, projects, endpoints, test-cases, test-suites, test-execution, bugs, AI (OpenAI), sync.

---

## Development

```bash
npm run dev
```

Starts frontend and backend in parallel with unified logs. No need to run each app separately.

- Frontend: `apps/frontend` (Vite)  
- Backend: `apps/backend` (NestJS, `npm run start:dev` under the hood)

---

## Build & Production

Build once, then start as many times as you need:

```bash
npm run build    # Build frontend + backend → dist/
npm run start    # Serve from dist/ (frontend 5173, backend 3000)
```

- **Frontend** is served from `dist/frontend/` (static).  
- **Backend** runs from `dist/backend/`; Swagger at [http://localhost:3000/docs](http://localhost:3000/docs).  
- **Test report:** If you ran `npm run test:all` before building, the existing test results are copied into `dist/backend/test-results/`, so **Settings → Tests Report** still shows results after build or when using the npm package.

---

## Using as npm Package

Install and run the app from any directory:

```bash
npm i omega-testing-mvp
npx omega-testing-mvp start-local
```

Or with custom ports:

```bash
omega-testing-mvp split --frontend-port 5173 --port 3000
```

- `start-local` uses split mode, opens the browser by default; use `--no-open` to disable.  
- Playwright workspaces default to a sibling folder of the installed package; override with `--workspace-path` or `PLAYWRIGHT_WORKSPACES_PATH`.

---

## Testing

```bash
npm run test:all
```

Runs:

- **Backend unit** — Jest, controllers/services/DTOs.  
- **Backend E2E** — Supertest, full API flows.  
- **Frontend Lighthouse** — Playwright + Lighthouse (Performance, Accessibility, Best Practices, SEO) on key screens.

Results are written to `apps/backend/test-results/` and `apps/frontend/test-results/`. The **Settings → Tests Report** page (and `/v1/api/test-report`) reads these; they are preserved in `dist/backend/test-results/` when you run `npm run build`, so the built app and npm package keep showing the latest report.

---

## Configuration


| Variable                     | Description                                                   |
| ---------------------------- | ------------------------------------------------------------- |
| `PORT`                       | Backend port (default `3000`)                                 |
| `PLAYWRIGHT_WORKSPACES_PATH` | Path for workspaces and SQLite DB                             |
| `OPENAI_API_KEY`             | Optional; enables AI features (or set in Settings → OpenAI)   |
| `VITE_API_URL`               | Frontend API base (e.g. for build; default uses proxy in dev) |


---

## Project Structure

```
omega-testing-mvp/
├── apps/
│   ├── frontend/          # React + Vite (client + optional server build)
│   └── backend/           # NestJS API
├── bin/
│   ├── omega-testing.js   # CLI (start-local, split, info)
│   └── static-frontend.js # Static server for split mode
├── dist/                  # Output of npm run build (frontend + backend + test-results)
├── scripts/
│   ├── build.js           # Build frontend + backend
│   ├── copy-builds.js     # Copy builds + existing test-results to dist/
│   ├── start-prod.js      # Start production (split mode)
│   └── start-dev.js       # Dev with unified logs
└── package.json
```

---

## Troubleshooting

- **Frontend not reachable (Windows):** Use `node bin/omega-testing.js split ...` to avoid path/shell issues.  
- **Database:** SQLite is created under the workspaces directory; set `PLAYWRIGHT_WORKSPACES_PATH` if needed.  
- **No test report after build:** Run `npm run test:all` before `npm run build` so results are copied to `dist/backend/test-results/`.

---

## Publishing to npm

- Remove `"private": true` in `package.json` if present.  
- `npm run build` (includes `prepublishOnly`).  
- `npm version patch -m "fix: ..."` then `npm publish --access public`.  
- Users run: `npx omega-testing-mvp start-local` or `omega-testing-mvp split`.

---

**Author:** Bryan Enrique Garay Benavidez — [b.garay.adm@gmail.com](mailto:b.garay.adm@gmail.com)  

Universidad Internacional SEK · Software Engineering Degree Thesis