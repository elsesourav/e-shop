import { UserType } from './userType';

export enum NotificationTypeEnum {
  ORDER_UPDATE = 'ORDER_UPDATE',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM',
  ALERT = 'ALERT',
}

export interface NotificationType {
  id: string;
  creatorId: string;
  creator?: UserType;
  receiverId: string;
  receiver?: UserType;
  title: string;
  message?: string;
  redirectLink?: string;
  isRead: boolean;
  type: NotificationTypeEnum;
  createdAt: Date;
  updatedAt: Date;
}
