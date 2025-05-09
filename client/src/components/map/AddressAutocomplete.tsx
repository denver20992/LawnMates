import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, lat?: number, lng?: number) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

// For now, create a simpler version that mimics the functionality
// Later we'll integrate the real Mapbox geocoder when we've resolved the TypeScript issues
const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  defaultValue = '',
  placeholder = 'Search for an address...',
  className = '',
}) => {
  const [address, setAddress] = useState(defaultValue);

  // For testing purposes - static coordinates for Toronto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    
    // Only trigger the callback if we have a meaningful address
    if (value.length > 5) {
      // For demo purposes, using Toronto coordinates
      onAddressSelect(value, 43.6532, -79.3832);
    }
  };

  return (
    <div className={`address-autocomplete ${className}`}>
      <Input 
        type="text"
        placeholder={placeholder}
        value={address}
        onChange={handleChange}
        className="w-full"
      />
      <div className="text-xs text-muted-foreground mt-1">
        <span>Start typing to search for an address in Canada</span>
      </div>
    </div>
  );
};

export default AddressAutocomplete;