import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Job, InsertJob } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export const useJobs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all available jobs (for landscapers)
  const { 
    data: jobs = [], 
    isLoading: loading,
    refetch: loadJobs
  } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
    enabled: !!user && user.role === 'landscaper'
  });

  // Fetch active jobs (jobs in progress or completed)
  const {
    data: activeJobs = [],
    isLoading: activeJobsLoading,
    refetch: loadActiveJobs
  } = useQuery<Job[]>({
    queryKey: ['/api/jobs/active'],
    enabled: !!user
  });

  // Fetch my jobs (all jobs created by property owners or assigned to landscapers)
  const {
    data: myJobs = [],
    isLoading: myJobsLoading,
    refetch: loadMyJobs
  } = useQuery<Job[]>({
    queryKey: ['/api/jobs/mine'],
    enabled: !!user
  });

  // Create a new job - allow string or Date for date fields
  const createJobMutation = useMutation({
    mutationFn: async (jobData: Partial<Omit<InsertJob, 'startDate' | 'endDate'>> & {
      startDate?: string | Date;
      endDate?: string | Date | null;
    }) => {
      const res = await apiRequest('POST', '/api/jobs', jobData);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all job-related queries to ensure all views are updated
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/mine'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      
      toast({
        title: 'Job Posted',
        description: 'Your job has been posted successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating job:', error);
      toast({
        title: 'Error',
        description: 'Failed to post job. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Accept a job (for landscapers)
  const acceptJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const res = await apiRequest('POST', `/api/jobs/${jobId}/accept`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/mine'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/active'] });
      toast({
        title: 'Job Accepted',
        description: 'You have successfully accepted the job.',
      });
    },
    onError: (error) => {
      console.error('Error accepting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept job. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Complete a job (for landscapers)
  const completeJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const res = await apiRequest('POST', `/api/jobs/${jobId}/complete`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/mine'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/active'] });
      toast({
        title: 'Job Completed',
        description: 'Job has been marked as completed. Please upload verification photos.',
      });
    },
    onError: (error) => {
      console.error('Error completing job:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete job. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Cancel a job (for property owners)
  const cancelJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const res = await apiRequest('POST', `/api/jobs/${jobId}/cancel`, {});
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all job-related queries to ensure all views are updated
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/mine'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] }); 
      toast({
        title: 'Job Cancelled',
        description: 'Your job has been cancelled successfully.',
      });
    },
    onError: (error) => {
      console.error('Error cancelling job:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel job. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Update the createJob type to match our mutation function
  const createJob = useCallback(async (jobData: Partial<Omit<InsertJob, 'startDate' | 'endDate'>> & {
    startDate?: string | Date;
    endDate?: string | Date | null;
  }) => {
    return createJobMutation.mutateAsync(jobData);
  }, [createJobMutation]);

  const acceptJob = useCallback(async (jobId: number) => {
    return acceptJobMutation.mutateAsync(jobId);
  }, [acceptJobMutation]);

  const completeJob = useCallback(async (jobId: number) => {
    return completeJobMutation.mutateAsync(jobId);
  }, [completeJobMutation]);
  
  const cancelJob = useCallback(async (jobId: number) => {
    if (window.confirm("Are you sure you want to cancel this job? This action cannot be undone.")) {
      return cancelJobMutation.mutateAsync(jobId);
    }
    return Promise.reject("Cancelled by user");
  }, [cancelJobMutation]);

  return {
    jobs,
    activeJobs,
    myJobs,
    loading: loading || activeJobsLoading || myJobsLoading,
    createJob,
    acceptJob,
    completeJob,
    cancelJob,
    loadJobs,
    loadActiveJobs,
    loadMyJobs
  };
};
