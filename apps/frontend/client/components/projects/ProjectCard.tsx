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
  Trash2,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  ExternalLink,
  Code,
} from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { replaceParams } from "@/lib/translations";
import type { TranslationKey } from "@/lib/translations";

// API Configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "/v1/api";

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

// Utility: build last run label with translations
function formatLastRun(
  lastExecution: string | null,
  t: (k: TranslationKey) => string,
  replaceParamsFn: (s: string, p: Record<string, string | number>) => string
): string {
  if (!lastExecution) return t("projects.lastRunNever");
  const lastRun = new Date(lastExecution);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - lastRun.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return t("projects.lastRunJustNow");
  if (diffInHours < 24) return replaceParamsFn(t("projects.lastRunHoursAgo"), { count: diffInHours });
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return replaceParamsFn(t("projects.lastRunDaysAgo"), { count: diffInDays });
  return lastRun.toLocaleDateString();
}

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

function openProjectInEditor(
  project: Project,
  editor: string,
  toast: any,
  t: (k: TranslationKey) => string,
  replaceParamsFn: (s: string, p: Record<string, string | number>) => string
) {
  const projectPath = project.path;
  if (!projectPath) {
    toast({
      title: t("projects.toastError"),
      description: t("projects.toastNoPath"),
      variant: "destructive",
    });
    return;
  }
  try {
    if (editor === "vscode") {
      const vscodeUrl = `vscode://file/${encodeURIComponent(projectPath)}`;
      window.open(vscodeUrl, "_blank");
      toast({
        title: t("projects.openProject"),
        description: replaceParamsFn(t("projects.toastOpeningIn"), { name: project.name, editor: "VS Code" }),
      });
    } else if (editor === "cursor") {
      const cursorUrl = `cursor://file/${encodeURIComponent(projectPath)}`;
      window.open(cursorUrl, "_blank");
      toast({
        title: t("projects.openProject"),
        description: replaceParamsFn(t("projects.toastOpeningIn"), { name: project.name, editor: "Cursor" }),
      });
    } else {
      const fileUrl = `file://${projectPath}`;
      window.open(fileUrl, "_blank");
      toast({
        title: t("projects.openProject"),
        description: replaceParamsFn(t("projects.toastOpeningIn"), { name: project.name, editor }),
      });
    }
  } catch (error) {
    console.error("Error opening project in editor:", error);
    toast({
      title: t("projects.toastError"),
      description: replaceParamsFn(t("projects.toastOpenError"), { editor }),
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
  toast,
}: ProjectCardProps) {
  const { t } = useTranslation();
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
    ? formatLastRun(executionSummaryData.data.lastExecution, t, replaceParams)
    : t("projects.lastRunNever");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-[#34D399]" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-[#F87171]" />;
      case "pending":
        return <Clock className="h-4 w-4 text-[#FBBF24]" />;
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ready":
        return t("projects.statusReady");
      case "failed":
        return t("projects.statusFailed");
      case "pending":
        return t("projects.statusPending");
      default:
        return status;
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(project.status)}
            <Badge variant={getStatusColor(project.status) as any}>
              {getStatusLabel(project.status)}
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
              <Button variant="ghost" className="h-8 w-8 p-0 text-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("projects.actions")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Edit className="mr-2 h-4 w-4" />
                {t("projects.editProject")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRunTests(project.id)}>
                <PlayCircle className="mr-2 h-4 w-4" />
                {t("projects.runTests")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-white [&_svg]:text-[#F87171]"
                onClick={() => onDelete(project)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("projects.deleteProjectAction")}
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
            <span className="text-muted-foreground">{t("projects.endpointsLabel")}</span>
            <span className="font-medium">{endpoints}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("projects.testCasesLabel")}</span>
            <span className="font-medium">{testCases}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("projects.lastRunLabel")}</span>
            <span className="font-medium">{lastRun}</span>
          </div>
          <div className="pt-3 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full" variant="success">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("projects.openProject")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{t("projects.openInEditor")}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openProjectInEditor(project, "vscode", toast, t, replaceParams)}>
                  <Code className="mr-2 h-4 w-4" />
                  VS Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openProjectInEditor(project, "cursor", toast, t, replaceParams)}>
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