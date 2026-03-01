## Endpoints by module (base path: /v1/api)

### health (AppController)
- GET /health: Service health check.
- GET /: Welcome message and basic info.

### projects (ProjectsController)
- POST /projects: Create project.
- GET /projects: List projects.
- GET /projects/:id: Get project by ID.
- PATCH /projects/:id: Update project.
- DELETE /projects/:id: Delete project.

### endpoints (EndpointsController, ProjectEndpointsController)
- GET /endpoints: List endpoints from all projects (global).
- POST /projects/:projectId/endpoints: Register and analyze endpoint (generates artifacts).
- GET /projects/:projectId/endpoints: List project endpoints.
- GET /projects/:projectId/endpoints/:endpointId: Endpoint detail.
- PATCH /projects/:projectId/endpoints/:endpointId: Update endpoint metadata.
- DELETE /projects/:projectId/endpoints/:endpointId: Delete endpoint and artifacts.

### test-cases (TestCasesController, ProjectTestCasesController)
- GET /test-cases: List test cases from all projects (global).
- POST /projects/:projectId/test-cases: Create test case.
- GET /projects/:projectId/test-cases: List test cases (filters: entityName, section, method, testType, status, search, tags, page, limit, sortBy, sortOrder).
- GET /projects/:projectId/test-cases/statistics: Project statistics.
- GET /projects/:projectId/test-cases/:testCaseId: Get test case by ID.
- PUT /projects/:projectId/test-cases/:testCaseId: Update test case.
- PUT /projects/:projectId/test-cases/:testCaseId/steps: Update steps/tags/structured scenario.
- PUT /projects/:projectId/test-cases/:testCaseId/scenario: Update full scenario + tags.
- DELETE /projects/:projectId/test-cases/:testCaseId: Delete test case.
- GET /projects/:projectId/test-cases/step-templates/organized: Organized step templates (Given/When/Then; common vs per entity).
- POST /projects/:projectId/test-cases/ai/generate: Generate test cases with AI (requirements/metadata).

### test-execution (TestExecutionController, GlobalTestExecutionController)
- POST /projects/:projectId/test-execution/execute: Execute tests (filters/config in body).
- GET /projects/:projectId/test-execution/results/:executionId: Detailed results for an execution.
- GET /projects/:projectId/test-execution/results: List results (filters: entityName, method, testType, status, dateFrom, dateTo, page, limit).
- DELETE /projects/:projectId/test-execution/results/:executionId: Delete execution results.
- GET /projects/:projectId/test-execution/history/:entityName: History by entity.
- GET /projects/:projectId/test-execution/summary: Project statistical summary.
- GET /test-execution/summary: Global summary (all projects).
- GET /projects/:projectId/test-execution/last-execution/test-suite/:testSuiteId: Last execution by suite.
- GET /projects/:projectId/test-execution/last-execution/test-case/:testCaseId: Last execution by test case.
- GET /projects/:projectId/test-execution/failed-executions/:testCaseId: Failed executions by testCaseId.
- SSE /projects/:projectId/test-execution/execution-events: Real-time execution events.

### test-suites (TestSuitesController)
- POST /projects/:projectId/test-suites: Create test suite (test_set/test_plan).
- GET /projects/:projectId/test-suites: List suites (filters: type, status, section, entity, page, limit).
- GET /projects/:projectId/test-suites/:suiteId: Get suite.
- PUT /projects/:projectId/test-suites/:suiteId: Update suite.
- DELETE /projects/:projectId/test-suites/:suiteId: Delete suite.
- POST /projects/:projectId/test-suites/:suiteId/execute: Execute suite.
- GET /projects/:projectId/test-suites/:suiteId/execution-history: Suite execution history.
- GET /projects/:projectId/test-suites/test-sets/:section: List test sets by section (for plans).

### bugs (BugsController, BugsGeneralController)
- POST /projects/:projectId/bugs: Create bug.
- GET /projects/:projectId/bugs: List project bugs (filters and pagination).
- GET /projects/:projectId/bugs/statistics: Project bug statistics.
- GET /projects/:projectId/bugs/failed-executions: Failed executions (bug autofill).
- POST /projects/:projectId/bugs/from-execution: Create bug from failed execution.
- GET /projects/:projectId/bugs/:bugId: Get bug.
- PUT /projects/:projectId/bugs/:bugId: Update bug.
- DELETE /projects/:projectId/bugs/:bugId: Delete bug.
- GET /bugs: List bugs globally (filters/pagination).
- GET /bugs/statistics: Global bug statistics.
- GET /bugs/failed-executions: Global failed executions.

### ai (AIController, AIGeneralController)
- GET /projects/:projectId/ai/assistant: Get project assistant.
- DELETE /projects/:projectId/ai/assistant: Delete assistant.
- POST /projects/:projectId/ai/assistant/init: Initialize assistant.
- POST /projects/:projectId/ai/test-cases/suggest: Suggest test cases with AI.
- GET /projects/:projectId/ai/suggestions: List project AI suggestions.
- GET /projects/:projectId/ai/suggestions/stats: AI suggestions statistics.
- GET /projects/:projectId/ai/suggestions/:suggestionId: Get AI suggestion by ID.
- POST /ai/test-connection: Test OpenAI connection.
- POST /ai/save-api-key: Save OpenAI API key.
- GET /ai/check-status: OpenAI configuration/connection status.

### sync (SyncController)
- POST /sync/projects/:projectId: Full sync (endpoints, test cases, steps).
- POST /sync/projects/:projectId/endpoints: Sync endpoints only.
- POST /sync/projects/:projectId/test-cases: Sync test cases only.
