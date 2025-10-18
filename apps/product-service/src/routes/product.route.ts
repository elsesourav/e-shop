import express, { Router } from 'express';
import {
  createDiscountCode,
  createProduct,
  deleteDiscountCode,
  deleteProductImage,
  getCategories,
  getDiscountCodes,
  uploadProductImage,
} from '../controllers/product.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';

const router: Router = express.Router();

// product categories
router.get('/get-categories', getCategories);

// discount codes
router.post('/create-discount-code', isAuthenticated, createDiscountCode);
router.get('/get-discount-codes', isAuthenticated, getDiscountCodes);
router.delete('/delete-discount-code/:id', isAuthenticated, deleteDiscountCode);

// product images
router.post('/create-product', isAuthenticated, createProduct);
router.post('/upload-product-image', isAuthenticated, uploadProductImage);
router.delete('/delete-product-image', isAuthenticated, deleteProductImage);

export default router;
