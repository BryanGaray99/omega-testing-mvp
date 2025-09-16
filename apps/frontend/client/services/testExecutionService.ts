import { 
  TestExecution, 
  TestResult, 
  TestExecutionFilters, 
  TestExecutionStatistics,
  CreateTestExecutionDto,
  UpdateTestExecutionDto 
} from '@/components/types/test-execution.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/v1/api';

class TestExecutionService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const isGet = !options.method || options.method.toUpperCase() === 'GET';
    const headers = isGet
      ? { ...(options.headers || {}) }
      : { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const response = await fetch(url, { headers, ...options });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get test executions with filters
  async getTestExecutions(projectId: string, filters: TestExecutionFilters): Promise<{
    data: TestExecution[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.entityName) params.append('entityName', filters.entityName);
    if (filters.method) params.append('method', filters.method);
    if (filters.testType) params.append('testType', filters.testType);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
    params.append('page', filters.page.toString());
    params.append('limit', filters.limit.toString());

    const response = await this.request<{
      success: boolean;
      data: {
        executions: TestExecution[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      };
    }>(`/projects/${projectId}/test-execution/results?${params.toString()}`);
    
    // Map backend response to frontend expected format
    return {
      data: response.data.executions || [],
      total: response.data.pagination?.total || 0,
      page: response.data.pagination?.page || 1,
      limit: response.data.pagination?.limit || 10,
      totalPages: response.data.pagination?.pages || 0,
    };
  }

  // Get test execution by ID
  async getTestExecution(projectId: string, executionId: string): Promise<TestExecution> {
    const response = await this.request<{
      success: boolean;
      data: TestExecution;
    }>(`/projects/${projectId}/test-execution/results/${executionId}`);
    
    return response.data;
  }

  // Get test results for an execution
  async getTestResults(projectId: string, executionId: string): Promise<TestResult[]> {
    const response = await this.request<{
      success: boolean;
      data: {
        results: TestResult[];
      };
    }>(`/projects/${projectId}/test-execution/results/${executionId}`);
    
    return response.data.results || [];
  }

  // Get test execution statistics
  async getTestExecutionStatistics(projectId: string): Promise<TestExecutionStatistics> {
    const response = await this.request<{
      success: boolean;
      data: TestExecutionStatistics;
    }>(`/projects/${projectId}/test-execution/summary`);
    
    return response.data;
  }

  // Create new test execution
  async createTestExecution(projectId: string, data: CreateTestExecutionDto): Promise<TestExecution> {
    return this.request(`/projects/${projectId}/test-execution/execute`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update test execution
  async updateTestExecution(projectId: string, executionId: string, data: UpdateTestExecutionDto): Promise<TestExecution> {
    return this.request(`/projects/${projectId}/test-execution/results/${executionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete test execution
  async deleteTestExecution(projectId: string, executionId: string): Promise<void> {
    return this.request(`/projects/${projectId}/test-execution/results/${executionId}`, {
      method: 'DELETE',
    });
  }

  // Get entities for filtering - This endpoint doesn't exist, we'll need to get from test cases
  async getEntities(projectId: string): Promise<string[]> {
    // For now, return empty array since this endpoint doesn't exist
    return [];
  }

  // Get methods for filtering - This endpoint doesn't exist, we'll need to get from test cases
  async getMethods(projectId: string): Promise<string[]> {
    // For now, return empty array since this endpoint doesn't exist
    return [];
  }

  // Get test types for filtering - This endpoint doesn't exist, we'll need to get from test cases
  async getTestTypes(projectId: string): Promise<string[]> {
    // For now, return empty array since this endpoint doesn't exist
    return [];
  }

  // Get last execution by test suite ID
  async getLastExecutionByTestSuite(projectId: string, testSuiteId: string): Promise<{
    executionId: string;
    status: string;
    startedAt: string;
    completedAt?: string;
    executionTime: number;
    totalScenarios: number;
    passedScenarios: number;
    failedScenarios: number;
    entityName: string;
  }> {
    const response = await this.request<{
      success: boolean;
      data: {
        executionId: string;
        status: string;
        startedAt: string;
        completedAt?: string;
        executionTime: number;
        totalScenarios: number;
        passedScenarios: number;
        failedScenarios: number;
        entityName: string;
      };
      metadata: {
        timestamp: string;
        path: string;
      };
    }>(`/projects/${projectId}/test-execution/last-execution/test-suite/${testSuiteId}`);
    
    return response.data;
  }

  // Get last execution by test case ID
  async getLastExecutionByTestCase(projectId: string, testCaseId: string): Promise<{
    executionId: string;
    status: string;
    startedAt: string;
    completedAt?: string;
    executionTime: number;
    totalScenarios: number;
    passedScenarios: number;
    failedScenarios: number;
    entityName: string;
  }> {
    const response = await this.request<{
      success: boolean;
      data: {
        executionId: string;
        status: string;
        startedAt: string;
        completedAt?: string;
        executionTime: number;
        totalScenarios: number;
        passedScenarios: number;
        failedScenarios: number;
        entityName: string;
      };
      metadata: {
        timestamp: string;
        path: string;
      };
    }>(`/projects/${projectId}/test-execution/last-execution/test-case/${testCaseId}`);
    
    return response.data;
  }
}

export const testExecutionService = new TestExecutionService();
