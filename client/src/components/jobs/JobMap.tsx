import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { useGeolocation } from '@/hooks/useGeolocation';

// Set Mapbox token from environment
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface JobMapProps {
  jobLatitude: number | null;
  jobLongitude: number | null;
  jobTitle: string;
  className?: string;
}

const JobMap: React.FC<JobMapProps> = ({
  jobLatitude,
  jobLongitude,
  jobTitle,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { latitude: userLat, longitude: userLng } = useGeolocation();

  useEffect(() => {
    // Don't initialize the map if we're missing location data
    if (!jobLatitude || !jobLongitude || !mapContainerRef.current) return;

    // Initialize the map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [jobLongitude, jobLatitude],
        zoom: 13
      });

      // Add controls
      mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      mapRef.current.addControl(new mapboxgl.FullscreenControl());
      
      // Add job marker
      new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat([jobLongitude, jobLatitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${jobTitle}</h3>`))
        .addTo(mapRef.current);
    }

    // Add user location marker when available
    if (userLat && userLng && mapRef.current) {
      // Remove previous user marker if exists
      const userMarkerEl = document.getElementById('user-location-marker');
      if (userMarkerEl) userMarkerEl.remove();
      
      // Create a new user marker
      const el = document.createElement('div');
      el.id = 'user-location-marker';
      el.className = 'flex items-center justify-center';
      el.innerHTML = `
        <div class="h-4 w-4 rounded-full bg-blue-500 animate-ping absolute"></div>
        <div class="h-4 w-4 rounded-full bg-blue-500 relative"></div>
      `;
      
      new mapboxgl.Marker(el)
        .setLngLat([userLng, userLat])
        .setPopup(new mapboxgl.Popup().setHTML('<h3>Your location</h3>'))
        .addTo(mapRef.current);
        
      // Fit bounds to include both markers if we have both locations
      if (jobLatitude && jobLongitude && userLat && userLng) {
        const bounds = new mapboxgl.LngLatBounds()
          .extend([jobLongitude, jobLatitude])
          .extend([userLng, userLat]);
          
        mapRef.current.fitBounds(bounds, { 
          padding: 50, 
          maxZoom: 15
        });
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [jobLatitude, jobLongitude, jobTitle, userLat, userLng]);
  
  if (!jobLatitude || !jobLongitude) {
    return (
      <Card className={`flex items-center justify-center h-64 ${className}`}>
        <p className="text-muted-foreground">No location data available for this job</p>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div ref={mapContainerRef} className="h-64 w-full" />
    </Card>
  );
};

export default JobMap;