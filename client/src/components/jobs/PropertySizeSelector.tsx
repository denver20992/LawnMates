import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { Home, Building, Castle } from 'lucide-react';

export interface PropertySize {
  id: string;
  label: string;
  description: string;
  multiplier: number;
  icon: React.ReactNode;
}

export const propertySizes: Record<string, PropertySize> = {
  small: {
    id: 'small',
    label: 'Small Property',
    description: 'Up to 5,000 sq ft',
    multiplier: 1.0,
    icon: <Home className="h-8 w-8 text-primary-500" />,
  },
  medium: {
    id: 'medium',
    label: 'Medium Property',
    description: '5,000-10,000 sq ft',
    multiplier: 1.2,
    icon: <Building className="h-8 w-8 text-primary-500" />
  },
  large: {
    id: 'large',
    label: 'Large Property',
    description: 'Over 10,000 sq ft',
    multiplier: 1.5,
    icon: <Castle className="h-8 w-8 text-primary-500" />
  }
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
        <FormItem className="space-y-3">
          <FormLabel>Property Size</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid grid-cols-3 gap-4"
            >
              {Object.values(propertySizes).map((size) => (
                <FormItem key={size.id}>
                  <FormControl>
                    <RadioGroupItem
                      value={size.id}
                      id={size.id}
                      className="peer sr-only"
                    />
                  </FormControl>
                  <Label
                    htmlFor={size.id}
                    className="flex flex-col items-center justify-center h-full rounded-md border-2 border-muted bg-popover p-4 hover:bg-muted hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary-50"
                  >
                    {size.icon}
                    <span className="mt-2 font-medium text-center">{size.label}</span>
                    <span className="text-xs text-center text-muted-foreground">
                      {size.description}
                    </span>
                  </Label>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default PropertySizeSelector;