import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useExecutionEvents } from '@/hooks/useExecutionEvents';
import { useExecution } from '@/contexts/ExecutionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Layers, Search, Filter, MoreHorizontal, RefreshCw } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { testSuiteService, TestSuite } from '@/services/testSuiteService';
import TestSuiteFilters from '@/components/test-suites/TestSuiteFilters';
import TestSuiteCreateDialog from '@/components/test-suites/TestSuiteCreateDialog';
import TestSuiteCard from '@/components/test-suites/TestSuiteCard';
import TestSuiteDetailsDialog from '@/components/test-suites/TestSuiteDetailsDialog';
import TestSuiteDeleteDialog from '@/components/test-suites/TestSuiteDeleteDialog';
import TestSuiteEditDialog from '@/components/test-suites/TestSuiteEditDialog';

export default function TestSuites() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { filteredProjects } = useProjects();
  const projects = filteredProjects || [];
  const { setSuiteExecutionId } = useExecution();

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'lastExecutedAt' | 'name'>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // State for dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTestSuite, setSelectedTestSuite] = useState<TestSuite | null>(null);
  const [editingTestSuite, setEditingTestSuite] = useState<TestSuite | null>(null);
  const [deletingTestSuite, setDeletingTestSuite] = useState<TestSuite | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get current project ID from URL or use first project
  const currentProjectId = projects.length > 0 ? projects[0].id : '';



  // Fetch test suites
  const {
    data: testSuitesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['testSuites', currentProjectId, {
      searchTerm,
      projectFilter,
      typeFilter,
      statusFilter,
      sectionFilter,
      entityFilter,
      sortBy,
      sortOrder,
      currentPage,
      itemsPerPage
    }],
    queryFn: () => testSuiteService.getTestSuites(
      currentProjectId,
      {
        search: searchTerm || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter as any,
        status: statusFilter === 'all' ? undefined : statusFilter as any,
        section: sectionFilter === 'all' ? undefined : sectionFilter,
        entity: entityFilter === 'all' ? undefined : entityFilter,
        sortBy,
        sortOrder,
        page: Number(currentPage),
        limit: itemsPerPage
      }
    ),
    enabled: !!currentProjectId,
  });

  const testSuites = testSuitesData?.testSuites || [];
  const totalItems = testSuitesData?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Handle URL parameters for opening test suite details
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const testSuiteId = searchParams.get('testSuiteId');
    const openDetails = searchParams.get('openDetails');

    if (testSuiteId && openDetails === 'true') {
      // Find the test suite by ID
      const testSuite = testSuites.find(ts => ts.suiteId === testSuiteId);
      if (testSuite) {
        setSelectedTestSuite(testSuite);
        setIsDetailsDialogOpen(true);
        
        // Clear URL parameters after opening the dialog
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('testSuiteId');
        newUrl.searchParams.delete('openDetails');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [testSuites]);

  // Contexto de ejecución
  const { startExecution, completeExecution, failExecution } = useExecution();

  // Handlers para eventos SSE
  const handleExecutionStarted = useCallback((event: any) => {
    console.log('TestSuites - Execution started:', event);
    console.log('TestSuites - Execution ID:', event.executionId);
    console.log('TestSuites - Test Suite ID:', event.testSuiteId);
    
    startExecution(event.executionId);
    
    // Si tenemos un testSuiteId, guardar el mapeo usando la clave entity-name
    if (event.testSuiteId && event.entityName) {
      // Buscar el test suite para obtener el nombre
      const testSuite = testSuites.find(ts => ts.suiteId === event.testSuiteId);
      if (testSuite) {
        const testSuiteKey = `${testSuite.entity}-${testSuite.name}`;
        setSuiteExecutionId(testSuiteKey, event.executionId);
        console.log('TestSuites - Mapped from SSE:', testSuiteKey, '->', event.executionId);
      }
    }
  }, [startExecution, setSuiteExecutionId, testSuites]);

  const handleExecutionCompleted = useCallback((event: any) => {
    console.log('TestSuites - Execution completed:', event);
    console.log('TestSuites - Execution ID:', event.executionId);
    completeExecution(event.executionId);
    // Recargar datos cuando termine una ejecución
    refetch();
  }, [completeExecution, refetch]);

  const handleExecutionFailed = useCallback((event: any) => {
    console.log('TestSuites - Execution failed:', event);
    console.log('TestSuites - Execution ID:', event.executionId);
    failExecution(event.executionId, event.message || 'Error desconocido');
    // Recargar datos cuando falle una ejecución
    refetch();
  }, [failExecution, refetch]);

  // Conectar a SSE
  useExecutionEvents({
    projectId: currentProjectId,
    onExecutionStarted: handleExecutionStarted,
    onExecutionCompleted: handleExecutionCompleted,
    onExecutionFailed: handleExecutionFailed,
    enabled: !!currentProjectId,
  });

  // Handle URL parameters for opening specific test suite details
  useEffect(() => {
    if (testSuites.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const testSetId = urlParams.get('testSetId');
      const openDetails = urlParams.get('openDetails');
      
      if (testSetId && openDetails === 'true') {
        const testSuite = testSuites.find(ts => ts.suiteId === testSetId);
        if (testSuite) {
          setSelectedTestSuite(testSuite);
          setEditingTestSuite(testSuite);
          setIsDetailsDialogOpen(true);
          
          // Clear URL parameters
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, [testSuites]);

  // Update test suite mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => 
      testSuiteService.updateTestSuite(currentProjectId, selectedTestSuite!.suiteId, data),
    onSuccess: () => {
      toast({
        title: "Test Suite Updated",
        description: "Test suite has been updated successfully",
      });
      setIsEditing(false);
      setEditingTestSuite(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update test suite",
        variant: "destructive",
      });
    },
  });

  // Delete test suite mutation
  const deleteMutation = useMutation({
    mutationFn: () => testSuiteService.deleteTestSuite(currentProjectId, deletingTestSuite!.suiteId),
    onSuccess: () => {
      toast({
        title: "Test Suite Deleted",
        description: "Test suite has been deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setDeletingTestSuite(null);
      setDeleteConfirmation('');
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete test suite",
        variant: "destructive",
      });
    },
  });

  // Execute test suite mutation
  const executeMutation = useMutation({
    mutationFn: () => testSuiteService.executeTestSuite(currentProjectId, selectedTestSuite!.suiteId),
    onSuccess: (data) => {
      // Mapear el executionId del test plan para las animaciones
      if (data?.data?.executionId && selectedTestSuite) {
        const testSuiteKey = `${selectedTestSuite.entity}-${selectedTestSuite.name}`;
        setSuiteExecutionId(testSuiteKey, data.data.executionId);
        console.log('TestSuites - Mapped test plan execution:', testSuiteKey, '->', data.data.executionId);
      }
      // No mostrar toast de inicio, solo recargar datos
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Execution Failed",
        description: error.message || "Failed to execute test suite",
        variant: "destructive",
      });
    },
  });

  // Handle actions
  const handleViewDetails = (testSuite: TestSuite) => {
    setOpenDropdownId(null); // Close dropdown
    setSelectedTestSuite(testSuite);
    setEditingTestSuite(testSuite);
    setIsEditing(false);
    setIsDetailsDialogOpen(true);
  };

  const handleEdit = (testSuite: TestSuite) => {
    setOpenDropdownId(null); // Close dropdown
    setEditingTestSuite(testSuite);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (testSuite: TestSuite) => {
    setOpenDropdownId(null); // Close dropdown
    setDeletingTestSuite(testSuite);
    setDeleteConfirmation('');
    setIsDeleteDialogOpen(true);
  };

  const handleRun = async (testSuite: TestSuite) => {
    setOpenDropdownId(null); // Close dropdown
    setSelectedTestSuite(testSuite);
    return new Promise((resolve, reject) => {
      executeMutation.mutate(undefined, {
        onSuccess: (data) => {
          resolve(data);
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  };

  const handleUpdate = () => {
    if (!editingTestSuite) return;
    
    const updateData = {
      name: editingTestSuite.name,
      description: editingTestSuite.description,
      section: editingTestSuite.section,
      entity: editingTestSuite.entity,
      status: editingTestSuite.status,
      tags: editingTestSuite.tags,
    };
    
    updateMutation.mutate(updateData);
  };

  const handleUpdateTestCases = async (testSuiteId: string, testCaseIds: string[]) => {
    try {
      await testSuiteService.updateTestSuite(currentProjectId, testSuiteId, {
        testCaseIds
      });
      toast({
        title: "Test Suite Updated",
        description: "Test cases have been updated successfully",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update test cases",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation === deletingTestSuite?.name) {
      deleteMutation.mutate();
    }
  };

  const handleCreateTestSuite = async (testSuiteData: any) => {
    try {
      await testSuiteService.createTestSuite(currentProjectId, testSuiteData);
      toast({
        title: "Test Suite Created",
        description: "Test suite has been created successfully",
      });
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create test suite",
        variant: "destructive",
      });
    }
  };

  const reloadData = async () => {
    await refetch();
  };

  const reloadDataAndUpdateTestSuite = async (suiteId: string) => {
    await refetch();
    // Find and update the selected test suite
    const updatedTestSuite = testSuites.find(ts => ts.suiteId === suiteId);
    if (updatedTestSuite) {
      setSelectedTestSuite(updatedTestSuite);
      setEditingTestSuite(updatedTestSuite);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Navigation functions for hyperlinks
  const handleNavigateToTestCase = (testCaseId: string) => {
    // Abrir en nueva pestaña con la URL específica del test case y abrir automáticamente el diálogo
    const testCaseUrl = `${window.location.origin}/test-cases?testCaseId=${testCaseId}&openDetails=true&tab=scenario`;
    window.open(testCaseUrl, '_blank');
  };

  const handleNavigateToTestSet = (testSetId: string) => {
    // Abrir en nueva pestaña con la URL específica del test set y abrir automáticamente el diálogo
    const testSetUrl = `${window.location.origin}/test-suites?testSetId=${testSetId}&openDetails=true`;
    window.open(testSetUrl, '_blank');
  };

  const handleNavigateToTestExecution = (executionId: string) => {
    // Abrir en nueva pestaña con la URL específica del test execution y abrir automáticamente el diálogo
    const executionUrl = `${window.location.origin}/test-executions?executionId=${executionId}&openDetails=true`;
    window.open(executionUrl, '_blank');
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error Loading Test Suites</h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
             {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
         <div>
           <h1 className="text-3xl font-bold">Test Suites</h1>
           <p className="mt-2 text-muted-foreground">
             Manage and organize your test cases into test sets and test plans
           </p>
         </div>
         {/* Contenedor de botones alineados a la derecha */}
         <div className="flex flex-row gap-2 ml-auto">
           <Button
             variant="outline"
             onClick={handleRefreshData}
             disabled={isRefreshing}
           >
             {isRefreshing ? (
               <RefreshCw className="h-4 w-4 animate-spin" />
             ) : (
               <RefreshCw className="h-4 w-4 mr-2" />
             )}
             {isRefreshing ? "Refreshing..." : "Refresh Data"}
           </Button>
           <Button onClick={() => setIsCreateDialogOpen(true)}>
             <Plus className="h-4 w-4 mr-2" />
             Create Test Suite
           </Button>
         </div>
       </div>

      {/* Filters */}
      <TestSuiteFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        projectFilter={projectFilter}
        setProjectFilter={setProjectFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sectionFilter={sectionFilter}
        setSectionFilter={setSectionFilter}
        entityFilter={entityFilter}
        setEntityFilter={setEntityFilter}
        projects={projects}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : testSuites.length === 0 ? (
        <div className="text-center py-12">
          <Layers className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Test Suites Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || projectFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'No test suites match your current filters.'
              : 'Get started by creating your first test suite.'}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Test Suite
          </Button>
        </div>
      ) : (
        <>
                     {/* Test Suites Grid */}
           <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-500 ${isRefreshing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                         {testSuites.map((testSuite) => (
                               <TestSuiteCard
                  key={testSuite.suiteId}
                  testSuite={testSuite}
                  projects={projects}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                  onRun={handleRun}
                  onDelete={handleDelete}
                  onNavigateToTestExecution={handleNavigateToTestExecution}
                  openDropdownId={openDropdownId}
                  setOpenDropdownId={setOpenDropdownId}
                />
             ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} test suites
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <TestSuiteCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projects={projects}
        onCreateWithData={handleCreateTestSuite}
      />

             <TestSuiteDetailsDialog
         isOpen={isDetailsDialogOpen}
         onOpenChange={setIsDetailsDialogOpen}
         selectedTestSuite={selectedTestSuite}
         onDelete={() => {
           setIsDetailsDialogOpen(false);
           if (selectedTestSuite) {
             handleDelete(selectedTestSuite);
           }
         }}
         onClose={() => setIsDetailsDialogOpen(false)}
         onNavigateToTestCase={handleNavigateToTestCase}
         onNavigateToTestSet={handleNavigateToTestSet}
         onNavigateToExecution={handleNavigateToTestExecution}
       />

             <TestSuiteEditDialog
         open={isEditDialogOpen}
         onOpenChange={setIsEditDialogOpen}
         testSuite={editingTestSuite}
         onSave={handleUpdateTestCases}
       />

       <TestSuiteDeleteDialog
         isOpen={isDeleteDialogOpen}
         onOpenChange={setIsDeleteDialogOpen}
         deletingTestSuite={deletingTestSuite}
         deleteConfirmation={deleteConfirmation}
         setDeleteConfirmation={setDeleteConfirmation}
         onConfirmDelete={handleConfirmDelete}
         onCancel={() => {
           setIsDeleteDialogOpen(false);
           setDeletingTestSuite(null);
           setDeleteConfirmation('');
         }}
         isPending={deleteMutation.isPending}
       />
    </div>
  );
}
