import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import AppHeader from '@/components/layout/AppHeader';
import MobileMenu from '@/components/layout/MobileMenu';
import DashboardTabs from '@/components/layout/DashboardTabs';
import DashboardStats from '@/components/dashboard/DashboardStats';
import JobMap from '@/components/jobs/JobMap';
import ActiveJobsSection from '@/components/jobs/ActiveJobsSection';
import RecentMessagesSection from '@/components/messages/RecentMessagesSection';
import { Button } from '@/components/ui/button';
import { useJobVerification } from '@/hooks/useJobVerification';
import { Job } from '@shared/schema';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { jobs: availableJobs, loading: jobsLoading, activeJobs } = useJobs();
  const { isModalOpen } = useJobVerification();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [counterparties, setCounterparties] = useState<Record<number, { id: number; username: string; avatar?: string; fullName?: string }>>({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // Mock loading counterparties data
  useEffect(() => {
    const loadCounterparties = async () => {
      // In a real implementation, this would fetch actual user data
      // For now, we'll create some placeholder data
      if (activeJobs?.length) {
        const parties: Record<number, { id: number; username: string; avatar?: string; fullName?: string }> = {};
        
        for (const job of activeJobs) {
          // For property owners, the counterparty is the landscaper
          if (user?.role === 'property_owner' && job.landscaperId) {
            parties[job.landscaperId] = {
              id: job.landscaperId,
              username: `landscaper${job.landscaperId}`,
              fullName: `Landscaper ${job.landscaperId}`
            };
          }
          // For landscapers, the counterparty is the property owner
          else if (user?.role === 'landscaper') {
            parties[job.ownerId] = {
              id: job.ownerId,
              username: `owner${job.ownerId}`,
              fullName: `Owner ${job.ownerId}`
            };
          }
        }
        
        setCounterparties(parties);
      }
    };
    
    loadCounterparties();
  }, [activeJobs, user?.role]);

  const handleOpenChat = (jobId: number, userId: number) => {
    setLocation(`/messages/${jobId}`);
  };

  const handleViewDetails = (jobId: number) => {
    setLocation(`/jobs/${jobId}`);
  };

  const handleRebook = (jobId: number) => {
    // This would create a new job based on the old one
    setLocation(`/jobs/post?rebook=${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="pb-16 md:pb-0">
      <AppHeader />
      
      <DashboardTabs activeTab="dashboard" />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <DashboardStats />
        
        {user?.role === 'landscaper' && (
          <JobMap 
            jobs={availableJobs}
            onSelectJob={setSelectedJob}
            selectedJob={selectedJob}
          />
        )}
        
        {user?.role === 'property_owner' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Post a Job</h2>
            </div>
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Need lawn care services?</h3>
              <p className="text-neutral-600 mb-4">Post a job to find reliable landscapers in your area.</p>
              <Button onClick={() => setLocation('/jobs/post')}>
                Post a New Job
              </Button>
            </div>
          </div>
        )}
        
        <ActiveJobsSection 
          jobs={activeJobs}
          counterparties={counterparties}
          onOpenChat={handleOpenChat}
          onViewDetails={handleViewDetails}
          onRebook={handleRebook}
        />
        
        <RecentMessagesSection limit={3} />
      </main>
      
      <MobileMenu />
    </div>
  );
};

export default Dashboard;
