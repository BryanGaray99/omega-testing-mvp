# Omega Testing MVP (Monorepo)

Monorepo containing a React (Vite) dashboard and a NestJS backend with Playwright + BDD tooling. It includes a local CLI to run the production builds together or split, plus a development workflow that starts both apps with unified logs.

## Features

- React dashboard (Vite) for projects, endpoints, test cases and executions
- NestJS API with Swagger, SQLite via TypeORM, migrations and validations
- Playwright workspaces generator and project scaffolding
- Local CLI to run compiled builds (monolithic or split)
- Workspaces stored outside of the repository by default

## Requirements

- Node.js >= 18
- npm >= 8

## Repository Structure

```
omega-testing-mvp/
├─ apps/
│  ├─ frontend/           # React + Vite app
│  └─ backend/            # NestJS API
├─ bin/
│  ├─ omega-testing.js    # Local CLI entry (start/split/info)
│  └─ static-frontend.js  # Tiny static server for split mode
├─ dist/                  # Distribution builds (created by build:dist)
├─ scripts/
│  └─ copy-builds.js      # Packages frontend/backend builds into dist/
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

## Build & Run (production)

1) Build frontend and backend, and package builds into `dist/`:

```bash
npm run build:dist
```

2) Run compiled builds with the local CLI

- Monolithic (backend serves frontend):

```bash
node bin/omega-testing.js start --port 3000
```

- Split mode (static frontend + backend separately):

```bash
node bin/omega-testing.js split --frontend-port 5173 --port 3000
```

## Workspace Location (Playwright)

- By default, workspaces live as a sibling directory to the monorepo root:
  - If your repo lives at `.../omega-testing-mvp`, default workspaces path is `.../playwright-workspaces`.
- You can override via `--workspace-path` (CLI) or `PLAYWRIGHT_WORKSPACES_PATH` (env).

## Environment Variables

- PORT: Backend port (default 3000)
- PLAYWRIGHT_WORKSPACES_PATH: Absolute or relative path for storing workspaces and SQLite DB
- OPENAI_API_KEY: Optional, for AI features

## Available Scripts

```bash
npm run dev            # Start frontend + backend in parallel with unified logs
npm run build          # Build frontend and backend inside apps/
npm run build:dist     # Build and package to dist/ for CLI run
npm run health         # Health check utility (local)
```

## Publishing (optional)

- This repository is currently private-local. To publish a CLI to npm:
  - Remove `"private": true` in `package.json`
  - Ensure `"bin": { "omega-testing": "./bin/omega-testing.js" }` is present
  - `npm publish`
  - Users could then run: `npx omega-testing start`

## Troubleshooting

- 404 at `/` in production start: ensure `npm run build:dist` was executed and `dist/frontend/index.html` exists.
- Frontend not reachable in split mode on Windows: re-run `node bin/omega-testing.js split ...` (the server uses a dedicated script to avoid `node -e` quoting issues).
- Database path: the SQLite DB is created under the workspaces directory by default.

## License

MVP for internal use. Choose a license before publishing.
