# Backend tests

All tests live under the **`test/`** folder, with a clear and stable folder layout.

## How to run

From the backend root (`apps/backend`):

```bash
# Run all unit tests (test/unit/)
npm test

# Unit tests with coverage report
npm run test:cov

# Unit tests in watch mode (re-run on file changes)
npm run test:watch

# Run all E2E tests (test/e2e/) — app is bootstrapped in memory
npm run test:e2e
```

To run **everything** (unit + e2e) in one go:

```bash
npm test && npm run test:e2e
```

- **Unit tests** use `jest.config.js` at the backend root, which loads `test/jest-unit.json`.
- **E2E tests** use `test/jest-e2e.json` and a temporary SQLite DB under `PLAYWRIGHT_WORKSPACES_PATH` (no need to start the server manually).

---

## Folder structure

```
test/
├── jest-unit.json          # Jest config for unit tests
├── jest-e2e.json           # Jest config for E2E tests
├── README.md               # This file
│
├── unit/                   # Unit tests (by module, mirrors src/)
│   ├── app/
│   │   ├── app.controller.spec.ts
│   │   └── app.service.spec.ts
│   └── modules/
│       ├── data/
│       │   ├── data.controller.spec.ts
│       │   └── data.service.spec.ts
│       ├── projects/
│       │   └── projects.controller.spec.ts
│       ├── workspace/
│       │   └── workspace.service.spec.ts
│       ├── endpoints/
│       │   └── controllers/
│       │       └── endpoints.controller.spec.ts
│       ├── test-cases/
│       │   └── controllers/
│       │       └── test-cases.controller.spec.ts
│       ├── test-execution/
│       │   └── utils/
│       │       └── test-filter.utils.spec.ts
│       ├── test-suites/
│       │   └── controllers/
│       │       └── test-suites.controller.spec.ts
│       ├── ai/
│       │   └── controllers/
│       │       └── ai-general.controller.spec.ts
│       ├── bugs/
│       │   └── controllers/
│       │       └── bugs-general.controller.spec.ts
│       └── sync/
│           └── controllers/
│               └── sync.controller.spec.ts
│
└── e2e/                    # System/API tests (app in memory)
    └── app.e2e-spec.ts
```

- **`test/unit/`** mirrors **`src/`** (app + modules). Specs import from `src/...` via Jest `moduleNameMapper`.
- **`test/e2e/`** runs against the full app bootstrapped in memory (health, list endpoints, DTO validation).

---

## Modules covered

| Module         | Location under test/unit/           |
|----------------|-------------------------------------|
| App            | `app/`                              |
| Data           | `modules/data/`                     |
| Projects       | `modules/projects/`                 |
| Workspace      | `modules/workspace/`                |
| Endpoints      | `modules/endpoints/controllers/`    |
| Test cases     | `modules/test-cases/controllers/`   |
| Test execution | `modules/test-execution/utils/`     |
| Test suites    | `modules/test-suites/controllers/`  |
| AI             | `modules/ai/controllers/`           |
| Bugs           | `modules/bugs/controllers/`         |
| Sync           | `modules/sync/controllers/`          |
