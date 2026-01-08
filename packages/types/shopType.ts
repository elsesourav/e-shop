import { FollowerType } from './followerType';
import { ImageType } from './imageType';
import { OrderType } from './orderType';
import { ProductAnalyticsType, ProductType } from './productType';
import { SellerType } from './sellerType';
import { UniqueShopVisitorType } from './uniqueShopVisitorType';
import { UserType } from './userType';

export interface ShopReviewType {
  id: string;
  userId: string;
  rating: number;
  reviews?: string;
  shopId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: UserType;
}

export interface ShopAnalyticsType {
  id: string;
  shopId: string;
  shop?: ShopType;
  totalVisits: number;
  countryStats?: any;
  cityStats?: any;
  deviceStats?: any;
  lastVisitedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopType {
  id: string;
  name: string;
  description: string;
  category: string;
  avatar: ImageType[];
  coverBanner?: string;
  address: string;
  openingHours?: string;
  website?: string;
  socialLinks: any[];
  ratings: number;
  reviews?: ShopReviewType[];
  sellerId: string;
  seller?: SellerType;
  products?: ProductType[];
  orders?: OrderType[];
  productAnalytics?: ProductAnalyticsType[];
  shopAnalytics?: ShopAnalyticsType;
  followersCount: number;
  followers?: FollowerType[];
  uniqueVisitors?: UniqueShopVisitorType[];
  createdAt: Date;
  updatedAt: Date;
}
