import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MapPin, Plus, Calendar, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFavorites } from '@/hooks/useFavorites';
import { PageHeader } from '@/components/ui/page-header';

export default function SavedPropertiesPage() {
  const { favorites, loadingFavorites, removeFavorite, createJobFromFavorite } = useFavorites();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleCreateJob = async (favoriteId: number) => {
    setProcessingId(favoriteId);
    try {
      await createJobFromFavorite(favoriteId);
      toast({
        title: "Job created successfully",
        description: "You can now view it in your jobs list",
      });
    } catch (error) {
      toast({
        title: "Error creating job",
        description: "There was a problem creating the job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveFavorite = (favoriteId: number) => {
    setProcessingId(favoriteId);
    try {
      removeFavorite(favoriteId);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredFavorites = favorites.filter(favorite => {
    if (activeTab === 'all') return true;
    if (activeTab === 'recurring') return favorite.isRecurring;
    if (activeTab === 'nonrecurring') return !favorite.isRecurring;
    return true;
  });

  return (
    <div className="container max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <PageHeader 
        title="Saved Properties" 
        description="Manage your saved properties and quickly create new job listings"
        actions={
          <Button asChild>
            <Link href="/properties/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full sm:w-auto grid-cols-3">
          <TabsTrigger value="all">All Properties</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="nonrecurring">Standard</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loadingFavorites ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading saved properties...</span>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-card">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No saved properties</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                You haven't saved any properties yet. Add a property to get started.
              </p>
              <Button asChild>
                <Link href="/properties/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((favorite) => (
                <Card key={favorite.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="truncate">{favorite.property?.address || "Unnamed Property"}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 inline" strokeWidth={2} />
                      {favorite.property?.city}, {favorite.property?.state} {favorite.property?.zipCode}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-2 text-sm">
                      <div className="font-medium">Type:</div>
                      <div className="ml-2">{favorite.property?.propertyType || "N/A"}</div>
                    </div>
                    <div className="flex items-center mb-2 text-sm">
                      <div className="font-medium">Size:</div>
                      <div className="ml-2">{favorite.property?.size ? `${favorite.property.size} sq ft` : "N/A"}</div>
                    </div>
                    {favorite.isRecurring && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1" strokeWidth={2} />
                        <span className="text-sm font-medium">
                          {favorite.recurrenceInterval} service
                        </span>
                      </div>
                    )}
                    {favorite.notes && (
                      <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                        {favorite.notes}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4 border-t">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      disabled={processingId === favorite.id}
                    >
                      {processingId === favorite.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Remove
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleCreateJob(favorite.id)}
                      disabled={processingId === favorite.id}
                    >
                      {processingId === favorite.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Create Job
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}