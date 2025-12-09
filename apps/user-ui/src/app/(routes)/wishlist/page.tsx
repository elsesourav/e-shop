'use client';

import { Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import useDeviceTracking from '../../../hooks/useDeviceTracking';
import useLocationTracking from '../../../hooks/useLocationTracking';
import useUser from '../../../hooks/useUser';
import { useStore } from '../../../store';
import { formatNumber } from '../../../utils/utils';

const WishlistPage = () => {
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);

  const increaseQuantity = (productId: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === productId
          ? { ...item, quantity: (item.quantity ?? 1) + 1 }
          : item
      ),
    }));
  };

  const decreaseQuantity = (productId: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };

  const removeItem = (productId: string) => {
    removeFromWishlist(productId, user, location, deviceInfo);
  }

  return (
    <div className="w-full bg-white ">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        {/* Breadcrumb */}
        <div className="pb-[50px]">
          <h1 className="md:pt-[50px] font-medium text-[44px] leading-[1] mb-[16px] font-jost">
            Wishlist
          </h1>
          <Link href={'/'} className="text-[#55585b] hover:underline">
            Home
          </Link>
          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>
          <span className="text-[#55585b]">Wishlist</span>
        </div>

        {/* if wishlist is empty */}
        {wishlist.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            Your wishlist is empty! Start adding products.
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Wishlist items table */}
            <table className="w-full border-collapse">
              <thead className="bg-[#f1f3f4]">
                <tr>
                  <th className="py-3 text-left pl-4">Product</th>
                  <th className="py-3 text-left">Price</th>
                  <th className="py-3 text-left">Quantity</th>
                  <th className="py-3 text-left">Action</th>
                  <th className="py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {wishlist.map((item: any) => (
                  <tr key={item.id} className="border-b border-b-[#0000000e]">
                    <td className="py-4 pl-4 flex items-center gap-4">
                      <Image
                        src={item.images[0]?.url}
                        alt={item.id}
                        width={40}
                        height={40}
                        className="rounded-md aspect-square object-cover"
                      />
                      <span>{item?.title}</span>
                    </td>
                    <td className="px-6 text-lg">
                      ₹{formatNumber(item?.salePrice)}
                    </td>
                    <td>
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
                    <td>
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                        onClick={() =>
                          addToCart(
                            item,
                            item.quantity ?? 1,
                            user,
                            location,
                            deviceInfo
                          )
                        }
                      >
                        Add to Cart
                      </button>
                    </td>
                    <td>
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
          </div>
        )}
      </div>
    </div>
  );
};
export default WishlistPage;
