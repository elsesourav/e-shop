import { ProductType } from './productType';
import { ShopType } from './shopType';
import { UserType } from './userType';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface OrderItemType {
  id: string;
  orderId: string;
  order?: OrderType;
  productId: string;
  product?: ProductType;
  quantity: number;
  price: number;
  selectedOptions?: any;
}

export interface OrderType {
  id: string;
  userId: string;
  user?: UserType;
  shopId: string;
  shop?: ShopType;
  totalAmount: number;
  discountCode?: string;
  discountAmount?: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus?: string;
  paymentMethod: string;
  shippingAddress: any;
  shippingAddressId?: string;
  items: OrderItemType[];
  createdAt: Date;
  updatedAt: Date;
}
