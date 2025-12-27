import { NotFoundError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import { NextFunction, Request, Response } from 'express';

// get product categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.siteConfigs.findFirst();
    if (!config) {
      return next(new NotFoundError('Site configuration not found'));
    }
    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};
