import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { normalizeTimeToSeconds } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FolderKanban,
  Plus,
  RefreshCw,
} from "lucide-react";

// Fetch helpers
const API_BASE = import.meta.env.VITE_API_URL || "/v1/api";

async function fetchProjects() {
  const url = `${API_BASE}/projects`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching projects");
  return res.json();
}

async function fetchAllEndpoints() {
  const url = `${API_BASE}/endpoints`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching all endpoints");
  return res.json();
}

async function fetchGlobalExecutionSummary() {
  const url = `${API_BASE}/test-execution/summary`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching global execution summary");
  return res.json();
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  // 1. Obtener proyectos
  const { data: projectsData, isLoading: loadingProjects, refetch: refetchProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });
  const projects = Array.isArray(projectsData?.data) ? projectsData.data : [];
  const totalProjects = projects.length;

  // 2. Obtener todos los endpoints globales
  const { data: endpointsData, isLoading: loadingEndpoints, refetch: refetchEndpoints } = useQuery({
    queryKey: ["endpoints"],
    queryFn: fetchAllEndpoints,
  });
  const endpoints = Array.isArray(endpointsData?.data) ? endpointsData.data : [];
  console.log("[DASHBOARD] endpoints", endpoints);
  const totalEndpoints = endpoints.length;

  // 3. Obtener resumen global de ejecuciones
  const { data: summaryData, isLoading: loadingSummary, refetch: refetchSummary } = useQuery({
    queryKey: ["global-execution-summary"],
    queryFn: fetchGlobalExecutionSummary,
  });
  // Refresh on backend-ready event
  useEffect(() => {
    const onReady = () => {
      void handleRefresh();
    };
    window.addEventListener('backend-ready', onReady as EventListener);
    return () => window.removeEventListener('backend-ready', onReady as EventListener);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchProjects(),
        refetchEndpoints(),
        refetchSummary(),
      ]);
      await new Promise((r) => setTimeout(r, 500));
    } finally {
      setIsRefreshing(false);
    }
  };
  const summary = summaryData?.data;

  // 4. Loading states
  const loading = loadingProjects || loadingEndpoints || loadingSummary;

  // 5. Métricas
  const successRate = Number(summary?.successRate) || 0;
  const passedTests = Number(summary?.totalPassed) || 0;
  const failedTests = Number(summary?.totalFailed) || 0;
  const averageExecutionTime = Number(summary?.averageExecutionTime) || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Omega Testing
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your comprehensive assistant for api testing administration
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
          <Button asChild>
            <Link to="/projects">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ${isRefreshing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : totalProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : totalEndpoints}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : `${successRate.toFixed(1)}%`}</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed Tests</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{loading ? "-" : passedTests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Tests</CardTitle>
            <XCircle className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">{loading ? "-" : failedTests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Execution Time</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
                            <div className="text-2xl font-bold text-warning">{loading ? "-" : normalizeTimeToSeconds(averageExecutionTime)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
