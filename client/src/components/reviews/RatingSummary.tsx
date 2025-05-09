import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, StarHalf, Loader2 } from 'lucide-react';
import { Review, User } from '@shared/schema';
import { Progress } from '@/components/ui/progress';

interface RatingSummaryProps {
  userId: number;
}

export function RatingSummary({ userId }: RatingSummaryProps) {
  // Fetch the user to get their rating
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    }
  });

  // Fetch reviews for this user to calculate the distribution
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ['reviews', 'reviewee', userId],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/reviewee/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    }
  });

  // Calculate rating distribution
  const getRatingDistribution = () => {
    if (!reviews || reviews.length === 0) return [];
    
    // Initialize counts for each rating (1-5)
    const counts = [0, 0, 0, 0, 0];
    
    // Count occurrences of each rating
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        counts[review.rating - 1]++;
      }
    });
    
    // Calculate percentages
    return counts.map(count => Math.round((count / reviews.length) * 100));
  };

  if (isLoadingUser || isLoadingReviews) {
    return (
      <div className="flex justify-center my-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-red-500 my-4">
        User not found
      </div>
    );
  }

  const ratingDistribution = getRatingDistribution();
  const reviewCount = user.reviewCount || 0;
  const averageRating = user.rating || 0;
  const hasReviews = reviewCount > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Rating & Reviews</h3>
        <span className="text-sm text-gray-500">{reviewCount} reviews</span>
      </div>

      {hasReviews ? (
        <>
          <div className="flex items-center mb-6">
            <div className="text-3xl font-bold mr-2">{averageRating.toFixed(1)}</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= Math.floor(averageRating);
                const half = !filled && star === Math.ceil(averageRating) && averageRating % 1 >= 0.5;
                
                return half ? (
                  <StarHalf key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ) : (
                  <Star 
                    key={star} 
                    className={`w-5 h-5 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating, index) => (
              <div key={rating} className="flex items-center">
                <span className="w-6 text-sm text-gray-600">{rating}</span>
                <Progress 
                  value={ratingDistribution[5 - rating] || 0}
                  className="h-2 flex-1 mx-2"
                />
                <span className="w-8 text-right text-xs text-gray-500">
                  {ratingDistribution[5 - rating] || 0}%
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500">No reviews yet</p>
        </div>
      )}
    </div>
  );
}