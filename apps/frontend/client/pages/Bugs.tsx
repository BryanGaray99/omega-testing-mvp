import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BugFilters } from "../components/bugs/BugFilters";
import BugCreateDialog from "../components/bugs/BugCreateDialog";
import BugDetailsDialog from "../components/bugs/BugDetailsDialog";
import BugDeleteDialog from "../components/bugs/BugDeleteDialog";
import { BugStatisticsCompact } from "../components/bugs/BugStatisticsCompact";
import { Plus, RefreshCw, Bug as BugIcon, Eye, Edit, Trash2, MoreVertical, AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";
import { Bug, BugFilters as BugFiltersType, BugStatus, BugSeverity, BugPriority } from "@/components/types/bug.types";
import { useProjects } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { bugService } from "@/services/bugService";
import { getPriorityColor, getSeverityColor } from '@/lib/colors';

export default function Bugs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { filteredProjects } = useProjects();
  const projects = filteredProjects || [];

  // Helper functions to get CSS classes for badges
  const getSeverityBadgeClass = (severity: BugSeverity) => {
    const colors = getSeverityColor(severity);
    return `${colors.bg} ${colors.text}`;
  };

  const getPriorityBadgeClass = (priority: BugPriority) => {
    const colors = getPriorityColor(priority);
    return `${colors.bg} ${colors.text}`;
  };

  // State for filters and search
  const [filters, setFilters] = useState<BugFiltersType>({
    search: '',
    type: undefined,
    severity: undefined,
    priority: undefined,
    status: undefined,
    section: undefined,
    entity: undefined,
    executionId: undefined,
    sortBy: 'reportedAt',
    sortOrder: 'DESC',
    page: 1,
    limit: 10,
  });

  // State for dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [deletingBug, setDeletingBug] = useState<Bug | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reset dialog states when dialogs close
  const resetDialogStates = () => {
    setSelectedBug(null);
    setDeletingBug(null);
    setDeleteConfirmation('');
  };

  // Handle dialog close with cleanup
  const handleDialogClose = (dialogType: 'create' | 'details' | 'delete') => {
    switch (dialogType) {
      case 'create':
        setIsCreateDialogOpen(false);
        break;
      case 'details':
        setIsDetailsDialogOpen(false);
        resetDialogStates();
        break;
      case 'delete':
        setIsDeleteDialogOpen(false);
        resetDialogStates();
        break;
    }
  };

  // Cleanup effect for dialog states
  useEffect(() => {
    return () => {
      resetDialogStates();
    };
  }, []);

  // Get current project ID from URL or use first project
  const currentProjectId = projects.length > 0 ? projects[0].id : '';

  // Fetch bugs
  const {
    data: bugsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['bugs', currentProjectId, filters],
    queryFn: () => bugService.getBugs(currentProjectId, filters),
    enabled: !!currentProjectId,
  });

  const bugs = bugsData?.data?.bugs || [];
  const totalItems = bugsData?.data?.total || 0;
  const totalPages = Math.ceil(totalItems / filters.limit);

  // Fetch statistics
  const {
    data: statisticsData,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['bugStatistics', currentProjectId],
    queryFn: () => bugService.getBugStatistics(currentProjectId),
    enabled: !!currentProjectId,
  });

  const statistics = statisticsData?.data;

  // Fetch failed executions for context
  const {
    data: failedExecutions,
    isLoading: loadingFailedExecutions
  } = useQuery({
    queryKey: ['failedExecutions', currentProjectId],
    queryFn: () => bugService.getFailedExecutions(currentProjectId),
    enabled: !!currentProjectId,
  });

  // Handle refresh data
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Create bug mutation
  const createMutation = useMutation({
    mutationFn: (bugData: any) => bugService.createBug(currentProjectId, bugData),
    onSuccess: () => {
      toast({
        title: "Bug Created",
        description: "Bug has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      queryClient.invalidateQueries({ queryKey: ['bugStatistics'] });
    setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Create Failed",
        description: error.message || "Failed to create bug",
        variant: "destructive",
      });
    },
  });

  // Update bug mutation
  const updateMutation = useMutation({
    mutationFn: ({ bugId, bugData }: { bugId: string; bugData: any }) => 
      bugService.updateBug(currentProjectId, bugId, bugData),
    onSuccess: () => {
      toast({
        title: "Bug Updated",
        description: "Bug has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      queryClient.invalidateQueries({ queryKey: ['bugStatistics'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update bug",
        variant: "destructive",
      });
    },
  });

  // Delete bug mutation
  const deleteMutation = useMutation({
    mutationFn: (bugId: string) => bugService.deleteBug(currentProjectId, bugId),
    onSuccess: () => {
      toast({
        title: "Bug Deleted",
        description: "Bug has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      queryClient.invalidateQueries({ queryKey: ['bugStatistics'] });
      setIsDeleteDialogOpen(false);
      setDeletingBug(null);
      setDeleteConfirmation('');
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete bug",
        variant: "destructive",
      });
    },
  });

  // Handle actions
  const handleViewDetails = (bug: Bug) => {
    setOpenDropdownId(null); // Close dropdown
    setSelectedBug(bug);
    setIsDetailsDialogOpen(true);
  };

  const handleEdit = (bug: Bug) => {
    setOpenDropdownId(null); // Close dropdown
    setSelectedBug(bug);
    setIsDetailsDialogOpen(true);
  };

  const handleDelete = (bug: Bug) => {
    setOpenDropdownId(null); // Close dropdown
    setDeletingBug(bug);
    setDeleteConfirmation('');
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation === deletingBug?.bugId) {
      deleteMutation.mutate(deletingBug.bugId);
    }
  };

  const handleCreateBug = (bugData: any) => {
    createMutation.mutate(bugData);
  };

  const handleUpdateBug = (bugId: string, bugData: any) => {
    updateMutation.mutate({ bugId, bugData });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Refreshed",
        description: "Bug data has been refreshed",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh bug data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFiltersChange = (newFilters: BugFiltersType) => {
    setFilters(newFilters);
  };

  const handleStatusChange = (bugId: string, newStatus: BugStatus) => {
    const bug = bugs.find(b => b.bugId === bugId);
    if (bug) {
      handleUpdateBug(bugId, { status: newStatus });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bugs</h1>
          <p className="mt-2 text-muted-foreground">
            Track and manage bugs found during test execution
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
            Create Bug
          </Button>
        </div>
      </div>

      {/* Filters */}
      <BugFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        projects={projects}
        failedExecutions={failedExecutions}
        loadingFailedExecutions={loadingFailedExecutions}
      />

      {/* Main Content - 20% Statistics / 80% Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Statistics Section - 20% */}
        <div className="lg:col-span-3">
          {statistics && (
            <BugStatisticsCompact statistics={statistics} />
          )}
        </div>

        {/* Cards Section - 80% */}
        <div className="lg:col-span-9">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : bugs.length === 0 ? (
            <div className="text-center py-12">
              <BugIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bugs Found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.type || filters.status
                  ? 'No bugs match your current filters.'
                  : 'Get started by creating your first bug report.'}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Bug
              </Button>
            </div>
          ) : (
            <>
      {/* Bugs Grid */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500 ${isRefreshing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {bugs.map((bug) => (
                  <div key={bug.bugId} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    {/* Header with Bug ID, Icon and Options */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">
                          {bug.type === 'system_bug' ? '🐛' : bug.type === 'framework_error' ? '⚙️' : bug.type === 'test_failure' ? '❌' : '🌍'}
                        </span>
                        <span className="font-mono text-sm text-muted-foreground">
                          {bug.bugId}
                        </span>
                      </div>
                      <DropdownMenu
                        open={openDropdownId === bug.bugId}
                        onOpenChange={(open) => {
                          if (open) {
                            setOpenDropdownId(bug.bugId);
                          } else {
                            setOpenDropdownId(null);
                          }
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(bug)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(bug)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Bug
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(bug)}>
                            <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                            Delete Bug
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Title and Status Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 mr-3">
                        <h3 className="font-medium text-sm mb-1 line-clamp-1">
                          {bug.title}
                        </h3>
                        {bug.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {bug.description}
                          </p>
                        )}
                      </div>
                      <Select onValueChange={(value) => handleStatusChange(bug.bugId, value as BugStatus)} value={bug.status}>
                        <SelectTrigger className="w-[140px] h-7 text-xs px-2">
                          <span className="flex items-center gap-1">
                            {bug.status === "open" && (
                              <>
                                <span className="flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                  <span>Open</span>
                                </span>
                              </>
                            )}
                            {bug.status === "in_progress" && (
                              <>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-purple-500" />
                                  <span>In Progress</span>
                                </span>
                              </>
                            )}
                            {bug.status === "resolved" && (
                              <>
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>Resolved</span>
                                </span>
                              </>
                            )}
                            {bug.status === "closed" && (
                              <>
                                <span className="flex items-center gap-1">
                                  <XCircle className="h-3 w-3 text-gray-500" />
                                  <span>Closed</span>
                                </span>
                              </>
                            )}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                              <span>Open</span>
                            </span>
                          </SelectItem>
                          <SelectItem value="in_progress">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-purple-500" />
                              <span>In Progress</span>
                            </span>
                          </SelectItem>
                          <SelectItem value="resolved">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>Resolved</span>
                            </span>
                          </SelectItem>
                          <SelectItem value="closed">
                            <span className="flex items-center gap-1">
                              <XCircle className="h-3 w-3 text-gray-500" />
                              <span>Closed</span>
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Project, Section, Entity structure like Test Suites */}
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Project:</span>
                        <span className="font-medium">
                          {projects.find(p => p.id === bug.projectId)?.name || bug.projectId}
                        </span>
                      </div>
                      {bug.section && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Section:</span>
                          <span className="font-medium">{bug.section}</span>
                        </div>
                      )}
                      {bug.entity && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Entity:</span>
                          <span className="font-medium">{bug.entity}</span>
                        </div>
                      )}
                    </div>

                    {/* Priority and Severity in same row */}
                    <div className="flex justify-between text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Priority:</span>
                        <span className={`ml-1 font-medium px-2 py-1 rounded text-xs ${getPriorityBadgeClass(bug.priority)}`}>
                          {bug.priority}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Severity:</span>
                        <span className={`ml-1 font-medium px-2 py-1 rounded text-xs ${getSeverityBadgeClass(bug.severity)}`}>
                          {bug.severity}
                        </span>
                      </div>
                    </div>

                    {/* Error message preview at bottom */}
                    {bug.errorMessage && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                        <div className="flex items-center space-x-1 text-red-700 mb-1">
                          <span>⚠️</span>
                          <span className="font-medium">Error:</span>
                        </div>
                        <p className="text-red-600 line-clamp-2">
                          {bug.errorMessage}
                        </p>
                      </div>
                    )}
                  </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, totalItems)} of {totalItems} bugs
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

      {/* Dialogs */}
      <BugCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            handleDialogClose('create');
          }
        }}
        projects={projects}
        failedExecutions={failedExecutions}
        onCreateBug={handleCreateBug}
        isCreating={createMutation.isPending}
      />

      <BugDetailsDialog
        isOpen={isDetailsDialogOpen}
        onOpenChange={(open) => {
          setIsDetailsDialogOpen(open);
          if (!open) {
            handleDialogClose('details');
          }
        }}
        bug={selectedBug}
        onUpdateBug={handleUpdateBug}
        isUpdating={updateMutation.isPending}
        onDelete={() => {
          handleDialogClose('details');
          if (selectedBug) {
            handleDelete(selectedBug);
          }
        }}
        onClose={() => handleDialogClose('details')}
      />

      <BugDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            handleDialogClose('delete');
          }
        }}
        deletingBug={deletingBug}
        deleteConfirmation={deleteConfirmation}
        setDeleteConfirmation={setDeleteConfirmation}
        onConfirmDelete={handleConfirmDelete}
        onCancel={() => handleDialogClose('delete')}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
