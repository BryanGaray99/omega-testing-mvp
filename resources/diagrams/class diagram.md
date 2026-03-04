classDiagram
%% =========================
%% ENTIDADES (CLASES)
%% =========================
class Project {
  +id: string
  +name: string
  +displayName: string
  +description: string
  +baseUrl: string
  +basePath: string
  +tags: string[]
  +status: ProjectStatus
  +type: ProjectType
  +path: string
  +assistantId: string
  +assistantCreatedAt: Date
  +metadata: object
  +createdAt: Date
  +updatedAt: Date
}

class Endpoint {
  +id: string
  +name: string
  +projectId: string
  +section: string
  +entityName: string
  +path: string
  +methods: object[]
  +pathParameters: object[]
  +description: string
  +analysisResults: object
  +generatedArtifacts: object
  +status: string
  +errorMessage: string
  +createdAt: Date
  +updatedAt: Date
}

class TestCase {
  +id: string
  +testCaseId: string
  +projectId: string
  +entityName: string
  +section: string
  +name: string
  +description: string
  +tags: string[]
  +method: string
  +testType: TestType
  +scenario: string
  +hooks: object
  +examples: object[]
  +status: TestCaseStatus
  +lastRun: Date
  +lastRunStatus: string
  +metadata: object
  +createdAt: Date
  +updatedAt: Date
}

class TestStep {
  +id: string
  +stepId: string
  +projectId: string
  +section: string
  +entityName: string
  +name: string
  +definition: string
  +type: StepType
  +stepType: StepTemplateType
  +parameters: object[]
  +implementation: string
  +validation: object
  +status: StepStatus
  +metadata: object
  +createdAt: Date
  +updatedAt: Date
}

class TestSuite {
  +id: string
  +suiteId: string
  +projectId: string
  +name: string
  +description: string
  +type: TestSuiteType
  +section: string
  +entity: string
  +status: TestSuiteStatus
  +testCases: object[]
  +testSets: object[]
  +totalTestCases: number
  +passedTestCases: number
  +failedTestCases: number
  +skippedTestCases: number
  +executionTime: number
  +startedAt: Date
  +completedAt: Date
  +lastExecutedAt: Date
  +errors: object[]
  +bugs: object[]
  +executionLogs: string
  +tags: string[]
  +environment: string
  +createdAt: Date
  +updatedAt: Date
}

class TestExecution {
  +id: string
  +projectId: string
  +executionId: string
  +entityName: string
  +method: string
  +testType: TestType
  +tags: string[]
  +specificScenario: string
  +status: ExecutionStatus
  +startedAt: Date
  +completedAt: Date
  +totalScenarios: number
  +passedScenarios: number
  +failedScenarios: number
  +executionTime: number
  +errorMessage: string
  +metadata: object
  +testCaseId: string
  +testSuiteId: string
  +createdAt: Date
  +updatedAt: Date
}

class TestResult {
  +id: string
  +executionId: string
  +scenarioName: string
  +scenarioTags: string[]
  +status: TestResultStatus
  +duration: number
  +steps: object[]
  +errorMessage: string
  +metadata: object
  +createdAt: Date
}

class Bug {
  +id: string
  +bugId: string
  +projectId: string
  +testCaseId: string
  +testSuiteId: string
  +executionId: string
  +title: string
  +description: string
  +scenarioName: string
  +testCaseName: string
  +type: BugType
  +severity: BugSeverity
  +priority: BugPriority
  +status: BugStatus
  +errorMessage: string
  +errorType: string
  +errorStack: string
  +errorCode: string
  +section: string
  +entity: string
  +method: string
  +endpoint: string
  +requestData: object
  +responseData: object
  +executionTime: number
  +executionDate: Date
  +executionLogs: string
  +consoleLogs: string
  +environment: string
  +reportedAt: Date
  +resolvedAt: Date
  +createdAt: Date
  +updatedAt: Date
}

class AIAssistant {
  +id: number
  +projectId: string
  +assistantId: string
  +fileIds: string
  +instructions: string
  +tools: string
  +model: string
  +status: string
  +createdAt: Date
  +updatedAt: Date
}

class AIThread {
  +id: number
  +projectId: string
  +threadId: string
  +assistantId: string
  +status: string
  +messageCount: number
  +maxMessages: number
  +lastUsedAt: Date
  +createdAt: Date
}

class AISuggestion {
  +id: string
  +suggestionId: string
  +projectId: string
  +entityName: string
  +section: string
  +requirements: string
  +suggestions: object[]
  +totalSuggestions: number
  +assistantId: string
  +threadId: string
  +runId: string
  +processingTime: number
  +status: string
  +errorMessage: string
  +metadata: object
  +createdAt: Date
  +updatedAt: Date
}

class AIGeneration {
  +id: string
  +generationId: string
  +projectId: string
  +type: AIGenerationType
  +entityName: string
  +method: string
  +scenarioName: string
  +section: string
  +status: AIGenerationStatus
  +requestData: string
  +generatedCode: string
  +errorMessage: string
  +metadata: object
  +createdAt: Date
  +updatedAt: Date
}

%% =========================
%% RELACIONES (CARDINALIDADES)
%% =========================
Project "1" o-- "*" Endpoint
Project "1" o-- "*" TestCase
Project "1" o-- "*" TestStep
Project "1" o-- "*" TestSuite
Project "1" o-- "*" TestExecution
Project "1" o-- "*" Bug
Project "1" o-- "*" AIAssistant
Project "1" o-- "*" AIThread
Project "1" o-- "*" AISuggestion
Project "1" o-- "*" AIGeneration

TestCase "1" o-- "*" Bug
TestSuite "1" o-- "*" Bug
TestExecution "1" o-- "*" TestResult

AIAssistant "1" o-- "*" AIThread