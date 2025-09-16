import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Endpoint, EndpointMethod } from "@/components/types/endpoint.types";
import { 
  reloadData, 
  createEndpoint, 
  updateEndpoint, 
  deleteEndpoint
} from "@/services/endpointService";

export function useEndpoints() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | null>(null);
  const [newEndpoint, setNewEndpoint] = useState({
    projectId: "",
    section: "",
    entityName: "",
    path: "",
    name: "",
    description: "",
    methods: [] as EndpointMethod[],
  });
  
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isComprehensiveDialogOpen, setIsComprehensiveDialogOpen] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [editingComprehensiveEndpoint, setEditingComprehensiveEndpoint] = useState<Endpoint | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [registerActiveTab, setRegisterActiveTab] = useState("basic");
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const resetDialogStates = useCallback(() => {
    setIsRegisterDialogOpen(false);
    setEditingEndpoint(null);
    setOpenDropdownId(null);
    setIsComprehensiveDialogOpen(false);
    setSelectedEndpoint(null);
    setEditingComprehensiveEndpoint(null);
    setNewEndpoint({
      projectId: "",
      section: "",
      entityName: "",
      path: "",
      name: "",
      description: "",
      methods: [] as EndpointMethod[],
    });
    setRegisterActiveTab("basic");
  }, []);

  const handleDialogClose = useCallback(() => {
    requestAnimationFrame(() => {
      resetDialogStates();
    });
  }, [resetDialogStates]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { projects: allProjects, endpoints: allEndpoints } = await reloadData();
        setProjects(allProjects);
        setEndpoints(allEndpoints);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [toast]);

  useEffect(() => {
    return () => {
      resetDialogStates();
    };
  }, [resetDialogStates]);

  const filteredEndpoints = endpoints.filter((endpoint) => {
    const matchesSearch =
      endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.entityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject =
      projectFilter === "all" || endpoint.projectId === projectFilter;
    const matchesMethod =
      methodFilter === "all" ||
      endpoint.methods.some((m) => m.method === methodFilter);
    const matchesStatus =
      statusFilter === "all" || endpoint.status === statusFilter;
    return matchesSearch && matchesProject && matchesMethod && matchesStatus;
  });

  const handleRegisterEndpoint = async () => {
    if (!newEndpoint.path || !newEndpoint.entityName || !newEndpoint.projectId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newEndpoint.methods.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one HTTP method",
        variant: "destructive",
      });
      return;
    }

    try {
      const endpointData = {
        name: newEndpoint.name || `${newEndpoint.entityName} API`,
        path: newEndpoint.path,
        section: newEndpoint.section,
        entityName: newEndpoint.entityName,
        methods: newEndpoint.methods,
        description: newEndpoint.description,
      };

      await createEndpoint(newEndpoint.projectId, endpointData);
      
      toast({
        title: "Success",
        description: "Endpoint registered successfully",
      });

      // Close dialog first
      resetDialogStates();
      
      // Then reload data
      const { projects: allProjects, endpoints: allEndpoints } = await reloadData();
      setProjects(allProjects);
      setEndpoints(allEndpoints);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register endpoint",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEndpoint = async () => {
    if (!editingEndpoint) return;

    if (!newEndpoint.path || !newEndpoint.entityName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newEndpoint.methods.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one HTTP method",
        variant: "destructive",
      });
      return;
    }

    try {
      const endpointData = {
        name: newEndpoint.name,
        path: newEndpoint.path,
        section: newEndpoint.section,
        entityName: newEndpoint.entityName,
        methods: newEndpoint.methods,
        description: newEndpoint.description,
      };

      await updateEndpoint(editingEndpoint.projectId, editingEndpoint.endpointId, endpointData);
      
      toast({
        title: "Success",
        description: "Endpoint updated successfully",
      });

      // Close dialog first
      resetDialogStates();
      
      // Then reload data
      const { projects: allProjects, endpoints: allEndpoints } = await reloadData();
      setProjects(allProjects);
      setEndpoints(allEndpoints);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update endpoint",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEndpoint = async (endpoint: Endpoint) => {
    if (!confirm("Are you sure you want to delete this endpoint?")) return;

    try {
      await deleteEndpoint(endpoint.projectId, endpoint.endpointId);
      
      toast({
        title: "Success",
        description: "Endpoint deleted successfully",
      });

      const { projects: allProjects, endpoints: allEndpoints } = await reloadData();
      setProjects(allProjects);
      setEndpoints(allEndpoints);
      
      resetDialogStates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete endpoint",
        variant: "destructive",
      });
    }
  };

  const handleReanalyzeEndpoint = async (endpoint: Endpoint) => {
    try {
      // Preparar los datos del endpoint para reanalizar
      const endpointData = {
        name: endpoint.name,
        path: endpoint.path,
        section: endpoint.section,
        entityName: endpoint.entityName,
        methods: endpoint.methods,
        description: endpoint.description || "",
      };

      // Primero eliminar el endpoint existente
      await deleteEndpoint(endpoint.projectId, endpoint.endpointId);

      // Luego crear el endpoint nuevamente con los mismos datos
      await createEndpoint(endpoint.projectId, endpointData);
      
      toast({
        title: "Success",
        description: "Endpoint reanalysis started",
      });

      const { projects: allProjects, endpoints: allEndpoints } = await reloadData();
      setProjects(allProjects);
      setEndpoints(allEndpoints);
      
      resetDialogStates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reanalyze endpoint",
        variant: "destructive",
      });
    }
  };

  const handleGenerateTests = (endpoint: Endpoint) => {
    navigate("/test-cases");
  };

  const handleOpenComprehensiveDialog = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setEditingComprehensiveEndpoint({...endpoint});
    setIsEditing(false);
    setIsComprehensiveDialogOpen(true);
    setOpenDropdownId(null);
  };

  const handleComprehensiveDialogClose = () => {
    handleDialogClose();
  };

  const handleComprehensiveUpdate = async () => {
    if (!editingComprehensiveEndpoint) return;

    try {
      setIsUpdating(true);
      
      setIsEditing(false);
      handleComprehensiveDialogClose();
      
      await deleteEndpoint(
        editingComprehensiveEndpoint.projectId,
        editingComprehensiveEndpoint.endpointId
      );

      await createEndpoint(
        editingComprehensiveEndpoint.projectId,
        {
          name: editingComprehensiveEndpoint.name,
          path: editingComprehensiveEndpoint.path,
          section: editingComprehensiveEndpoint.section,
          entityName: editingComprehensiveEndpoint.entityName,
          methods: editingComprehensiveEndpoint.methods,
          description: editingComprehensiveEndpoint.description || "",
        }
      );

      toast({
        title: "Success",
        description: "Endpoint updated successfully",
      });

      const { endpoints: updatedEndpoints } = await reloadData();
      setEndpoints(updatedEndpoints);
    } catch (error) {
      console.error("Error updating endpoint:", error);
      toast({
        title: "Error",
        description: "Failed to update endpoint",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComprehensiveDelete = async () => {
    if (!selectedEndpoint) return;

    try {
      await deleteEndpoint(selectedEndpoint.projectId, selectedEndpoint.endpointId);

      toast({
        title: "Success",
        description: "Endpoint deleted successfully",
      });

      const { endpoints: updatedEndpoints } = await reloadData();
      setEndpoints(updatedEndpoints);
      handleComprehensiveDialogClose();
    } catch (error) {
      console.error("Error deleting endpoint:", error);
      toast({
        title: "Error",
        description: "Failed to delete endpoint",
        variant: "destructive",
      });
    }
  };

  const handleEditEndpoint = (endpoint: Endpoint) => {
    const methodsForForm = endpoint.methods.map(method => ({
      method: method.method,
      requestBodyDefinition: method.requestBodyDefinition || [],
      description: method.description || "",
      requiresAuth: method.requiresAuth || false
    }));
    
    setEditingEndpoint(endpoint);
    setNewEndpoint({
      projectId: endpoint.projectId,
      section: endpoint.section,
      entityName: endpoint.entityName,
      path: endpoint.path,
      name: endpoint.name,
      description: "",
      methods: methodsForForm,
    });
    setIsRegisterDialogOpen(true);
    setOpenDropdownId(null);
  };

  return {
    // State
    endpoints,
    projects,
    loading,
    searchTerm,
    setSearchTerm,
    projectFilter,
    setProjectFilter,
    methodFilter,
    setMethodFilter,
    statusFilter,
    setStatusFilter,
    isRegisterDialogOpen,
    setIsRegisterDialogOpen,
    editingEndpoint,
    newEndpoint,
    setNewEndpoint,
    openDropdownId,
    setOpenDropdownId,
    isComprehensiveDialogOpen,
    setIsComprehensiveDialogOpen,
    selectedEndpoint,
    editingComprehensiveEndpoint,
    setEditingComprehensiveEndpoint,
    isEditing,
    setIsEditing,
    isUpdating,
    registerActiveTab,
    setRegisterActiveTab,
    filteredEndpoints,
    
    // Actions
    handleRegisterEndpoint,
    handleUpdateEndpoint,
    handleDeleteEndpoint,
    handleReanalyzeEndpoint,
    handleGenerateTests,
    handleOpenComprehensiveDialog,
    handleComprehensiveDialogClose,
    handleComprehensiveUpdate,
    handleComprehensiveDelete,
    handleEditEndpoint,
    handleDialogClose,
    reloadData,
  };
} 