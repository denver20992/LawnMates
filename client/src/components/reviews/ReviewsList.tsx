import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { StarRating } from '@/components/ui/star-rating';
import { Loader2 } from 'lucide-react';
import { Review, User } from '@shared/schema';

interface ReviewsListProps {
  userId: number;
  isUserReviewee: boolean;
  jobId?: number;
}

export function ReviewsList({ userId, isUserReviewee, jobId }: ReviewsListProps) {
  // Fetch reviews based on the provided filters
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: isUserReviewee 
      ? ['reviews', 'reviewee', userId] 
      : ['reviews', 'reviewer', userId],
    queryFn: async () => {
      const endpoint = isUserReviewee 
        ? `/api/reviews/reviewee/${userId}` 
        : `/api/reviews/reviewer/${userId}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    }
  });
  
  // If there's a jobId, we filter the reviews
  const filteredReviews = jobId && reviews 
    ? reviews.filter(review => review.jobId === jobId) 
    : reviews;

  // Loading state
  if (isLoadingReviews) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state
  if (!filteredReviews || filteredReviews.length === 0) {
    return (
      <div className="bg-gray-50 border rounded-lg p-8 text-center text-gray-500">
        <p className="text-lg font-medium mb-2">No reviews yet</p>
        <p>
          {isUserReviewee 
            ? "This user hasn't received any reviews yet." 
            : "This user hasn't left any reviews yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredReviews.map((review) => (
        <ReviewCard key={review.id} review={review} isUserReviewee={isUserReviewee} />
      ))}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  isUserReviewee: boolean;
}

function ReviewCard({ review, isUserReviewee }: ReviewCardProps) {
  // We need to fetch the user who wrote or received the review
  const userId = isUserReviewee ? review.reviewerId : review.revieweeId;
  
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    enabled: !!userId
  });

  // Loading state
  if (isLoadingUser) {
    return (
      <Card className="bg-gray-50 animate-pulse">
        <CardContent className="py-6">
          <div className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>
                {user.username?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base font-medium">
                {user.fullName || user.username}
              </CardTitle>
              <p className="text-sm text-gray-500">
                {isUserReviewee ? 'Reviewed you' : 'You reviewed'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <StarRating rating={review.rating} />
            <p className="text-xs text-gray-500 mt-1">
              {review.createdAt && format(new Date(review.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{review.comment}</p>
      </CardContent>
    </Card>
  );
}