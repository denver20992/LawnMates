import React, { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import AppHeader from '@/components/layout/AppHeader';
import MobileMenu from '@/components/layout/MobileMenu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Job } from '@shared/schema';
import { Loader2, MapPin, Clock, Dollar, ArrowLeft, MessageCircle } from 'lucide-react';

const JobDetailsPage: React.FC = () => {
  const [match, params] = useRoute<{ id: string }>('/jobs/:id');
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { getJobById, loading: jobLoading } = useJobs();
  const [job, setJob] = useState<Job | null>(null);
  const { toast } = useToast();
  const jobId = match ? parseInt(params.id) : null;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/login');
      return;
    }

    if (jobId) {
      getJobById(jobId)
        .then(data => {
          setJob(data);
        })
        .catch(error => {
          console.error('Error fetching job details:', error);
          toast({
            title: 'Error',
            description: 'Failed to load job details.',
            variant: 'destructive',
          });
        });
    }
  }, [jobId, authLoading, isAuthenticated, getJobById, setLocation, toast]);

  const handleBack = () => {
    setLocation('/jobs');
  };

  const handleMessage = () => {
    if (job) {
      const targetUserId = user?.role === 'property_owner' ? job.landscaperId : job.ownerId;
      if (targetUserId) {
        setLocation(`/messages/${job.id}/${targetUserId}`);
      } else {
        toast({
          title: 'Cannot message',
          description: 'There is no one to message for this job yet.',
          variant: 'destructive',
        });
      }
    }
  };

  if (authLoading || jobLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AppHeader title="Job Details" />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={handleBack} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to jobs
          </Button>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <h2 className="text-xl font-medium text-neutral-800 mb-2">Job not found</h2>
                <p className="text-neutral-600 mb-4">The job you're looking for doesn't exist or you don't have permission to view it.</p>
                <Button onClick={handleBack}>Go back to jobs</Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <MobileMenu />
      </div>
    );
  }

  const jobStatusColors: Record<string, string> = {
    posted: 'bg-amber-100 text-amber-800',
    accepted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    verification_pending: 'bg-teal-100 text-teal-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    disputed: 'bg-orange-100 text-orange-800',
  };

  const jobStatusDisplay: Record<string, string> = {
    posted: 'Posted',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    verification_pending: 'Verification Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    disputed: 'Disputed',
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader title="Job Details" />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to jobs
        </Button>

        <Card>
          <CardHeader className="pb-0">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-2xl font-bold text-neutral-900">{job.title}</CardTitle>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${jobStatusColors[job.status]}`}>
                {jobStatusDisplay[job.status]}
              </span>
            </div>
            {job.latitude && job.longitude && (
              <div className="flex items-center text-neutral-600 text-sm mb-2">
                <MapPin className="h-4 w-4 mr-1 text-neutral-400" />
                <span>
                  {job.latitude.toFixed(6)}, {job.longitude.toFixed(6)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-4 text-sm text-neutral-600 mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-neutral-400" />
                <span>{job.startDate ? format(new Date(job.startDate), 'MMM d, yyyy') : 'No date specified'}</span>
              </div>
              <div className="flex items-center">
                <Dollar className="h-4 w-4 mr-1 text-neutral-400" />
                <span>${(job.price / 100).toFixed(2)} CAD</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="border-t border-b py-4 mb-4">
              <h3 className="font-medium text-neutral-900 mb-2">Description</h3>
              <p className="text-neutral-700">{job.description || 'No description provided.'}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium text-neutral-900 mb-2">Job Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-neutral-100 p-3 rounded-md">
                  <span className="text-sm text-neutral-500">Property Size</span>
                  <p className="font-medium text-neutral-800 capitalize">{job.propertySize || 'Not specified'}</p>
                </div>
                <div className="bg-neutral-100 p-3 rounded-md">
                  <span className="text-sm text-neutral-500">Equipment Required</span>
                  <p className="font-medium text-neutral-800">{job.requiresEquipment ? 'Yes' : 'No'}</p>
                </div>
                <div className="bg-neutral-100 p-3 rounded-md">
                  <span className="text-sm text-neutral-500">Recurring Job</span>
                  <p className="font-medium text-neutral-800">{job.isRecurring ? 'Yes' : 'No'}</p>
                </div>
                <div className="bg-neutral-100 p-3 rounded-md">
                  <span className="text-sm text-neutral-500">Job Created</span>
                  <p className="font-medium text-neutral-800">
                    {job.createdAt ? format(new Date(job.createdAt), 'MMM d, yyyy') : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-6">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              {job.status !== 'cancelled' && job.status !== 'completed' && (
                <Button 
                  onClick={handleMessage}
                  disabled={!job.landscaperId && user?.role === 'property_owner'}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <MobileMenu />
    </div>
  );
};

export default JobDetailsPage;