import { TestCase } from "../components/types/testCase.types";

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || "/v1/api";

// Helper function to get all test cases from all projects
export async function fetchTestCases(): Promise<{ data: TestCase[] }> {
  const url = `${API_BASE}/test-cases`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching test cases");
  return res.json();
}

export async function createTestCase(testCaseData: any): Promise<{ data: TestCase }> {
  // For creating test cases, we need a projectId
  const url = `${API_BASE}/projects/${testCaseData.projectId}/test-cases`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testCaseData),
  });
  if (!res.ok) {
    try {
      const err = await res.json();
      const msg = err?.error?.message || err?.message || "Error creating test case";
      throw new Error(Array.isArray(msg) ? msg.join("; ") : msg);
    } catch (e:any) {
      throw new Error(e?.message || "Error creating test case");
    }
  }
  return res.json();
}

export async function updateTestCase(testCaseId: string, testCaseData: any, projectId: string): Promise<{ data: TestCase }> {
  const url = `${API_BASE}/projects/${projectId}/test-cases/${testCaseId}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testCaseData),
  });
  if (!res.ok) throw new Error("Error updating test case");
  return res.json();
}

export async function deleteTestCase(testCaseId: string, projectId: string): Promise<{ data: any }> {
  const url = `${API_BASE}/projects/${projectId}/test-cases/${testCaseId}`;
  const res = await fetch(url, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error deleting test case");
  return res.json();
}

export async function runTestCase(testCaseId: string, projectId: string, entityName: string, scenarioName: string): Promise<{ data: any }> {
  const url = `${API_BASE}/projects/${projectId}/test-execution/execute`;
  
  const payload = {
    entityName: entityName,
    specificScenario: scenarioName,
    testCaseId: testCaseId,
  };
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error response:', errorText);
    throw new Error("Error running test case");
  }
  
  const result = await res.json();
  return result;
}

// Helper function to reload test cases data
export async function reloadTestCasesData(): Promise<{ testCases: TestCase[] }> {
  try {
    const response = await fetch(`${API_BASE}/test-cases`);
    if (response.ok) {
      const data = await response.json();
      const testCases = data.data || [];
      return { testCases };
    }
    return { testCases: [] };
  } catch (error) {
    console.error("Error reloading test cases data:", error);
    return { testCases: [] };
  }
}

// Get detailed test case by ID
export async function getTestCaseDetails(testCaseId: string, projectId: string): Promise<{ data: TestCase }> {
  const url = `${API_BASE}/projects/${projectId}/test-cases/${testCaseId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching test case details");
  return res.json();
}

// Update test case steps with organized step selection
export async function updateTestCaseSteps(
  testCaseId: string,
  projectId: string,
  data: {
    tags: string[];
    steps: {
      type: 'Given' | 'When' | 'Then' | 'And';
      stepId: string;
      parameters?: Record<string, any>;
    }[];
    scenario: string;
  }
): Promise<{ data: TestCase }> {
  const url = `${API_BASE}/projects/${projectId}/test-cases/${testCaseId}/steps`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error updating test case steps");
  return res.json();
}

// Update test case scenario with complete text
export async function updateTestCaseScenario(
  testCaseId: string,
  projectId: string,
  data: {
    tags: string[];
    scenario: string;
  }
): Promise<{ data: TestCase }> {
  const url = `${API_BASE}/projects/${projectId}/test-cases/${testCaseId}/scenario`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error updating test case scenario");
  return res.json();
}

export async function suggestTestCases(
  projectId: string,
  data: {
    entityName: string;
    section: string;
    requirements: string;
  }
): Promise<{ 
  suggestions: Array<{
    shortPrompt: string;
    shortDescription: string;
    detailedDescription: string;
  }>;
  totalSuggestions: number;
  message: string;
}> {
  const url = `${API_BASE}/projects/${projectId}/ai/test-cases/suggest`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    try {
      const err = await res.json();
      const msg = err?.error?.message || err?.message || "Error suggesting test cases";
      throw new Error(Array.isArray(msg) ? msg.join("; ") : msg);
    } catch (e:any) {
      throw new Error(e?.message || "Error suggesting test cases");
    }
  }
  
  const response = await res.json();
  console.log(`[DEBUG] Suggest response:`, response);
  
  // Handle wrapped response format
  if (response && response.success && response.data) {
    console.log(`[DEBUG] Using wrapped response format`);
    return response.data;
  } else if (response && response.suggestions) {
    console.log(`[DEBUG] Using direct response format`);
    return response;
  } else {
    console.warn(`[DEBUG] Unexpected response format:`, response);
    throw new Error("Unexpected response format from suggestion endpoint");
  }
} 

// Get sections and entities for a specific project
export async function getProjectSectionsAndEntities(projectId: string): Promise<{
  sections: string[];
  entities: string[];
}> {
  const url = `${API_BASE}/projects/${projectId}/endpoints`;
  console.log(`[DEBUG] Fetching endpoints from: ${url}`);
  
  const res = await fetch(url);
  if (!res.ok) {
    try {
      const err = await res.json();
      const msg = err?.error?.message || err?.message || "Error fetching project data";
      throw new Error(Array.isArray(msg) ? msg.join("; ") : msg);
    } catch (e:any) {
      throw new Error(e?.message || "Error fetching project data");
    }
  }
  
  const response = await res.json();
  console.log(`[DEBUG] Raw response:`, response);
  console.log(`[DEBUG] Response type:`, typeof response);
  console.log(`[DEBUG] Is array:`, Array.isArray(response));
  
  // Handle different response formats
  let endpoints: Array<{ section: string; entityName: string }> = [];
  
  if (Array.isArray(response)) {
    // Direct array response
    console.log(`[DEBUG] Using direct array response`);
    endpoints = response;
  } else if (response && Array.isArray(response.data)) {
    // Response with data property
    console.log(`[DEBUG] Using response.data array`);
    endpoints = response.data;
  } else if (response && typeof response === 'object') {
    // Try to extract endpoints from object response
    console.log(`[DEBUG] Trying to extract from object response`);
    endpoints = response.endpoints || response.items || [];
  }
  
  console.log(`[DEBUG] Final endpoints:`, endpoints);
  
  // Ensure endpoints is always an array
  if (!Array.isArray(endpoints)) {
    console.warn('Unexpected endpoints format:', response);
    endpoints = [];
  }
  
  // Extract unique sections and entities
  const sections = [...new Set(endpoints.map((endpoint) => endpoint.section))].sort();
  const entities = [...new Set(endpoints.map((endpoint) => endpoint.entityName))].sort();
  
  console.log(`[DEBUG] Extracted sections:`, sections);
  console.log(`[DEBUG] Extracted entities:`, entities);
  
  return { sections, entities };
}

// Get entities for a specific project and section
export async function getProjectEntities(projectId: string, section: string): Promise<string[]> {
  const url = `${API_BASE}/projects/${projectId}/endpoints`;
  const res = await fetch(url);
  if (!res.ok) {
    try {
      const err = await res.json();
      const msg = err?.error?.message || err?.message || "Error fetching project entities";
      throw new Error(Array.isArray(msg) ? msg.join("; ") : msg);
    } catch (e:any) {
      throw new Error(e?.message || "Error fetching project entities");
    }
  }
  
  const response = await res.json();
  
  // Handle different response formats
  let endpoints: Array<{ section: string; entityName: string }> = [];
  
  if (Array.isArray(response)) {
    // Direct array response
    endpoints = response;
  } else if (response && Array.isArray(response.data)) {
    // Response with data property
    endpoints = response.data;
  } else if (response && typeof response === 'object') {
    // Try to extract endpoints from object response
    endpoints = response.endpoints || response.items || [];
  }
  
  // Ensure endpoints is always an array
  if (!Array.isArray(endpoints)) {
    console.warn('Unexpected endpoints format:', response);
    endpoints = [];
  }
  
  // Filter by section and extract unique entities
  const entities = [...new Set(
    endpoints
      .filter((endpoint) => endpoint.section === section)
      .map((endpoint) => endpoint.entityName)
  )].sort();
  
  return entities;
} 