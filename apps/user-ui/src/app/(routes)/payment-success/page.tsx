'use client';

import { useStore } from '@/store';
import axiosInstance from '@/utils/axiosInstance';
import confetti from 'canvas-confetti';
import { CheckCircle, Loader2, Truck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const paymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const paymentIntent = searchParams.get('payment_intent');
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAndCreateOrder = async () => {
      if (!sessionId || !paymentIntent) {
        setError('Missing payment information');
        setIsProcessing(false);
        return;
      }

      try {
        await axiosInstance.get(
          `/order/api/verify-and-process-payment?payment_intent=${paymentIntent}&sessionId=${sessionId}`
        );

        // Clear cart only after successful order creation
        useStore.setState({ cart: [] });

        // Confetti burst
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
        });

        setIsProcessing(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to process order');
        setIsProcessing(false);
      }
    };

    verifyAndCreateOrder();
  }, [sessionId, paymentIntent]);

  if (isProcessing) {
    return (
      <div className="min-h-[80svh] flex items-center justify-center px-4">
        <div className="text-center bg-white shadow-sm border border-gray-200 rounded-lg max-w-lg p-6">
          <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Processing Your Order...
          </h2>
          <p className="text-sm text-gray-600">
            Please wait while we confirm your payment and create your order.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80svh] flex items-center justify-center px-4">
        <div className="text-center bg-white shadow-sm border border-red-200 rounded-lg max-w-lg p-6">
          <div className="text-red-500 mb-4">
            <CheckCircle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Order Processing Error
          </h2>
          <p className="text-sm text-red-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/cart')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80svh] flex items-center justify-center px-4">
      <div className="text-center bg-white shadow-sm border border-gray-200 rounded-lg max-w-lg p-6">
        <div className="text-green-500 mb-4">
          <CheckCircle className="w-16 h-16 mx-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Payment Successful 🎉
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Thank you for your purchase. Your order has been placed successfully!
        </p>

        <button
          onClick={() => router.push('/profile?active=My+Orders')}
          className="inline-flex gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition focus:outline-2 focus:outline-gray-700"
        >
          <Truck className="size-5" />
          Track Orders
        </button>

        <div className="text-gray-400 mt-8 text-xs">
          Payment Session ID:{' '}
          <span className="font-mono text-gray-700">{sessionId}</span>
        </div>
      </div>
    </div>
  );
};
export default paymentSuccessPage;
