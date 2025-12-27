import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import { NextFunction, Request, Response } from 'express';

// Create product review
export const createProductReview = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, rating, review } = req.body;
    const userId = req.user?.id;

    if (!productId || !rating) {
      return next(new ValidationError('Product ID and rating are required'));
    }

    if (!userId) {
      return next(new AuthError('Please login to submit a review'));
    }

    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    // Create review
    const productReview = await prisma.productReviews.create({
      data: {
        userId,
        productId,
        rating: parseFloat(rating),
        review,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Optimized: Use database aggregation for average rating
    const ratingStats = await prisma.productReviews.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const totalReviews = ratingStats._count.rating;
    const avgRating = ratingStats._avg.rating || 0;

    // Optimized: Use database grouping for star distribution
    const starGroups = await prisma.productReviews.groupBy({
      by: ['rating'],
      where: { productId },
      _count: { rating: true },
    });

    const starDistribution = {
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0,
    };

    starGroups.forEach((group) => {
      const star = Math.round(group.rating);
      const count = group._count.rating;
      if (star === 5) starDistribution.fiveStars += count;
      else if (star === 4) starDistribution.fourStars += count;
      else if (star === 3) starDistribution.threeStars += count;
      else if (star === 2) starDistribution.twoStars += count;
      else if (star === 1) starDistribution.oneStar += count;
    });

    // Update or create product ratings
    await prisma.productRatings.upsert({
      where: { productId },
      create: {
        productId,
        averageRating: avgRating,
        totalReviews,
        ...starDistribution,
      },
      update: {
        averageRating: avgRating,
        totalReviews,
        ...starDistribution,
      },
    });

    // Also update the legacy ratings field on products for backwards compatibility
    await prisma.products.update({
      where: { id: productId },
      data: { ratings: avgRating },
    });

    return res.status(201).json({ success: true, review: productReview });
  } catch (error) {
    return next(error);
  }
};

// Get product reviews
export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      prisma.productReviews.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.productReviews.count({ where: { productId } }),
    ]);

    return res.status(200).json({
      success: true,
      reviews,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Create shop review
export const createShopReview = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId, rating, reviews } = req.body;
    const userId = req.user?.id;

    if (!shopId || !rating) {
      return next(new ValidationError('Shop ID and rating are required'));
    }

    if (!userId) {
      return next(new AuthError('Please login to submit a review'));
    }

    // Check if shop exists
    const shop = await prisma.shops.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return next(new NotFoundError('Shop not found'));
    }

    // Create review
    const shopReview = await prisma.shopReviews.create({
      data: {
        userId,
        shopId,
        rating: parseFloat(rating),
        reviews,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Optimized: Use database aggregation for shop rating
    const ratingStats = await prisma.shopReviews.aggregate({
      where: { shopId },
      _avg: { rating: true },
    });

    const avgRating = ratingStats._avg.rating || 0;

    await prisma.shops.update({
      where: { id: shopId },
      data: { ratings: avgRating },
    });

    return res.status(201).json({ success: true, review: shopReview });
  } catch (error) {
    return next(error);
  }
};

// Get shop reviews
export const getShopReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      prisma.shopReviews.findMany({
        where: { shopId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.shopReviews.count({ where: { shopId } }),
    ]);

    return res.status(200).json({
      success: true,
      reviews,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return next(error);
  }
};
