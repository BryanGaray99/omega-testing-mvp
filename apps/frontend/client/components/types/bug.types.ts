export enum BugType {
  SYSTEM_BUG = 'system_bug',
  FRAMEWORK_ERROR = 'framework_error',
  TEST_FAILURE = 'test_failure',
  ENVIRONMENT_ISSUE = 'environment_issue'
}

export enum BugSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum BugPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum BugStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface Bug {
  id: string;
  bugId: string;
  projectId: string;
  testCaseId?: string;
  testSuiteId?: string;
  executionId?: string;
  title: string;
  description: string;
  scenarioName?: string;
  testCaseName?: string;
  type: BugType;
  severity: BugSeverity;
  priority: BugPriority;
  status: BugStatus;
  errorMessage?: string;
  errorType?: string;
  errorStack?: string;
  errorCode?: string;
  section?: string;
  entity?: string;
  method?: string;
  endpoint?: string;
  requestData?: any;
  responseData?: any;
  executionTime?: number;
  executionDate?: Date;
  executionLogs?: string;
  consoleLogs?: string;
  environment?: string;
  reportedAt: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBugDto {
  title: string;
  description: string;
  type: BugType;
  severity: BugSeverity;
  priority?: BugPriority;
  testCaseId?: string;
  testSuiteId?: string;
  executionId?: string;
  scenarioName?: string;
  testCaseName?: string;
  errorMessage?: string;
  errorType?: string;
  errorStack?: string;
  errorCode?: string;
  section?: string;
  entity?: string;
  method?: string;
  endpoint?: string;
  requestData?: any;
  responseData?: any;
  executionTime?: number;
  executionDate?: Date;
  executionLogs?: string;
  consoleLogs?: string;
  environment?: string;
}

export interface UpdateBugDto {
  title?: string;
  description?: string;
  type?: BugType;
  severity?: BugSeverity;
  priority?: BugPriority;
  status?: BugStatus;
  errorMessage?: string;
  errorType?: string;
  errorStack?: string;
  errorCode?: string;
  requestData?: any;
  responseData?: any;
  executionLogs?: string;
  consoleLogs?: string;
  environment?: string;
}

export interface BugFilters {
  search?: string;
  projectId?: string;
  type?: BugType;
  severity?: BugSeverity;
  priority?: BugPriority;
  status?: BugStatus;
  section?: string;
  entity?: string;
  testCaseId?: string;
  testSuiteId?: string;
  executionId?: string;
  environment?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface BugStatistics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  bySeverity: { [key: string]: number };
  byType: { [key: string]: number };
  byPriority: { [key: string]: number };
}

export interface BugStatisticsResponse {
  success: boolean;
  data: BugStatistics;
  metadata?: {
    timestamp: string;
    path: string;
  };
}

export interface FailedExecution {
  executionId: string;
  testCaseId: string;
  testCaseName: string;
  entityName: string;
  section: string;
  method: string;
  endpoint: string;
  errorMessage: string;
  executionDate: Date;
}

export interface BugsResponse {
  success: boolean;
  data: {
    bugs: Bug[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  metadata?: {
    timestamp: string;
    path: string;
  };
}
