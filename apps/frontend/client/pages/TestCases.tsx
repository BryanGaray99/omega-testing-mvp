import { useTestCases } from "@/hooks/useTestCases";
import { useExecutionEvents } from "@/hooks/useExecutionEvents";
import { useExecution } from "@/contexts/ExecutionContext";
import TestCaseCard from "@/components/test-cases/TestCaseCard";
import TestCaseFilters from "@/components/test-cases/TestCaseFilters";
import TestCaseCreateDialog from "@/components/test-cases/TestCaseCreateDialog";
import TestCaseComprehensiveDialog from "@/components/test-cases/TestCaseComprehensiveDialog";
import TestCaseDeleteDialog from "@/components/test-cases/TestCaseDeleteDialog";
import TestCaseEmptyState from "@/components/test-cases/TestCaseEmptyState";
import ScenarioEditor from "@/components/test-cases/ScenarioEditor";
import { Button } from "@/components/ui/button";
import { TestCase } from "@/components/types/testCase.types";
import { RefreshCw, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback } from "react";

export default function TestCases() {
  const {
    // State
    loading,
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
    filteredTestCases,
    visibleTestCases,
    projects,
    availableMethods,
    availableSections,
    availableEntities,
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
    handleDeleteTestCase,
    handleRunTestCase,
    handleViewDetails,
    handleComprehensiveDialogClose,
    handleComprehensiveUpdate,
    handleComprehensiveDelete,
    handleComprehensiveRun,
    handleConfirmDelete,
    handleCancelDelete,
    handleEditSteps,
    handleSaveSteps,
    handleCancelEditSteps,
    handleSaveScenarioSteps,
    handleEditScenario,
    reloadData,
    reloadDataAndUpdateTestCase,
  } = useTestCases();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Obtener el projectId del primer proyecto disponible
  const currentProjectId = projects.length > 0 ? projects[0].id : '';

  // Contexto de ejecución
  const { startExecution, completeExecution, failExecution, setSuiteExecutionId } = useExecution();

  // Navigation functions for hyperlinks
  const handleNavigateToTestExecution = (executionId: string) => {
    // Abrir en nueva pestaña con la URL específica del test execution y abrir automáticamente el diálogo
    const executionUrl = `${window.location.origin}/test-executions?executionId=${executionId}&openDetails=true`;
    window.open(executionUrl, '_blank');
  };

  // Handlers para eventos SSE
  const handleExecutionStarted = useCallback((event: any) => {
    console.log('TestCases - Execution started:', event);
    console.log('TestCases - Execution ID:', event.executionId);
    startExecution(event.executionId);
    
    // Para test cases, usar el testCaseId del evento SSE si está disponible
    if (event.testCaseId) {
      const testCaseKey = `${event.entityName}-${event.testCaseId}`;
      setSuiteExecutionId(testCaseKey, event.executionId);
      console.log('TestCases - Mapped from SSE with testCaseId:', testCaseKey, '->', event.executionId);
    } else if (event.entityName) {
      // Fallback: usar entityName + timestamp como clave temporal
      const timestamp = new Date(event.timestamp).getTime();
      const testCaseKey = `${event.entityName}-${timestamp}`;
      setSuiteExecutionId(testCaseKey, event.executionId);
      console.log('TestCases - Mapped from SSE (fallback):', testCaseKey, '->', event.executionId);
    }
  }, [startExecution, setSuiteExecutionId]);

  const handleExecutionCompleted = useCallback((event: any) => {
    console.log('TestCases - Execution completed:', event);
    console.log('TestCases - Execution ID:', event.executionId);
    completeExecution(event.executionId);
    // Recargar datos cuando termine una ejecución
    reloadData();
  }, [completeExecution, reloadData]);

  const handleExecutionFailed = useCallback((event: any) => {
    console.log('TestCases - Execution failed:', event);
    console.log('TestCases - Execution ID:', event.executionId);
    failExecution(event.executionId, event.message || 'Error desconocido');
    // Recargar datos cuando falle una ejecución
    reloadData();
  }, [failExecution, reloadData]);

  // Conectar a SSE
  useExecutionEvents({
    projectId: currentProjectId,
    onExecutionStarted: handleExecutionStarted,
    onExecutionCompleted: handleExecutionCompleted,
    onExecutionFailed: handleExecutionFailed,
    enabled: !!currentProjectId,
  });

  // Wrapper para handleRunTestCase
  const handleRunTestCaseWithMapping = useCallback(async (testCase: TestCase) => {
    try {
      const result = await handleRunTestCase(testCase);
      return result;
    } catch (error) {
      console.error('Error running test case:', error);
      throw error;
    }
  }, [handleRunTestCase]);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await reloadData();
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading test cases...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Test Cases</h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage test scenarios with AI assistance
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
                Create Test Case
              </Button>
        </div>
      </div>

      {/* Filters */}
      <TestCaseFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        projectFilter={projectFilter}
        setProjectFilter={setProjectFilter}
        sectionFilter={sectionFilter}
        setSectionFilter={setSectionFilter}
        entityFilter={entityFilter}
        setEntityFilter={setEntityFilter}
        methodFilter={methodFilter}
        setMethodFilter={setMethodFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        projects={projects}
        methods={availableMethods}
        sections={availableSections}
        entities={availableEntities}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* Test Cases Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ${isRefreshing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {visibleTestCases.map((testCase) => (
               <TestCaseCard
                 key={testCase.testCaseId}
                 testCase={testCase}
                 projects={projects}
                 onViewDetails={handleViewDetails}
                 onEdit={handleEditTestCase}
                 onRun={handleRunTestCaseWithMapping}
                 onDelete={handleDeleteTestCase}
                 openDropdownId={openDropdownId}
                 setOpenDropdownId={setOpenDropdownId}
               />
        ))}
      </div>

      {/* Pagination */}
      {filteredTestCases.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredTestCases.length === 0 && (
        <TestCaseEmptyState
          onCreateClick={() => setIsCreateDialogOpen(true)}
        />
      )}

      {/* Test Case Create Dialog */}
      <TestCaseCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projects={projects}
        onCreateWithData={async (data, projectId) => {
          await reloadData();
        }}
      />

      {/* Test Case Comprehensive Dialog */}
              <TestCaseComprehensiveDialog
          isOpen={isComprehensiveDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleComprehensiveDialogClose();
            } else {
              setIsComprehensiveDialogOpen(true);
            }
          }}
          selectedTestCase={selectedTestCase}
          editingTestCase={editingComprehensiveTestCase}
          setEditingTestCase={setEditingComprehensiveTestCase}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          isUpdating={isUpdating}
          projects={projects}
          onUpdate={handleComprehensiveUpdate}
          onDelete={handleComprehensiveDelete}
          onClose={handleComprehensiveDialogClose}
          onEditSteps={() => selectedTestCase && handleEditSteps(selectedTestCase)}
          reloadData={reloadData}
          reloadDataAndUpdateTestCase={reloadDataAndUpdateTestCase}
          onEditScenario={handleEditScenario}
          onNavigateToExecution={handleNavigateToTestExecution}
        />
      
              <TestCaseDeleteDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleCancelDelete();
            } else {
              setIsDeleteDialogOpen(true);
            }
          }}
          deletingTestCase={deletingTestCase}
          deleteConfirmation={deleteConfirmation}
          setDeleteConfirmation={setDeleteConfirmation}
          onConfirmDelete={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isPending={isDeleting}
        />
    </div>
  );
}
