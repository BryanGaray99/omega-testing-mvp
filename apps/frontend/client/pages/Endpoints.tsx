import { useEndpoints } from "@/hooks/useEndpoints";
import EndpointCard from "@/components/endpoints/EndpointCard";
import EndpointFilters from "@/components/endpoints/EndpointFilters";
import EndpointRegisterDialog from "@/components/endpoints/EndpointRegisterDialog";
import EndpointComprehensiveDialog from "@/components/endpoints/EndpointComprehensiveDialog";
import EndpointEmptyState from "@/components/endpoints/EndpointEmptyState";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export default function Endpoints() {
  const {
    // State
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
    projects,
    
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
  } = useEndpoints();

  const [isRefreshing, setIsRefreshing] = useState(false);

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
            <p className="text-muted-foreground">Loading endpoints...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Endpoints</h1>
          <p className="mt-2 text-muted-foreground">
            Manage API endpoints and generate testing artifacts
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
          <EndpointRegisterDialog
            isOpen={isRegisterDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                handleDialogClose();
              } else {
                setIsRegisterDialogOpen(true);
              }
            }}
            editingEndpoint={editingEndpoint}
            newEndpoint={newEndpoint}
            setNewEndpoint={setNewEndpoint}
            projects={projects}
            registerActiveTab={registerActiveTab}
            setRegisterActiveTab={setRegisterActiveTab}
            onRegister={handleRegisterEndpoint}
            onUpdate={handleUpdateEndpoint}
            onCancel={handleDialogClose}
          />
        </div>
      </div>

      {/* Filters */}
      <EndpointFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        projectFilter={projectFilter}
        setProjectFilter={setProjectFilter}
        methodFilter={methodFilter}
        setMethodFilter={setMethodFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        projects={projects}
      />

      {/* Endpoints Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ${isRefreshing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {filteredEndpoints.map((endpoint) => (
          <EndpointCard
            key={endpoint.endpointId}
            endpoint={endpoint}
            onViewDetails={handleOpenComprehensiveDialog}
            onGenerateTests={handleGenerateTests}
            onReanalyze={handleReanalyzeEndpoint}
            openDropdownId={openDropdownId}
            setOpenDropdownId={setOpenDropdownId}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredEndpoints.length === 0 && (
        <EndpointEmptyState
          onRegisterClick={() => setIsRegisterDialogOpen(true)}
        />
      )}

      {/* Comprehensive Dialog */}
      <EndpointComprehensiveDialog
        isOpen={isComprehensiveDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleComprehensiveDialogClose();
          } else {
            setIsComprehensiveDialogOpen(true);
          }
        }}
        selectedEndpoint={selectedEndpoint}
        editingComprehensiveEndpoint={editingComprehensiveEndpoint}
        setEditingComprehensiveEndpoint={setEditingComprehensiveEndpoint}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isUpdating={isUpdating}
        projects={projects}
        onUpdate={handleComprehensiveUpdate}
        onDelete={handleComprehensiveDelete}
        onClose={handleComprehensiveDialogClose}
      />
    </div>
  );
}
