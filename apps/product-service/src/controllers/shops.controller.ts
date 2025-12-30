import prisma from '@packages/libs/prisma';
import { NextFunction, Request, Response } from 'express';

// Get filtered shops
export const getFilteredShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      categories = [],
      countries = [],
      page = 1,
      limit = 20,
    } = { ...req.body, ...req.query };

    const parsedPage = Math.max(1, parseInt(page as any, 10));
    const parsedLimit = Math.max(1, parseInt(limit as any, 10));
    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(','),
      };
    }

    if (countries && (countries as string[]).length > 0) {
      filters.seller = {
        country: {
          in: Array.isArray(countries)
            ? countries
            : String(countries).split(','),
        },
      };
    }

    const [shops, totalCount] = await Promise.all([
      prisma.shops.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          seller: true,
          avatar: true,
          followers: true,
          // only 12 products per shop for preview
          products: {
            take: 12,
          },
        },
      }),
      prisma.shops.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(totalCount / parsedLimit);

    return res.status(200).json({
      shops,
      pagination: {
        currentPage: parsedPage,
        totalPages,
        totalProducts: totalCount,
        limit: parsedLimit,
        hasNextPage: parsedPage < totalPages,
        hasPrevPage: parsedPage > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Top shops
export const getTopShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Aggregate total sales per shop from orders
    const topShopsData = await prisma.orders.groupBy({
      by: ['shopId'],
      _sum: {
        totalAmount: true,
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: 10,
    });

    // Fetch shop details
    const shopIds = topShopsData.map((data) => data.shopId);

    let shops = await prisma.shops.findMany({
      where: { id: { in: shopIds } },
      select: {
        id: true,
        name: true,
        ratings: true,
        avatar: true,
        coverBanner: true,
        address: true,
        followers: true,
        followersCount: true,
        category: true,
      },
    });

    if (shops.length < 10) {
      const moreShops = await prisma.shops.findMany({
        where: { id: { notIn: shopIds } },
        take: 10 - shops.length,
        orderBy: { ratings: 'desc' },
        select: {
          id: true,
          name: true,
          ratings: true,
          avatar: true,
          coverBanner: true,
          address: true,
          followers: true,
          followersCount: true,
          category: true,
        },
      });
      shops = [...shops, ...moreShops];
    }

    // Merge sales with shop data
    const enrichedShops = shops.map((shop) => {
      const salesData = topShopsData.find((data) => data.shopId === shop.id);
      return {
        ...shop,
        totalSales: salesData?._sum.totalAmount ?? 0,
      };
    });

    const top10Shops = enrichedShops
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      shops: top10Shops,
    });
  } catch (error) {
    return next(error);
  }
};
