# Omega Testing MVP (Monorepo)

Monorepo with a React (Vite) dashboard and a NestJS backend for generating, managing, and executing API test projects using Playwright + BDD. Includes a local CLI to run production builds (monolithic or split) and a development workflow with unified logs.

NPM package: [omega-testing-mvp](https://www.npmjs.com/package/omega-testing-mvp)

## What this app does

- Centralizes API testing management in a dashboard: projects, endpoints, test cases, executions, and reports.
- Generates Playwright + Cucumber (BDD) testing projects with ready-to-run structure, configs, and helpers.
- Executes tests and streams execution events to the UI; stores results for later inspection.
- Provides AI-assisted utilities for suggesting/generating test cases (configurable via OpenAI key).
- Exposes a documented REST API with Swagger for automation and integrations.


The diagram reflects the current local architecture: React dashboard + NestJS API, with Playwright workspaces stored outside the repo, and optional future cloud/AI integrations.

## Frontend (apps/frontend)

- Stack: React 18, TypeScript, Vite, TailwindCSS, TanStack Query, Radix UI, Vitest.
- Dev server: http://localhost:5173 (proxy to backend for `/v1/api`).
- Build outputs:
  - Client SPA: `apps/frontend/dist/spa/`
  - Server node build (for SSR/static serving in original setup): `apps/frontend/dist/server/`
- Pages (examples): `Dashboard`, `Projects`, `Endpoints`, `TestCases`, `TestSuites`, `TestExecutions`, `AIAssistant`.
- API access: shared helper in `apps/frontend/shared/api.ts` and typed service hooks under `apps/frontend/client/services/*` and `apps/frontend/client/hooks/*`.
- Auth placeholder: simple local context (`client/contexts/AuthContext.tsx`) ready to integrate with your auth of choice.
- Configuration:
  - Vite dev proxy: `/v1/api` → `http://127.0.0.1:3000`
  - `VITE_API_URL` can be provided for external API base when needed.

## Backend (apps/backend)

- Stack: NestJS 11, TypeScript, TypeORM (SQLite), Swagger, Helmet, Compression.
- Dev server: http://localhost:3000 (auto-fallback to 3001/3002 if busy).
- API base path: `/v1/api`; Swagger at `/docs`.
- Database: SQLite file at `<workspaces>/central-backend.sqlite`.
- Static assets in production: serves compiled frontend from `dist/frontend/` when using monolithic start.
- Key modules:
  - `workspace`: manages Playwright workspaces, root `.env`, safety checks (kept outside backend code).
  - `projects`: CRUD and scaffolding orchestration for Playwright projects.
  - `endpoints`: registration and analysis helpers for API endpoints.
  - `test-cases`: entities and operations related to test cases and steps.
  - `test-execution`: triggers, SSE events stream, results storage and retrieval.
  - `test-suites`: organization of test cases into suites.
  - `ai`: OpenAI-powered suggestions/generation (optional).
  - `sync`: import/sync helpers.
- Migrations: applied on startup to initialize/update the SQLite schema.

## Repository Structure

```
omega-testing-mvp/
├─ apps/
│  ├─ frontend/           # React + Vite app
│  └─ backend/            # NestJS API
├─ bin/
│  ├─ omega-testing.js    # Local CLI entry (start/split/info)
│  └─ static-frontend.js  # Tiny static server for split mode
├─ dist/                  # Production builds (created by npm run build)
├─ scripts/
│  ├─ build.js            # Build frontend + backend → dist/
│  ├─ start-prod.js       # Start frontend + backend (no build)
│  ├─ start-dev.js        # Dev with unified logs
│  └─ copy-builds.js      # Copy builds to dist/
├─ package.json           # Workspaces, scripts, and CLI wiring
└─ README.md
```

## Development (local)

From the monorepo root:

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Swagger: http://localhost:3000/docs

Unified logs and parallel startup are handled by the dev script.

## Build & Run (production)

Commands are separated for speed: build once, then start as many times as you want without rebuilding.

1) **Build** (frontend + backend → `dist/`):

```bash
npm run build
```

2) **Start** (uses existing build, fast startup ~3–4 s):

```bash
npm run start
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Swagger: http://localhost:3000/docs

If you run `npm run start` without a prior build, you'll see a message telling you to run `npm run build`.

CLI alternative:

```bash
node bin/omega-testing.js split --frontend-port 5173 --port 3000
```

## Use as npm library

You can consume this as a CLI from npm:

1) Local project installation

```bash
npm i omega-testing-mvp
npx omega-testing-mvp start-local
# or
omega-testing-mvp split --frontend-port 5173 --port 3000
```

Notes:
- `start-local` uses split mode with default ports (frontend 5173, backend 3000) and opens the browser automatically. Use `--no-open` to disable.
- Playwright workspaces: sibling folder of the project, created only if it doesn't exist. Override: `--workspace-path` or `PLAYWRIGHT_WORKSPACES_PATH`.

## Publish npm patch update

- npm version patch -m "fix(cli) message"
- git push & git push --tags
- npm install
- npm run build
- npm publish --access public 

## Playwright Workspaces

- Default location: sibling directory to the repo root (not inside the project).
  - If your repo is `.../omega-testing-mvp`, workspaces default to `.../playwright-workspaces`.
- Created automatically only if it doesn't exist.
- Contains: generated projects, `.env` for keys, and `central-backend.sqlite`.
- Override via CLI `--workspace-path` or env `PLAYWRIGHT_WORKSPACES_PATH`.

## Environment Variables

- `PORT`: Backend port (default 3000)
- `PLAYWRIGHT_WORKSPACES_PATH`: Absolute/relative path for workspaces and SQLite DB
- `OPENAI_API_KEY`: Optional, enables AI features in the backend

## Available Scripts

```bash
npm run dev            # Development: frontend + backend in parallel with unified logs
npm run build          # Production: build frontend + backend → dist/
npm run start          # Start app (no build, uses existing dist/)
npm run build:dist     # Alias for build
npm run health         # Health check utility (local)
```

## Troubleshooting

- Frontend not reachable in split mode on Windows: use `node bin/omega-testing.js split ...` (the server uses a dedicated script to avoid quoting issues).
- Database path: the SQLite DB is created under the workspaces directory by default.

## Publishing (optional)

- This repository is currently private-local. To publish a CLI to npm:
  - Remove `"private": true` in `package.json`
  - Ensure `"bin": { "omega-testing": "./bin/omega-testing.js" }` is present
  - `npm publish`
  - Consumers can run: `npx omega-testing start`

## Author

Bryan Garay
b.garay.adm@gmail.com
