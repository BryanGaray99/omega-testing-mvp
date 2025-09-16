import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit,
  Trash,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  ExternalLink,
  Code,
} from "lucide-react";

// API Configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/v1/api";

interface Project {
  id: string;
  name: string;
  displayName?: string;
  baseUrl: string;
  basePath?: string;
  type: "playwright-bdd" | "api-only";
  status: "pending" | "ready" | "failed";
  endpoints: number;
  testCases: number;
  lastRun: string;
  createdAt: string;
  path?: string;
}

// Utility Functions
const formatLastRun = (lastExecution: string | null) => {
  if (!lastExecution) return "Never";
  
  const lastRun = new Date(lastExecution);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - lastRun.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return lastRun.toLocaleDateString();
};

// API Functions
async function fetchProjectEndpoints(projectId: string) {
  const url = `${API_BASE}/projects/${projectId}/endpoints`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching project endpoints");
  return res.json();
}

async function fetchProjectTestCases(projectId: string) {
  const url = `${API_BASE}/projects/${projectId}/test-cases`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching project test cases");
  return res.json();
}

async function fetchProjectExecutionSummary(projectId: string) {
  const url = `${API_BASE}/projects/${projectId}/test-execution/summary`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching project execution summary");
  return res.json();
}

// Función para abrir proyecto en editor externo
function openProjectInEditor(project: Project, editor: string, toast: any) {
  // Usar la ruta del proyecto que viene del backend
  const projectPath = project.path;
  
  if (!projectPath) {
    toast({
      title: "Error",
      description: "No se encontró la ruta del proyecto. Contacta al administrador.",
      variant: "destructive",
    });
    return;
  }
  
  // Intentar abrir el proyecto en el editor especificado
  try {
    if (editor === 'vscode') {
      // Usar el protocolo vscode:// para abrir VS Code
      const vscodeUrl = `vscode://file/${encodeURIComponent(projectPath)}`;
      window.open(vscodeUrl, '_blank');
      toast({
        title: "Proyecto abierto",
        description: `Abriendo ${project.name} en VS Code...`,
      });
    } else if (editor === 'cursor') {
      // Usar el protocolo cursor:// para abrir Cursor
      const cursorUrl = `cursor://file/${encodeURIComponent(projectPath)}`;
      window.open(cursorUrl, '_blank');
      toast({
        title: "Proyecto abierto",
        description: `Abriendo ${project.name} en Cursor...`,
      });
    } else {
      // Fallback: intentar abrir con el comando del sistema
      const fileUrl = `file://${projectPath}`;
      window.open(fileUrl, '_blank');
      toast({
        title: "Proyecto abierto",
        description: `Abriendo ${project.name} en el editor del sistema...`,
      });
    }
  } catch (error) {
    console.error('Error opening project in editor:', error);
    toast({
      title: "Error",
      description: `No se pudo abrir el proyecto en ${editor}. Asegúrate de que ${editor} esté instalado y configurado.`,
      variant: "destructive",
    });
  }
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onRunTests: (projectId: string) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  toast: any;
}

export default function ProjectCard({ 
  project, 
  onEdit, 
  onDelete, 
  onRunTests,
  openDropdownId,
  setOpenDropdownId,
  toast
}: ProjectCardProps) {
  // Fetch project-specific data
  const { data: endpointsData } = useQuery({
    queryKey: ["project-endpoints", project.id],
    queryFn: () => fetchProjectEndpoints(project.id),
    enabled: !!project.id,
  });

  const { data: testCasesData } = useQuery({
    queryKey: ["project-test-cases", project.id],
    queryFn: () => fetchProjectTestCases(project.id),
    enabled: !!project.id,
  });

  const { data: executionSummaryData } = useQuery({
    queryKey: ["project-execution-summary", project.id],
    queryFn: () => fetchProjectExecutionSummary(project.id),
    enabled: !!project.id,
  });

  const endpoints = Array.isArray(endpointsData?.data) ? endpointsData.data.length : 0;
  const testCases = Array.isArray(testCasesData?.data?.testCases) ? testCasesData.data.testCases.length : 0;
  const lastRun = executionSummaryData?.data?.lastExecution 
    ? formatLastRun(executionSummaryData.data.lastExecution)
    : "Never";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-error" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "default";
      case "failed":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(project.status)}
            <Badge variant={getStatusColor(project.status) as any}>
              {project.status}
            </Badge>
          </div>
          <DropdownMenu
            open={openDropdownId === project.id}
            onOpenChange={(open) => {
              if (!open) {
                setOpenDropdownId(null);
              } else {
                setOpenDropdownId(project.id);
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRunTests(project.id)}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Run Tests
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete(project)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg">{project.name}</CardTitle>
        {project.displayName && (
          <p className="text-sm text-muted-foreground overflow-hidden h-10">
            {project.displayName}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground truncate">
              {project.baseUrl}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Endpoints:</span>
            <span className="font-medium">{endpoints}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Test Cases:</span>
            <span className="font-medium">{testCases}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Run:</span>
            <span className="font-medium">{lastRun}</span>
          </div>
          <div className="pt-3 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                            <Button className="w-full bg-green-100 hover:bg-green-200 text-green-800 border-green-300 hover:border-green-400" variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Project
            </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Open in Editor</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openProjectInEditor(project, 'vscode', toast)}>
                  <Code className="mr-2 h-4 w-4" />
                  VS Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openProjectInEditor(project, 'cursor', toast)}>
                  <Code className="mr-2 h-4 w-4" />
                  Cursor
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 