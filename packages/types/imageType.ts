export interface ImageType {
  id: string;
  fileId: string;
  url: string;
  userId?: string;
  shopId?: string;
  productId?: string;
  createdAt: Date;
  updatedAt: Date;
}
