import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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

interface CreateProjectData {
  name: string;
  displayName: string;
  baseUrl: string;
  basePath: string;
  type: 'playwright-bdd' | 'api-only';
}

interface UpdateProjectData {
  displayName: string;
  baseUrl: string;
  basePath: string;
}

// API Functions
async function fetchProjects() {
  const url = `${API_BASE}/projects`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching projects");
  return res.json();
}

async function createProject(projectData: CreateProjectData) {
  const url = `${API_BASE}/projects`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectData),
  });
  if (!res.ok) throw new Error("Error creating project");
  return res.json();
}

async function updateProject(projectId: string, projectData: UpdateProjectData) {
  const url = `${API_BASE}/projects/${projectId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });
  if (!res.ok) throw new Error("Error updating project");
  return res.json();
}

async function deleteProject(projectId: string) {
  const url = `${API_BASE}/projects/${projectId}`;
  const res = await fetch(url, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error("Error deleting project");
  return res.json();
}

async function runProjectTests(projectId: string) {
  const url = `${API_BASE}/projects/${projectId}/test-execution/execute`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}), // Enviamos un objeto vacío para ejecutar todos los test cases
  });
  if (!res.ok) throw new Error("Error running tests");
  return res.json();
}

export function useProjects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    displayName: "",
    baseUrl: "",
    basePath: "/v1/api",
    type: "playwright-bdd" as 'playwright-bdd' | 'api-only',
  });

  // Estados para editar proyecto
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectData, setEditProjectData] = useState({
    displayName: "",
    baseUrl: "",
    basePath: "/v1/api",
  });

  // Estados para eliminar proyecto
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Estado para controlar el DropdownMenu
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Función para limpiar todos los estados de diálogos
  const resetDialogStates = useCallback(() => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setEditingProject(null);
    setDeletingProject(null);
    setDeleteConfirmation("");
    setOpenDropdownId(null); // Cerrar cualquier dropdown abierto
    setNewProject({
      name: "",
      displayName: "",
      baseUrl: "",
      basePath: "/v1/api",
      type: "playwright-bdd" as 'playwright-bdd' | 'api-only',
    });
    setEditProjectData({
      displayName: "",
      baseUrl: "",
      basePath: "/v1/api",
    });
  }, []);

  // Función para manejar el cierre de diálogos de forma segura
  const handleDialogClose = useCallback((dialogType: 'create' | 'edit' | 'delete') => {
    // Usar requestAnimationFrame para asegurar que el DOM se actualice correctamente
    requestAnimationFrame(() => {
      resetDialogStates();
    });
  }, [resetDialogStates]);

  // Fetch projects
  const { data: projectsData, isLoading: loadingProjects, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const reloadData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const projects = Array.isArray(projectsData?.data) ? projectsData.data : [];

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      resetDialogStates();
      toast({
        title: "Project created",
        description: "The project has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdateProjectData }) => 
      updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      resetDialogStates();
      toast({
        title: "Project updated",
        description: "The project has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      resetDialogStates();
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Run tests mutation
  const runTestsMutation = useMutation({
    mutationFn: runProjectTests,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Tests started",
        description: data.data?.message || "Test execution has been initiated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start test execution. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.displayName && project.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Actions
  const handleCreateProject = () => {
    if (!newProject.name || !newProject.baseUrl) {
      return;
    }

    createProjectMutation.mutate({
      name: newProject.name,
      displayName: newProject.displayName,
      baseUrl: newProject.baseUrl,
      basePath: newProject.basePath,
      type: newProject.type,
    });
  };

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setEditProjectData({
      displayName: project.displayName || "",
      baseUrl: project.baseUrl,
      basePath: project.basePath || "/v1/api",
    });
    setIsEditDialogOpen(true);
    setOpenDropdownId(null); // Cerrar el dropdown al abrir el diálogo
  }, []);

  const handleUpdateProject = () => {
    if (!editingProject || !editProjectData.baseUrl) {
      return;
    }

    updateProjectMutation.mutate({
      projectId: editingProject.id,
      data: {
        displayName: editProjectData.displayName,
        baseUrl: editProjectData.baseUrl,
        basePath: editProjectData.basePath,
      },
    });
  };

  const handleDeleteProject = useCallback((project: Project) => {
    setDeletingProject(project);
    setDeleteConfirmation("");
    setIsDeleteDialogOpen(true);
    setOpenDropdownId(null); // Cerrar el dropdown al abrir el diálogo
  }, []);

  const handleConfirmDelete = () => {
    if (!deletingProject || deleteConfirmation !== deletingProject.name) {
      return;
    }

    deleteProjectMutation.mutate(deletingProject.id);
  };

  const handleRunTests = useCallback((projectId: string) => {
    runTestsMutation.mutate(projectId);
  }, [runTestsMutation]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      resetDialogStates();
    };
  }, [resetDialogStates]);

  return {
    // State
    loadingProjects,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    newProject,
    setNewProject,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editingProject,
    editProjectData,
    setEditProjectData,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deletingProject,
    deleteConfirmation,
    setDeleteConfirmation,
    openDropdownId,
    setOpenDropdownId,
    filteredProjects,
    
    // Actions
    handleCreateProject,
    handleEditProject,
    handleUpdateProject,
    handleDeleteProject,
    handleConfirmDelete,
    handleRunTests,
    handleDialogClose,
    resetDialogStates,
    reloadData,
    
    // Mutations
    createProjectMutation,
    updateProjectMutation,
    deleteProjectMutation,
    runTestsMutation,
  };
} 