import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ChevronLeft } from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { RatingSummary } from '@/components/reviews/RatingSummary';
import { UserRating } from '@/components/ui/star-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@shared/schema';

export default function ReviewsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState('received');
  
  // Get userId from URL or use current user's ID
  const params = new URLSearchParams(window.location.search);
  const userIdParam = params.get('userId');
  const userId = userIdParam ? parseInt(userIdParam, 10) : user?.id;
  
  const isCurrentUser = !userIdParam || (user && userId === user.id);

  // Fetch user data if viewing someone else's profile
  const { data: profileUser, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    enabled: !!userId && !isCurrentUser
  });

  const displayUser = isCurrentUser ? user : profileUser;
  
  const isLoading = isAuthLoading || isUserLoading || !displayUser;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center p-8 bg-red-50 rounded-lg text-red-600">
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p>The user you're looking for doesn't exist or is not accessible.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate("/dashboard")}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-4"
          onClick={() => navigate(isCurrentUser ? "/profile" : "/dashboard")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {isCurrentUser ? "Back to Profile" : "Back to Dashboard"}
        </Button>
        
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={displayUser.avatar} alt={displayUser.username} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {displayUser.username?.substring(0, 2)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="text-2xl font-bold">
              {isCurrentUser ? "My Reviews" : `${displayUser.fullName || displayUser.username}'s Reviews`}
            </h1>
            <UserRating 
              rating={displayUser.rating || 0} 
              reviewCount={displayUser.reviewCount || 0} 
              size="md"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <RatingSummary userId={displayUser.id} />
          
          {/* Additional user info or actions could go here */}
          {!isCurrentUser && (
            <div className="mt-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/profile?userId=${displayUser.id}`)}
              >
                View Full Profile
              </Button>
            </div>
          )}
        </div>
        
        <div className="md:col-span-2">
          <Tabs 
            defaultValue="received" 
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="received">Reviews Received</TabsTrigger>
              <TabsTrigger value="given">Reviews Given</TabsTrigger>
            </TabsList>
            
            <TabsContent value="received" className="mt-6">
              <ReviewsList userId={displayUser.id} isUserReviewee={true} />
            </TabsContent>
            
            <TabsContent value="given" className="mt-6">
              <ReviewsList userId={displayUser.id} isUserReviewee={false} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}