import React, { useState, useEffect, useRef } from 'react';
import JobCard from './JobCard';
import { MapPin, Filter, Clock, DollarSign, Plus, Minus } from 'lucide-react';
import { Job } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface JobMapProps {
  jobs: Job[];
  onSelectJob?: (job: Job) => void;
  selectedJob?: Job | null;
  title?: string;
}

const JobMap: React.FC<JobMapProps> = ({ 
  jobs, 
  onSelectJob, 
  selectedJob = null, 
  title = "Jobs Near You" 
}) => {
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { toast } = useToast();
  
  // In a real implementation, we would use a proper map library (Mapbox, Google Maps, etc.)
  // For now we use a static Mapbox map
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  
  useEffect(() => {
    // Set initial filtered jobs
    setFilteredJobs(jobs);
    
    // Check if Mapbox token is available
    if (!mapboxToken) {
      toast({
        title: "Map Display Error",
        description: "Mapbox token is missing. Please contact support.",
        variant: "destructive"
      });
    } else {
      setMapLoaded(true);
    }
  }, [jobs, mapboxToken, toast]);
  
  const handleFilterClick = (filter: string) => {
    // Toggle filter
    if (activeFilter === filter) {
      setActiveFilter(null);
      setFilteredJobs(jobs);
      return;
    }
    
    setActiveFilter(filter);
    
    // Apply filtering logic
    switch (filter) {
      case 'distance':
        // In a real app, we would filter based on geolocation
        setFilteredJobs(jobs.filter((job) => job.propertyId % 2 === 0));
        break;
      case 'time':
        // Filter jobs scheduled for the current week
        const today = new Date();
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
        
        setFilteredJobs(jobs.filter((job) => {
          const jobDate = new Date(job.startDate);
          return jobDate >= today && jobDate <= endOfWeek;
        }));
        break;
      case 'price':
        // Filter jobs in a specific price range ($30-$50)
        setFilteredJobs(jobs.filter((job) => 
          job.price >= 3000 && job.price <= 5000
        ));
        break;
      default:
        setFilteredJobs(jobs);
    }
  };
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h2>
      <div className="bg-white shadow rounded-lg p-4">
        <div className="rounded-md overflow-hidden mb-4 relative">
          {/* Map container */}
          <div ref={mapContainerRef} className="h-80 bg-secondary-100 w-full relative">
            {/* Map using Mapbox */}
            {mapLoaded ? (
              <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center" 
                style={{ 
                  backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l+1e88e5(-83.7430,42.2808),pin-l+1e88e5(-83.7530,42.2908),pin-l+1e88e5(-83.7330,42.2708)/auto/800x600?access_token=${mapboxToken}')` 
                }} 
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-neutral-500">Loading map...</div>
              </div>
            )}
            
            {/* Map job markers */}
            {filteredJobs.map((job, index) => (
              <div 
                key={job.id}
                className={`absolute cursor-pointer ${
                  selectedJob?.id === job.id ? 'top-2/3 left-2/3' : `top-${1 + index}/${4 + index % 2} left-${1 + index % 3}/${3 + index % 4}`
                }`}
                onClick={() => onSelectJob?.(job)}
              >
                <div className={`
                  ${selectedJob?.id === job.id ? 'h-8 w-8 animate-pulse bg-accent-500' : 'h-6 w-6 bg-primary-500'} 
                  rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-white font-bold text-xs
                `}>
                  {index + 1}
                </div>
              </div>
            ))}
            
            {/* Map Controls */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2">
              <div className="flex flex-col space-y-2">
                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-neutral-100">
                  <Plus className="h-5 w-5 text-neutral-700" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-neutral-100">
                  <Minus className="h-5 w-5 text-neutral-700" />
                </button>
              </div>
            </div>
            
            {/* Map Attribution */}
            <div className="absolute bottom-2 left-2 bg-white bg-opacity-75 rounded px-2 py-1 text-xs text-neutral-600">
              Map data © OpenStreetMap contributors
            </div>
          </div>
        </div>
        
        {/* Job Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-medium text-neutral-700">Filter:</span>
          <Button 
            variant="outline"
            size="sm"
            className={`inline-flex items-center rounded-full text-sm font-medium ${
              activeFilter === 'distance' ? 'bg-primary-100 text-primary-800' : ''
            }`}
            onClick={() => handleFilterClick('distance')}
          >
            <MapPin className="h-4 w-4 mr-1.5" />
            Distance (5 miles)
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className={`inline-flex items-center rounded-full text-sm font-medium ${
              activeFilter === 'time' ? 'bg-secondary-100 text-secondary-800' : ''
            }`}
            onClick={() => handleFilterClick('time')}
          >
            <Clock className="h-4 w-4 mr-1.5" />
            This Week
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className={`inline-flex items-center rounded-full text-sm font-medium ${
              activeFilter === 'price' ? 'bg-accent-100 text-accent-800' : ''
            }`}
            onClick={() => handleFilterClick('price')}
          >
            <DollarSign className="h-4 w-4 mr-1.5" />
            $30 - $50
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="inline-flex items-center rounded-full text-sm font-medium text-neutral-500 hover:bg-neutral-100"
          >
            <Filter className="h-4 w-4 mr-1.5" />
            More Filters
          </Button>
        </div>
        
        {/* Job Cards */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">No jobs match the current filters.</p>
              <Button 
                variant="link" 
                onClick={() => { 
                  setActiveFilter(null); 
                  setFilteredJobs(jobs); 
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onClick={() => onSelectJob?.(job)}
                selected={selectedJob?.id === job.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMap;
