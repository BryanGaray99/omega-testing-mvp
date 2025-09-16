import { useState, useMemo, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { TestCase, CreateTestCaseData, UpdateTestCaseData } from "@/components/types/testCase.types";
import { 
  reloadTestCasesData, 
  createTestCase, 
  updateTestCase, 
  deleteTestCase,
  runTestCase,
  updateTestCaseSteps
} from "@/services/testCaseService";

export function useTestCases() {
  // State
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // execution status
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isComprehensiveDialogOpen, setIsComprehensiveDialogOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [editingComprehensiveTestCase, setEditingComprehensiveTestCase] = useState<TestCase | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTestCase, setDeletingTestCase] = useState<TestCase | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTestCaseForSteps, setEditingTestCaseForSteps] = useState<TestCase | null>(null);
  const [isUpdatingSteps, setIsUpdatingSteps] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [newTestCase, setNewTestCase] = useState<CreateTestCaseData>({
    name: "",
    entityName: "",
    section: "",
    method: "",
    testType: "",
    scenario: "",
    description: "",
    tags: [],
  });

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'lastRun' | 'name'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  const { toast } = useToast();

  const resetDialogStates = useCallback(() => {
    setIsCreateDialogOpen(false);
    setIsComprehensiveDialogOpen(false);
    setSelectedTestCase(null);
    setEditingComprehensiveTestCase(null);
    setEditingTestCase(null);
    setOpenDropdownId(null);
    setIsEditing(false);
    setIsUpdating(false);
    setIsEditorOpen(false);
    setEditingTestCaseForSteps(null);
    setIsUpdatingSteps(false);
    setNewTestCase({
      name: "",
      entityName: "",
      section: "",
      method: "",
      testType: "",
      scenario: "",
      description: "",
      tags: [],
    });
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
        const { testCases: allTestCases } = await reloadTestCasesData();
        setTestCases(allTestCases);
        
        // Load projects data
        const projectsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/v1/api'}/projects`);
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData.data || []);
        }
      } catch (error) {
        console.error("Error loading test cases:", error);
        toast({
          title: "Error",
          description: "Failed to load test cases",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [toast]);

  // Handle URL parameters for opening test case details
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const testCaseId = searchParams.get('testCaseId');
    const openDetails = searchParams.get('openDetails');
    const tab = searchParams.get('tab');

    if (testCaseId && openDetails === 'true') {
      // Find the test case by ID
      const testCase = testCases.find(tc => tc.testCaseId === testCaseId);
      if (testCase) {
        setSelectedTestCase(testCase);
        setEditingComprehensiveTestCase(testCase);
        setIsComprehensiveDialogOpen(true);
        
        // Store the desired tab in sessionStorage for the dialog to use
        if (tab) {
          sessionStorage.setItem('openDialogTab', tab);
        }
        
        // Clear URL parameters after opening the dialog
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('testCaseId');
        newUrl.searchParams.delete('openDetails');
        newUrl.searchParams.delete('tab');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [testCases]);

  useEffect(() => {
    return () => {
      resetDialogStates();
    };
  }, [resetDialogStates]);

  // Reset page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, projectFilter, sectionFilter, entityFilter, methodFilter, statusFilter]);

  // Computed values
  const availableMethods = useMemo(() => {
    const unique = new Set<string>();
    testCases.forEach(tc => tc.method && unique.add(tc.method));
    return Array.from(unique);
  }, [testCases]);

  const availableSections = useMemo(() => {
    const unique = new Set<string>();
    testCases.forEach(tc => {
      if (projectFilter === 'all' || tc.projectId === projectFilter) {
        unique.add(tc.section);
      }
    });
    return Array.from(unique);
  }, [testCases, projectFilter]);

  const availableEntities = useMemo(() => {
    const unique = new Set<string>();
    testCases.forEach(tc => {
      const projectOk = projectFilter === 'all' || tc.projectId === projectFilter;
      const sectionOk = sectionFilter === 'all' || tc.section === sectionFilter;
      if (projectOk && sectionOk) {
        unique.add(tc.entityName);
      }
    });
    return Array.from(unique);
  }, [testCases, projectFilter, sectionFilter]);

  const filteredTestCases = useMemo(() => {
    return testCases.filter((testCase) => {
      const matchesSearch =
        testCase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testCase.scenario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testCase.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      // Project filter by projectId
      const matchesProject =
        projectFilter === "all" || testCase.projectId === projectFilter;

      // Section filter
      const matchesSection =
        sectionFilter === 'all' || testCase.section === sectionFilter;

      // Entity filter
      const matchesEntity =
        entityFilter === 'all' || testCase.entityName === entityFilter;

      // Method filter
      const matchesMethod =
        methodFilter === "all" || testCase.method === methodFilter;

      // Execution status filter
      let matchesExecStatus = true;
      if (statusFilter !== "all") {
        if (statusFilter === "pending") {
          matchesExecStatus = !testCase.lastRun;
        } else {
          matchesExecStatus = testCase.lastRunStatus === statusFilter;
        }
      }

      return matchesSearch && matchesProject && matchesSection && matchesEntity && matchesMethod && matchesExecStatus;
    });
  }, [testCases, searchTerm, projectFilter, sectionFilter, entityFilter, methodFilter, statusFilter]);

  const sortedFilteredTestCases = useMemo(() => {
    const data = [...filteredTestCases];
    const key = sortBy;
    data.sort((a, b) => {
      const aVal = a[key] ? new Date(a[key] as any).getTime() : 0;
      const bVal = b[key] ? new Date(b[key] as any).getTime() : 0;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return data;
  }, [filteredTestCases, sortBy, sortOrder]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(sortedFilteredTestCases.length / pageSize)), [sortedFilteredTestCases.length]);

  const visibleTestCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedFilteredTestCases.slice(start, start + pageSize);
  }, [sortedFilteredTestCases, currentPage]);

  const projectSections = useMemo(() => {
    const uniqueProjects = new Set(testCases.map((tc) => tc.section));
    return Array.from(uniqueProjects);
  }, [testCases]);

  // Actions
  const handleCreateTestCase = async () => {
    if (!newTestCase.name || !newTestCase.entityName || !newTestCase.section) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTestCase(newTestCase);
      
      toast({
        title: "Success",
        description: "Test case created successfully",
      });

      // Close dialog first
      resetDialogStates();
      
      // Then reload data
      const { testCases: allTestCases } = await reloadTestCasesData();
      setTestCases(allTestCases);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test case",
        variant: "destructive",
      });
    }
  };

  const handleEditTestCase = (testCase: TestCase) => {
    // Marcar que se debe activar la edición del escenario
    sessionStorage.setItem('editScenario', 'true');
    
    // Abrir el modal de detalles
    setSelectedTestCase(testCase);
    setEditingComprehensiveTestCase({...testCase});
    setIsEditing(false);
    setIsComprehensiveDialogOpen(true);
    setOpenDropdownId(null);
  };

  const handleEditScenario = () => {
    if (selectedTestCase) {
      setEditingComprehensiveTestCase({...selectedTestCase});
    }
  };

  const handleUpdateTestCase = async () => {
    if (!editingTestCase) return;

    if (!newTestCase.name || !newTestCase.entityName || !newTestCase.section) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateTestCase(editingTestCase.testCaseId, newTestCase, editingTestCase.projectId);
      
      toast({
        title: "Success",
        description: "Test case updated successfully",
      });

      // Close dialog first
      resetDialogStates();
      
      // Then reload data
      const { testCases: allTestCases } = await reloadTestCasesData();
      setTestCases(allTestCases);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update test case",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTestCase = useCallback((testCase: TestCase) => {
    setDeletingTestCase(testCase);
    setDeleteConfirmation("");
    setIsDeleteDialogOpen(true);
    setOpenDropdownId(null);
  }, []);

  const handleRunTestCase = async (testCase: TestCase) => {
    try {
      const result = await runTestCase(testCase.testCaseId, testCase.projectId, testCase.entityName, testCase.name);
      
      // Recargar la lista tras ejecutar para reflejar lastRun/lastRunStatus cuando terminen
      const { testCases: allTestCases } = await reloadTestCasesData();
      setTestCases(allTestCases);
      
      return result; // Devolver el resultado para que el componente pueda acceder al executionId
    } catch (error) {
      console.error('Error in handleRunTestCase:', error);
      toast({
        title: "Error",
        description: "Failed to run test case",
        variant: "destructive",
      });
      throw error; // Re-lanzar el error para que el componente pueda manejarlo
    }
  };

  const handleDuplicateTestCase = async (testCase: TestCase) => {
    try {
      const duplicatedData: CreateTestCaseData = {
        name: `${testCase.name} (Copy)`,
        entityName: testCase.entityName,
        section: testCase.section,
        method: testCase.method,
        testType: testCase.testType,
        scenario: testCase.scenario,
        description: "",
        tags: testCase.tags,
      };

      await createTestCase(duplicatedData);
      
      toast({
        title: "Success",
        description: "Test case duplicated successfully",
      });

      const { testCases: allTestCases } = await reloadTestCasesData();
      setTestCases(allTestCases);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate test case",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setEditingComprehensiveTestCase({...testCase});
    setIsEditing(false);
    setIsComprehensiveDialogOpen(true);
    setOpenDropdownId(null);
  };

  const handleComprehensiveDialogClose = () => {
    handleDialogClose();
  };

  const handleComprehensiveUpdate = async () => {
    if (!editingComprehensiveTestCase) return;

    try {
      setIsUpdating(true);
      
      await updateTestCase(editingComprehensiveTestCase.testCaseId, {
        name: editingComprehensiveTestCase.name,
        entityName: editingComprehensiveTestCase.entityName,
        section: editingComprehensiveTestCase.section,
        method: editingComprehensiveTestCase.method,
        testType: editingComprehensiveTestCase.testType,
        scenario: editingComprehensiveTestCase.scenario,
        description: editingComprehensiveTestCase.description || "",
        tags: editingComprehensiveTestCase.tags,
      }, editingComprehensiveTestCase.projectId);

      toast({
        title: "Success",
        description: "Test case updated successfully",
      });

      // Cerrar el modal y recargar la lista
      handleComprehensiveDialogClose();
      
      // Recargar solo la lista de test cases
      const { testCases: allTestCases } = await reloadTestCasesData();
      setTestCases(allTestCases);
    } catch (error) {
      console.error("Error updating test case:", error);
      toast({
        title: "Error",
        description: "Failed to update test case",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComprehensiveDelete = async () => {
    if (!selectedTestCase) return;

    // Abrir el modal de confirmación en lugar de hacer delete directo
    setDeletingTestCase(selectedTestCase);
    setDeleteConfirmation("");
    setIsDeleteDialogOpen(true);
    handleComprehensiveDialogClose();
  };

  const handleComprehensiveRun = async () => {
    if (!selectedTestCase) return;

    try {
      await runTestCase(selectedTestCase.testCaseId, selectedTestCase.projectId, selectedTestCase.entityName, selectedTestCase.name);
      
      toast({
        title: "Success",
        description: "Test case execution started",
      });

      // Recargar data general y mantener el test case abierto actualizado
      const { testCases: allTestCases } = await reloadTestCasesData();
      setTestCases(allTestCases);
      const updated = allTestCases.find(tc => tc.testCaseId === selectedTestCase.testCaseId);
      if (updated) {
        setEditingComprehensiveTestCase({ ...updated });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run test case",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTestCase || deleteConfirmation !== deletingTestCase.name) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteTestCase(deletingTestCase.testCaseId, deletingTestCase.projectId);
      
      toast({
        title: "Success",
        description: "Test case deleted successfully",
      });

      const { testCases: allTestCases } = await reloadTestCasesData();
      setTestCases(allTestCases);
      
      // Close dialog and reset states
      setIsDeleteDialogOpen(false);
      setDeletingTestCase(null);
      setDeleteConfirmation("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete test case",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeletingTestCase(null);
    setDeleteConfirmation("");
  };

  const handleEditSteps = (testCase: TestCase) => {
    setEditingTestCaseForSteps(testCase);
    setIsEditorOpen(true);
    setOpenDropdownId(null);
  };

  const handleSaveSteps = async (data: {
    tags: string[];
    steps: {
      type: 'Given' | 'When' | 'Then' | 'And';
      stepId: string;
      parameters?: Record<string, any>;
    }[];
    scenario: string;
  }) => {
    if (!editingTestCaseForSteps) return;

    try {
      setIsUpdatingSteps(true);
      
      await updateTestCaseSteps(
        editingTestCaseForSteps.testCaseId,
        editingTestCaseForSteps.projectId,
        data
      );

      toast({
        title: "Success",
        description: "Test case steps updated successfully",
      });

      // Cerrar el editor y recargar la lista
      setIsEditorOpen(false);
      setEditingTestCaseForSteps(null);
      
      // Recargar solo la lista de test cases
      const { testCases: allTestCases } = await reloadTestCasesData();
      setTestCases(allTestCases);
    } catch (error) {
      console.error("Error updating test case steps:", error);
      toast({
        title: "Error",
        description: "Failed to update test case steps",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingSteps(false);
    }
  };

  const handleCancelEditSteps = () => {
    setIsEditorOpen(false);
    setEditingTestCaseForSteps(null);
  };

  const handleSaveScenarioSteps = async (steps: any[], tags: string[], scenario: string) => {
    if (!editingTestCaseForSteps) return;

    try {
      setIsUpdatingSteps(true);
      
      // Convertir el formato de steps para el backend
      const formattedSteps = steps.map(step => ({
        type: step.type,
        stepId: step.id,
        parameters: step.parameters || {},
      }));

      await updateTestCaseSteps(
        editingTestCaseForSteps.testCaseId,
        editingTestCaseForSteps.projectId,
        {
          tags: tags,
          steps: formattedSteps,
          scenario: scenario, // Usar el escenario completo que incluye Examples
        }
      );

      toast({
        title: "Success",
        description: "Test case steps updated successfully",
      });

      // Cerrar el editor y recargar la lista
      setIsEditorOpen(false);
      setEditingTestCaseForSteps(null);
      
      // Recargar solo la lista de test cases
      const { testCases: allTestCases } = await reloadTestCasesData();
      setTestCases(allTestCases);
    } catch (error) {
      console.error("Error updating test case steps:", error);
      toast({
        title: "Error",
        description: "Failed to update test case steps",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingSteps(false);
    }
  };

  const reloadData = async () => {
    try {
      const { testCases: allTestCases } = await reloadTestCasesData();
      setTestCases(allTestCases);
    } catch (error) {
      console.error("Error reloading test cases:", error);
      toast({
        title: "Error",
        description: "Failed to reload test cases",
        variant: "destructive",
      });
    }
  };

  const reloadDataAndUpdateTestCase = async (testCaseId: string) => {
    try {
      const { testCases: allTestCases } = await reloadTestCasesData();
      setTestCases(allTestCases);
      
      // Buscar y actualizar el test case específico
      const updatedTestCase = allTestCases.find(tc => tc.testCaseId === testCaseId);
      if (updatedTestCase) {
        setEditingComprehensiveTestCase({...updatedTestCase});
      }
    } catch (error) {
      console.error("Error reloading test cases:", error);
      toast({
        title: "Error",
        description: "Failed to reload test cases",
        variant: "destructive",
      });
    }
  };

  return {
        // State
        loading,
        testCases,
        projects,
        searchTerm,
        setSearchTerm,
        projectFilter,
        setProjectFilter,
        statusFilter,
        setStatusFilter,
        methodFilter,
        setMethodFilter,
        sectionFilter,
        setSectionFilter,
        entityFilter,
        setEntityFilter,
        priorityFilter,
        setPriorityFilter,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isComprehensiveDialogOpen,
        setIsComprehensiveDialogOpen,
        selectedTestCase,
        editingComprehensiveTestCase,
        setEditingComprehensiveTestCase,
        isEditing,
        setIsEditing,
        isUpdating,
        openDropdownId,
        setOpenDropdownId,
        editingTestCase,
        newTestCase,
        setNewTestCase,
        filteredTestCases,
        visibleTestCases,
        projectSections,
        availableMethods,
        availableSections,
        availableEntities,
        
        // Sorting & Pagination
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        currentPage,
        setCurrentPage,
        pageSize,
        totalPages,
        
        // Delete dialog state
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        deletingTestCase,
        deleteConfirmation,
        setDeleteConfirmation,
        isDeleting,

        // Editor state
        isEditorOpen,
        setIsEditorOpen,
        editingTestCaseForSteps,
        isUpdatingSteps,

        // Actions
        handleCreateTestCase,
        handleEditTestCase,
        handleUpdateTestCase,
        handleDeleteTestCase,
        handleRunTestCase,
        handleDuplicateTestCase,
        handleViewDetails,
        handleComprehensiveDialogClose,
        handleComprehensiveUpdate,
        handleComprehensiveDelete,
        handleComprehensiveRun,
        handleDialogClose,
        handleConfirmDelete,
        handleCancelDelete,
        handleEditSteps,
        handleSaveSteps,
        handleCancelEditSteps,
        handleSaveScenarioSteps,
        handleEditScenario,
        reloadData,
        reloadDataAndUpdateTestCase,
      };
} 