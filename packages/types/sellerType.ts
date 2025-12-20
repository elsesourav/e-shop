import { DiscountCodeType } from './discountCodeType';
import { ShopType } from './shopType';

export interface SellerType {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  password?: string;
  stripeId?: string;
  shop?: ShopType;
  discountCodes?: DiscountCodeType[];
  createdAt: Date;
  updatedAt: Date;
}
