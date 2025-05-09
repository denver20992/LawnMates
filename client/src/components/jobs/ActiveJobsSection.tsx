import React from 'react';
import { MapPin, User, MessageCircle, Camera } from 'lucide-react';
import { Job } from '@shared/schema';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useJobVerification } from '@/hooks/useJobVerification';

interface ActiveJobsSectionProps {
  jobs: Job[];
  counterparties: Record<number, { id: number; username: string; avatar?: string; fullName?: string }>;
  onOpenChat: (jobId: number, userId: number) => void;
  onViewDetails: (jobId: number) => void;
  onRebook: (jobId: number) => void;
}

const ActiveJobsSection: React.FC<ActiveJobsSectionProps> = ({
  jobs,
  counterparties,
  onOpenChat,
  onViewDetails,
  onRebook,
}) => {
  const { user } = useAuth();
  const { openVerificationModal } = useJobVerification();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'posted':
        return <Badge variant="outline">Posted</Badge>;
      case 'accepted':
        return <Badge variant="secondary">Accepted</Badge>;
      case 'in_progress':
        return <Badge className="bg-secondary-100 text-secondary-800">In Progress</Badge>;
      case 'verification_pending':
        return <Badge className="bg-accent-100 text-accent-800">Verification Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'disputed':
        return <Badge className="bg-red-100 text-red-800">Disputed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getActionButtons = (job: Job) => {
    // Different actions based on job status and user role
    if (user?.role === 'landscaper') {
      if (job.status === 'in_progress') {
        return (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onOpenChat(job.id, job.ownerId)}
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Message
            </Button>
            <Button 
              size="sm" 
              onClick={() => openVerificationModal(job.id)}
            >
              <Camera className="h-4 w-4 mr-1.5" />
              Upload Photo
            </Button>
          </>
        );
      } else if (job.status === 'completed') {
        return (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(job.id)}
          >
            View Details
          </Button>
        );
      }
    } else if (user?.role === 'property_owner') {
      if (job.status === 'completed') {
        return (
          <Button 
            size="sm" 
            variant="default"
            className="bg-accent-600 hover:bg-accent-700"
            onClick={() => onRebook(job.id)}
          >
            <MessageCircle className="h-4 w-4 mr-1.5" />
            Rebook
          </Button>
        );
      } else if (job.landscaperId) {
        // Has a landscaper assigned
        return (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onOpenChat(job.id, job.landscaperId)}
          >
            <MessageCircle className="h-4 w-4 mr-1.5" />
            Message
          </Button>
        );
      }
    }
    
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onViewDetails(job.id)}
      >
        View Details
      </Button>
    );
  };

  if (!jobs.length) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">My Active Jobs</h2>
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-neutral-500">You don't have any active jobs.</p>
          {user?.role === 'property_owner' && (
            <Button className="mt-4">Post a Job</Button>
          )}
          {user?.role === 'landscaper' && (
            <Button className="mt-4">Find Jobs</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">My Active Jobs</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => {
          const counterparty = counterparties[
            user?.role === 'landscaper' ? job.ownerId : (job.landscaperId || 0)
          ];
          
          return (
            <div key={job.id} className="bg-white shadow rounded-lg overflow-hidden border border-neutral-200">
              <div className="px-4 py-5 sm:px-6 bg-neutral-50 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-neutral-900">{job.title}</h3>
                  {getStatusBadge(job.status)}
                </div>
                <p className="mt-1 max-w-2xl text-sm text-neutral-500">
                  {format(new Date(job.startDate), 'h:mm a')} - 
                  {job.endDate ? format(new Date(job.endDate), 'h:mm a') : 'Flexible'}, 
                  {format(new Date(job.startDate), ' MMM d')}
                </p>
              </div>
              <div className="px-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-neutral-500">
                      {user?.role === 'landscaper' ? 'Customer' : 'Landscaper'}
                    </dt>
                    <dd className="mt-1 text-sm text-neutral-900 sm:mt-0 sm:col-span-2 flex items-center">
                      {counterparty ? (
                        <>
                          <Avatar className="h-6 w-6 mr-2">
                            {counterparty.avatar ? (
                              <AvatarImage src={counterparty.avatar} alt={counterparty.username} />
                            ) : (
                              <AvatarFallback>
                                {counterparty.fullName 
                                  ? getInitials(counterparty.fullName) 
                                  : counterparty.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span>{counterparty.fullName || counterparty.username}</span>
                        </>
                      ) : (
                        <span className="text-neutral-500">Not assigned yet</span>
                      )}
                    </dd>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-neutral-500">Address</dt>
                    <dd className="mt-1 text-sm text-neutral-900 sm:mt-0 sm:col-span-2">
                      {job.latitude && job.longitude 
                        ? `${job.latitude.toFixed(6)}, ${job.longitude.toFixed(6)}`
                        : 'Address not specified'}
                    </dd>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-neutral-500">Job Value</dt>
                    <dd className="mt-1 text-sm font-semibold text-primary-600 sm:mt-0 sm:col-span-2">
                      ${(job.price / 100).toFixed(2)}
                      {job.status === 'completed' && (
                        <span className="text-green-600 ml-1">(Paid)</span>
                      )}
                    </dd>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-neutral-500">Next Steps</dt>
                    <dd className="mt-1 text-sm text-neutral-900 sm:mt-0 sm:col-span-2">
                      {job.status === 'posted' && 'Waiting for landscaper to accept'}
                      {job.status === 'accepted' && 'Wait for scheduled date'}
                      {job.status === 'in_progress' && user?.role === 'landscaper' && 'Upload completion photos'}
                      {job.status === 'in_progress' && user?.role === 'property_owner' && 'Waiting for job completion'}
                      {job.status === 'verification_pending' && 'Verification in progress'}
                      {job.status === 'completed' && 'Job completed successfully'}
                      {job.status === 'cancelled' && 'Job was cancelled'}
                      {job.status === 'disputed' && 'Job is under dispute'}
                    </dd>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  {getActionButtons(job)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveJobsSection;
