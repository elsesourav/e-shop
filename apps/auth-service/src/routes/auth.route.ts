import { isSeller } from '@packages/middleware/authorizeRoles';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import express, { Router } from 'express';
import {
  addUserAddress,
  createShop,
  createStripeConnectAccount,
  deleteUserAddress,
  getLoggedInUser,
  getSeller,
  getUserAddresses,
  logoutSeller,
  logoutUser,
  refreshToken,
  sellerLogin,
  sellerRegistration,
  sellerVerify,
  updateUserAddress,
  userForgotPassword,
  userLogin,
  userRegistration,
  userResetPassword,
  userVerify,
  userVerifyForgotPassword,
} from '../controllers/auth.controller';

const router: Router = express.Router();

// User routes
router.post('/user-registration', userRegistration);
router.post('/user-verify', userVerify);
router.post('/user-login', userLogin);
router.get('/logged-in-user', isAuthenticated, getLoggedInUser);
router.post('/user-forgot-password', userForgotPassword);
router.post('/user-verify-forgot-password', userVerifyForgotPassword);
router.post('/user-reset-password', userResetPassword);
router.post('/user-logout', isAuthenticated, logoutUser);
router.post('/add-address', isAuthenticated, addUserAddress);
router.put('/update-address/:addressId', isAuthenticated, updateUserAddress);
router.delete('/delete-address/:addressId', isAuthenticated, deleteUserAddress);
router.get('/get-addresses', isAuthenticated, getUserAddresses);

// Seller routes
router.post('/seller-registration', sellerRegistration);
router.post('/seller-verify', sellerVerify);
router.post('/create-shop', createShop);
router.post('/create-stripe-account', createStripeConnectAccount);
router.post('/seller-login', sellerLogin);
router.get('/logged-in-seller', isAuthenticated, isSeller, getSeller);
router.post('/seller-logout', isAuthenticated, isSeller, logoutSeller);

// All routes
router.post('/refresh-token', refreshToken);

export default router;
