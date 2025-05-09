import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, PlusCircle } from 'lucide-react';
import SavedPropertiesList from '@/components/properties/SavedPropertiesList';
import { PageHeader } from '@/components/ui/page-header';

const SavedPropertiesPage: React.FC = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const { data: favorites, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/favorites'],
    queryFn: async () => {
      const response = await fetch('/api/favorites');
      if (!response.ok) {
        throw new Error('Failed to fetch saved properties');
      }
      return response.json();
    },
  });
  
  const handleCreateJob = () => {
    navigate('/jobs/create');
  };
  
  const handleAddProperty = () => {
    navigate('/properties/add');
  };
  
  if (error) {
    toast({
      title: 'Error fetching saved properties',
      description: (error as Error).message,
      variant: 'destructive',
    });
  }
  
  return (
    <div className="container max-w-6xl mx-auto py-6 space-y-8">
      <PageHeader
        title="Saved Properties"
        description="Manage your saved properties and quickly create recurring jobs"
        actions={
          <Button onClick={handleAddProperty}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        }
      />
      
      <Separator />
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading saved properties...</span>
        </div>
      ) : favorites && favorites.length > 0 ? (
        <SavedPropertiesList 
          onCreateJob={handleCreateJob}
        />
      ) : (
        <Card className="bg-muted/40">
          <CardHeader>
            <CardTitle className="text-center">No Saved Properties</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>You haven't saved any properties yet. Add a property to save it for future jobs.</p>
            <Button onClick={handleAddProperty} variant="default">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Property
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavedPropertiesPage;