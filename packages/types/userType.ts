import { FollowerType } from './followerType';
import { ImageType } from './imageType';
import { NotificationType } from './notificationType';
import { OrderType } from './orderType';
import { ProductReviewType } from './productType';
import { ShopReviewType } from './shopType';
import { UniqueShopVisitorType } from './uniqueShopVisitorType';

export enum AddressTypeEnum {
  HOME = 'HOME',
  WORK = 'WORK',
  OTHERS = 'OTHERS',
}

export interface AddressType {
  id: string;
  userId: string;
  user?: UserType;
  addressType: AddressTypeEnum;
  name: string;
  phone: string;
  address: string;
  city: string;
  zpi: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAnalyticsType {
  id: string;
  userId: string;
  user?: UserType;
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
  shopReviews?: ShopReviewType[];
  productReviews?: ProductReviewType[];
  orders?: OrderType[];
  addresses?: AddressType[];
  createdAt: Date;
  updatedAt: Date;
  userAnalytics?: UserAnalyticsType;
  following?: FollowerType[];
  visitedShops?: UniqueShopVisitorType[];
  createdNotifications?: NotificationType[];
  receivedNotifications?: NotificationType[];
}
