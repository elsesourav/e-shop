import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { CheckCircle, XCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';

type CheckoutFormProps = {
  clientSecret: string;
  cartItems: Array<any>;
  couponCode?: any;
  sessionId?: string;
};

const CheckoutForm = ({
  clientSecret,
  cartItems,
  couponCode,
  sessionId,
}: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<'success' | 'failed' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const total = cartItems.reduce(
    (sum, item) => sum + item.salePrice * item.quantity,
    0
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setError(null);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(
          submitError.message || 'Payment failed. Please try again.'
        );
        setError('failed');
        return;
      }

      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?sessionId=${sessionId}`,
        },
      });

      if (result.error) {
        setErrorMessage(
          result.error.message || 'Payment failed. Please try again.'
        );
        setError('failed');
      } else {
        setError('success');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80svh] px-4 py-10">
      <form
        className="bg-white w-full max-w-lg p-8 rounded-md shadow space-y-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold mb-2 text-center">
          Secure Payment Checkout
        </h2>

        {/* Dynamic Order Summary */}
        <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-700 space-y-2">
          {cartItems.map((item, index) => (
            <div key={index} className="flex justify-between text-sm pb-1">
              <span>
                {item.title} x {item.quantity}
              </span>
              <span>₹{item.salePrice * item.quantity}</span>
            </div>
          ))}

          <div className="flex justify-between font-semibold pt-2 border-t border-t-gray-200">
            {(couponCode?.discountAmount || 0) > 0 && (
              <>
                <span>Discount</span>
                <span className="text-green-600">
                  - ₹{(couponCode?.discountAmount || 0).toFixed(2)}
                </span>
              </>
            )}
          </div>

          <div className="flex justify-between font-semibold mt-2">
            <span>Total</span>
            <span>
              ₹{(total - (couponCode?.discountAmount || 0)).toFixed(2)}
            </span>
          </div>
        </div>

        <PaymentElement />

        <button
          type="submit"
          disabled={loading || !stripe || !elements}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>

        {errorMessage && (
          <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
            <XCircle className="size-5" />
            {errorMessage}
          </div>
        )}

        {error === 'success' && (
          <div className="flex items-center gap-2 text-green-600 text-sm justify-center">
            <CheckCircle className="size-5" />
            Payment Successful! Thank you for your purchase.
          </div>
        )}

        {error === 'failed' && (
          <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
            <XCircle className="size-5" />
            Payment Failed! Please try again.
          </div>
        )}
      </form>
    </div>
  );
};
export default CheckoutForm;
