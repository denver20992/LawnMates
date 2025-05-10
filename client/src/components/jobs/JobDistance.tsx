import React from 'react';
import { MapPinIcon } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance, formatDistance } from '@/utils/distance';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface JobDistanceProps {
  jobLatitude: number | null;
  jobLongitude: number | null;
  className?: string;
}

/**
 * Component that displays the distance between the user's current location and a job
 */
const JobDistance: React.FC<JobDistanceProps> = ({ 
  jobLatitude, 
  jobLongitude,
  className = ''
}) => {
  const { latitude, longitude, error, loading } = useGeolocation();
  
  const distance = calculateDistance(
    latitude,
    longitude,
    jobLatitude,
    jobLongitude
  );

  if (loading) {
    return (
      <Badge variant="outline" className={`animate-pulse ${className}`}>
        <MapPinIcon className="h-3 w-3 mr-1" />
        Getting location...
      </Badge>
    );
  }
  
  if (error || !distance) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={className}>
              <MapPinIcon className="h-3 w-3 mr-1" />
              Unknown distance
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{error || "Missing location data for accurate distance"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Determine color based on distance
  let badgeVariant: "default" | "secondary" | "outline" = "outline";
  
  if (distance < 5) {
    badgeVariant = "default"; // Close jobs
  } else if (distance < 15) {
    badgeVariant = "secondary"; // Medium distance jobs
  }

  return (
    <Badge variant={badgeVariant} className={className}>
      <MapPinIcon className="h-3 w-3 mr-1" />
      {formatDistance(distance)}
    </Badge>
  );
};

export default JobDistance;