export interface DiscountCodeType {
  id: string;
  name: string;
  type: string;
  value: number;
  code: string;
  sellerId: string;
  minAmount?: number;
  maxAmount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
