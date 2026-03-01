# Frontend test results

Place **a11y** and **Lighthouse** JSON outputs here so the **Settings > Tests Report** can show real data for the frontend section.

- **a11y** — `npm run test --workspace=apps/frontend` (Vitest + axe); export results to e.g. `a11y-results.json` if needed.
- **Lighthouse** — `npm run test:lighthouse --workspace=apps/frontend`; reports are in `lighthouse-reports/*.html` by default; JSON can be added here for the dashboard.

Tests run **locally in development** (not in production).
