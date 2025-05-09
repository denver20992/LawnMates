import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showEmpty?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showEmpty = true,
  className,
}: StarRatingProps) {
  // Size mappings
  const sizeMap = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Generate stars
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= maxRating; i++) {
      if (i <= fullStars) {
        // Full star
        stars.push(
          <Star
            key={i}
            className={cn(sizeMap[size], 'text-yellow-400 fill-yellow-400')}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        // Half star
        stars.push(
          <StarHalf
            key={i}
            className={cn(sizeMap[size], 'text-yellow-400 fill-yellow-400')}
          />
        );
      } else if (showEmpty) {
        // Empty star
        stars.push(
          <Star
            key={i}
            className={cn(sizeMap[size], 'text-gray-300')}
          />
        );
      }
    }

    return stars;
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {renderStars()}
    </div>
  );
}

interface UserRatingProps {
  rating: number;
  reviewCount: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserRating({
  rating,
  reviewCount,
  size = 'md',
  className,
}: UserRatingProps) {
  const textSizeMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <StarRating rating={rating} size={size} />
      <span className={cn('text-gray-600', textSizeMap[size])}>
        {rating.toFixed(1)} ({reviewCount})
      </span>
    </div>
  );
}