import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Play, Activity, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useTestExecutions } from "@/hooks/useTestExecutions";
import { useTranslation } from "@/contexts/LanguageContext";
import { replaceParams } from "@/lib/translations";
import { TestExecutionStatisticsCompact } from "@/components/test-executions/TestExecutionStatisticsCompact";
import { TestExecutionFilters as TestExecutionFiltersComponent } from "@/components/test-executions/TestExecutionFilters";
import { TestExecutionCard } from "@/components/test-executions/TestExecutionCard";
import TestExecutionDetailsDialog from "@/components/test-executions/TestExecutionDetailsDialog";
import TestExecutionDeleteDialog from "@/components/test-executions/TestExecutionDeleteDialog";

export default function TestExecutions() {
  const { t } = useTranslation();
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
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t("exec.errorLoading")}</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : t("exec.errorLoading")}
          </p>
          <Button onClick={() => refetch()}>{t("exec.tryAgain")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("exec.title")}</h1>
          <p className="text-muted-foreground">
            {t("exec.subtitle")}
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
            {isRefreshing ? t("exec.refreshing") : t("exec.refreshData")}
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
                <p className="text-muted-foreground">{t("exec.loading")}</p>
              </div>
            ) : executions.length === 0 ? (
              <div className="text-center py-8">
                <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">{t("exec.emptyTitle")}</h3>
                <p className="text-muted-foreground">
                  {filters.search || filters.status || filters.entityName || filters.testType
                    ? t("exec.emptyFiltered")
                    : t("exec.emptyNone")}
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
                       projectName={projects.length > 0 ? projects[0].name : t("exec.currentProject")}
                       openDropdownId={openDropdownId}
                       setOpenDropdownId={setOpenDropdownId}
                     />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      {replaceParams(t("exec.showing"), { from: String(((filters.page - 1) * filters.limit) + 1), to: String(Math.min(filters.page * filters.limit, totalItems)), total: String(totalItems) })}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleFiltersChange({ ...filters, page: filters.page - 1 })}
                        disabled={filters.page === 1}
                      >
                        {t("exec.previous")}
                      </Button>
                      <span className="text-sm">
                        {replaceParams(t("exec.pageOf"), { current: String(filters.page), total: String(totalPages) })}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleFiltersChange({ ...filters, page: filters.page + 1 })}
                        disabled={filters.page === totalPages}
                      >
                        {t("exec.next")}
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
