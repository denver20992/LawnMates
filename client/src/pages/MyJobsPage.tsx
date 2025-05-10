import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useJobCancelDialog } from '@/hooks/useJobCancelDialog';
import JobCancelDialog from '@/components/jobs/JobCancelDialog';
import AppHeader from '@/components/layout/AppHeader';
import MobileMenu from '@/components/layout/MobileMenu';
import ActiveJobsSection from '@/components/jobs/ActiveJobsSection';
import { Button } from '@/components/ui/button';
import { Job } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

const MyJobsPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { myJobs, loadMyJobs, loading, cancelJob } = useJobs();
  const { isDialogOpen, jobToCancel, openCancelDialog, closeCancelDialog } = useJobCancelDialog();
  const [counterparties, setCounterparties] = useState<Record<number, { id: number; username: string; avatar?: string; fullName?: string }>>({});
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, setLocation]);
  
  const handleOpenChat = useCallback((jobId: number, userId: number | null) => {
    if (userId) {
      setLocation(`/messages/${jobId}/${userId}`);
    }
  }, [setLocation]);
  
  const handleViewDetails = useCallback((jobId: number) => {
    setLocation(`/jobs/${jobId}`);
  }, [setLocation]);
  
  const handleRebook = useCallback((jobId: number) => {
    console.log('Rebooking job:', jobId);
  }, []);
  
  const handleCancelJob = useCallback((jobId: number) => {
    openCancelDialog(jobId);
  }, [openCancelDialog]);
    
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <AppHeader title="My Jobs" />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">My Jobs</h1>
          {user?.role === 'property_owner' && (
            <Button onClick={() => setLocation('/jobs/post')}>Post a Job</Button>
          )}
        </div>
  
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <ActiveJobsSection 
            jobs={myJobs}
            counterparties={counterparties}
            onOpenChat={handleOpenChat}
            onViewDetails={handleViewDetails}
            onRebook={handleRebook}
            onCancelJob={handleCancelJob}
          />
        )}
      </main>
      
      {/* Job Cancellation Dialog */}
      <JobCancelDialog
        isOpen={isDialogOpen}
        jobId={jobToCancel}
        onClose={closeCancelDialog}
        jobTitle={myJobs.find(job => job.id === jobToCancel)?.title || 'this job'}
      />
      
      <MobileMenu />
    </div>
  );
};

export default MyJobsPage;