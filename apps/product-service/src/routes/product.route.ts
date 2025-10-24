import isAuthenticated from '@packages/middleware/isAuthenticated';
import express, { Router } from 'express';
import {
  createDiscountCode,
  createProduct,
  createProductReview,
  createShopReview,
  deleteDiscountCode,
  deleteDraftProduct,
  deleteProduct,
  deleteProductImage,
  getAllProducts,
  getCategories,
  getDiscountCodes,
  getDraftProducts,
  getProductById,
  getProductReviews,
  getRelatedProducts,
  getShopProducts,
  getShopProductStats,
  getShopReviews,
  incrementDiscountUsage,
  incrementProductView,
  publishDraftProduct,
  saveProductDraft,
  updateDiscountCode,
  uploadProductImage,
  validateDiscountCode,
} from '../controllers/product.controller';

const router: Router = express.Router();

// product categories
router.get('/get-categories', getCategories);

// Get all products (public - for customers)
router.get('/get-all-products', getAllProducts);
router.get('/get-product/:identifier', getProductById); // Get by ID or slug
router.get('/get-related-products/:productId', getRelatedProducts);

// discount codes
router.post('/create-discount-code', isAuthenticated, createDiscountCode);
router.get('/get-discount-codes', isAuthenticated, getDiscountCodes);
router.put('/update-discount-code/:id', isAuthenticated, updateDiscountCode);
router.delete('/delete-discount-code/:id', isAuthenticated, deleteDiscountCode);
router.post('/validate-discount-code', validateDiscountCode);
router.post('/increment-discount-usage', incrementDiscountUsage);

// product images
router.post('/upload-product-image', isAuthenticated, uploadProductImage);
router.delete('/delete-product-image', isAuthenticated, deleteProductImage);

// create product
router.post('/create-product', isAuthenticated, createProduct);

// get seller's shop products
router.get('/get-shop-products', isAuthenticated, getShopProducts);
// get seller's shop product stats
router.get('/get-shop-product-stats', isAuthenticated, getShopProductStats);

// delete product (soft delete)
router.put('/delete-product/:id', isAuthenticated, deleteProduct);

// product drafts
router.post('/save-product-draft', isAuthenticated, saveProductDraft);
router.get('/get-draft-products', isAuthenticated, getDraftProducts);
router.delete('/delete-draft-product/:id', isAuthenticated, deleteDraftProduct);
router.put('/publish-draft-product/:id', isAuthenticated, publishDraftProduct);

// product reviews
router.post('/create-product-review', isAuthenticated, createProductReview);
router.get('/get-product-reviews/:productId', getProductReviews);

// shop reviews
router.post('/create-shop-review', isAuthenticated, createShopReview);
router.get('/get-shop-reviews/:shopId', getShopReviews);

// product analytics
router.post('/increment-product-view/:productId', incrementProductView);

export default router;
