'use client';
import { useRouter } from 'next/navigation';
import useUser from '../../../hooks/useUser';
import useLocationTracking from '../../../hooks/useLocationTracking';
import useDeviceTracking from '../../../hooks/useDeviceTracking';
import Link from 'next/link';
import { useStore } from '../../../store';
import { useState } from 'react';
import Image from 'next/image';
import { Loader2, Minus, Plus } from 'lucide-react';
import { formatNumber } from '../../../utils/utils';

const CartPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const cart = useStore((state: any) => state.cart);
  const [discountedProductId, setDiscountedProductId] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string>('');
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const increaseQuantity = (productId: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === productId
          ? { ...item, quantity: (item.quantity ?? 1) + 1 }
          : item
      ),
    }));
  };

  const decreaseQuantity = (productId: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };

  const removeItem = (productId: string) => {
    removeFromCart(productId, user, location, deviceInfo);
  };

  const subtotal = cart.reduce((total: number, item: any) => {
    const itemTotal = item.salePrice * (item.quantity || 1);
    return total + itemTotal;
  }, 0);

  return (
    <div className="w-full bg-white">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        <div className="pb-[50px]">
          <h1 className="md:pt-[50px] font-medium text-[44px] leading-[1] mb-[16px] font-jost">
            Shopping Cart
          </h1>
          <Link href={'/'} className="text-[#55585b] hover:underline">
            Home
          </Link>
          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>
          <span className="text-[#55585b]">Cart</span>
        </div>

        {/* if cart is empty */}
        {cart.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            Your cart is empty! Start adding products.
          </div>
        ) : (
          <div className="lg:flex items-start gap-10">
            <table className="w-full lg:w-[70%] border-collapse">
              <thead className="bg-[#f1f3f4] rounded">
                <tr>
                  <th className="py-3 text-left pl-4">Product</th>
                  <th className="py-3 text-left">Price</th>
                  <th className="py-3 text-left">Quantity</th>
                  <th className="py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item: any) => (
                  <tr key={item.id} className="border-b border-b-[#0000000e]">
                    <td className="flex items-center gap-4 p-4">
                      <Image
                        src={item.images[0]?.url}
                        alt={item.id}
                        width={40}
                        height={40}
                        className="rounded-md aspect-square object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.title}</span>
                        {item.selectedOptions && (
                          <div className="text-sm text-gray-500">
                            {item.selectedOptions?.color && (
                              <span>
                                Color: {}
                                <span
                                  style={{
                                    backgroundColor: item.selectedOptions.color,
                                    width: '12px',
                                    height: '12px',
                                    display: 'inline-block',
                                    borderRadius: '100%',
                                    marginLeft: '4px',
                                    verticalAlign: 'middle',
                                  }}
                                />
                              </span>
                            )}
                            {item.selectedOptions?.size && (
                              <span className="ml-2">
                                Size: {item.selectedOptions.size}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 text-lg">
                      {item.id === discountedProductId ? (
                        <div className="flex flex-col items-center">
                          <span className="line-through text-gray-500">
                            ₹{formatNumber(item.salePrice)}
                          </span>{' '}
                          <span className="text-green-600 font-semibold">
                            ₹
                            {formatNumber(
                              (item.salePrice * (100 - discountPercent)) / 100
                            )}
                          </span>
                          <span className="text-xs text-green-700 bg-white rounded px-1">
                            Discount Applied
                          </span>
                        </div>
                      ) : (
                        <span className="">₹{formatNumber(item.salePrice)}</span>
                      )}
                    </td>
                    <td className="">
                      <div className="flex items-center justify-center border border-gray-200 rounded-[20px] w-[90px] p-[2px]">
                        <button
                          className="text-black cursor-pointer"
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          <Minus className="size-5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200" />
                        </button>
                        <span className="px-4 w-[40px]">{item?.quantity}</span>
                        <button
                          className="text-black cursor-pointer"
                          onClick={() => increaseQuantity(item.id)}
                        >
                          <Plus className="size-5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200" />
                        </button>
                      </div>
                    </td>
                    <td className="text-center">
                      <button
                        className="text-[#818487] cursor-pointer hover:text-red-600 transition duration-200"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-6 shadow-md w-full lg:w-[30%] bg-[#f9f9f9] rounded-lg">
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-[#010f1c] text-base font-medium pb-1">
                  <span className="font-jost">
                    Discount ({discountPercent}%)
                  </span>
                  <span className="text-green-600">
                    - ₹{formatNumber(discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-[#010f1c] text-[20px] font-[550] pb-3">
                <span className="font-jost">Subtotal</span>
                <span>₹{formatNumber(subtotal - discountAmount)}</span>
              </div>
              <hr className="my-4 text-slate-200" />
              <div className="mb-4">
                <h4 className="mb-[7px] font-[500] text-[15px]">
                  Have a Coupon?
                </h4>
                <div className="flex">
                  <input
                    type="text"
                    name="coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="w-full p-2 border border-gray-200 rounded-l-md focus:outline-none focus:border-blue-500"
                  />
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors duration-200"
                    // onClick={() => couponCodeApplyHandler()}
                  >
                    Apply
                  </button>
                  {/* {error && (
                      <p className='text-sm pt-2 text-red-500'>{error}</p>
                    )} */}
                </div>
              </div>

              <hr className="my-4 text-slate-200" />

              <div className="mb-4">
                <h4 className="mb-[7px] font-medium text-[15px]">
                  Select Shipping Address
                </h4>
                <select
                  name="address"
                  className="w-full p-2 border border-gray-200 rounded-l-md focus:outline-none focus:border-blue-500"
                  value={selectedAddressId}
                >
                  <option value="address-x">Home - West Bengal - 700XXX</option>
                </select>
              </div>

              <hr className="my-4 text-slate-200" />

              <div className="mb-">
                <h4 className="mb-[7px] font-[500] text-[15px]">
                  Select Payment Method
                </h4>
                <select className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500">
                  <option value="credit_card">Online Payment</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>

              <hr className="my-4 text-slate-200" />

              <div className="flex justify-between items-center text-[#010f1c] font-[550] pb-3">
                <span className="font-jost">Total</span>
                <span>₹{formatNumber(subtotal - discountAmount)}</span>
                </div>
                
                <button
                  disabled={loading}
                  className='flex w-full items-center justify-center gap-2 cursor-pointer mt-4 py-3 bg-[#010f1c] text-white hover:bg-[#0989ff] transition-all rounded-lg'
                >
                  {loading && <Loader2 className='animate-spin size-5' />}
                  {loading ? 'Redirecting...' : 'Proceed to Checkout'}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CartPage;
