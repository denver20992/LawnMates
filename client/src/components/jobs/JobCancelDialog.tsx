import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface JobCancelDialogProps {
  isOpen: boolean;
  jobId: number | null;
  jobTitle?: string;
  onClose: () => void;
}

const JobCancelDialog: React.FC<JobCancelDialogProps> = ({
  isOpen,
  jobId,
  jobTitle = 'this job',
  onClose,
}) => {
  const { toast } = useToast();

  const handleCancel = async () => {
    if (!jobId) {
      onClose();
      return;
    }

    try {
      await apiRequest('PATCH', `/api/jobs/${jobId}/cancel`);
      
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/mine'] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });
      
      toast({
        title: 'Job cancelled',
        description: 'The job was successfully cancelled.',
      });
      
      onClose();
    } catch (error) {
      console.error('Error cancelling job:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel the job. Please try again.',
        variant: 'destructive',
      });
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Job</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel {jobTitle}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>No, keep it</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel}>Yes, cancel job</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default JobCancelDialog;