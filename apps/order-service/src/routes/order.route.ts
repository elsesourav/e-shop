import isAuthenticated from '@/packages/middleware/isAuthenticated';
import { Router } from 'express';
import {
  createPaymentIntent,
  createPaymentSession,
  verifyPaymentSession,
} from '../controllers/order.controller';

const router: Router = Router();

router.post('/create-order-intent', isAuthenticated, createPaymentIntent);
router.post('/create-payment-session', isAuthenticated, createPaymentSession);
router.get('/verify-payment-session', isAuthenticated, verifyPaymentSession);

export default router;
