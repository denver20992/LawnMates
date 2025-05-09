import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';
import { Home, Castle, Building } from 'lucide-react';

export interface PropertySize {
  id: string;
  label: string;
  description: string;
  multiplier: number;
  icon: React.ReactNode;
}

// Property size information with price multipliers
export const propertySizes: Record<string, PropertySize> = {
  small: {
    id: 'small',
    label: 'Small Property',
    description: 'Standard city lot with minimal landscaping (up to 0.1 acre)',
    multiplier: 0.75,
    icon: <Home className="h-6 w-6" />
  },
  medium: {
    id: 'medium',
    label: 'Medium Property',
    description: 'Suburban property with typical landscaping (0.1 to 0.3 acres)',
    multiplier: 1.0,
    icon: <Building className="h-6 w-6" />
  },
  large: {
    id: 'large',
    label: 'Large Property',
    description: 'Estate or large lot with extensive landscaping (0.3+ acres)',
    multiplier: 1.5,
    icon: <Castle className="h-6 w-6" />
  }
};

export const propertySizeInfo = {
  small: { multiplier: 0.75 },
  medium: { multiplier: 1.0 },
  large: { multiplier: 1.5 }
};

interface PropertySizeSelectorProps {
  control: Control<any>;
  name: string;
}

const PropertySizeSelector: React.FC<PropertySizeSelectorProps> = ({ control, name }) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel>Property Size</FormLabel>
          <FormDescription>
            Select the size of your property to help determine service pricing.
          </FormDescription>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid grid-cols-3 gap-4 pt-2"
            >
              {Object.values(propertySizes).map((size) => (
                <FormItem key={size.id}>
                  <FormLabel className="cursor-pointer [&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem
                        value={size.id}
                        className="sr-only"
                        checked={field.value === size.id}
                      />
                    </FormControl>
                    <div className="border-2 rounded-lg p-4 flex flex-col items-center gap-2 hover:border-muted-foreground transition-colors">
                      {size.icon}
                      <div className="font-medium text-center">{size.label}</div>
                      <div className="text-xs text-center text-muted-foreground">
                        {size.description}
                      </div>
                    </div>
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PropertySizeSelector;