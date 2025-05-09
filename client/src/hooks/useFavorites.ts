import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Favorite, Property } from '@shared/schema';

export const useFavorites = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Fetch user's favorite properties
  const { data: favorites = [], isLoading: loadingFavorites } = useQuery({
    queryKey: ['/api/favorites'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/favorites');
      const data = await response.json();
      return data as (Favorite & { property?: Property })[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create favorite mutation
  const createFavoriteMutation = useMutation({
    mutationFn: async (favoriteData: {
      propertyId: number;
      isRecurring?: boolean;
      recurrenceInterval?: string;
      notes?: string;
    }) => {
      const response = await apiRequest('POST', '/api/favorites', favoriteData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Property saved",
        description: "The property has been added to your favorites.",
      });
    },
    onError: (error) => {
      console.error('Error creating favorite:', error);
      toast({
        title: "Failed to save property",
        description: "There was an error saving this property. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update favorite mutation
  const updateFavoriteMutation = useMutation({
    mutationFn: async ({ id, ...favoriteData }: {
      id: number;
      isRecurring?: boolean;
      recurrenceInterval?: string;
      notes?: string;
    }) => {
      const response = await apiRequest('PATCH', `/api/favorites/${id}`, favoriteData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Favorite updated",
        description: "Your saved property has been updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating favorite:', error);
      toast({
        title: "Failed to update",
        description: "There was an error updating this saved property. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete favorite mutation
  const deleteFavoriteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/favorites/${id}`);
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Property removed",
        description: "The property has been removed from your favorites.",
      });
    },
    onError: (error) => {
      console.error('Error deleting favorite:', error);
      toast({
        title: "Failed to remove property",
        description: "There was an error removing this property. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Helper function to create a new job from a saved property
  const createJobFromFavorite = useCallback(async (favoriteId: number) => {
    try {
      setLoading(true);
      
      // Get the favorite details
      const favorite = favorites.find(f => f.id === favoriteId);
      if (!favorite || !favorite.property) {
        throw new Error('Favorite property not found');
      }
      
      // This would call the API to create a job based on the favorite
      // In a real implementation, you would send more data
      const response = await apiRequest('POST', '/api/jobs/from-favorite', { favoriteId });
      
      if (!response.ok) {
        throw new Error('Failed to create job');
      }
      
      // Success toast
      toast({
        title: "Job created",
        description: "A new job has been created from your saved property.",
      });
      
      // Return the created job ID for potential redirection
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Error creating job from favorite:', error);
      toast({
        title: "Failed to create job",
        description: "There was an error creating a job from this saved property. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [favorites, toast]);

  return {
    favorites,
    loadingFavorites,
    loading,
    saveFavorite: createFavoriteMutation.mutate,
    updateFavorite: updateFavoriteMutation.mutate,
    removeFavorite: deleteFavoriteMutation.mutate,
    createJobFromFavorite,
  };
};