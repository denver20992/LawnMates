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

  // Create a new job
  const createJobMutation = useMutation({
    mutationFn: async (jobData: Partial<InsertJob>) => {
      const res = await apiRequest('POST', '/api/jobs', jobData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/mine'] });
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

  const createJob = useCallback(async (jobData: Partial<InsertJob>) => {
    return createJobMutation.mutateAsync(jobData);
  }, [createJobMutation]);

  const acceptJob = useCallback(async (jobId: number) => {
    return acceptJobMutation.mutateAsync(jobId);
  }, [acceptJobMutation]);

  const completeJob = useCallback(async (jobId: number) => {
    return completeJobMutation.mutateAsync(jobId);
  }, [completeJobMutation]);

  return {
    jobs,
    activeJobs,
    myJobs,
    loading: loading || activeJobsLoading || myJobsLoading,
    createJob,
    acceptJob,
    completeJob,
    loadJobs,
    loadActiveJobs,
    loadMyJobs
  };
};
