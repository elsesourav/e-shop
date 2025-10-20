import isAuthenticated from '@packages/middleware/isAuthenticated';
import express, { Router } from 'express';
import {
  createDiscountCode,
  createProduct,
  createProductReview,
  createShopReview,
  deleteDiscountCode,
  deleteProductImage,
  getCategories,
  getDiscountCodes,
  getProductReviews,
  getShopReviews,
  incrementDiscountUsage,
  incrementProductView,
  updateDiscountCode,
  uploadProductImage,
  validateDiscountCode,
} from '../controllers/product.controller';

const router: Router = express.Router();

// product categories
router.get('/get-categories', getCategories);

// discount codes
router.post('/create-discount-code', isAuthenticated, createDiscountCode);
router.get('/get-discount-codes', isAuthenticated, getDiscountCodes);
router.put('/update-discount-code/:id', isAuthenticated, updateDiscountCode);
router.delete('/delete-discount-code/:id', isAuthenticated, deleteDiscountCode);
router.post('/validate-discount-code', validateDiscountCode);
router.post('/increment-discount-usage', incrementDiscountUsage);

// product images
router.post('/create-product', isAuthenticated, createProduct);
router.post('/upload-product-image', isAuthenticated, uploadProductImage);
router.delete('/delete-product-image', isAuthenticated, deleteProductImage);

// product reviews
router.post('/create-product-review', isAuthenticated, createProductReview);
router.get('/get-product-reviews/:productId', getProductReviews);

// shop reviews
router.post('/create-shop-review', isAuthenticated, createShopReview);
router.get('/get-shop-reviews/:shopId', getShopReviews);

// product analytics
router.post('/increment-product-view/:productId', incrementProductView);

export default router;
