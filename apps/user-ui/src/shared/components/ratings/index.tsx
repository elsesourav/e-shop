import FullStar from 'apps/user-ui/src/assets/svg/full-star';
import HalfStar from 'apps/user-ui/src/assets/svg/half-star';
import OutlineStar from 'apps/user-ui/src/assets/svg/outline-star';

import { FC } from 'react';

type RatingsProps = {
  ratings: number;
  size?: number;
  className?: string;
};

const Ratings: FC<RatingsProps> = ({ ratings, size = 20, className = '' }) => {
  const stars = [];

  // Ensure ratings is between 0 and 5
  const validRating = Math.max(0, Math.min(5, ratings));

  // Calculate full, half, and empty stars
  const fullStars = Math.floor(validRating);
  const hasHalfStar = validRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <FullStar
        key={`full-${i}`}
        width={size}
        height={size}
        className="text-yellow-500"
      />
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <HalfStar
        key="half"
        width={size}
        height={size}
        className="text-yellow-500"
      />
    );
  }

  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <OutlineStar
        key={`empty-${i}`}
        width={size}
        height={size}
        className="text-gray-400"
      />
    );
  }

  return <div className={`flex items-center gap-1 ${className}`}>{stars}</div>;
};

export default Ratings;
