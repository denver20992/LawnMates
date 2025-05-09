import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertPropertySchema } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { useFavorites } from '@/hooks/useFavorites';

// Extend property schema for the form
const propertyFormSchema = z.object({
  address: z.string().min(5, {
    message: "Address must be at least 5 characters",
  }),
  city: z.string().min(2, {
    message: "City is required",
  }),
  state: z.string().min(2, {
    message: "State is required",
  }),
  zipCode: z.string().min(5, {
    message: "Zip code is required",
  }),
  propertyType: z.string({
    required_error: "Please select a property type",
  }),
  size: z.string().transform(val => val ? parseInt(val, 10) : undefined).optional(),
  notes: z.string().optional(),
  // Additional fields for saving as favorite
  saveAsFavorite: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurrenceInterval: z.string().optional(),
  favoriteNotes: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  onSuccess?: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { saveFavorite } = useFavorites();
  
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      propertyType: 'residential',
      size: '',
      notes: '',
      saveAsFavorite: false,
      isRecurring: false,
      recurrenceInterval: 'weekly',
      favoriteNotes: '',
    },
  });
  
  const saveAsFavorite = form.watch('saveAsFavorite');
  const isRecurring = form.watch('isRecurring');
  
  const onSubmit = async (values: PropertyFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create property
      const propertyData = {
        address: values.address,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        propertyType: values.propertyType,
        size: values.size,
        notes: values.notes,
        // We'd normally get these from a map component in a real implementation
        latitude: 43.651070,
        longitude: -79.347015,
      };
      
      const response = await apiRequest('POST', '/api/properties', propertyData);
      if (!response.ok) {
        throw new Error('Failed to create property');
      }
      
      const property = await response.json();
      
      // If save as favorite is checked, create a favorite
      if (values.saveAsFavorite) {
        const favoriteData = {
          propertyId: property.id,
          isRecurring: values.isRecurring,
          recurrenceInterval: values.isRecurring ? values.recurrenceInterval : undefined,
          notes: values.favoriteNotes,
        };
        
        await saveFavorite(favoriteData);
      }
      
      toast({
        title: "Property Added",
        description: `${values.address} has been added successfully${values.saveAsFavorite ? ' and saved to your favorites' : ''}`,
      });
      
      // Reset form
      form.reset();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: "Failed to Add Property",
        description: "There was an error adding your property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="max-w-3xl mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Property Information</h2>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Toronto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province/State</FormLabel>
                      <FormControl>
                        <Input placeholder="ON" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal/Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="M5V 2H1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="multi_family">Multi-Family</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Size (sq ft)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 5000" {...field} />
                    </FormControl>
                    <FormDescription>
                      Approximate size of the yard/lawn area
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special considerations about this property..."
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Special instructions or information about this property
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <FormField
              control={form.control}
              name="saveAsFavorite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Save as Favorite</FormLabel>
                    <FormDescription>
                      Add this property to your favorites for easy access later
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {saveAsFavorite && (
              <div className="space-y-4 pl-4 border-l-2 border-primary-100">
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Recurring Service</FormLabel>
                        <FormDescription>
                          Flag this property for recurring lawn care service
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {isRecurring && (
                  <FormField
                    control={form.control}
                    name="recurrenceInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recurrence Interval</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How often you want the service to repeat
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="favoriteNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favorite Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add notes for this saved property..."
                          className="resize-none"
                          rows={2}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Special notes for when this property is used for jobs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Saving...
                </>
              ) : 'Add Property'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default PropertyForm;