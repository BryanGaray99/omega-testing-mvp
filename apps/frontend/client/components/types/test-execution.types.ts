export interface TestExecution {
  executionId: string;
  entityName: string;
  method?: string;
  testType: string;
  tags?: string;
  specificScenario?: string;
  status: TestExecutionStatus;
  startedAt: string;
  completedAt?: string;
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  executionTime: number;
  errorMessage?: string;
  metadata?: string;
  // Información adicional del backend
  section?: string;
  feature?: string;
  scenarioName?: string;
  tagsArray?: string[];
  // Información del test case
  testCaseId?: string;
  testCaseDescription?: string;
  testCaseMethod?: string;
  testCaseTestType?: string;
  testSuiteId?: string;
  testSuiteName?: string;
  // Estadísticas detalladas de steps
  totalSteps?: number;
  passedSteps?: number;
  failedSteps?: number;
  skippedSteps?: number;
  totalStepDuration?: number;
  averageStepDuration?: number;
  stepSuccessRate?: number;
  // Información adicional de resultados
  allSteps?: any[];
  allScenarioTags?: string[];
  allErrorMessages?: string[];
  resultsCount?: number;
  // Propiedades para manejar Examples
  hasMultipleExamples?: boolean;
  examplesCount?: number;
  // Estructura anidada de scenarios y examples
  scenariosStructure?: ScenarioStructure[];
}

export interface ScenarioStructure {
  scenarioName: string;
  examples: ExampleStructure[];
}

export interface ExampleStructure {
  exampleName: string;
  steps: TestStep[];
  status: TestResultStatus;
  duration: number;
  errorMessage?: string;
}

export interface TestResult {
  id: string;
  executionId: string;
  scenarioName: string;
  scenarioTags?: string;
  status: TestResultStatus;
  duration: number;
  steps: string; // JSON string containing steps data
  errorMessage?: string;
  metadata?: string;
  createdAt: string;
  // Nuevos campos para manejar Examples
  isExampleExecution?: boolean;
  executionIndex?: number;
  originalScenarioName?: string;
  totalExampleExecutions?: number;
}

export interface GroupedTestResult {
  originalScenarioName: string;
  executions: TestResult[];
  consolidatedStatus: TestResultStatus;
  totalDuration: number;
  hasMultipleExecutions: boolean;
}

export interface TestStep {
  stepName: string;
  status: TestStepStatus;
  duration: number;
  timestamp?: string;
  isHook?: boolean;
  hookType?: string | null;
  errorMessage?: string;
}

export enum TestExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TestResultStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  PENDING = 'pending'
}

export enum TestStepStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  PENDING = 'pending'
}

export interface TestExecutionFilters {
  search: string;
  status?: string;
  entityName?: string;
  method?: string;
  testType?: string;
  projectId?: string;
  section?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page: number;
  limit: number;
  sortBy?: 'startedAt' | 'completedAt' | 'executionTime' | 'totalScenarios' | 'passedScenarios' | 'failedScenarios';
  sortOrder?: 'asc' | 'desc';
}

export interface TestExecutionStatistics {
  totalExecutions: number;
  totalScenarios: number;
  totalPassed: number;
  totalFailed: number;
  successRate: number;
  averageExecutionTime: number;
  statusDistribution: Record<string, number>;
  lastExecution: string;
}

export interface CreateTestExecutionDto {
  projectId: string;
  entityName: string;
  method?: string;
  testType: string;
  tags?: string;
  specificScenario?: string;
  testCaseId?: string;
  testSuiteId?: string;
}

export interface UpdateTestExecutionDto {
  status?: TestExecutionStatus;
  completedAt?: Date;
  totalScenarios?: number;
  passedScenarios?: number;
  failedScenarios?: number;
  executionTime?: number;
  errorMessage?: string;
  metadata?: string;
  testCaseId?: string;
  testSuiteId?: string;
}
