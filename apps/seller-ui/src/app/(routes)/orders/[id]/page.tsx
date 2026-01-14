'use client';

import axiosInstance from '@/utils/axiosInstance';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const STATUS = {
  ORDERED: 'Ordered',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_OF_DELIVERY: 'Out of Delivery',
  DELIVERED: 'Delivered',
}; 

const Page = () => {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const router = useRouter();

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/order/api/get-order-details/${orderId}`
      );
      setOrder(response.data.order);
      console.log(response.data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = event.target.value;
    try {
      setUpdating(true);
      console.log(orderId);
      
      await axiosInstance.put(
        `/order/api/update-order-delivery-status/${orderId}`,
        {
          deliveryStatus: newStatus,
        }
      );
      // Refresh order details after update
      fetchOrderDetails();
    } catch (error) {
      console.error('Error updating delivery status:', error);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40svh]">
        <Loader2 className="size-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[40svh]">
        <p className="text-red-500 mb-4">No order found.</p>
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="flex items-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          <ArrowLeft className="size-4 mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="my-4">
        <span
          className="text-white flex items-center gap-2 font-semibold cursor-pointer hover:text-blue-400 transition-colors hover:underline"
          onClick={() => router.push('/dashboard/orders')}
        >
          <ArrowLeft className="size-4" />
          Go Back to Orders
        </span>
      </div>

      {/* Order Id */}
      <div className="my-4">
        <h2 className="text-xl font-bold text-gray-400">
          Order ID: #{order.id.slice(-8).toUpperCase()}
        </h2>
      </div>

      {/* Status Selector */}
      <div className="mt-8 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-8">
          <label className="text-base font-medium text-gray-300">
            Update Delivery Status:
          </label>
          <select
            value={order.deliveryStatus || STATUS.ORDERED}
            disabled={updating}
            onChange={handleStatusChange}
            className="border border-gray-600 bg-gray-900 text-gray-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {Object.keys(STATUS).map((status, i) => {
              const currentIndex = Object.keys(STATUS).indexOf(
                order.deliveryStatus || STATUS.ORDERED
              );
              const statusIndex = Object.keys(STATUS).indexOf(status);
              return (
                <option
                  key={i}
                  value={status}
                  disabled={statusIndex < currentIndex}
                  className="bg-gray-800 text-gray-200 py-2"
                >
                  {STATUS[status as keyof typeof STATUS]}
                </option>
              );
            })}
          </select>
          {updating && (
            <Loader2 className="size-5 animate-spin text-blue-500" />
          )}
        </div>

        {/* Delivery Progress */}
        <div className="w-full mt-12">
          <div className="flex items-center w-full px-4 relative">
            {Object.keys(STATUS).map((step, i) => {
              const currentStatus = order.deliveryStatus || STATUS.ORDERED;
              const reached = Object.keys(STATUS).indexOf(currentStatus) >= i;
              const current = step === currentStatus;

              return (
                <div
                  key={step}
                  className={`flex items-center relative ${
                    i !== Object.keys(STATUS).length - 1 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`absolute -top-8 left-0 -translate-x-1/2 whitespace-nowrap text-xs font-medium transition-all duration-300 ${
                      current
                        ? 'text-blue-400 font-bold scale-125'
                        : reached
                        ? 'text-green-500'
                        : 'text-gray-500'
                    }`}
                    style={{ left: '0.75rem' }}
                  >
                    {STATUS[step as keyof typeof STATUS]}
                  </div>
                  <div
                    className={`size-6 rounded-full transition-all duration-500 border-2 z-10 ${
                      reached
                        ? 'bg-green-500 border-green-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                        : 'bg-gray-800 border-gray-600'
                    }`}
                  />
                  {i !== Object.keys(STATUS).length - 1 && (
                    <div
                      className={`flex-1 h-2 mx-[-1px] transition-all duration-500 ${
                        reached ? 'bg-green-500' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative w-full">
          {/* Summary Info */}
          <div className="mt-6 space-y-1 text-md text-gray-200">
            <p>
              <span className="font-semibold">Payment Status:</span>{' '}
              <span className="text-cyan-400 font-medium">
                {order.paymentStatus}
              </span>
            </p>

            <p>
              <span className="font-semibold">Total Paid:</span>{' '}
              <span className="text-cyan-400 font-bold">
                ₹{order.totalAmount.toFixed(0)}
              </span>
            </p>

            {order.discountAmount > 0 && (
              <p>
                <span className="font-semibold">Discount Amount:</span>{' '}
                <span className="text-green-600 font-medium">
                  {order.discountAmount.toFixed(2)} (
                  {order.couponCode?.discountType === 'percentage'
                    ? `${order.couponCode?.discountValue}%`
                    : `₹${order.couponCode?.discountValue} off`}
                  )
                </span>
              </p>
            )}

            {order.couponCode && (
              <p>
                <span className="font-semibold">Coupon Used:</span>{' '}
                <span className="text-blue-600 font-medium">
                  {order.couponCode?.name}
                </span>
              </p>
            )}

            <p>
              <span className="font-semibold">Order Date:</span>{' '}
              <span className="text-gray-300 font-medium">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </p>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="mt-6 text-sm text-gray-300">
              <h2 className="font-semibold text-md mb-2">Shipping Address</h2>
              <p>{order.shippingAddress.name}</p>
              <p>
                {order.shippingAddress.address}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zip}
              </p>
              <p>
                {order.shippingAddress.country}, {order.shippingAddress.phone}
              </p>
            </div>
          )}

          {/* Order Items */}
          <div className="mt-6">
            <h2 className="text-lg text-gray-300 font-semibold mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="border border-gray-300 rounded-md p-4 flex items-center gap-4"
                >
                  <Image
                    src={item.product?.images[0]?.url}
                    alt={item.product?.title || 'Product Image'}
                    className="size-16 object-cover rounded-md border border-gray-200"
                    width={64}
                    height={64}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-200">
                      {item.product?.title || 'Unnamed Product'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Quantity: {item.quantity}
                    </p>

                    {item.selectedOptions &&
                      Object.keys(item.selectedOptions).length > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          {Object.entries(item.selectedOptions).map(
                            ([key, value]: [string, any]) =>
                              value && (
                                <span key={key} className="mr-3">
                                  <span className="font-semibold capitalize">
                                    {key}:
                                  </span>{' '}
                                  {value}
                                </span>
                              )
                          )}
                        </div>
                      )}
                  </div>
                  <p className="text-sm font-semibold text-cyan-400">
                    ₹{((item.price || 0) * (item.quantity || 1)).toFixed(0)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Page;
