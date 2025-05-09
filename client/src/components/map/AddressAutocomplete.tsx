import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, lat: number, lng: number) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  defaultValue = '',
  placeholder = 'Search for an address...',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState(defaultValue);

  useEffect(() => {
    if (!import.meta.env.VITE_MAPBOX_TOKEN) {
      console.error('Mapbox token is missing');
      return;
    }

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    
    // Create a hidden map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-79.3832, 43.6532], // Toronto coordinates
      zoom: 11,
      interactive: false,
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: placeholder,
      countries: 'ca', // Limit to Canada
      types: 'address,place',
    });

    // Add the geocoder to the container
    if (geocoderContainerRef.current) {
      geocoderContainerRef.current.appendChild(geocoder.onAdd(map));
    }

    // Listen for the result event
    geocoder.on('result', (e) => {
      const result = e.result;
      const coordinates = result.geometry.coordinates;
      const placeName = result.place_name;
      
      setAddress(placeName);
      onAddressSelect(placeName, coordinates[1], coordinates[0]);
    });

    // Clean up on unmount
    return () => {
      map.remove();
      if (geocoderContainerRef.current && geocoderContainerRef.current.firstChild) {
        geocoderContainerRef.current.removeChild(geocoderContainerRef.current.firstChild);
      }
    };
  }, [onAddressSelect, placeholder]);

  return (
    <div className="address-autocomplete">
      {/* Hidden map container */}
      <div ref={mapContainerRef} style={{ display: 'none' }} />
      
      {/* Geocoder container */}
      <div ref={geocoderContainerRef} className={`mapboxgl-geocoder-container ${className}`} />
    </div>
  );
};

export default AddressAutocomplete;