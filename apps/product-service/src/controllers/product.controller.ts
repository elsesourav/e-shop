import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '@packages/error-handler';
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
};

// Create Product
export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      detailDescription,
      subCategory,
      tags,
      warranty,
      slug,
      brand,
      cod,
      category,
      discountCodes,
      colors = [],
      sizes = [],
      images = [],
      videoUrl,
      regularPrice,
      salePrice,
      stock,
      customProperties = {},
      customSpecifications = {},
    } = req.body;

    if (
      !title ||
      !slug ||
      !description ||
      !detailDescription ||
      !category ||
      !subCategory ||
      !images ||
      !tags ||
      !salePrice ||
      !regularPrice ||
      !stock
    ) {
      return next(new ValidationError('Please fill all required fields'));
    }

    if (!req.seller?.id) {
      return next(new AuthError('Only sellers can create products!'));
    }

    // Get seller's shop
    const seller = await prisma.sellers.findUnique({
      where: { id: req.seller.id },
      include: { shop: true },
    });

    console.log('Seller Data:', JSON.stringify(seller, null, 2));
    console.log('Shop ID:', seller?.shop?.id);

    if (!seller?.shop) {
      return next(
        new ValidationError('Please create a shop before adding products!')
      );
    }

    const slugChecking = await prisma.products.findUnique({
      where: { slug },
    });

    if (slugChecking) {
      return next(
        new ValidationError('Slug already in use, please use a different slug')
      );
    }

    const filteredImages = (images || [])
      .filter((img: any) => img && img.fileId && img.fileUrl)
      .map((img: any) => ({
        fileId: img.fileId,
        url: img.fileUrl,
      }));

    console.log('Creating product with shop ID:', seller.shop.id);

    const product = await prisma.products.create({
      data: {
        title,
        description,
        detailDescription,
        warranty,
        cod: cod === 'yes',
        slug,
        tags: Array.isArray(tags)
          ? tags
          : tags.split(',').map((tag: string) => tag.trim()),
        brand,
        videoUrl,
        category,
        subCategory,
        colors: colors || [],
        discountCodes: discountCodes?.map((codeId: string) => codeId) || [],
        sizes: sizes || [],
        stock: parseInt(stock, 10),
        salePrice: parseFloat(salePrice),
        regularPrice: parseFloat(regularPrice),
        customProperties: customProperties || {},
        customSpecifications: customSpecifications || {},
        shop: {
          connect: {
            id: seller.shop.id,
          },
        },
        images: {
          create: filteredImages,
        },
      },
      include: { images: true },
    });

    return res.status(201).json({ success: true, product });
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

    // Update product average rating
    const reviews = await prisma.productReviews.findMany({
      where: { productId },
      select: { rating: true },
    });

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

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

    // Update shop average rating
    const allReviews = await prisma.shopReviews.findMany({
      where: { shopId },
      select: { rating: true },
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

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

// Increment product view count
export const incrementProductView = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    await prisma.products.update({
      where: { id: productId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

// Save product as draft
export const saveProductDraft = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      detailDescription,
      subCategory,
      tags,
      warranty,
      slug,
      brand,
      cod,
      category,
      discountCodes,
      colors = [],
      sizes = [],
      images = [],
      videoUrl,
      regularPrice,
      salePrice,
      stock,
      customProperties = {},
      customSpecifications = {},
    } = req.body;

    if (!title || !slug) {
      return next(
        new ValidationError('Title and slug are required to save draft')
      );
    }

    if (!req.seller?.id) {
      return next(new AuthError('Only sellers can save product drafts!'));
    }

    // Get seller's shop
    const seller = await prisma.sellers.findUnique({
      where: { id: req.seller.id },
      include: { shop: true },
    });

    if (!seller?.shop) {
      return next(
        new ValidationError(
          'Please create a shop before saving product drafts!'
        )
      );
    }

    // Check if draft with same slug exists for this shop
    const existingDraft = await prisma.products.findFirst({
      where: {
        slug,
        shopId: seller.shop.id,
        status: 'DRAFT',
      },
    });

    const filteredImages = (images || [])
      .filter((img: any) => img && img.fileId && img.fileUrl)
      .map((img: any) => ({
        fileId: img.fileId,
        url: img.fileUrl,
      }));

    const productData = {
      title,
      description: description || '',
      detailDescription: detailDescription || '',
      warranty: warranty || '',
      cod: cod === 'yes',
      slug,
      tags: Array.isArray(tags)
        ? tags
        : tags
        ? tags.split(',').map((tag: string) => tag.trim())
        : [],
      brand: brand || '',
      videoUrl: videoUrl || '',
      category: category || '',
      subCategory: subCategory || '',
      colors: colors || [],
      discountCodes: discountCodes?.map((codeId: string) => codeId) || [],
      sizes: sizes || [],
      stock: stock ? parseInt(stock, 10) : 0,
      salePrice: salePrice ? parseFloat(salePrice) : 0,
      regularPrice: regularPrice ? parseFloat(regularPrice) : 0,
      customProperties: customProperties || {},
      customSpecifications: customSpecifications || {},
      status: 'DRAFT' as const,
      shop: {
        connect: {
          id: seller.shop.id,
        },
      },
    };

    let product;

    if (existingDraft) {
      // Update existing draft
      product = await prisma.products.update({
        where: { id: existingDraft.id },
        data: {
          ...productData,
          images: {
            deleteMany: {},
            create: filteredImages,
          },
        },
        include: { images: true },
      });
    } else {
      // Create new draft
      product = await prisma.products.create({
        data: {
          ...productData,
          images: {
            create: filteredImages,
          },
        },
        include: { images: true },
      });
    }

    return res.status(201).json({ success: true, product });
  } catch (error) {
    return next(error);
  }
};

// Get draft products for seller
export const getDraftProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.seller?.id) {
      return next(new AuthError('Only sellers can access drafts!'));
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: req.seller.id },
      include: { shop: true },
    });

    if (!seller?.shop) {
      return res.status(200).json({ success: true, drafts: [] });
    }

    const drafts = await prisma.products.findMany({
      where: {
        shopId: seller.shop.id,
        status: 'DRAFT',
      },
      include: {
        images: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return res.status(200).json({ success: true, drafts });
  } catch (error) {
    return next(error);
  }
};

// Delete draft product
export const deleteDraftProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    if (!sellerId) {
      return next(new AuthError('Only sellers can delete drafts!'));
    }

    const product = await prisma.products.findUnique({
      where: { id },
      include: { shop: true },
    });

    if (!product) {
      return next(new NotFoundError('Draft not found'));
    }

    if (product.shop.sellerId !== sellerId) {
      return next(
        new ValidationError('You are not authorized to delete this draft')
      );
    }

    if (product.status !== 'DRAFT') {
      return next(
        new ValidationError('Only draft products can be deleted this way')
      );
    }

    await prisma.products.delete({ where: { id } });

    return res
      .status(200)
      .json({ success: true, message: 'Draft deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

// Publish draft product
export const publishDraftProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    if (!sellerId) {
      return next(new AuthError('Only sellers can publish drafts!'));
    }

    const product = await prisma.products.findUnique({
      where: { id },
      include: { shop: true },
    });

    if (!product) {
      return next(new NotFoundError('Draft not found'));
    }

    if (product.shop.sellerId !== sellerId) {
      return next(
        new ValidationError('You are not authorized to publish this draft')
      );
    }

    if (product.status !== 'DRAFT') {
      return next(new ValidationError('Product is not a draft'));
    }

    // Validate required fields for publishing
    if (
      !product.description ||
      !product.detailDescription ||
      !product.category ||
      !product.subCategory
    ) {
      return next(
        new ValidationError(
          'Please complete all required fields before publishing'
        )
      );
    }

    const publishedProduct = await prisma.products.update({
      where: { id },
      data: {
        status: 'ACTIVE',
      },
      include: { images: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Product published successfully',
      product: publishedProduct,
    });
  } catch (error) {
    return next(error);
  }
};
