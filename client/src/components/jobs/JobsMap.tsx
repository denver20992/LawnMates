import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance, formatDistance } from '@/utils/distance';
import { Job } from '@shared/schema';
import JobCard from './JobCard';

// Set Mapbox token from environment
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface JobsMapProps {
  jobs: Job[];
  onSelectJob: (job: Job | null) => void;
  selectedJob: Job | null;
  title: string;
  className?: string;
}

const JobsMap: React.FC<JobsMapProps> = ({
  jobs,
  onSelectJob,
  selectedJob,
  title,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<number, mapboxgl.Marker>>({});
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const { latitude: userLat, longitude: userLng, error: locationError } = useGeolocation();
  const [jobsWithDistance, setJobsWithDistance] = useState<Array<Job & { distance: number | null }>>([]);

  // Calculate distances between user and jobs
  useEffect(() => {
    if (userLat && userLng) {
      const jobsWithDistances = jobs.map(job => ({
        ...job,
        distance: calculateDistance(userLat, userLng, job.latitude, job.longitude)
      }));
      
      // Sort by distance (closest first)
      jobsWithDistances.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
      
      setJobsWithDistance(jobsWithDistances);
    } else {
      setJobsWithDistance(jobs.map(job => ({ ...job, distance: null })));
    }
  }, [jobs, userLat, userLng]);

  // Initialize map and markers
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Check if we have any jobs with coords
    const hasValidCoords = jobs.some(job => job.latitude && job.longitude);
    if (!hasValidCoords && !userLat && !userLng) return;
    
    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      // Default center (will be updated)
      const defaultCenter = [
        userLng || (jobs[0]?.longitude || -79.3832),
        userLat || (jobs[0]?.latitude || 43.6532)
      ];
      
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: defaultCenter as [number, number],
        zoom: 10
      });
      
      // Add controls
      mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      mapRef.current.addControl(new mapboxgl.FullscreenControl());
    }
    
    const map = mapRef.current;
    
    // Add job markers
    jobs.forEach(job => {
      if (!job.latitude || !job.longitude) return;
      
      // Skip if marker already exists
      if (markersRef.current[job.id]) return;
      
      // Create element for marker
      const el = document.createElement('div');
      el.className = 'cursor-pointer';
      el.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md">
          ${job.id}
        </div>
      `;
      
      el.addEventListener('click', () => {
        onSelectJob(job);
      });
      
      // Create and store marker
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([job.longitude, job.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <h3 class="font-bold">${job.title}</h3>
              <p class="text-sm">$${(job.price / 100).toFixed(2)}</p>
            `)
        )
        .addTo(map);
      
      markersRef.current[job.id] = marker;
    });
    
    // Add user location marker
    if (userLat && userLng) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat([userLng, userLat]);
      } else {
        const el = document.createElement('div');
        el.className = 'flex items-center justify-center';
        el.innerHTML = `
          <div class="h-4 w-4 rounded-full bg-blue-500 animate-ping absolute"></div>
          <div class="h-4 w-4 rounded-full bg-blue-500 relative"></div>
        `;
        
        userMarkerRef.current = new mapboxgl.Marker(el)
          .setLngLat([userLng, userLat])
          .setPopup(new mapboxgl.Popup().setHTML('<h3>Your location</h3>'))
          .addTo(map);
      }
    }
    
    // Fit bounds to include all markers
    if (map) {
      const bounds = new mapboxgl.LngLatBounds();
      let hasMarkers = false;
      
      // Add job locations to bounds
      jobs.forEach(job => {
        if (job.latitude && job.longitude) {
          bounds.extend([job.longitude, job.latitude]);
          hasMarkers = true;
        }
      });
      
      // Add user location to bounds
      if (userLat && userLng) {
        bounds.extend([userLng, userLat]);
        hasMarkers = true;
      }
      
      // Only fit bounds if we have markers
      if (hasMarkers) {
        map.fitBounds(bounds, {
          padding: 50,
          maxZoom: 14
        });
      }
    }
    
    return () => {
      // Clean up markers when component unmounts
      Object.values(markersRef.current).forEach(marker => marker.remove());
      if (userMarkerRef.current) userMarkerRef.current.remove();
    };
  }, [jobs, userLat, userLng, onSelectJob]);
  
  // Update selected job highlight
  useEffect(() => {
    // Reset all markers to default style
    Object.entries(markersRef.current).forEach(([jobId, marker]) => {
      const el = marker.getElement();
      const inner = el.querySelector('div');
      if (inner) {
        inner.classList.remove('bg-accent');
        inner.classList.add('bg-primary');
      }
    });
    
    // Highlight selected job marker
    if (selectedJob && markersRef.current[selectedJob.id]) {
      const marker = markersRef.current[selectedJob.id];
      const el = marker.getElement();
      const inner = el.querySelector('div');
      if (inner) {
        inner.classList.remove('bg-primary');
        inner.classList.add('bg-accent');
      }
    }
  }, [selectedJob]);

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 ${className}`}>
      <div className="lg:col-span-2">
        <Card className="overflow-hidden h-[400px] md:h-[500px]">
          <CardHeader className="p-4 pb-0">
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div ref={mapContainerRef} className="h-[350px] md:h-[450px] w-full" />
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-1 h-[400px] md:h-[500px] overflow-y-auto pr-1">
        <h3 className="font-medium text-lg mb-3">{jobs.length} Available Jobs</h3>
        {locationError && (
          <div className="bg-amber-50 p-3 rounded-md mb-3 text-sm border border-amber-200">
            <p className="text-amber-800 font-medium">Location access is disabled</p>
            <p className="text-amber-700 text-xs mt-1">
              Enable location access to see job distances and get better recommendations.
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          {jobsWithDistance.map(job => (
            <div 
              key={job.id}
              className={`cursor-pointer transition-all ${selectedJob?.id === job.id ? 'ring-2 ring-accent' : ''}`}
              onClick={() => onSelectJob(job)}
            >
              <JobCard job={job} selected={selectedJob?.id === job.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobsMap;