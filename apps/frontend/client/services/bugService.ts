import { 
  Bug, 
  CreateBugDto, 
  UpdateBugDto, 
  BugFilters, 
  BugStatistics,
  BugStatisticsResponse,
  BugsResponse,
  FailedExecution 
} from '@/components/types/bug.types';

const API_BASE = import.meta.env.VITE_API_URL || '/v1/api';

export const bugService = {
  // Get bugs with filters
  async getBugs(projectId?: string, filters: BugFilters = {}): Promise<BugsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    // Use general endpoint if no projectId or if projectId is 'all'
    const url = projectId && projectId !== 'all' 
      ? `${API_BASE}/projects/${projectId}/bugs?${params.toString()}`
      : `${API_BASE}/bugs?${params.toString()}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        // If project-specific endpoint fails, try general endpoint
        if (projectId && projectId !== 'all') {
          console.warn(`Project-specific bugs endpoint failed, trying general endpoint`);
          const generalResponse = await fetch(`${API_BASE}/bugs?${params.toString()}`);
          if (!generalResponse.ok) {
            throw new Error(`Failed to fetch bugs: ${generalResponse.statusText}`);
          }
          return generalResponse.json();
        }
        throw new Error(`Failed to fetch bugs: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // If any error occurs, try general endpoint as fallback
      if (projectId && projectId !== 'all') {
        console.warn(`Error with project-specific endpoint, trying general endpoint:`, error);
        try {
          const generalResponse = await fetch(`${API_BASE}/bugs?${params.toString()}`);
          if (!generalResponse.ok) {
            throw new Error(`Failed to fetch bugs: ${generalResponse.statusText}`);
          }
          return generalResponse.json();
        } catch (generalError) {
          throw new Error(`Failed to fetch bugs from both endpoints: ${error.message}`);
        }
      }
      throw error;
    }
  },

  // Get a specific bug
  async getBug(projectId: string, bugId: string): Promise<Bug> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/bugs/${bugId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bug: ${response.statusText}`);
    }

    return response.json();
  },

  // Create a new bug
  async createBug(projectId: string, bugData: CreateBugDto): Promise<Bug> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/bugs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bugData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create bug: ${response.statusText}`);
    }

    return response.json();
  },

  // Update a bug
  async updateBug(projectId: string, bugId: string, bugData: UpdateBugDto): Promise<Bug> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/bugs/${bugId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bugData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update bug: ${response.statusText}`);
    }

    return response.json();
  },

  // Delete a bug
  async deleteBug(projectId: string, bugId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/bugs/${bugId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete bug: ${response.statusText}`);
    }

    return response.json();
  },

  // Get bug statistics
  async getBugStatistics(projectId?: string): Promise<BugStatisticsResponse> {
    // Use general endpoint if no projectId or if projectId is 'all'
    const url = projectId && projectId !== 'all' 
      ? `${API_BASE}/projects/${projectId}/bugs/statistics`
      : `${API_BASE}/bugs/statistics`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        // If project-specific endpoint fails, try general endpoint
        if (projectId && projectId !== 'all') {
          console.warn(`Project-specific statistics endpoint failed, trying general endpoint`);
          const generalResponse = await fetch(`${API_BASE}/bugs/statistics`);
          if (!generalResponse.ok) {
            throw new Error(`Failed to fetch bug statistics: ${generalResponse.statusText}`);
          }
          return generalResponse.json();
        }
        throw new Error(`Failed to fetch bug statistics: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // If any error occurs, try general endpoint as fallback
      if (projectId && projectId !== 'all') {
        console.warn(`Error with project-specific statistics endpoint, trying general endpoint:`, error);
        try {
          const generalResponse = await fetch(`${API_BASE}/bugs/statistics`);
          if (!generalResponse.ok) {
            throw new Error(`Failed to fetch bug statistics: ${generalResponse.statusText}`);
          }
          return generalResponse.json();
        } catch (generalError) {
          throw new Error(`Failed to fetch bug statistics from both endpoints: ${error.message}`);
        }
      }
      throw error;
    }
  },

  // Get failed executions
  async getFailedExecutions(projectId?: string): Promise<FailedExecution[]> {
    // Use general endpoint if no projectId or if projectId is 'all'
    const url = projectId && projectId !== 'all' 
      ? `${API_BASE}/projects/${projectId}/bugs/failed-executions`
      : `${API_BASE}/bugs/failed-executions`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        // If project-specific endpoint fails, try general endpoint
        if (projectId && projectId !== 'all') {
          console.warn(`Project-specific failed executions endpoint failed, trying general endpoint`);
          const generalResponse = await fetch(`${API_BASE}/bugs/failed-executions`);
          if (!generalResponse.ok) {
            throw new Error(`Failed to fetch failed executions: ${generalResponse.statusText}`);
          }
          return generalResponse.json();
        }
        throw new Error(`Failed to fetch failed executions: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // If any error occurs, try general endpoint as fallback
      if (projectId && projectId !== 'all') {
        console.warn(`Error with project-specific failed executions endpoint, trying general endpoint:`, error);
        try {
          const generalResponse = await fetch(`${API_BASE}/bugs/failed-executions`);
          if (!generalResponse.ok) {
            throw new Error(`Failed to fetch failed executions: ${generalResponse.statusText}`);
          }
          return generalResponse.json();
        } catch (generalError) {
          throw new Error(`Failed to fetch failed executions from both endpoints: ${error.message}`);
        }
      }
      throw error;
    }
  },

  // Get failed executions by test case ID
  async getFailedExecutionsByTestCaseId(projectId: string, testCaseId: string): Promise<FailedExecution[]> {
    const url = `${API_BASE}/projects/${projectId}/test-execution/failed-executions/${testCaseId}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch failed executions for test case: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(`Failed to fetch failed executions for test case: ${error.message}`);
    }
  },

  // Create bug from failed execution
  async createBugFromExecution(
    projectId: string,
    executionId: string,
    testCaseId: string,
    bugData: Partial<CreateBugDto>
  ): Promise<Bug> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/bugs/from-execution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        executionId,
        testCaseId,
        ...bugData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create bug from execution: ${response.statusText}`);
    }

    return response.json();
  },

};
