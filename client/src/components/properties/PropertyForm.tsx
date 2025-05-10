import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { insertPropertySchema } from '@shared/schema';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFavorites } from '@/hooks/useFavorites';

// Extend the insert schema with additional validations
const formSchema = insertPropertySchema.extend({
  address: z.string().min(3, { message: "Address must be at least 3 characters" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State/Province is required" }),
  zipCode: z.string().min(3, { message: "Postal/Zip code is required" }),
  propertyType: z.string().min(1, { message: "Property type is required" }),
  size: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  saveAsFavorite: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurrenceInterval: z.string().nullable().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PropertyFormProps {
  onSuccess?: () => void;
  onSubmit?: () => void;
}

export default function PropertyForm({ onSuccess, onSubmit }: PropertyFormProps) {
  const { toast } = useToast();
  const { saveFavorite } = useFavorites();
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      propertyType: '',
      notes: '',
      saveAsFavorite: false,
      isRecurring: false,
      recurrenceInterval: null,
    },
  });

  const propertyMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Extract properties that are not part of the Property schema
      const { saveAsFavorite, isRecurring, recurrenceInterval, ...propertyData } = values;
      
      // Debug log to help diagnose issues
      console.log("Creating property with data:", propertyData);
      
      // Make the API request to create the property
      const response = await apiRequest('POST', '/api/properties', propertyData);
      
      // Check if the response is OK
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create property");
      }
      
      return response.json();
    },
    onSuccess: async (data) => {
      console.log("Property created successfully:", data);
      
      // Check if we should save as favorite
      if (form.getValues('saveAsFavorite')) {
        setIsSavingFavorite(true);
        try {
          // Create a favorite from this property
          await saveFavorite({
            propertyId: data.id,
            isRecurring: form.getValues('isRecurring'),
            recurrenceInterval: form.getValues('recurrenceInterval'),
            notes: form.getValues('notes'),
          });
        } catch (error) {
          console.error("Error saving as favorite:", error);
          toast({
            title: "Error saving favorite",
            description: "Property was created but couldn't be saved as a favorite",
            variant: "destructive",
          });
        } finally {
          setIsSavingFavorite(false);
        }
      }

      toast({
        title: "Property created",
        description: "Your property has been created successfully",
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error('Error creating property:', error);
      toast({
        title: "Error",
        description: "There was an error creating the property. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      // First, call the onSubmit callback to show the loading state
      if (onSubmit) {
        onSubmit();
      }
      
      // Log the form submission to debug
      console.log("PropertyForm: Form submitted with values:", values);
      
      // Pass all the values as they are to ensure we have all required fields
      // The API expects ownerId, but that will be assigned on the server
      // based on the authenticated user
      console.log("PropertyForm: Submitting property data");
      
      // Directly perform the mutation to create the property using the full values
      await propertyMutation.mutateAsync(values);
      
      console.log("PropertyForm: Property creation successful");
      
      // Reset the form after successful submission for a better UX
      form.reset();
    } catch (error) {
      console.error("PropertyForm: Error during form submission:", error);
      // The error handling is already in the mutation, but we log it here too
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6 md:col-span-2">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province/State</FormLabel>
                    <FormControl>
                      <Input placeholder="Province/State" {...field} />
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
                      <Input placeholder="Postal/Zip Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

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
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Multi-family">Multi-family</SelectItem>
                    <SelectItem value="Vacant Land">Vacant Land</SelectItem>
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
                <FormLabel>Size (sq ft)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g. 2500" 
                    {...field} 
                    value={field.value || ''}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Approximate size of the property
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add any additional details about the property"
                    className="resize-none min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2 border rounded-lg p-4 bg-muted/30 space-y-4">
            <FormField
              control={form.control}
              name="saveAsFavorite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-1">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Save as favorite property</FormLabel>
                    <FormDescription>
                      This will save the property for quick access and recurring jobs
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch('saveAsFavorite') && (
              <>
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-1 ml-6">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set as recurring service</FormLabel>
                        <FormDescription>
                          Plan for regular maintenance at this property
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('isRecurring') && (
                  <FormField
                    control={form.control}
                    name="recurrenceInterval"
                    render={({ field }) => (
                      <FormItem className="ml-6">
                        <FormLabel>Recurrence Interval</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="How often?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="seasonal">Seasonal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button"  
            disabled={propertyMutation.isPending || isSavingFavorite}
            className="bg-primary hover:bg-primary/90 text-white font-medium px-6"
            onClick={(e) => {
              e.preventDefault();
              console.log("PropertyForm: Submit button clicked");
              // Validate the form first
              const isValid = form.trigger();
              isValid.then(valid => {
                if (valid) {
                  // If valid, get the form values and submit
                  const values = form.getValues();
                  console.log("PropertyForm: Form is valid, submitting with values:", values);
                  handleSubmit(values);
                } else {
                  console.log("PropertyForm: Form validation failed");
                }
              });
            }}
          >
            {propertyMutation.isPending || isSavingFavorite ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Creating...</span>
              </div>
            ) : (
              "Create Property"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}