import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Play, Activity, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useTestExecutions } from "@/hooks/useTestExecutions";
import { TestExecutionStatisticsCompact } from "@/components/test-executions/TestExecutionStatisticsCompact";
import { TestExecutionFilters as TestExecutionFiltersComponent } from "@/components/test-executions/TestExecutionFilters";
import { TestExecutionCard } from "@/components/test-executions/TestExecutionCard";
import TestExecutionDetailsDialog from "@/components/test-executions/TestExecutionDetailsDialog";
import TestExecutionDeleteDialog from "@/components/test-executions/TestExecutionDeleteDialog";

export default function TestExecutions() {
  const { filteredProjects } = useProjects();
  const projects = filteredProjects || [];
  const currentProjectId = projects.length > 0 ? projects[0].id : '';

    const {
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
    entities,
    methods,
    testTypes,
    sections,
    isLoading,
    statisticsLoading,
    entitiesLoading,
    methodsLoading,
    testTypesLoading,
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
   } = useTestExecutions(currentProjectId);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Test Executions</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Test Executions</h1>
          <p className="text-muted-foreground">
            Monitor and analyze test execution results
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <TestExecutionFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          entities={entities}
          testTypes={testTypes}
          sections={sections}
          projects={projects}
        />
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
                 {/* Statistics - 25% width */}
         <div className="w-1/4">
           {statistics && (
             <div className="space-y-4">
               <TestExecutionStatisticsCompact statistics={statistics} />
             </div>
           )}
         </div>

                 {/* Executions - 75% width */}
         <div className="w-3/4">
           <div className="space-y-4">

            {isLoading ? (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading test executions...</p>
              </div>
            ) : executions.length === 0 ? (
              <div className="text-center py-8">
                <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No test executions found</h3>
                <p className="text-muted-foreground">
                  {filters.search || filters.status || filters.entityName || filters.testType
                    ? "Try adjusting your filters to see more results."
                    : "No test executions have been created yet."}
                </p>
              </div>
            ) : (
              <>
                                 {/* Executions Grid */}
                 <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all duration-500 ${isRefreshing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                  {executions.map((execution) => (
                                         <TestExecutionCard
                       key={execution.executionId}
                       execution={execution}
                       onViewDetails={handleViewDetails}
                       onDelete={handleDeleteExecution}
                       onNavigateToTestExecution={handleNavigateToTestExecution}
                       projectName={projects.length > 0 ? projects[0].name : 'Current Project'}
                       openDropdownId={openDropdownId}
                       setOpenDropdownId={setOpenDropdownId}
                     />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, totalItems)} of {totalItems} executions
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleFiltersChange({ ...filters, page: filters.page - 1 })}
                        disabled={filters.page === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {filters.page} of {totalPages}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleFiltersChange({ ...filters, page: filters.page + 1 })}
                        disabled={filters.page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

                           {/* Dialogs */}
        <TestExecutionDetailsDialog
          isOpen={isDetailsDialogOpen}
          onOpenChange={handleDialogOpenChange}
          execution={selectedExecution}
          projectId={currentProjectId}
          onNavigateToTestCase={handleNavigateToTestCase}
          onNavigateToTestSuite={handleNavigateToTestSuite}
        />
        
        <TestExecutionDeleteDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleCancelDelete();
            } else {
              setIsDeleteDialogOpen(true);
            }
          }}
          deletingExecution={deletingExecution}
          deleteConfirmation={deleteConfirmation}
          setDeleteConfirmation={setDeleteConfirmation}
          onConfirmDelete={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isPending={isDeleting}
        />
    </div>
  );
}
