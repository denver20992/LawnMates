import React from 'react';
import { MapPin, Calendar, Star } from 'lucide-react';
import { Job } from '@shared/schema';
import { formatDistanceToNow, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import JobDistance from './JobDistance';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  selected?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick, selected = false }) => {
  const { user } = useAuth();
  const { acceptJob } = useJobs();

  // Format price from cents to dollars
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(job.price / 100);

  // Determine if user can accept this job (must be a landscaper and not assigned yet)
  const canAcceptJob = user?.role === 'landscaper' && !job.landscaperId;

  // Format date and time
  const formattedDate = format(new Date(job.startDate), 'EEE, MMM d');
  const formattedTimeWindow = job.endDate 
    ? `${format(new Date(job.startDate), 'h:mm a')} - ${format(new Date(job.endDate), 'h:mm a')}`
    : `${format(new Date(job.startDate), 'h:mm a')}`;

  const handleAcceptJob = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canAcceptJob) {
      try {
        await acceptJob(job.id);
      } catch (error) {
        console.error('Failed to accept job:', error);
      }
    }
  };

  return (
    <div 
      className={`border border-neutral-200 rounded-lg transition-shadow duration-200 cursor-pointer
        ${selected ? 'shadow-md ring-2 ring-primary-300 border-primary-300' : 'hover:shadow-md'}
      `}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="sm:flex sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center">
              <h4 className="text-lg font-medium text-neutral-900">{job.title}</h4>
              {job.isRecurring && (
                <Badge variant="secondary" className="ml-2">Recurring</Badge>
              )}
              {selected && (
                <Badge variant="default" className="ml-2 bg-accent-100 text-accent-800">Featured</Badge>
              )}
            </div>
            <div className="mt-1 flex items-center text-sm text-neutral-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {job.latitude && job.longitude 
                  ? `${job.latitude.toFixed(4)}, ${job.longitude.toFixed(4)}` 
                  : 'Location not specified'
                }
              </span>
              {job.latitude && job.longitude && user?.role === 'landscaper' && (
                <JobDistance
                  jobLatitude={job.latitude}
                  jobLongitude={job.longitude}
                  className="ml-2"
                />
              )}
            </div>
            <div className="mt-1 flex items-center text-sm text-neutral-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formattedDate} - {formattedTimeWindow}</span>
            </div>
            <div className="mt-2">
              <p className="text-sm text-neutral-600">{job.description}</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 text-right">
            <p className="text-xl font-bold text-primary-600">{formattedPrice}</p>
            <div className="mt-1 text-sm text-neutral-500">{job.isRecurring ? 'Monthly service' : 'One-time job'}</div>
            {canAcceptJob && (
              <Button 
                className="mt-2" 
                onClick={handleAcceptJob}
              >
                Accept Job
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
