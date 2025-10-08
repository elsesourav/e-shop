import prisma from '@packages/libs/prisma';
import { Request, Response, NextFunction } from 'express';

// get product categories
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await prisma.siteConfigs.findFirst();
    if (!config) {
      return res.status(404).json({ message: 'Site configuration not found' });
    }
    return res.status(200).json({ categories: config.categories, subCategories: config.subCategories });
  } catch (error) {
    return next(error);
  }
};
