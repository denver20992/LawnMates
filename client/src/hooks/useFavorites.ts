import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FavoriteCreateParams {
  propertyId: number;
  isRecurring?: boolean;
  recurrenceInterval?: string | null;
  notes?: string;
}

// Define the Favorite type to match what we expect from the API
interface Favorite {
  id: number;
  userId: number;
  propertyId: number;
  isRecurring: boolean;
  recurrenceInterval: string | null;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
  property?: {
    id: number;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    propertyType: string;
    size?: number | null;
  };
}

export function useFavorites() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all favorites for the current user
  const { data: favorites = [], isLoading: loadingFavorites, error } = useQuery<Favorite[]>({
    queryKey: ['/api/favorites'],
    staleTime: 30000, // 30 seconds
  });

  // Create a new favorite
  const createFavoriteMutation = useMutation({
    mutationFn: async (favoriteData: FavoriteCreateParams) => {
      const response = await apiRequest('POST', '/api/favorites', favoriteData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Property saved",
        description: "Property has been added to your favorites",
      });
    },
    onError: (error) => {
      console.error('Error saving favorite:', error);
      toast({
        title: "Error",
        description: "Failed to save the property to favorites",
        variant: "destructive",
      });
    }
  });

  // Remove a favorite
  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      await apiRequest('DELETE', `/api/favorites/${favoriteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Property removed",
        description: "Property has been removed from your favorites",
      });
    },
    onError: (error) => {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove the property from favorites",
        variant: "destructive",
      });
    }
  });

  // Create a job from favorite
  const createJobFromFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      const response = await apiRequest('POST', `/api/favorites/${favoriteId}/create-job`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    },
    onError: (error) => {
      console.error('Error creating job from favorite:', error);
      throw error;
    }
  });

  // Update favorite properties (recurring status, etc.)
  const updateFavoriteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Favorite> }) => {
      const response = await apiRequest('PATCH', `/api/favorites/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Favorite updated",
        description: "Property preferences have been updated",
      });
    },
    onError: (error) => {
      console.error('Error updating favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update property preferences",
        variant: "destructive",
      });
    }
  });

  return {
    favorites,
    loadingFavorites,
    error,
    saveFavorite: createFavoriteMutation.mutateAsync,
    removeFavorite: removeFavoriteMutation.mutateAsync,
    updateFavorite: updateFavoriteMutation.mutateAsync,
    createJobFromFavorite: createJobFromFavoriteMutation.mutateAsync,
    isSaving: createFavoriteMutation.isPending,
    isRemoving: removeFavoriteMutation.isPending,
    isUpdating: updateFavoriteMutation.isPending,
    isCreatingJob: createJobFromFavoriteMutation.isPending,
  };
}