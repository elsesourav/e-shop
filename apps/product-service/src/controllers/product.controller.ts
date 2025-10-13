import { NotFoundError, ValidationError } from '@packages/error-handler';
import imagekit from '@packages/libs/imagekit';
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

// Create Discount code
export const createDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, type, value, code } = req.body;

    const isDiscountCodeExists = await prisma.discountCodes.findUnique({
      where: { code },
    });

    if (isDiscountCodeExists) {
      return next(
        new ValidationError(
          'Discount code already exists, please use a different code'
        )
      );
    }

    const discountCode = await prisma.discountCodes.create({
      data: {
        name,
        type,
        value: parseFloat(value),
        code,
        sellerId: req.seller?.id,
      },
    });

    return res.status(201).json({ success: true, discountCode });
  } catch (error) {
    return next(error);
  }
};

// Get all discount codes
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discountCodes = await prisma.discountCodes.findMany({
      where: { sellerId: req.seller?.id },
    });
    return res.status(200).json({ success: true, discountCodes });
  } catch (error) {
    return next(error);
  }
};

// Delete discount code
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    const discountCode = await prisma.discountCodes.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!discountCode) {
      return next(new NotFoundError('Discount code not found'));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(
        new ValidationError(
          'You are not authorized to delete this discount code'
        )
      );
    }

    await prisma.discountCodes.delete({ where: { id } });

    return res
      .status(200)
      .json({ success: true, message: 'Discount code deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

// Upload Product Image
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { image } = req.body;

    const response = await imagekit.upload({
      file: image,
      fileName: `es-product-${Date.now()}.jpg`,
      folder: '/products',
    });
    return res
      .status(200)
      .json({ success: true, fileUrl: response.url, fileId: response.fileId });
  } catch (error) {
    return next(error);
  }
};

// Delete Product Image
export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;

    const response = await imagekit.deleteFile(fileId);
    return res.status(200).json({ success: true, response });
  } catch (error) {
    return next(error);
  }
}