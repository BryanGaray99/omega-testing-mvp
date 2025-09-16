import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { bugService } from '@/services/bugService';
import { Bug, CreateBugDto, UpdateBugDto, BugFilters, BugStatistics, BugStatisticsResponse, BugsResponse, FailedExecution } from '@/components/types/bug.types';

export const useBugs = (projectId?: string) => {
  const queryClient = useQueryClient();

  // Get bugs with filters
  const {
    data: bugsData,
    isLoading: loadingBugs,
    error: bugsError,
    refetch: refetchBugs,
  } = useQuery({
    queryKey: ['bugs', projectId],
    queryFn: () => bugService.getBugs(projectId),
    enabled: true, // Always enabled, will use general endpoint if no projectId
    retry: (failureCount, error) => {
      // Retry up to 2 times, but don't retry if it's a 404 or 500 error
      if (failureCount >= 2) return false;
      if (error.message.includes('500') || error.message.includes('404')) return false;
      return true;
    },
  });

  // Get bug statistics
  const {
    data: statisticsData,
    isLoading: loadingStatistics,
    error: statisticsError,
  } = useQuery({
    queryKey: ['bug-statistics', projectId],
    queryFn: () => bugService.getBugStatistics(projectId),
    enabled: true, // Always enabled, will use general endpoint if no projectId
    retry: (failureCount, error) => {
      // Retry up to 2 times, but don't retry if it's a 404 or 500 error
      if (failureCount >= 2) return false;
      if (error.message.includes('500') || error.message.includes('404')) return false;
      return true;
    },
  });

  // Debug logs
  console.log('useBugs - bugsData:', bugsData);
  console.log('useBugs - loadingBugs:', loadingBugs);
  console.log('useBugs - bugsError:', bugsError);
  console.log('useBugs - statisticsData:', statisticsData);

  // Get failed executions
  const {
    data: failedExecutions,
    isLoading: loadingFailedExecutions,
    error: failedExecutionsError,
    refetch: refetchFailedExecutions,
  } = useQuery({
    queryKey: ['failed-executions', projectId],
    queryFn: () => bugService.getFailedExecutions(projectId),
    enabled: true, // Always enabled, will use general endpoint if no projectId
    retry: (failureCount, error) => {
      // Retry up to 2 times, but don't retry if it's a 404 or 500 error
      if (failureCount >= 2) return false;
      if (error.message.includes('500') || error.message.includes('404')) return false;
      return true;
    },
  });

  // Create bug mutation
  const createBugMutation = useMutation({
    mutationFn: (bugData: CreateBugDto) => bugService.createBug(projectId, bugData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
      queryClient.invalidateQueries({ queryKey: ['bug-statistics', projectId] });
      toast({
        title: "Success",
        description: "Bug created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update bug mutation
  const updateBugMutation = useMutation({
    mutationFn: ({ bugId, bugData }: { bugId: string; bugData: UpdateBugDto }) =>
      bugService.updateBug(projectId, bugId, bugData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
      queryClient.invalidateQueries({ queryKey: ['bug-statistics', projectId] });
      toast({
        title: "Success",
        description: "Bug updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete bug mutation
  const deleteBugMutation = useMutation({
    mutationFn: (bugId: string) => bugService.deleteBug(projectId, bugId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
      queryClient.invalidateQueries({ queryKey: ['bug-statistics', projectId] });
      toast({
        title: "Success",
        description: "Bug deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create bug from execution mutation
  const createBugFromExecutionMutation = useMutation({
    mutationFn: ({
      executionId,
      testCaseId,
      bugData,
    }: {
      executionId: string;
      testCaseId: string;
      bugData: Partial<CreateBugDto>;
    }) => bugService.createBugFromExecution(projectId, executionId, testCaseId, bugData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
      queryClient.invalidateQueries({ queryKey: ['bug-statistics', projectId] });
      queryClient.invalidateQueries({ queryKey: ['failed-executions', projectId] });
      toast({
        title: "Success",
        description: "Bug created from execution successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get bugs with custom filters
  const getBugsWithFilters = useCallback(async (filters: BugFilters) => {
    try {
      return await bugService.getBugs(projectId, filters);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch bugs",
        variant: "destructive",
      });
      throw error;
    }
  }, [projectId]);

  // Get specific bug
  const getBug = useCallback(async (bugId: string) => {
    try {
      return await bugService.getBug(projectId, bugId);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch bug",
        variant: "destructive",
      });
      throw error;
    }
  }, [projectId]);

  return {
    // Data
    bugs: bugsData?.data?.bugs || [],
    totalBugs: bugsData?.data?.total || 0,
    currentPage: bugsData?.data?.page || 1,
    totalPages: bugsData?.data?.totalPages || 0,
    statistics: statisticsData?.data || null,
    failedExecutions,

    // Loading states
    loadingBugs,
    loadingStatistics,
    loadingFailedExecutions,

    // Error states
    bugsError,
    statisticsError,
    failedExecutionsError,

    // Mutations
    createBug: createBugMutation.mutate,
    updateBug: updateBugMutation.mutate,
    deleteBug: deleteBugMutation.mutate,
    createBugFromExecution: createBugFromExecutionMutation.mutate,

    // Mutation states
    isCreatingBug: createBugMutation.isPending,
    isUpdatingBug: updateBugMutation.isPending,
    isDeletingBug: deleteBugMutation.isPending,
    isCreatingBugFromExecution: createBugFromExecutionMutation.isPending,

    // Functions
    refetchBugs,
    refetchFailedExecutions,
    getBugsWithFilters,
    getBug,
  };
};
