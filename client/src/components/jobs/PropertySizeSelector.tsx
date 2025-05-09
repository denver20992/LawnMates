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
    label: 'Small Yard',
    description: 'Up to 500 sq ft of yard area to maintain',
    multiplier: 0.75,
    icon: <Home className="h-6 w-6" />
  },
  medium: {
    id: 'medium',
    label: 'Medium Yard',
    description: '500 to 1,000 sq ft of yard area to maintain',
    multiplier: 1.0,
    icon: <Building className="h-6 w-6" />
  },
  large: {
    id: 'large',
    label: 'Large Yard',
    description: 'Over 1,000 sq ft of yard area to maintain',
    multiplier: 1.5,
    icon: <Castle className="h-6 w-6" />
  }
};

export const propertySizeInfo = {
  small: { multiplier: 0.75 },
  medium: { multiplier: 1.0 },
  large: { multiplier: 1.5 }
};

export const yardTypes: Record<string, {id: string, label: string, description: string, multiplier: number}> = {
  frontyard: {
    id: 'frontyard',
    label: 'Front Yard Only',
    description: 'Service only the front yard area',
    multiplier: 0.8
  },
  backyard: {
    id: 'backyard',
    label: 'Back Yard Only',
    description: 'Service only the back yard area',
    multiplier: 0.8
  },
  both: {
    id: 'both',
    label: 'Both Front & Back Yards',
    description: 'Service both front and back yard areas',
    multiplier: 1.5
  }
};

interface PropertySizeSelectorProps {
  control: Control<any>;
  name: string;
  yardTypeControlName?: string;
}

const PropertySizeSelector: React.FC<PropertySizeSelectorProps> = ({ 
  control, 
  name,
  yardTypeControlName 
}) => {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>Yard Size</FormLabel>
            <FormDescription>
              Select the size of your yard area to help determine service pricing.
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

      {yardTypeControlName && (
        <FormField
          control={control}
          name={yardTypeControlName}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Yard Location</FormLabel>
              <FormDescription>
                Specify which yard areas need service.
              </FormDescription>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-3 gap-4 pt-2"
                >
                  {Object.values(yardTypes).map((type) => (
                    <FormItem key={type.id}>
                      <FormLabel className="cursor-pointer [&:has([data-state=checked])>div]:border-primary">
                        <FormControl>
                          <RadioGroupItem
                            value={type.id}
                            className="sr-only"
                            checked={field.value === type.id}
                          />
                        </FormControl>
                        <div className="border-2 rounded-lg p-4 flex flex-col items-center gap-2 hover:border-muted-foreground transition-colors">
                          <div className="font-medium text-center">{type.label}</div>
                          <div className="text-xs text-center text-muted-foreground">
                            {type.description}
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
      )}
    </div>
  );
};

export default PropertySizeSelector;