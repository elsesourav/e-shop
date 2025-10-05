import express, { Router } from 'express';
import {
  createShop,
  createStripeConnectAccount,
  getLoggedInUser,
  getSeller,
  sellerLogin,
  sellerRegistration,
  sellerVerify,
  userForgotPassword,
  userLogin,
  refreshToken,
  userRegistration,
  userResetPassword,
  userVerify,
  userVerifyForgotPassword,
} from '../controllers/auth.controller';
import isAuthenticated from "./../../../../packages/middleware/isAuthenticated";
import { isSeller } from './../../../../packages/middleware/authorizeRoles';

const router: Router = express.Router();

// User routes
router.post('/user-registration', userRegistration);
router.post('/user-verify', userVerify);
router.post('/user-login', userLogin);
router.get('/logged-in-user', isAuthenticated, getLoggedInUser);
router.post('/user-forgot-password', userForgotPassword);
router.post('/user-verify-forgot-password', userVerifyForgotPassword);
router.post('/user-reset-password', userResetPassword);

// Seller routes
router.post('/seller-registration', sellerRegistration);
router.post('/seller-verify', sellerVerify);
router.post('/create-shop', createShop);
router.post('/create-stripe-account', createStripeConnectAccount);
router.post('/seller-login', sellerLogin);
router.get('/logged-in-seller', isAuthenticated, isSeller, getSeller);

// All routes
router.post('/refresh-token', refreshToken);

export default router;
