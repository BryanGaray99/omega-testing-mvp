## Endpoints por módulo (base path: /v1/api)

### health (AppController)
- GET /health: Health check del servicio.
- GET /: Mensaje de bienvenida e info básica.

### projects (ProjectsController)
- POST /projects: Crear proyecto.
- GET /projects: Listar proyectos.
- GET /projects/:id: Obtener proyecto por ID.
- PATCH /projects/:id: Actualizar proyecto.
- DELETE /projects/:id: Eliminar proyecto.

### endpoints (EndpointsController, ProjectEndpointsController)
- GET /endpoints: Listar endpoints de todos los proyectos (global).
- POST /projects/:projectId/endpoints: Registrar y analizar endpoint (genera artefactos).
- GET /projects/:projectId/endpoints: Listar endpoints del proyecto.
- GET /projects/:projectId/endpoints/:endpointId: Detalle de endpoint.
- PATCH /projects/:projectId/endpoints/:endpointId: Actualizar metadatos de endpoint.
- DELETE /projects/:projectId/endpoints/:endpointId: Eliminar endpoint y artefactos.

### test-cases (TestCasesController, ProjectTestCasesController)
- GET /test-cases: Listar casos de prueba de todos los proyectos (global).
- POST /projects/:projectId/test-cases: Crear caso de prueba.
- GET /projects/:projectId/test-cases: Listar casos (filtros: entityName, section, method, testType, status, search, tags, page, limit, sortBy, sortOrder).
- GET /projects/:projectId/test-cases/statistics: Estadísticas del proyecto.
- GET /projects/:projectId/test-cases/:testCaseId: Obtener caso por ID.
- PUT /projects/:projectId/test-cases/:testCaseId: Actualizar caso.
- PUT /projects/:projectId/test-cases/:testCaseId/steps: Actualizar pasos/tags/escenario estructurado.
- PUT /projects/:projectId/test-cases/:testCaseId/scenario: Actualizar escenario completo + tags.
- DELETE /projects/:projectId/test-cases/:testCaseId: Eliminar caso.
- GET /projects/:projectId/test-cases/step-templates/organized: Plantillas de steps organizadas (Given/When/Then; comunes vs por entidad).
- POST /projects/:projectId/test-cases/ai/generate: Generar casos con IA (requirements/metadata).

### test-execution (TestExecutionController, GlobalTestExecutionController)
- POST /projects/:projectId/test-execution/execute: Ejecutar pruebas (filters/config en body).
- GET /projects/:projectId/test-execution/results/:executionId: Resultados detallados de una ejecución.
- GET /projects/:projectId/test-execution/results: Listar resultados (filtros: entityName, method, testType, status, dateFrom, dateTo, page, limit).
- DELETE /projects/:projectId/test-execution/results/:executionId: Borrar resultados de una ejecución.
- GET /projects/:projectId/test-execution/history/:entityName: Historial por entidad.
- GET /projects/:projectId/test-execution/summary: Resumen estadístico del proyecto.
- GET /test-execution/summary: Resumen global (todos los proyectos).
- GET /projects/:projectId/test-execution/last-execution/test-suite/:testSuiteId: Última ejecución por suite.
- GET /projects/:projectId/test-execution/last-execution/test-case/:testCaseId: Última ejecución por caso.
- GET /projects/:projectId/test-execution/failed-executions/:testCaseId: Ejecuciones fallidas por testCaseId.
- SSE /projects/:projectId/test-execution/execution-events: Eventos en tiempo real de ejecución.

### test-suites (TestSuitesController)
- POST /projects/:projectId/test-suites: Crear test suite (test_set/test_plan).
- GET /projects/:projectId/test-suites: Listar suites (filtros: type, status, section, entity, page, limit).
- GET /projects/:projectId/test-suites/:suiteId: Obtener suite.
- PUT /projects/:projectId/test-suites/:suiteId: Actualizar suite.
- DELETE /projects/:projectId/test-suites/:suiteId: Eliminar suite.
- POST /projects/:projectId/test-suites/:suiteId/execute: Ejecutar suite.
- GET /projects/:projectId/test-suites/:suiteId/execution-history: Historial de ejecuciones de la suite.
- GET /projects/:projectId/test-suites/test-sets/:section: Listar test sets por sección (para planes).

### bugs (BugsController, BugsGeneralController)
- POST /projects/:projectId/bugs: Crear bug.
- GET /projects/:projectId/bugs: Listar bugs del proyecto (filtros y paginación).
- GET /projects/:projectId/bugs/statistics: Estadísticas de bugs del proyecto.
- GET /projects/:projectId/bugs/failed-executions: Ejecuciones fallidas (autorrelleno de bug).
- POST /projects/:projectId/bugs/from-execution: Crear bug desde ejecución fallida.
- GET /projects/:projectId/bugs/:bugId: Obtener bug.
- PUT /projects/:projectId/bugs/:bugId: Actualizar bug.
- DELETE /projects/:projectId/bugs/:bugId: Eliminar bug.
- GET /bugs: Listar bugs global (filtros/paginación).
- GET /bugs/statistics: Estadísticas globales de bugs.
- GET /bugs/failed-executions: Ejecuciones fallidas globales.

### ai (AIController, AIGeneralController)
- GET /projects/:projectId/ai/assistant: Obtener assistant del proyecto.
- DELETE /projects/:projectId/ai/assistant: Eliminar assistant.
- POST /projects/:projectId/ai/assistant/init: Inicializar assistant.
- POST /projects/:projectId/ai/test-cases/suggest: Sugerir casos de prueba con IA.
- GET /projects/:projectId/ai/suggestions: Listar sugerencias IA del proyecto.
- GET /projects/:projectId/ai/suggestions/stats: Estadísticas de sugerencias IA.
- GET /projects/:projectId/ai/suggestions/:suggestionId: Obtener sugerencia IA por ID.
- POST /ai/test-connection: Probar conexión con OpenAI.
- POST /ai/save-api-key: Guardar API key de OpenAI.
- GET /ai/check-status: Estado de configuración/conexión de OpenAI.

### sync (SyncController)
- POST /sync/projects/:projectId: Sincronización completa (endpoints, test cases, steps).
- POST /sync/projects/:projectId/endpoints: Sincronizar solo endpoints.
- POST /sync/projects/:projectId/test-cases: Sincronizar solo test cases.


