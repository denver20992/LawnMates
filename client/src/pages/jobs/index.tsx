import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useJobCancelDialog } from '@/hooks/useJobCancelDialog';
import JobCancelDialog from '@/components/jobs/JobCancelDialog';
import AppHeader from '@/components/layout/AppHeader';
import MobileMenu from '@/components/layout/MobileMenu';
import DashboardTabs from '@/components/layout/DashboardTabs';
import JobsMap from '@/components/jobs/JobsMap';
import ActiveJobsSection from '@/components/jobs/ActiveJobsSection';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Job } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

const JobsPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { jobs, activeJobs, myJobs, loadMyJobs, loadJobs, loading, cancelJob } = useJobs();
  const { isDialogOpen, jobToCancel, openCancelDialog, closeCancelDialog } = useJobCancelDialog();
  
  // Handle job cancellation with confirmation dialog
  const handleCancelJob = useCallback((jobId: number) => {
    openCancelDialog(jobId);
  }, [openCancelDialog]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<string>("available");
  const [counterparties, setCounterparties] = useState<Record<number, { id: number; username: string; avatar?: string; fullName?: string }>>({});
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    // Load appropriate jobs based on user role and active tab
    if (isAuthenticated) {
      if (activeTab === 'available' && user?.role === 'landscaper') {
        loadJobs();
      } else if (activeTab === 'my-jobs') {
        loadMyJobs();
      }
    }
  }, [isAuthenticated, activeTab, user?.role, loadJobs, loadMyJobs]);

  // Mock loading counterparties data
  useEffect(() => {
    const loadCounterparties = async () => {
      // In a real implementation, this would fetch actual user data
      if (myJobs?.length) {
        const parties: Record<number, { id: number; username: string; avatar?: string; fullName?: string }> = {};
        
        for (const job of myJobs) {
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
  }, [myJobs, user?.role]);

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
      
      <DashboardTabs activeTab={activeTab === 'available' ? 'available-jobs' : 'my-jobs'} />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-neutral-900">Jobs</h1>
          
          {user?.role === 'property_owner' && (
            <Button onClick={() => setLocation('/jobs/post')}>
              Post a New Job
            </Button>
          )}
        </div>
        
        <Tabs 
          defaultValue={activeTab} 
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            {user?.role === 'landscaper' && (
              <TabsTrigger value="available">Available Jobs</TabsTrigger>
            )}
            {user?.role === 'property_owner' && (
              <TabsTrigger value="available">Posted Jobs</TabsTrigger>
            )}
            <TabsTrigger value="my-jobs">
              {user?.role === 'landscaper' ? 'My Jobs' : 'Active Jobs'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="mt-4">
            {user?.role === 'landscaper' ? (
              <>
                {loading ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : jobs.length > 0 ? (
                  <JobsMap 
                    jobs={jobs}
                    onSelectJob={setSelectedJob}
                    selectedJob={selectedJob}
                    title="Available Jobs"
                  />
                ) : (
                  <div className="bg-white shadow rounded-lg p-8 text-center">
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">No available jobs</h3>
                    <p className="text-neutral-500 mb-4">There are no available jobs in your area at the moment. Check back later!</p>
                  </div>
                )}
              </>
            ) : (
              // Property owner view of their posted jobs
              <>
                {loading ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : myJobs.filter(job => job.status === 'posted').length > 0 ? (
                  <div className="space-y-4">
                    {myJobs.filter(job => job.status === 'posted').map(job => (
                      <div key={job.id} className="bg-white shadow rounded-lg p-4 border border-neutral-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-neutral-900">{job.title}</h3>
                            <p className="text-sm text-neutral-500 mt-1">{job.description.substring(0, 100)}...</p>
                            <div className="flex items-center mt-2">
                              <span className="text-sm text-neutral-600 font-medium">
                                ${(job.price / 100).toFixed(2)}
                              </span>
                              <span className="mx-2 text-neutral-300">•</span>
                              <span className="text-sm text-neutral-600">
                                Posted {new Date(job.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-2">
                              Awaiting Landscaper
                            </span>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewDetails(job.id)}>
                                View Details
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCancelJob(job.id)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white shadow rounded-lg p-8 text-center">
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">No posted jobs</h3>
                    <p className="text-neutral-500 mb-4">You haven't posted any jobs yet. Create a new job to find landscapers.</p>
                    <Button onClick={() => setLocation('/jobs/post')}>
                      Post a New Job
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="my-jobs" className="mt-4">
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
          </TabsContent>
        </Tabs>
      </main>
      

      
      <MobileMenu />
      
      {/* Job Cancellation Dialog */}
      <JobCancelDialog
        isOpen={isDialogOpen}
        jobId={jobToCancel}
        onClose={closeCancelDialog}
        jobTitle={
          jobToCancel 
            ? myJobs.find(job => job.id === jobToCancel)?.title || "this job"
            : "this job"
        }
      />
    </div>
  );
};

export default JobsPage;
