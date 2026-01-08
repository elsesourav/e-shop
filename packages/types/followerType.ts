import { ShopType } from './shopType';
import { UserType } from './userType';

export interface FollowerType {
  id: string;
  userId: string;
  user?: UserType;
  shopId: string;
  shop?: ShopType;
  createdAt: Date;
}
