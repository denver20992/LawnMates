import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar as CalendarIcon, Clock, DollarSign, MapPin, AlertCircle, CheckCircle, Home, Building, Castle } from 'lucide-react';
import AddressAutocomplete from '@/components/map/AddressAutocomplete';
import PropertySizeSelector, { propertySizes, yardTypes } from './PropertySizeSelector';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { insertJobSchema } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useJobs } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';

// Define available services with market rates in the area
const AVAILABLE_SERVICES = [
  { id: 'lawn-mowing', label: 'Lawn Mowing', basePrice: 50 },
  { id: 'hedge-trimming', label: 'Hedge Trimming', basePrice: 60 },
  { id: 'leaf-removal', label: 'Leaf Removal', basePrice: 55 },
  { id: 'garden-maintenance', label: 'Garden Maintenance', basePrice: 70 },
  { id: 'weed-control', label: 'Weed Control', basePrice: 65 },
  { id: 'fertilization', label: 'Fertilization', basePrice: 75 },
  { id: 'dethatching', label: 'Dethatching', basePrice: 85 }
];

// Define the Quick Service Package
const QUICK_SERVICE_PACKAGE = {
  label: 'Essential Yard Maintenance',
  services: ['lawn-mowing', 'hedge-trimming', 'leaf-removal'],
  discountPercentage: 10 // 10% discount on the combined services
};

// Define time options for scheduling
const timeOptions = [
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
];

// Extend the job schema for the form
const jobFormSchema = z.object({
  title: z.string().min(5, {
    message: "Address must be at least 5 characters",
  }),
  selectedServices: z.array(z.string()).min(1, {
    message: "Please select at least one service"
  }),
  description: z.string().optional(),
  propertyId: z.coerce.number().optional(),
  propertySize: z.enum(['small', 'medium', 'large']).default('medium'),
  yardType: z.enum(['frontyard', 'backyard', 'both']).default('both'),
  isQuickService: z.boolean().default(false),
  price: z.coerce.number().min(1, { 
    message: "Please provide a price for the job" 
  }),
  startDate: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string(),
  endTime: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceInterval: z.string().optional(),
  requiresEquipment: z.boolean().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  useExistingProperty: z.boolean(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobPostFormProps {
  onSuccess?: () => void;
}

const JobPostForm: React.FC<JobPostFormProps> = ({ onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createJob } = useJobs();
  const { user } = useAuth();
  
  // Use an empty array for properties to force new property creation
  const [properties, setProperties] = useState([]);
  
  // Property size descriptions
  const propertySizeInfo = {
    small: { label: 'Small Property', description: 'Up to 2,000 sq ft', multiplier: 0.75 },
    medium: { label: 'Medium Property', description: '2,000-5,000 sq ft', multiplier: 1.0 },
    large: { label: 'Large Property', description: 'Over 5,000 sq ft', multiplier: 1.5 }
  };
  
  // No need for more definitions, already defined at the top

  // Calculate price based on selected services and property size
  const calculateEstimatedPrice = (
    services: string[], 
    propertyId: number, 
    useExistingProperty: boolean = true,
    customPropertySize?: string,
    yardType?: string,
    isQuickService?: boolean
  ) => {
    if (!services.length) return 0;
    
    let sizeMultiplier = 1.0;
    let yardTypeMultiplier = 1.0;
    
    // Since we're not using existing properties, always use custom property size
    if (customPropertySize) {
      // Use custom property size for new addresses
      sizeMultiplier = propertySizeInfo[customPropertySize as keyof typeof propertySizeInfo].multiplier;
    }
    
    // Apply yard type multiplier if available
    if (yardType && yardTypes[yardType as keyof typeof yardTypes]) {
      yardTypeMultiplier = yardTypes[yardType as keyof typeof yardTypes].multiplier;
    }
    
    // If quick service is selected, use the package services
    const servicesForPricing = isQuickService 
      ? QUICK_SERVICE_PACKAGE.services
      : services;
    
    // Calculate base price from selected services
    const basePrice = servicesForPricing.reduce((total, serviceId) => {
      const service = AVAILABLE_SERVICES.find(s => s.id === serviceId);
      return total + (service?.basePrice || 0);
    }, 0);
    
    // Apply both multipliers to the base price
    const finalPrice = basePrice * sizeMultiplier * yardTypeMultiplier;
    
    // Round to nearest 5
    return Math.ceil(finalPrice / 5) * 5;
  };
  
  // Initialize form with defaults
  // We're not using existing properties, always default to new property
  const hasExistingProperties = false;
  
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      selectedServices: [],
      description: '',
      propertyId: 0,
      propertySize: 'medium',
      yardType: 'both',
      isQuickService: false,
      price: 0,
      startDate: new Date(),
      startTime: '09:00',
      endTime: 'flexible',
      isRecurring: false,
      recurrenceInterval: 'monthly',
      requiresEquipment: false,
      useExistingProperty: false,
      latitude: undefined,
      longitude: undefined,
    },
  });
  
  const isRecurring = form.watch('isRecurring');
  const selectedPropertyId = form.watch('propertyId');
  const selectedServices = form.watch('selectedServices');
  const useExistingProperty = form.watch('useExistingProperty');
  const selectedPropertySize = form.watch('propertySize');
  
  // Helper function to check if services qualify for quick service
  const isQuickServiceEligible = (services: string[]): boolean => {
    if (!services.length) return false;
    
    // Check if all quick service package services are selected
    const qualifiesForQuickService = QUICK_SERVICE_PACKAGE.services.every(packageService => 
      services.includes(packageService)
    );
    
    return qualifiesForQuickService;
  };

  // Watch for yard type and quick service changes
  const selectedYardType = form.watch('yardType');
  const isQuickService = form.watch('isQuickService');
  
  // Update price when services, property size, yard type, or quick service changes
  useEffect(() => {
    // Always update the price, even if no services are selected (price will be 0)
    let estimatedPrice = 0;
    
    if (selectedServices?.length) {
      if (useExistingProperty) {
        if (selectedPropertyId) {
          estimatedPrice = calculateEstimatedPrice(
            selectedServices, 
            selectedPropertyId, 
            true, 
            undefined, 
            selectedYardType, 
            isQuickService
          );
        }
      } else {
        // For new properties, use the selected property size
        estimatedPrice = calculateEstimatedPrice(
          selectedServices, 
          0, 
          false, 
          selectedPropertySize, 
          selectedYardType, 
          isQuickService
        );
      }
    }
    
    form.setValue('price', estimatedPrice);
  }, [
    selectedServices, 
    selectedPropertyId, 
    useExistingProperty, 
    selectedPropertySize, 
    selectedYardType, 
    isQuickService, 
    form
  ]);
  
  const onSubmit = async (values: JobFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Since we're not using existing properties, always use the new address details
      
      // Calculate start and end dates from the date and time fields
      const startDateTime = new Date(values.startDate);
      const [startHour, startMinute] = values.startTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute);
      
      let endDateTime;
      if (values.endTime && values.endTime !== 'flexible') {
        endDateTime = new Date(values.startDate);
        const [endHour, endMinute] = values.endTime.split(':').map(Number);
        endDateTime.setHours(endHour, endMinute);
      }
      
      // Convert price to cents for API
      const priceInCents = Math.round(values.price * 100);
      
      // Create job payload
      const jobData = {
        title: values.title, // Always use the title from the form
        description: values.description || '', // Ensure description is at least an empty string
        price: priceInCents,
        startDate: startDateTime.toISOString(), // Convert to ISO string for API
        endDate: endDateTime ? endDateTime.toISOString() : undefined,
        isRecurring: values.isRecurring,
        recurrenceInterval: values.isRecurring ? values.recurrenceInterval : undefined,
        requiresEquipment: values.requiresEquipment,
        // Use coordinates from address autocomplete
        latitude: values.latitude,
        longitude: values.longitude,
        // Include property size 
        propertySize: values.propertySize,
        ownerId: user?.id || 0, // This should be set on the server
      };
      
      // Convert dates to Date objects for TypeScript compatibility
      const formattedData = {
        ...jobData,
        // Note: Even though we send ISO strings, the server will handle proper conversion 
      };
      
      // Submit the job
      await createJob(formattedData);
      
      toast({
        title: "Job Posted Successfully",
        description: "Your job has been posted and is now visible to landscapers",
      });
      
      // Reset form and go back to step 1
      form.reset();
      setStep(1);
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        title: "Failed to Post Job",
        description: "There was an error posting your job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Post a New Lawn Care Job</CardTitle>
          <CardDescription>
            Enter your address and select services to find a landscaper for your property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {step === 1 && (
                <div className="space-y-4">
                  {/* New address form only - removed property selection */}
                  {(
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Address</FormLabel>
                          <FormControl>
                            <AddressAutocomplete 
                              placeholder="e.g. 123 Main St, Toronto, ON M5V 1A1" 
                              defaultValue={field.value}
                              onAddressSelect={(address, lat, lng) => {
                                field.onChange(address);
                                if (lat && lng) {
                                  form.setValue('latitude', lat);
                                  form.setValue('longitude', lng);
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the address where the landscaping job will be performed.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {!useExistingProperty && (
                    <PropertySizeSelector 
                      control={form.control}
                      name="propertySize"
                      yardTypeControlName="yardType"
                    />
                  )}
                  
                  {/* Quick Service Package Option - Always visible */}
                  <FormField
                    control={form.control}
                    name="isQuickService"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-green-200 bg-green-50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              const isChecked = checked === true;
                              field.onChange(isChecked);
                              
                              // When checkbox is checked, automatically select the services
                              if (isChecked) {
                                // Select all quick service package services
                                form.setValue('selectedServices', QUICK_SERVICE_PACKAGE.services);
                              }
                              
                              // Update price calculation
                              const newServices = isChecked ? QUICK_SERVICE_PACKAGE.services : form.getValues('selectedServices');
                              if (useExistingProperty) {
                                if (selectedPropertyId) {
                                  const newPrice = calculateEstimatedPrice(
                                    newServices, 
                                    selectedPropertyId, 
                                    true, 
                                    undefined, 
                                    form.getValues('yardType'), 
                                    isChecked
                                  );
                                  form.setValue('price', newPrice);
                                }
                              } else {
                                const newPrice = calculateEstimatedPrice(
                                  newServices, 
                                  0, 
                                  false, 
                                  selectedPropertySize, 
                                  form.getValues('yardType'), 
                                  isChecked
                                );
                                form.setValue('price', newPrice);
                              }
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-green-700 text-base font-medium">
                            Quick Service Package
                          </FormLabel>
                          <FormDescription className="text-green-700">
                            Select our essential yard maintenance package including: 
                            <span className="font-medium"> {QUICK_SERVICE_PACKAGE.services.map(s => 
                              AVAILABLE_SERVICES.find(as => as.id === s)?.label
                            ).join(', ')}</span>
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="selectedServices"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Services Needed</FormLabel>
                          <FormDescription>
                            Select the services you need for this job. Rates shown are the average market rates for landscapers in your area.
                          </FormDescription>
                          <div className="mt-2 p-3 bg-muted/50 rounded-md text-xs">
                            <p className="font-medium mb-1">Pricing Information</p>
                            <p>The estimated rates below are based on market data from landscapers in your area. Actual prices may vary based on property size, complexity, and special requirements. Final prices will be adjusted after property assessment.</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {AVAILABLE_SERVICES.map((service) => (
                            <FormField
                              key={service.id}
                              control={form.control}
                              name="selectedServices"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={service.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(service.id)}
                                        onCheckedChange={(checked) => {
                                          const isChecked = checked === true;
                                          const updatedServices = isChecked
                                            ? [...field.value, service.id]
                                            : field.value?.filter(
                                                (value) => value !== service.id
                                              );
                                          field.onChange(updatedServices);
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-sm font-medium">
                                        {service.label}
                                      </FormLabel>
                                      <FormDescription className="text-xs">
                                        Estimated rate: ${service.basePrice} CAD
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any special instructions, specific requirements, or additional details about the job..." 
                            className="resize-none" 
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Include any details that will help landscapers understand your needs
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  

                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Offer</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
                            <Input 
                              type="number" 
                              placeholder="Estimated amount" 
                              className="pl-8" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          {field.value ? (
                            <div className="space-y-1">
                              <span className="text-sm text-primary-600 font-medium">
                                Estimated amount: ${field.value} CAD
                              </span>
                              {selectedServices?.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  <p>Based on selected services:</p>
                                  <ul className="list-disc list-inside mt-1">
                                    {selectedServices.map(serviceId => {
                                      const service = AVAILABLE_SERVICES.find(s => s.id === serviceId);
                                      return service ? (
                                        <li key={serviceId}>{service.label}: ${service.basePrice} CAD</li>
                                      ) : null;
                                    })}
                                  </ul>
                                  
                                  {/* Show quick service package status when applied */}
                                  {isQuickService && (
                                    <div className="mt-2 mb-2 p-1.5 bg-green-50 border border-green-200 rounded-md">
                                      <p className="text-green-700 font-medium">
                                        <CheckCircle className="inline-block h-3 w-3 mr-1" />
                                        Quick Service Package Applied
                                      </p>
                                      <p className="text-green-700 text-xs">
                                        Your price reflects the Quick Service package pricing.
                                      </p>
                                    </div>
                                  )}
                                  
                                  <p className="mt-1">Adjusted based on property size and complexity.</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span>
                              Amount you're willing to pay for this job (in CAD)
                            </span>
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {step === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          The date when you need the service.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <Clock className="mr-2 h-4 w-4" />
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={time.value} value={time.value}>
                                  {time.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <Clock className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Flexible" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="flexible">Flexible</SelectItem>
                              {timeOptions.map((time) => (
                                <SelectItem key={time.value} value={time.value}>
                                  {time.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Recurring Service</FormLabel>
                          <FormDescription>
                            Set this job to repeat automatically.
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
                                <SelectValue placeholder="Select interval" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How often should this job repeat?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="requiresEquipment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Landscaper Provides Equipment</FormLabel>
                          <FormDescription>
                            Toggle on if the landscaper should bring their own equipment.
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
                </div>
              )}
              
              {step === 3 && (
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-4">Job Summary</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Job Address:</span>
                        <span className="font-medium">{form.getValues('title')}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Service Offer:</span>
                        <span className="font-medium">${form.getValues('price')} CAD</span>
                      </div>
                      
                      <div>
                        <span className="text-neutral-500">Selected Services:</span>
                        <div className="mt-2 ml-4">
                          {form.getValues('selectedServices').map(serviceId => {
                            const service = AVAILABLE_SERVICES.find(s => s.id === serviceId);
                            return service ? (
                              <div key={serviceId} className="flex justify-between mb-1">
                                <span className="font-medium">{service.label}</span>
                                <span>${service.basePrice} CAD</span>
                              </div>
                            ) : null;
                          })}
                          
                          {/* Show quick service package if applied */}
                          {form.getValues('isQuickService') && (
                            <div className="bg-green-50 rounded-md p-2 my-2 border border-green-200 flex justify-between">
                              <span className="text-green-700 font-medium">Quick Service Package ({QUICK_SERVICE_PACKAGE.label}):</span>
                              <span className="text-green-700 font-medium">✓ Applied</span>
                            </div>
                          )}
                          
                          <div className="border-t mt-2 pt-1 flex justify-between">
                            <span className="font-medium">Total (adjusted for property):</span>
                            <span className="font-medium">${form.getValues('price')} CAD</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Don't show property info since we're not using stored properties */}
                      
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Date & Time:</span>
                        <span className="font-medium">
                          {format(form.getValues('startDate'), 'MMM d, yyyy')} at {' '}
                          {timeOptions.find(t => t.value === form.getValues('startTime'))?.label}
                          {form.getValues('endTime') && form.getValues('endTime') !== 'flexible' 
                            ? ` - ${timeOptions.find(t => t.value === form.getValues('endTime'))?.label}` 
                            : ' (Flexible end time)'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Recurring:</span>
                        <span className="font-medium">
                          {form.getValues('isRecurring') 
                            ? `Yes (${form.getValues('recurrenceInterval')})`
                            : 'No (One-time job)'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Equipment:</span>
                        <span className="font-medium">
                          {form.getValues('requiresEquipment') 
                            ? 'Landscaper brings equipment'
                            : 'Owner provides equipment'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Services Requested:</h4>
                      <p className="text-neutral-700">{form.getValues('description')}</p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4 bg-primary-50">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 mr-2" />
                      <div>
                        <h4 className="font-medium text-primary-800">Payment Protection</h4>
                        <p className="text-neutral-600 text-sm mt-1">
                          Your payment will be held in escrow until the job is verified as complete, 
                          ensuring quality service before funds are released.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Back
                  </Button>
                ) : (
                  <div className="hidden sm:block"></div>
                )}
                
                {step < 3 ? (
                  <Button
                    type="button"
                    className="w-full sm:w-auto order-1 sm:order-2"
                    onClick={async () => {
                      // For step 1, we'll do manual validation without using trigger
                      if (step === 1) {
                        let isValid = true;
                        let errorFields = [];
                        
                        // Check if services are selected
                        if (!selectedServices || selectedServices.length === 0) {
                          isValid = false;
                          errorFields.push("You must select at least one service");
                        }
                        
                        // Check address information
                        const title = form.getValues("title");
                        if (!title || title.trim().length < 5) {
                          isValid = false;
                          errorFields.push("You must enter a valid address");
                        }
                        
                        // Check price
                        const price = form.getValues("price");
                        if (!price || price <= 0) {
                          isValid = false;
                          errorFields.push("A valid price is required");
                        }
                        
                        if (isValid) {
                          setStep(step + 1);
                        } else {
                          // Show errors
                          toast({
                            title: "Please fix the following issues:",
                            description: (
                              <ul className="list-disc pl-5">
                                {errorFields.map((err, idx) => (
                                  <li key={idx}>{err}</li>
                                ))}
                              </ul>
                            ),
                            variant: "destructive",
                          });
                        }
                      } else if (step === 2) {
                        // For step 2, we can use the trigger method
                        const result = await form.trigger(["startDate", "startTime"]);
                        if (result) {
                          setStep(step + 1);
                        }
                      }
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    {isSubmitting ? "Posting..." : "Post Job"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
              step >= 1 ? 'bg-primary-600 text-white' : 'border border-neutral-300 text-neutral-500'
            }`}>
              1
            </div>
            <div className={`h-0.5 w-5 ${step >= 2 ? 'bg-primary-600' : 'bg-neutral-300'}`}></div>
            <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
              step >= 2 ? 'bg-primary-600 text-white' : 'border border-neutral-300 text-neutral-500'
            }`}>
              2
            </div>
            <div className={`h-0.5 w-5 ${step >= 3 ? 'bg-primary-600' : 'bg-neutral-300'}`}></div>
            <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
              step >= 3 ? 'bg-primary-600 text-white' : 'border border-neutral-300 text-neutral-500'
            }`}>
              3
            </div>
          </div>
          <div className="text-sm text-neutral-500">
            Step {step} of 3: {step === 1 ? 'Address & Services' : step === 2 ? 'Scheduling' : 'Review & Submit'}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JobPostForm;
