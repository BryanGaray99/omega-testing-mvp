import { useProjects } from "@/hooks/useProjects";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectFilters from "@/components/projects/ProjectFilters";
import ProjectRegisterDialog from "@/components/projects/ProjectRegisterDialog";
import ProjectEditDialog from "@/components/projects/ProjectEditDialog";
import ProjectDeleteDialog from "@/components/projects/ProjectDeleteDialog";
import ProjectEmptyState from "@/components/projects/ProjectEmptyState";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Projects() {
  const { toast } = useToast();
  const {
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
    reloadData,
    
    // Mutations
    createProjectMutation,
    updateProjectMutation,
    deleteProjectMutation,
  } = useProjects();

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

  if (loadingProjects) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your testing projects and configurations
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your testing projects and configurations
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
          <ProjectRegisterDialog
            isOpen={isCreateDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                handleDialogClose('create');
              } else {
                setIsCreateDialogOpen(true);
              }
            }}
            newProject={newProject}
            setNewProject={setNewProject}
            onCreateProject={handleCreateProject}
            onCancel={() => handleDialogClose('create')}
            isPending={createProjectMutation.isPending}
          />
        </div>
      </div>

      {/* Filters */}
      <ProjectFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Projects Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ${isRefreshing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onRunTests={handleRunTests}
            openDropdownId={openDropdownId}
            setOpenDropdownId={setOpenDropdownId}
            toast={toast}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <ProjectEmptyState
          onRegisterClick={() => setIsCreateDialogOpen(true)}
        />
      )}

      {/* Edit Project Dialog */}
      <ProjectEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleDialogClose('edit');
          } else {
            setIsEditDialogOpen(true);
          }
        }}
        editingProject={editingProject}
        editProjectData={editProjectData}
        setEditProjectData={setEditProjectData}
        onUpdateProject={handleUpdateProject}
        onCancel={() => handleDialogClose('edit')}
        isPending={updateProjectMutation.isPending}
      />

      {/* Delete Project Dialog */}
      <ProjectDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleDialogClose('delete');
          } else {
            setIsDeleteDialogOpen(true);
          }
        }}
        deletingProject={deletingProject}
        deleteConfirmation={deleteConfirmation}
        setDeleteConfirmation={setDeleteConfirmation}
        onConfirmDelete={handleConfirmDelete}
        onCancel={() => handleDialogClose('delete')}
        isPending={deleteProjectMutation.isPending}
      />
    </div>
  );
}
