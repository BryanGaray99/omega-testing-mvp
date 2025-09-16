import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, CheckCircle, XCircle, FolderKanban } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/v1/api";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SyncResult {
  success: boolean;
  message: string;
  data: {
    projectId: string;
    endpointsUpdated: number;
    testCasesSynced: number;
    stepsSynced: number;
    scenariosAdded: number;
    processingTime: number;
    details: {
      sections: string[];
      entities: string[];
      errors: string[];
    };
  };
}

interface SyncProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SyncProjectDialog({ open, onOpenChange }: SyncProjectDialogProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<Record<string, SyncResult>>({});
  const [syncingProjects, setSyncingProjects] = useState<Set<string>>(new Set());
  const [syncedProjects, setSyncedProjects] = useState<Set<string>>(new Set());

  // Fetch projects
  const { data: projectsResponse, isLoading: loadingProjects, error: projectsError, refetch: refetchProjects } = useQuery<{ success: boolean; data: Project[]; metadata: any }>({
    queryKey: ['projects'],
    queryFn: async () => {
      console.log('Fetching projects...');
      console.log('API_BASE:', API_BASE);
      
      // Test the connection first
      try {
        const testResponse = await fetch(`${API_BASE}/health`);
        console.log('Health check response:', testResponse.status);
      } catch (error) {
        console.error('Health check failed:', error);
      }
      
      const response = await fetch(`${API_BASE}/projects`);
      console.log('Projects response status:', response.status);
      console.log('Projects response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch projects:', errorText);
        throw new Error(`Failed to fetch projects: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Projects data:', data);
      
      // The backend uses TransformInterceptor, so response is wrapped
      if (data && data.success && Array.isArray(data.data)) {
        return data;
      } else {
        console.warn('Unexpected projects response format:', data);
        return { success: true, data: [], metadata: {} };
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Extract projects array from response
  const projects = projectsResponse?.data || [];

  console.log('Projects state:', { projects, loadingProjects, error: projectsError, projectsResponse });

  const syncProject = async (projectId: string) => {
    setSyncingProjects(prev => new Set(prev).add(projectId));
    
    try {
      console.log('Syncing project:', projectId);
      const response = await fetch(`${API_BASE}/sync/projects/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sync failed: ${response.status} ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Sync response data:', responseData);
      
      // The backend uses TransformInterceptor, so response is wrapped
      const result: SyncResult = responseData.data || responseData;
      console.log('Sync result:', result);
      
      setSyncResults(prev => ({
        ...prev,
        [projectId]: result
      }));

      // Si el sync fue exitoso, agregar al estado temporal de "synced"
      if (result.success) {
        setSyncedProjects(prev => new Set(prev).add(projectId));
        
        // Remover del estado "synced" después de 1 minuto
        setTimeout(() => {
          setSyncedProjects(prev => {
            const newSet = new Set(prev);
            newSet.delete(projectId);
            return newSet;
          });
        }, 60000); // 1 minuto
      }

      // Refetch projects to get updated data
      refetchProjects();
      
    } catch (error) {
      console.error('Sync error:', error);
      setSyncResults(prev => ({
        ...prev,
        [projectId]: {
          success: false,
          message: error instanceof Error ? error.message : 'Sync failed',
          data: {
            projectId,
            endpointsUpdated: 0,
            testCasesSynced: 0,
            stepsSynced: 0,
            scenariosAdded: 0,
            processingTime: 0,
            details: {
              sections: [],
              entities: [],
              errors: [error instanceof Error ? error.message : 'Unknown error']
            }
          }
        }
      }));
    } finally {
      setSyncingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  };

  const syncAllProjects = async () => {
    if (!projects) return;
    
    for (const project of projects) {
      await syncProject(project.id);
    }
  };

  const getProjectStatus = (projectId: string) => {
    const result = syncResults[projectId];
    const isSynced = syncedProjects.has(projectId);
    
    if (isSynced) return 'synced';
    if (!result) return 'pending';
    return result.success ? 'success' : 'error';
  };

  const getStatusIcon = (projectId: string) => {
    const status = getProjectStatus(projectId);
    const isSyncing = syncingProjects.has(projectId);
    
    if (isSyncing) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (projectId: string) => {
    const status = getProjectStatus(projectId);
    const isSyncing = syncingProjects.has(projectId);
    
    if (isSyncing) {
      return <Badge variant="secondary">Syncing...</Badge>;
    }
    
    switch (status) {
      case 'synced':
        return <Badge variant="default" className="bg-green-500">Synced</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Synced</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sync Projects
          </DialogTitle>
          <DialogDescription>
            Synchronize all project files with the database. This will update endpoints, test cases, and steps.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sync All Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium">Sync All Projects</h3>
              <p className="text-xs text-muted-foreground">
                Synchronize all projects at once
              </p>
            </div>
            <Button 
              onClick={syncAllProjects}
              disabled={loadingProjects || syncingProjects.size > 0 || !projects || projects.length === 0}
              className="flex items-center gap-2"
            >
              {syncingProjects.size > 0 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sync All
            </Button>
          </div>

          {/* Error Display */}
          {projectsError && (
            <Alert variant="destructive">
              <AlertDescription>
                Error loading projects: {projectsError.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Projects List */}
          {loadingProjects ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading projects...</span>
            </div>
          ) : projectsError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">Failed to load projects</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {projectsError.message}
                </p>
                <Button 
                  onClick={() => refetchProjects()} 
                  variant="outline" 
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          ) : !projects || projects.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No projects found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create a project first to sync it with the database.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => {
                const result = syncResults[project.id];
                const isSyncing = syncingProjects.has(project.id);
                
                return (
                  <Card key={project.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(project.id)}
                          <div>
                            <CardTitle className="text-base">{project.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {project.description || 'No description'}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(project.id)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => syncProject(project.id)}
                            disabled={isSyncing}
                          >
                            {isSyncing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Sync Results */}
                    {result && (
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <Alert variant={result.success ? "default" : "destructive"}>
                            <AlertDescription>
                              {result.message}
                            </AlertDescription>
                          </Alert>

                          {result.success && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="font-medium text-green-600">
                                  {result.data.endpointsUpdated}
                                </div>
                                <div className="text-muted-foreground">Endpoints</div>
                              </div>
                              <div>
                                <div className="font-medium text-blue-600">
                                  {result.data.testCasesSynced}
                                </div>
                                <div className="text-muted-foreground">Test Cases</div>
                              </div>
                              <div>
                                <div className="font-medium text-purple-600">
                                  {result.data.stepsSynced}
                                </div>
                                <div className="text-muted-foreground">Steps</div>
                              </div>
                              <div>
                                <div className="font-medium text-orange-600">
                                  {result.data.scenariosAdded}
                                </div>
                                <div className="text-muted-foreground">Scenarios Added</div>
                              </div>
                            </div>
                          )}

                          {result.data.details.errors.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-red-600">Errors:</h4>
                              <ul className="text-xs text-red-500 space-y-1">
                                {result.data.details.errors.map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
