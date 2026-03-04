erDiagram
  projects {
    string id PK
    string name UNIQUE
    string displayName
    string description
    string baseUrl
    string basePath
    string tags
    string status
    string type
    string path
    string assistant_id
    date assistant_created_at
    string metadata
    date createdAt
    date updatedAt
  }

  endpoints {
    string id PK
    string name
    string projectId FK
    string section
    string entityName
    string path
    string methods
    string pathParameters
    string description
    string analysisResults
    string generatedArtifacts
    string status
    string errorMessage
    date createdAt
    date updatedAt
  }

  test_cases {
    string id PK
    string testCaseId UNIQUE
    string projectId FK
    string entityName
    string section
    string name
    string description
    string tags
    string method
    string testType
    string scenario
    string hooks
    string examples
    string status
    date lastRun
    string lastRunStatus
    string metadata
    date createdAt
    date updatedAt
  }

  test_steps {
    string id PK
    string stepId UNIQUE
    string projectId FK
    string section
    string entityName
    string name
    string definition
    string type
    string stepType
    string parameters
    string implementation
    string validation
    string status
    string metadata
    date createdAt
    date updatedAt
  }

  test_executions {
    string id PK
    string projectId FK
    string executionId UNIQUE
    string entityName
    string method
    string testType
    string tags
    string specificScenario
    string status
    date startedAt
    date completedAt
    int totalScenarios
    int passedScenarios
    int failedScenarios
    int executionTime
    string errorMessage
    string metadata
    string testCaseId
    string testSuiteId
    date createdAt
    date updatedAt
  }

  test_results {
    string id PK
    string executionId FK
    string scenarioName
    string scenarioTags
    string status
    int duration
    string steps
    string errorMessage
    string metadata
    date createdAt
  }

  ai_generations {
    string id PK
    string generationId UNIQUE
    string projectId FK
    string type
    string entityName
    string method
    string scenarioName
    string section
    string status
    string requestData
    string generatedCode
    string errorMessage
    string metadata
    date createdAt
    date updatedAt
  }

  ai_assistants {
    int id PK
    string project_id FK
    string assistant_id UNIQUE
    string vector_store_id
    string file_ids
    string instructions
    string tools
    string model
    string status
    date created_at
    date updated_at
  }

  ai_threads {
    int id PK
    string project_id FK
    string thread_id UNIQUE
    string assistant_id FK
    string status
    int message_count
    int max_messages
    date last_used_at
    date created_at
  }

  ai_suggestions {
    string id PK
    string suggestionId UNIQUE
    string projectId FK
    string entityName
    string section
    string requirements
    string suggestions
    int totalSuggestions
    string assistantId
    string threadId
    string runId
    int processingTime
    string status
    string errorMessage
    string metadata
    date createdAt
    date updatedAt
  }

  test_suites {
    string id PK
    string suiteId UNIQUE
    string projectId FK
    string name
    string description
    string type
    string section
    string entity
    string status
    string testCases
    string testSets
    int totalTestCases
    int passedTestCases
    int failedTestCases
    int skippedTestCases
    int executionTime
    date startedAt
    date completedAt
    date lastExecutedAt
    string errors
    string bugs
    string executionLogs
    string tags
    string environment
    date createdAt
    date updatedAt
  }

  bugs {
    string id PK
    string bugId UNIQUE
    string projectId FK
    string testCaseId FK
    string testSuiteId FK
    string executionId
    string title
    string description
    string scenarioName
    string testCaseName
    string type
    string severity
    string priority
    string status
    string errorMessage
    string errorType
    string errorStack
    string errorCode
    string section
    string entity
    string method
    string endpoint
    string requestData
    string responseData
    int executionTime
    date executionDate
    string executionLogs
    string consoleLogs
    string environment
    date reportedAt
    date resolvedAt
    date createdAt
    date updatedAt
  }

  projects ||--o{ endpoints : projectId
  projects ||--o{ test_cases : projectId
  projects ||--o{ test_steps : projectId
  projects ||--o{ test_executions : projectId
  projects ||--o{ ai_generations : projectId
  projects ||--o{ ai_suggestions : projectId
  projects ||--o{ test_suites : projectId
  projects ||--o{ bugs : projectId
  projects ||--o{ ai_assistants : project_id
  projects ||--o{ ai_threads : project_id

  ai_assistants ||--o{ ai_threads : assistant_id
  test_executions ||--o{ test_results : executionId
  test_cases ||--o{ bugs : testCaseId
  test_suites ||--o{ bugs : testSuiteId


