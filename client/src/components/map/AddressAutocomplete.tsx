import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, lat?: number, lng?: number) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

interface AddressSuggestion {
  place_name: string;
  center: [number, number]; // [longitude, latitude]
}

const MAPBOX_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  defaultValue = '',
  placeholder = 'Enter an address...',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Focus Canada with a bias towards populated places
  const searchOptions = {
    country: 'ca',
    types: 'address,place,neighborhood,locality,poi',
    limit: 5
  };

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const fetchAddressSuggestions = async (query: string) => {
    if (!query || query.length < 3 || !MAPBOX_TOKEN) return;
    
    setIsLoading(true);
    
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('access_token', MAPBOX_TOKEN);
      searchParams.append('country', searchOptions.country);
      searchParams.append('types', searchOptions.types);
      searchParams.append('limit', searchOptions.limit.toString());
      
      // Encode the query to handle special characters
      const encodedQuery = encodeURIComponent(query);
      
      const response = await fetch(
        `${MAPBOX_API_URL}/${encodedQuery}.json?${searchParams.toString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address suggestions');
      }
      
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setValue(query);
    
    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Set a new timeout to debounce the API call
    debounceTimeout.current = setTimeout(() => {
      if (query.length >= 3) {
        fetchAddressSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);
  };

  const handleSelectAddress = (address: AddressSuggestion) => {
    setValue(address.place_name);
    onAddressSelect(address.place_name, address.center[1], address.center[0]);
    setIsOpen(false);
  };

  // Auto-show dropdown when user starts typing
  useEffect(() => {
    if (value.length >= 3) {
      setIsOpen(true);
      fetchAddressSuggestions(value);
    } else {
      setSuggestions([]);
    }
  }, [value]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            className={cn("pl-9", className)}
            onFocus={() => {
              setIsOpen(true);
              if (value.length >= 3) {
                fetchAddressSuggestions(value);
              }
            }}
            onClick={() => {
              setIsOpen(true);
              if (value.length >= 3) {
                fetchAddressSuggestions(value);
              }
            }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
        <Command>
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Searching addresses...</span>
              </div>
            ) : (
              <>
                {suggestions.length === 0 ? (
                  <CommandEmpty>
                    {value.length < 3 
                      ? 'Type at least 3 characters to search for addresses' 
                      : 'No addresses found matching your search. Try a different address.'}
                  </CommandEmpty>
                ) : (
                  <CommandGroup heading="Suggestions">
                    {suggestions.map((address) => (
                      <CommandItem
                        key={address.place_name}
                        onSelect={() => handleSelectAddress(address)}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{address.place_name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AddressAutocomplete;