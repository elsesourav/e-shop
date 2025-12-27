import { NotFoundError, ValidationError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import { NextFunction, Request, Response } from 'express';

// Create Discount code
export const createDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      discountName,
      discountType,
      discountValue,
      discountCode,
      minAmount,
      maxAmount,
      usageLimit,
      expiresAt,
      isActive = true,
    } = req.body;

    if (!discountName || !discountType || !discountValue || !discountCode) {
      return next(new ValidationError('All required fields must be provided!'));
    }

    const isDiscountCodeExists = await prisma.discountCodes.findUnique({
      where: { code: discountCode },
    });

    if (isDiscountCodeExists) {
      return next(
        new ValidationError(
          'Discount code already exists, please use a different code'
        )
      );
    }

    const code = await prisma.discountCodes.create({
      data: {
        name: discountName,
        type: discountType,
        value: parseFloat(discountValue),
        code: discountCode,
        sellerId: req.seller?.id,
        minAmount: minAmount ? parseFloat(minAmount) : 0,
        maxAmount: maxAmount ? parseFloat(maxAmount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive,
      },
    });

    return res.status(201).json({ success: true, code });
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
    const { activeOnly } = req.query;

    const where: any = { sellerId: req.seller?.id };

    // Filter by active status if requested
    if (activeOnly === 'true') {
      where.isActive = true;
      // Also check if not expired
      where.OR = [{ expiresAt: null }, { expiresAt: { gte: new Date() } }];
    }

    const discountCodes = await prisma.discountCodes.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

// Update discount code
export const updateDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      discountName,
      discountType,
      discountValue,
      minAmount,
      maxAmount,
      usageLimit,
      expiresAt,
      isActive,
    } = req.body;

    const discountCode = await prisma.discountCodes.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!discountCode) {
      return next(new NotFoundError('Discount code not found'));
    }

    if (discountCode.sellerId !== req.seller?.id) {
      return next(
        new ValidationError(
          'You are not authorized to update this discount code'
        )
      );
    }

    const updateData: any = {};
    if (discountName) updateData.name = discountName;
    if (discountType) updateData.type = discountType;
    if (discountValue) updateData.value = parseFloat(discountValue);
    if (minAmount !== undefined) updateData.minAmount = parseFloat(minAmount);
    if (maxAmount !== undefined) updateData.maxAmount = parseFloat(maxAmount);
    if (usageLimit !== undefined)
      updateData.usageLimit = parseInt(usageLimit, 10);
    if (expiresAt !== undefined)
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCode = await prisma.discountCodes.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ success: true, code: updatedCode });
  } catch (error) {
    return next(error);
  }
};

// Validate and apply discount code
export const validateDiscountCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || !orderAmount) {
      return next(new ValidationError('Code and order amount are required'));
    }

    const discountCode = await prisma.discountCodes.findUnique({
      where: { code },
    });

    if (!discountCode) {
      return next(new NotFoundError('Invalid discount code'));
    }

    // Check if active
    if (!discountCode.isActive) {
      return next(
        new ValidationError('This discount code is no longer active')
      );
    }

    // Check if expired
    if (discountCode.expiresAt && new Date() > discountCode.expiresAt) {
      return next(new ValidationError('This discount code has expired'));
    }

    // Check usage limit
    if (
      discountCode.usageLimit &&
      discountCode.usageLimit > 0 &&
      discountCode.usedCount >= discountCode.usageLimit
    ) {
      return next(
        new ValidationError('This discount code has reached its usage limit')
      );
    }

    // Check minimum amount
    if (discountCode.minAmount && orderAmount < discountCode.minAmount) {
      return next(
        new ValidationError(
          `Minimum order amount of ${discountCode.minAmount} required to use this code`
        )
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (discountCode.type === 'percentage') {
      discountAmount = (orderAmount * discountCode.value) / 100;
    } else if (discountCode.type === 'fixed') {
      discountAmount = discountCode.value;
    }

    // Apply maximum discount limit if set
    if (discountCode.maxAmount && discountAmount > discountCode.maxAmount) {
      discountAmount = discountCode.maxAmount;
    }

    return res.status(200).json({
      success: true,
      valid: true,
      discountAmount,
      finalAmount: orderAmount - discountAmount,
      discountCode: {
        code: discountCode.code,
        name: discountCode.name,
        type: discountCode.type,
        value: discountCode.value,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Increment discount code usage
export const incrementDiscountUsage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.body;

    if (!code) {
      return next(new ValidationError('Discount code is required'));
    }

    const discountCode = await prisma.discountCodes.update({
      where: { code },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });

    return res.status(200).json({ success: true, discountCode });
  } catch (error) {
    return next(error);
  }
};
