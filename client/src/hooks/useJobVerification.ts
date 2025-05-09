import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export const useJobVerification = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Submit verification photos
  const submitVerificationMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/verifications', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/mine'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/active'] });
      toast({
        title: 'Verification Submitted',
        description: 'Your verification photos have been submitted for review.',
      });
      closeVerificationModal();
    },
    onError: (error) => {
      console.error('Error submitting verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit verification. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const openVerificationModal = useCallback((jobId: number) => {
    setCurrentJobId(jobId);
    setIsModalOpen(true);
  }, []);

  const closeVerificationModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentJobId(null);
  }, []);

  const submitVerification = useCallback(async (formData: FormData) => {
    return submitVerificationMutation.mutateAsync(formData);
  }, [submitVerificationMutation]);

  return {
    isModalOpen,
    currentJobId,
    openVerificationModal,
    closeVerificationModal,
    submitVerification,
    isSubmitting: submitVerificationMutation.isPending
  };
};
