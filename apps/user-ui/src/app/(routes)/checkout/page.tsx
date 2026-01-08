'use client';
import CheckoutForm from '@/shared/components/checkout/checkout-form';
import axiosInstance from '@/utils/axiosInstance';
import { Elements } from '@stripe/react-stripe-js';
import { Appearance, loadStripe } from '@stripe/stripe-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const page = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get('sessionId');

  useEffect(() => {
    const fetchSessionAndClientSecret = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        const verifyRes = await axiosInstance.get(
          `order/api/verify-payment-session?sessionId=${sessionId}`
        );

        const { totalAmount, sellers, cart, couponCode } =
          verifyRes.data.session;

        if (
          !sellers ||
          sellers.length === 0 ||
          totalAmount === undefined ||
          totalAmount === null
        ) {
          throw new Error('Invalid payment session data.');
        }

        setCartItems(cart || []);
        setCoupon(couponCode || null);

        const sellerStripeAccountId = sellers[0]?.stripeAccountId;

        const intentRes = await axiosInstance.post(
          'order/api/create-order-intent',
          {
            amount: couponCode?.discountAmount
              ? totalAmount - couponCode.discountAmount
              : totalAmount,
            sellerStripeAccountId,
            sessionId,
          }
        );

        console.log(
          'Intent Response data.clientSecret:',
          intentRes.data.clientSecret
        );

        setClientSecret(intentRes.data.clientSecret);
      } catch (error) {
        console.log(error);
        setError('Something went wrong while processing your payment.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndClientSecret();
  }, [sessionId]);

  const appearance: Appearance = {
    theme: 'stripe',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <h1 className="text-2xl font-bold text-red-500 mb-4">{error}</h1>
        <button
          onClick={() => router.push('/cart')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Go Back to Cart
        </button>
      </div>
    );
  }

  return (
    clientSecret &&
    stripePromise && (
      <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
        <CheckoutForm
          clientSecret={clientSecret}
          cartItems={cartItems}
          couponCode={coupon}
          sessionId={sessionId as string}
        />
      </Elements>
    )
  );
};
export default page;
