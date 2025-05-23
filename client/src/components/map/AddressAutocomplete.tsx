import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Memoize the fetch function to avoid recreating it on every render
  const fetchAddressSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 3 || !MAPBOX_TOKEN) return;
    
    // Don't update the loading state yet to prevent UI flicker
    // Only show loading indicator after a short delay if the request is still pending
    const loadingTimerId = setTimeout(() => {
      setIsLoading(true);
    }, 300);
    
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
      // Clear the timer and set loading to false
      clearTimeout(loadingTimerId);
      setIsLoading(false);
    }
  }, [MAPBOX_TOKEN, searchOptions]);

  // Improved input change handler with proper debouncing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setValue(query);
    
    // Store the current cursor position
    const cursorPosition = e.target.selectionStart;
    
    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Set a new timeout to debounce the API call
    debounceTimeout.current = setTimeout(() => {
      if (query.length >= 3) {
        // Fetch suggestions without interfering with focus
        fetchAddressSuggestions(query)
          .then(() => {
            // Ensure dropdown doesn't automatically open - prevents cursor jumping
            // User must click the button to see suggestions
            // Do NOT set isOpen to true here
            
            // Restore cursor position if input is still focused
            if (document.activeElement === inputRef.current && inputRef.current) {
              inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
            }
          });
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);
  }, [fetchAddressSuggestions]);

  // Improved select handler that prevents cursor issues
  const handleSelectAddress = useCallback((address: AddressSuggestion) => {
    // First, close the popover
    setIsOpen(false);
    
    // Update the value immediately to prevent weird flashing
    setValue(address.place_name);
    
    // IMPORTANT: Let the UI settle down before focusing and notifying parent
    // This delay is crucial for preventing cursor jumps
    requestAnimationFrame(() => {
      // Focus the input and place cursor at the end
      if (inputRef.current) {
        inputRef.current.focus();
        // Place cursor at the end of the text
        inputRef.current.setSelectionRange(
          address.place_name.length,
          address.place_name.length
        );
      }
      
      // Notify parent component about the selected address
      onAddressSelect(address.place_name, address.center[1], address.center[0]);
    });
  }, [onAddressSelect]);

  // Input focuses or click handler - only now do we open the dropdown
  const handleInputFocus = useCallback(() => {
    // Don't open the dropdown on focus unless we already have a value
    // This prevents the dropdown from interrupting typing
    if (value.length >= 3) {
      fetchAddressSuggestions(value);
      // We don't automatically open the dropdown on focus to prevent interruption
      // User can click to open it when they're ready
    }
  }, [value, fetchAddressSuggestions]);
  
  // Only when user clicks dropdown button or specifically clicks to open
  // do we show the dropdown
  const handleOpenDropdown = useCallback(() => {
    if (value.length >= 3) {
      fetchAddressSuggestions(value);
      setIsOpen(true);
    }
  }, [value, fetchAddressSuggestions]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full flex">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            className={cn("pl-9 flex-grow pr-8", className)}
            onFocus={handleInputFocus}
          />
          {value.length >= 3 && suggestions.length > 0 && (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 px-2"
              onClick={handleOpenDropdown}
              title="Show address suggestions"
            >
              {isOpen ? "↑" : "↓"}
            </Button>
          )}
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