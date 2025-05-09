import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarClock, MapPin, MoreVertical, Trash } from 'lucide-react';
import { Favorite } from '@shared/schema';

// Form schema for editing favorites
const favoriteFormSchema = z.object({
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceInterval: z.string().optional(),
});

type FavoriteFormValues = z.infer<typeof favoriteFormSchema>;

interface SavedPropertiesListProps {
  onCreateJob?: () => void;
}

const SavedPropertiesList: React.FC<SavedPropertiesListProps> = ({ onCreateJob }) => {
  const [, setLocation] = useLocation();
  const { favorites, loadingFavorites, removeFavorite, updateFavorite, createJobFromFavorite } = useFavorites();
  const [editingFavorite, setEditingFavorite] = useState<Favorite | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<FavoriteFormValues>({
    resolver: zodResolver(favoriteFormSchema),
    defaultValues: {
      notes: '',
      isRecurring: false,
      recurrenceInterval: 'weekly',
    },
  });

  // Watch for recurring value change
  const isRecurring = form.watch('isRecurring');

  const handleEditFavorite = (favorite: Favorite) => {
    setEditingFavorite(favorite);
    form.reset({
      notes: favorite.notes || '',
      isRecurring: favorite.isRecurring || false,
      recurrenceInterval: favorite.recurrenceInterval || 'weekly',
    });
    setIsDialogOpen(true);
  };

  const handleSaveEdit = async (values: FavoriteFormValues) => {
    if (!editingFavorite) return;
    
    await updateFavorite({
      id: editingFavorite.id,
      ...values,
    });
    
    setIsDialogOpen(false);
    setEditingFavorite(null);
  };

  const handleCreateJob = async (favoriteId: number) => {
    const jobId = await createJobFromFavorite(favoriteId);
    if (jobId && onCreateJob) {
      onCreateJob();
    }
  };

  if (loadingFavorites) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card className="bg-white shadow rounded-lg p-6 text-center">
        <CardHeader>
          <CardTitle>No Saved Properties</CardTitle>
          <CardDescription>
            You haven't saved any properties yet. When you save a property, it will appear here.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button onClick={() => setLocation('/properties/add')}>
            Add a New Property
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {favorites.map((favorite) => (
        <Card key={favorite.id} className="overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div>
              <CardTitle className="text-xl">{favorite.property?.address || 'Saved Property'}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1 text-neutral-400" />
                {favorite.property?.city}, {favorite.property?.state} {favorite.property?.zipCode}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEditFavorite(favorite)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => removeFavorite(favorite.id)} className="text-destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {favorite.notes && (
                <p className="text-sm text-neutral-600">{favorite.notes}</p>
              )}
              <div className="flex flex-wrap gap-2 text-sm">
                {favorite.property?.propertyType && (
                  <span className="bg-neutral-100 px-2 py-1 rounded-md text-neutral-700">
                    {favorite.property.propertyType}
                  </span>
                )}
                {favorite.property?.size && (
                  <span className="bg-neutral-100 px-2 py-1 rounded-md text-neutral-700">
                    {favorite.property.size} sq ft
                  </span>
                )}
                {favorite.isRecurring && (
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-md flex items-center">
                    <CalendarClock className="h-3.5 w-3.5 mr-1" />
                    Recurring ({favorite.recurrenceInterval})
                  </span>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t">
            <Button 
              variant="secondary" 
              className="mr-2"
              onClick={() => handleCreateJob(favorite.id)}
            >
              Create Job
            </Button>
            <Button variant="outline" onClick={() => handleEditFavorite(favorite)}>
              Edit
            </Button>
          </CardFooter>
        </Card>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Saved Property</DialogTitle>
            <DialogDescription>
              Update your saved property preferences and recurring schedule.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any special notes about this property..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Any special instructions or details you want to remember.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Recurring Service</FormLabel>
                      <FormDescription>
                        Save this property for regular scheduled service.
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
                        How often you want the service to repeat.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedPropertiesList;