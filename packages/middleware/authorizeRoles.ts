import { Response, NextFunction } from "express";
import { AuthError } from "../error-handler";

export const isSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== 'seller') {
    return next(new AuthError('Access denied! Sellers only resource.'));
  }
  return next();
}
  
export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== 'user') {
    return next(new AuthError('Access denied! Users only resource.'));
  }
  return next();
}