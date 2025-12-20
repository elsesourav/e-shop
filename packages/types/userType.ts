import { ImageType } from './imageType';
import { ProductReviewType } from './productType';
import { ShopReviewType } from './shopType';

export interface UserAnalyticsType {
  id: string;
  userId: string;
  actions: any[];
  country?: string;
  city?: string;
  device?: string;
  lastVisited?: Date;
  lastLogin?: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserType {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: ImageType[];
  following: string[];
  shopReviews?: ShopReviewType[];
  productReviews?: ProductReviewType[];
  createdAt: Date;
  updatedAt: Date;
  userAnalytics?: UserAnalyticsType;
}
