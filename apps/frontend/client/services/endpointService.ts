import { Endpoint, CreateEndpointData, UpdateEndpointData } from "../components/types/endpoint.types";

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || "/v1/api";

export async function fetchEndpoints(projectId?: string): Promise<{ data: Endpoint[] }> {
  if (projectId) {
    const url = `${API_BASE}/projects/${projectId}/endpoints`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error fetching endpoints");
    return res.json();
  } else {
    const url = `${API_BASE}/endpoints`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error fetching endpoints");
    return res.json();
  }
}

export async function createEndpoint(projectId: string, endpointData: CreateEndpointData): Promise<{ data: Endpoint }> {
  const url = `${API_BASE}/projects/${projectId}/endpoints`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(endpointData),
  });
  if (!res.ok) throw new Error("Error creating endpoint");
  return res.json();
}

export async function updateEndpoint(projectId: string, endpointId: string, endpointData: UpdateEndpointData): Promise<{ data: Endpoint }> {
  const url = `${API_BASE}/projects/${projectId}/endpoints/${endpointId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(endpointData),
  });
  if (!res.ok) throw new Error("Error updating endpoint");
  return res.json();
}

export async function deleteEndpoint(projectId: string, endpointId: string): Promise<{ data: any }> {
  const url = `${API_BASE}/projects/${projectId}/endpoints/${endpointId}`;
  const res = await fetch(url, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error deleting endpoint");
  return res.json();
}

export async function fetchProjects(): Promise<{ data: any[] }> {
  const url = `${API_BASE}/projects`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching projects");
  return res.json();
}

// Helper function to reload all data
export async function reloadData(): Promise<{ projects: any[], endpoints: Endpoint[] }> {
  try {
    const endpointsResponse = await fetch(`${API_BASE}/endpoints`);
    if (endpointsResponse.ok) {
      const endpointsData = await endpointsResponse.json();
      const allEndpoints = endpointsData.data || [];
      
      const projectIds = [...new Set(allEndpoints.map((endpoint: any) => endpoint.projectId))];
      
      const projectsResponse = await fetch(`${API_BASE}/projects`);
      let allProjects: any[] = [];
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        allProjects = projectsData.data || [];
      }
      
      const endpointsWithProject = allEndpoints.map((endpoint: any) => {
        const project = allProjects.find((p: any) => p.id === endpoint.projectId);
        return {
          endpointId: endpoint.endpointId,
          name: endpoint.name,
          path: endpoint.path,
          section: endpoint.section,
          entityName: endpoint.entityName,
          projectId: endpoint.projectId,
          projectName: project?.name || 'Unknown Project',
          methods: endpoint.methods,
          status: endpoint.status,
          createdAt: endpoint.createdAt,
          updatedAt: endpoint.updatedAt,
          generatedArtifacts: endpoint.generatedArtifacts,
          analysisResults: endpoint.analysisResults
        };
      });
      
      return { projects: allProjects, endpoints: endpointsWithProject };
    }
    return { projects: [], endpoints: [] };
  } catch (error) {
    console.error("Error reloading data:", error);
    return { projects: [], endpoints: [] };
  }
} 