import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { TestExecution, TestExecutionFilters } from '@/components/types/test-execution.types';
import { testExecutionService } from '@/services/testExecutionService';

export function useTestExecutions(projectId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for filters and search
  const [filters, setFilters] = useState<TestExecutionFilters>({
    search: '',
    status: undefined,
    entityName: undefined,
    testType: undefined,
    projectId: undefined,
    section: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    sortBy: 'startedAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  });

  // State for dialogs
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<TestExecution | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingExecution, setDeletingExecution] = useState<TestExecution | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset dialog states when dialogs close
  const resetDialogStates = useCallback(() => {
    setSelectedExecution(null);
    setIsDetailsDialogOpen(false);
    setOpenDropdownId(null);
    setDeletingExecution(null);
    setIsDeleteDialogOpen(false);
    setDeleteConfirmation("");
  }, []);

  // Handle dialog close with cleanup
  const handleDialogClose = useCallback(() => {
    requestAnimationFrame(() => {
      resetDialogStates();
    });
  }, [resetDialogStates]);

  // Fetch test executions
  const {
    data: executionsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['test-executions', projectId, filters],
    queryFn: () => testExecutionService.getTestExecutions(projectId, filters),
    enabled: !!projectId,
  });

  // Fetch statistics
  const {
    data: statistics,
    isLoading: statisticsLoading,
  } = useQuery({
    queryKey: ['test-execution-statistics', projectId],
    queryFn: () => testExecutionService.getTestExecutionStatistics(projectId),
    enabled: !!projectId,
  });

  // Handle filters change
  const handleFiltersChange = useCallback((newFilters: TestExecutionFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle view details
  const handleViewDetails = useCallback((execution: TestExecution) => {
    setSelectedExecution(execution);
    setIsDetailsDialogOpen(true);
    setOpenDropdownId(null); // Close any open dropdown
  }, []);

  // Handle delete execution
  const handleDeleteExecution = useCallback((execution: TestExecution) => {
    setDeletingExecution(execution);
    setDeleteConfirmation("");
    setIsDeleteDialogOpen(true);
    setOpenDropdownId(null);
  }, []);

  // Handle confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!deletingExecution || deleteConfirmation !== deletingExecution.executionId) {
      return;
    }

    try {
      setIsDeleting(true);
      await testExecutionService.deleteTestExecution(projectId, deletingExecution.executionId);
      
      toast({
        title: "Success",
        description: "Test execution deleted successfully",
      });

      // Refetch data
      await refetch();
      
      // Close dialog and reset states
      setIsDeleteDialogOpen(false);
      setDeletingExecution(null);
      setDeleteConfirmation("");
    } catch (error) {
      console.error("Error deleting test execution:", error);
      toast({
        title: "Error",
        description: "Failed to delete test execution",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [deletingExecution, deleteConfirmation, projectId, toast, refetch]);

  // Handle cancel delete
  const handleCancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setDeletingExecution(null);
    setDeleteConfirmation("");
  }, []);

  // Handle dialog close
  const handleDetailsDialogClose = useCallback(() => {
    handleDialogClose();
  }, [handleDialogClose]);

  // Handle dialog open/close
  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      handleDetailsDialogClose();
    } else {
      setIsDetailsDialogOpen(true);
    }
  }, [handleDetailsDialogClose]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetch(),
        // Refetch statistics
        queryClient.invalidateQueries({ queryKey: ['test-execution-statistics', projectId] }),
      ]);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error refreshing test executions:", error);
      toast({
        title: "Error",
        description: "Failed to refresh test executions",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, queryClient, projectId]);

  // Handle navigate to test execution (for hyperlinks from other sections)
  const handleNavigateToTestExecution = useCallback((executionId: string) => {
    const executionUrl = `${window.location.origin}/test-executions?executionId=${executionId}&openDetails=true`;
    window.open(executionUrl, '_blank');
  }, []);

  // Handle navigate to test case (for hyperlinks from execution details)
  const handleNavigateToTestCase = useCallback((testCaseId: string) => {
    const testCaseUrl = `${window.location.origin}/test-cases?testCaseId=${testCaseId}&openDetails=true&tab=scenario`;
    window.open(testCaseUrl, '_blank');
  }, []);

  // Handle navigate to test suite (for hyperlinks from execution details)
  const handleNavigateToTestSuite = useCallback((testSuiteId: string) => {
    const testSuiteUrl = `${window.location.origin}/test-suites?testSuiteId=${testSuiteId}&openDetails=true`;
    window.open(testSuiteUrl, '_blank');
  }, []);

  // Cleanup effect for dialog states
  useEffect(() => {
    return () => {
      resetDialogStates();
    };
  }, [resetDialogStates]);

  const executions = executionsData?.data || [];
  const totalItems = executionsData?.total || 0;
  const totalPages = executionsData?.totalPages || 0;

  // Handle URL parameters for opening execution details
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const executionId = searchParams.get('executionId');
    const openDetails = searchParams.get('openDetails');

    if (executionId && openDetails === 'true') {
      // Find the execution by ID
      const execution = executions.find(ex => ex.executionId === executionId);
      if (execution) {
        setSelectedExecution(execution);
        setIsDetailsDialogOpen(true);
        
        // Clear URL parameters after opening the dialog
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('executionId');
        newUrl.searchParams.delete('openDetails');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [executions]);

  // Extract filter options from executions data
  const availableEntities = useMemo(() => {
    const unique = new Set<string>();
    executions.forEach(execution => {
      if (execution.entityName) {
        unique.add(execution.entityName);
      }
    });
    return Array.from(unique).sort();
  }, [executions]);

  const availableSections = useMemo(() => {
    const unique = new Set<string>();
    executions.forEach(execution => {
      if (execution.section) {
        unique.add(execution.section);
      }
    });
    return Array.from(unique).sort();
  }, [executions]);

  const availableTestTypes = useMemo(() => {
    const unique = new Set<string>();
    executions.forEach(execution => {
      if (execution.testType) {
        unique.add(execution.testType);
      }
    });
    return Array.from(unique).sort();
  }, [executions]);

  return {
    // State
    filters,
    isDetailsDialogOpen,
    selectedExecution,
    isRefreshing,
    openDropdownId,
    executions,
    totalItems,
    totalPages,
    statistics,
    entities: availableEntities,
    methods: [],
    testTypes: availableTestTypes,
    sections: availableSections,
    isLoading,
    statisticsLoading,
    entitiesLoading: false,
    methodsLoading: false,
    testTypesLoading: false,
    error,

    // Delete dialog state
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deletingExecution,
    deleteConfirmation,
    setDeleteConfirmation,
    isDeleting,

    // Actions
    handleFiltersChange,
    handleViewDetails,
    handleDeleteExecution,
    handleConfirmDelete,
    handleCancelDelete,
    handleDetailsDialogClose,
    handleDialogOpenChange,
    handleRefresh,
    handleNavigateToTestExecution,
    handleNavigateToTestCase,
    handleNavigateToTestSuite,
    resetDialogStates,
    handleDialogClose,
    refetch,
    setOpenDropdownId,
  };
}
