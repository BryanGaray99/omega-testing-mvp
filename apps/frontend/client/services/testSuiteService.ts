const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1/api';

export interface TestSuite {
  id: string;
  suiteId: string;
  projectId: string;
  name: string;
  description: string;
  type: 'test_set' | 'test_plan';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  section: string;
  entity: string;
  totalTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  skippedTestCases: number;
  executionTime: number;
  startedAt: string;
  completedAt: string;
  lastExecutedAt: string;
  errors: any[];
  bugs: any[];
  executionLogs: string;
  tags: string[];
  environment: string;
  createdAt: string;
  updatedAt: string;
  testCases: Array<{
    testCaseId: string;
    name: string;
    entityName: string;
    section: string;
  }>;
  testSets: Array<{
    setId: string;
    name: string;
    testCases: string[];
  }>;
}

export interface CreateTestSuiteData {
  name: string;
  description?: string;
  type: 'test_set' | 'test_plan';
  section?: string;
  entity?: string;
  testCaseIds?: string[];
  testSuiteIds?: string[];
  environment?: string;
  tags?: string[];
}

export interface UpdateTestSuiteData {
  name?: string;
  description?: string;
  type?: 'test_set' | 'test_plan';
  status?: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  testCaseIds?: string[];
  testSuiteIds?: string[];
  tags?: string[];
}

export interface TestSuiteFilters {
  type?: 'test_set' | 'test_plan';
  status?: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  section?: string;
  entity?: string;
  tags?: string[];
  environment?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface TestSuitesResponse {
  testSuites: TestSuite[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExecutionResponse {
  success: boolean;
  data: {
    executionId: string;
    status: string;
    message: string;
    startedAt: string;
    projectId?: string;
    entityName?: string;
    specificScenario?: string;
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

class TestSuiteService {
  async getTestSuites(projectId: string, filters: TestSuiteFilters = {}): Promise<TestSuitesResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const url = `${API_BASE}/projects/${projectId}/test-suites?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch test suites: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async getTestSuite(projectId: string, suiteId: string): Promise<TestSuite> {
    const url = `${API_BASE}/projects/${projectId}/test-suites/${suiteId}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch test suite: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async createTestSuite(projectId: string, data: CreateTestSuiteData): Promise<TestSuite> {
    const url = `${API_BASE}/projects/${projectId}/test-suites`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create test suite: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.data || responseData;
  }

  async updateTestSuite(projectId: string, suiteId: string, data: UpdateTestSuiteData): Promise<TestSuite> {
    const url = `${API_BASE}/projects/${projectId}/test-suites/${suiteId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update test suite: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.data || responseData;
  }

  async deleteTestSuite(projectId: string, suiteId: string): Promise<DeleteResponse> {
    const url = `${API_BASE}/projects/${projectId}/test-suites/${suiteId}`;
    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete test suite: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async executeTestSuite(projectId: string, suiteId: string, options?: {
    method?: string;
    testType?: 'positive' | 'negative' | 'all';
    parallel?: boolean;
    timeout?: number;
    retries?: number;
    environment?: 'local' | 'staging' | 'production';
    verbose?: boolean;
  }): Promise<ExecutionResponse> {
    // Use the test suite specific execution endpoint
    const url = `${API_BASE}/projects/${projectId}/test-suites/${suiteId}/execute`;
    
    // Prepare execution payload with options
    const payload: any = {
      method: options?.method,
      testType: options?.testType || 'all',
      parallel: options?.parallel ?? true,
      timeout: options?.timeout || 30000,
      retries: options?.retries || 1,
      environment: options?.environment || 'local',
      verbose: options?.verbose ?? true,
      saveLogs: true,
      savePayloads: true,
      workers: 3
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to execute test suite: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async getExecutionHistory(projectId: string, suiteId: string): Promise<any[]> {
    // Get the test suite to extract entity name
    const testSuite = await this.getTestSuite(projectId, suiteId);
    
    if (!testSuite) {
      throw new Error('Test suite not found');
    }

    // Use the test execution history endpoint with entity name
    const url = `${API_BASE}/projects/${projectId}/test-execution/history/${testSuite.entity}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch execution history: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async getExecutionResults(projectId: string, executionId: string): Promise<any> {
    const url = `${API_BASE}/projects/${projectId}/test-execution/results/${executionId}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch execution results: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async deleteExecutionResults(projectId: string, executionId: string): Promise<any> {
    const url = `${API_BASE}/projects/${projectId}/test-execution/results/${executionId}`;
    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete execution results: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async getExecutionSummary(projectId: string): Promise<any> {
    const url = `${API_BASE}/projects/${projectId}/test-execution/summary`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch execution summary: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // Helper method to get available test cases for a project
  async getAvailableTestCases(projectId: string): Promise<Array<{
    id: string;
    testCaseId: string;
    name: string;
    entityName: string;
    section: string;
    method?: string;
    testType?: string;
  }>> {
    const url = `${API_BASE}/projects/${projectId}/test-cases`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch test cases: ${response.status}`);
    }

    const data = await response.json();
    const testCases = data.data?.testCases || data.testCases || [];
    
    return testCases.map((tc: any) => ({
      id: tc.id,
      testCaseId: tc.testCaseId,
      name: tc.name,
      entityName: tc.entityName,
      section: tc.section,
      method: tc.method,
      testType: tc.testType,
    }));
  }

  // Helper method to get available test suites for a project (for test plans)
  async getAvailableTestSuites(projectId: string): Promise<Array<{
    suiteId: string;
    name: string;
    type: string;
    totalTestCases: number;
  }>> {
    const url = `${API_BASE}/projects/${projectId}/test-suites?type=test_set`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch test suites: ${response.status}`);
    }

    const data = await response.json();
    const testSuites = data.data?.testSuites || data.testSuites || [];
    
    return testSuites.map((ts: any) => ({
      suiteId: ts.suiteId,
      name: ts.name,
      type: ts.type,
      totalTestCases: ts.totalTestCases,
    }));
  }

  // Helper method to get test sets by section for test plans
  async getTestSetsBySection(projectId: string, section: string): Promise<Array<{
    suiteId: string;
    name: string;
    type: string;
    totalTestCases: number;
    section: string;
    entity: string;
  }>> {
    const url = `${API_BASE}/projects/${projectId}/test-suites/test-sets/${section}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch test sets by section: ${response.status}`);
    }

    const data = await response.json();
    const testSets = data.data || data || [];
    
    return testSets.map((ts: any) => ({
      suiteId: ts.suiteId,
      name: ts.name,
      type: ts.type,
      totalTestCases: ts.totalTestCases,
      section: ts.section,
      entity: ts.entity,
    }));
  }
}

export const testSuiteService = new TestSuiteService();
