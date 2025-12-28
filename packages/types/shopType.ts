import { ImageType } from './imageType';
import { ProductType } from './productType';
import { SellerType } from './sellerType';
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
  followers?: UserType[];
  followersCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
