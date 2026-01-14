import isAuthenticated from '@/packages/middleware/isAuthenticated';
import { Router } from 'express';
import {
  createPaymentIntent,
  createPaymentSession,
  getOrderDetails,
  getSellerOrders,
  updateOrderDeliveryStatus,
  verifyAndProcessPayment,
  verifyPaymentSession,
} from '../controllers/order.controller';
import { isSeller } from '@/packages/middleware/authorizeRoles';

const router: Router = Router();

router.post('/create-order-intent', isAuthenticated, createPaymentIntent);
router.post('/create-payment-session', isAuthenticated, createPaymentSession);
router.get('/verify-payment-session', isAuthenticated, verifyPaymentSession);
router.get(
  '/verify-and-process-payment',
  isAuthenticated,
  verifyAndProcessPayment
);
router.get('/get-seller-orders', isAuthenticated, getSellerOrders);
router.get('/get-order-details/:id', isAuthenticated, getOrderDetails);
router.put(
  '/update-order-delivery-status/:id',
  isAuthenticated,
  isSeller,
  updateOrderDeliveryStatus
);

export default router;
