import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Star, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Review, User as UserType } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ReviewsListProps {
  userId: number;
  isUserReviewee?: boolean;
}

export function ReviewsList({ userId, isUserReviewee = true }: ReviewsListProps) {
  const { toast } = useToast();
  
  // Fetch reviews where the user is either the reviewer or reviewee
  const queryKey = isUserReviewee ? 
    ['reviews', 'reviewee', userId] : 
    ['reviews', 'reviewer', userId];
  
  const { data: reviews, isLoading, error } = useQuery<Review[]>({
    queryKey,
    queryFn: async () => {
      const endpoint = isUserReviewee ? 
        `/api/reviews/reviewee/${userId}` : 
        `/api/reviews/reviewer/${userId}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    }
  });

  // Fetch user data for reviewers or reviewees
  const { data: users, isLoading: isLoadingUsers } = useQuery<UserType[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
    enabled: !!reviews
  });

  const getUserById = (id: number) => {
    return users?.find(user => user.id === id);
  };

  if (isLoading || isLoadingUsers) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 my-8">
        Error loading reviews: {(error as Error).message}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center text-gray-500 my-8 p-6 bg-gray-50 rounded-lg">
        <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium">No reviews yet</p>
        <p className="text-sm">This user hasn't received any reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isUserReviewee ? 'Reviews Received' : 'Reviews Left'}
        </h2>
        <Button 
          variant="outline" 
          onClick={() => toast({
            title: "Coming Soon",
            description: "This feature will be available in a future update.",
          })}
        >
          {isUserReviewee ? 'All Reviews' : 'My Reviews'}
        </Button>
      </div>

      {reviews.map((review) => {
        const reviewerUser = getUserById(review.reviewerId);
        const revieweeUser = getUserById(review.revieweeId);
        const displayUser = isUserReviewee ? reviewerUser : revieweeUser;

        return (
          <Card key={review.id} className="mb-4 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={displayUser?.avatar} alt={displayUser?.username} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {displayUser?.username?.substring(0, 2)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="font-semibold">{displayUser?.fullName || displayUser?.username}</div>
                <div className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), 'MMMM d, yyyy')}
                </div>
              </div>
              <div className="ml-auto flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{review.comment || "No comment provided."}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}