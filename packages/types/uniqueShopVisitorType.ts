import { ShopType } from './shopType';
import { UserType } from './userType';

export interface UniqueShopVisitorType {
  id: string;
  shopId: string;
  shop?: ShopType;
  userId: string;
  user?: UserType;
  visitedAt: Date;
}
