import { ImageType } from './imageType';
import { ShopType } from './shopType';
import { UserType } from './userType';

export enum ProductStatusType {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  DRAFT = 'DRAFT',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export interface ProductReviewType {
  id: string;
  userId: string;
  rating: number;
  review?: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: UserType;
}

export interface ProductRatingType {
  id: string;
  productId: string;
  averageRating: number;
  totalReviews: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductAnalyticsType {
  id: string;
  productId: string;
  shopId?: string;
  views: number;
  purchases: number;
  addedToCarts: number;
  addedToWishlists: number;
  removedFromCarts: number;
  removedFromWishlists: number;
  lastVisitedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductType {
  id: string;
  status: ProductStatusType;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  description: string;
  detailDescription: string;
  stock: number;
  salePrice: number;
  regularPrice: number;
  ratings: number;
  images: ImageType[];
  reviews?: ProductReviewType[];
  productRating?: ProductRatingType;
  productAnalytics?: ProductAnalyticsType;
  discountCodes: string[];
  tags: string[];
  colors: string[];
  sizes: string[];
  cod: boolean;
  brand?: string;
  warranty?: string;
  videoUrl?: string;
  customSpecifications?: Record<string, any>;
  customProperties?: Record<string, any>;
  isDeleted: boolean;
  viewCount: number;
  soldCount: number;
  startingDate?: Date;
  endingDate?: Date;
  createdAt: Date;
  deletedAt?: Date;
  deletePermanentlyAt?: Date;
  updatedAt: Date;
  shopId: string;
  shop?: ShopType;
}
