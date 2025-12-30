import isAuthenticated from '@packages/middleware/isAuthenticated';
import express, { Router } from 'express';
import { getCategories } from '../controllers/categories.controller';
import {
  createDiscountCode,
  deleteDiscountCode,
  getDiscountCodes,
  incrementDiscountUsage,
  updateDiscountCode,
  validateDiscountCode,
} from '../controllers/discount-codes.controller';
import {
  createProduct,
  deleteDraftProduct,
  deleteProduct,
  deleteProductImage,
  getAllEvents,
  getAllProducts,
  getBrands,
  getDraftProducts,
  getFilteredEvents,
  getFilteredProducts,
  getProductById,
  getRelatedProducts,
  getShopProducts,
  getShopProductStats,
  incrementProductView,
  publishDraftProduct,
  recoverProduct,
  saveProductDraft,
  searchProducts,
  uploadProductImage,
} from '../controllers/products.controller';
import {
  createProductReview,
  createShopReview,
  getProductReviews,
  getShopReviews,
} from '../controllers/reviews.controller';
import { getFilteredShops, getTopShops } from '../controllers/shops.controller';

const router: Router = express.Router();

// product categories
router.get('/get-categories', getCategories);
router.get('/get-brands', getBrands);

// Get all products (public - for customers)
router.get('/get-all-products', getAllProducts);
router.get('/get-filtered-products', getFilteredProducts);
router.get('/get-filtered-offers', getFilteredEvents);
router.get('/get-all-events', getAllEvents);
router.get('/get-filtered-shops', getFilteredShops);
router.get('/get-top-shops', getTopShops);
router.get('/get-product/:identifier', getProductById); // Get by ID or slug
router.get('/get-related-products/:productId', getRelatedProducts);
router.get('/search-products', searchProducts);

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

// recover product
router.put('/recover-product/:id', isAuthenticated, recoverProduct);

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
