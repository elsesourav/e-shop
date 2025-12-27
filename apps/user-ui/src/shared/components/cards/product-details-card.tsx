import { Heart, MapPin, MessageCircleMore, Minus, Plus, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CartIcon } from '@src/assets/svg';
import useDeviceTracking from '@src/hooks/useDeviceTracking';
import useLocationTracking from '@src/hooks/useLocationTracking';
import useUser from '@src/hooks/useUser';
import { useStore } from '@src/store';
import { formatPrice } from '@src/utils/utils';
import ImageMagnifier from '../../components/image-magnifier';
import Ratings from '../ratings';

const ProductDetailsCard = ({
  product,
  setIsOpen,
}: {
  product: any;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [activeImage, setActiveImage] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>(
    product?.colors?.[0] || ''
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product?.sizes?.[0] || ''
  );
  const [quantity, setQuantity] = useState<number>(1);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const userInfo = {
    user: user || null,
    location: location,
    deviceInfo: deviceInfo,
  };

  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isInWishlist = wishlist.find((item: any) => item.id === product?.id);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.find((item: any) => item.id === product?.id);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  const router = useRouter();

  const addToCartHandler = () => {
    if (!isInCart && product?.stock > 0) {
      const cartData = {
        ...product,
        quantity,
        selectedOptions: {
          color: selectedColor,
          size: selectedSize,
        },
      };

      addToCart(cartData, userInfo);
    }
  };

  const wishlistHandler = () => {
    if (!isInWishlist) {
      const wishlistData = {
        ...product,
        quantity,
        selectedOptions: {
          color: selectedColor,
          size: selectedSize,
        },
      };
      addToWishlist(wishlistData, userInfo);
    } else {
      removeFromWishlist(product.id, userInfo);
    }
  };

  return (
    <div
      className="fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-[#0000001d] z-50"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-[90%] md:w-[70%] md:mt-14 2xl:mt-0 h-max overflow-scroll min-h-[60vh] p-4 md:p-6 bg-white shadow-md rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 h-full flex gap-4">
            {/* Thumbnail Navigation */}
            <div className="flex flex-col gap-2 w-16 h-full overflow-y-auto scrollbar-hide">
              {product?.images?.map((image: any, index: number) => (
                <div
                  key={index}
                  className={`relative w-full aspect-square cursor-pointer border-2 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                    index === activeImage
                      ? 'border-blue-500 ring-1 ring-blue-500'
                      : 'border-gray-400 hover:border-gray-500'
                  }`}
                  onClick={() => setActiveImage(index)}
                  onMouseEnter={() => setActiveImage(index)}
                >
                  <Image
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className={`object-cover ${
                      activeImage === index &&
                      'rounded-xl outline outline-[30px] outline-blue-500'
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="flex-1 aspect-square relative rounded-lg bg-gray-50 z-10">
              <ImageMagnifier
                src={product?.images?.[activeImage]?.url}
                alt={product?.images?.[activeImage]?.url}
                zoomLevel={3}
                position="left"
                positionOffset={85}
                magnifierWidth={
                  typeof window !== 'undefined' ? window.innerWidth * 0.14 : 0
                }
              />
            </div>
          </div>

          <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
            {/* Seller Info */}
            <div className="border-b relative pb-3 border-gray-200 flex items-center ">
              <div className="flex items-start gap-3">
                {/* Shop Logo */}
                <div className="size-16 my-auto">
                  <Image
                    src={
                      product?.shop?.avatar?.[0]?.url ||
                      'https://ik.imagekit.io/elsesourav/products/purav-logo.jpg?updatedAt=1761671622227'
                    }
                    alt={product?.shop?.name}
                    width={60}
                    height={60}
                    className="rounded-full size-[60px] object-cover"
                  />
                </div>
                <div>
                  <Link
                    href={`/shop/${product?.shop?.id}`}
                    className="text-lg font-medium"
                  >
                    {product?.shop?.name}
                  </Link>

                  {/* Shop Rating */}
                  <span className="block mt-1">
                    <Ratings ratings={product?.shop?.ratings} />
                  </span>

                  {/* Shop Location */}
                  <p className="text-gray-600 mt-1 flex items-center gap-3">
                    <MapPin size={20} />{' '}
                    <span>
                      {product?.shop?.address || 'Address not available'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Chat With Seller Button */}
              <button
                className="flex cursor-pointer font-semibold items-center gap-2 px-4 py-2 absolute right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-105 shadow-inner shadow-blue-500"
                onClick={() =>
                  router.push(`/inbox?shopId=${product?.shop?.id}`)
                }
              >
                <MessageCircleMore size={20} />
                Chat with Seller
              </button>

              <button
                className="w-full cursor-pointer absolute -right-[5px] -top-[5px] flex justify-end my-2 -mt-[10px]"
                onClick={() => setIsOpen(false)}
              >
                <X size={25} />
              </button>
            </div>

            {/* Product Info */}
            <h3 className="text-xl font-semibold mt-3 flex gap-2">
              {product?.brand && (
                <p className="text-blue-950">{product?.brand}</p>
              )}
              {product?.title}
            </h3>

            <p className="text-gray-700 mt-2 whitespace-pre-wrap w-full">
              {product?.description}
            </p>

            {/* Color and Size Selection */}
            <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
              {product?.colors?.length > 0 && (
                <div>
                  <strong>Color:</strong>
                  <div className="flex gap-2 mt-1">
                    {product.colors.map((color: string, index: number) => (
                      <button
                        key={index}
                        className={`size-8 cursor-pointer rounded-full border-2 ${
                          color === selectedColor
                            ? 'border-gray-400 scale-110 shadow-md'
                            : 'border-transparent'
                        }`}
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color }}
                      >
                        <span className="sr-only">{color}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product?.sizes?.length > 0 && (
                <div>
                  <strong>Size:</strong>
                  <div className="flex gap-2 mt-1">
                    {product.sizes.map((size: string, index: number) => (
                      <button
                        key={index}
                        className={`h-8 w-[36px] text-base font-Roboto font-light cursor-pointer rounded-md ${
                          size === selectedSize
                            ? 'bg-gray-800 text-white shadow-md'
                            : 'bg-gray-300 text-black'
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col mt-2">
              {/* Price Section */}
              <div className="flex mt-5 items-center gap-4">
                <h3 className="text-2xl font-semibold text-gray-900">
                  ₹{formatPrice(product?.salePrice, true)}
                </h3>
                <h3 className="text-lg text-gray-600 line-through">
                  ₹{formatPrice(product?.regularPrice, true)}
                </h3>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-5">
              <div className="flex items-center rounded-md">
                <button
                  className="px-3 cursor-pointer py-2 bg-gray-300 hover:text-blue-700 text-black font-semibold rounded-l-md transition-all duration-200"
                  onClick={() => setQuantity((pre) => Math.max(1, pre - 1))}
                >
                  <Minus size={24} />
                </button>
                <span className="px-4 py-2 min-w-14 text-center font-semibold bg-gray-100">
                  {quantity}
                </span>
                <button
                  className="px-3 cursor-pointer py-2 bg-gray-300 hover:text-blue-700 text-black font-semibold rounded-r-md transition-all duration-200"
                  onClick={() => setQuantity((pre) => Math.min(99, pre + 1))}
                >
                  <Plus size={24} />
                </button>
              </div>

              <button
                className={`flex px-4 py-2 items-center gap-2 bg-[#ff5722] text-white font-medium rounded-md shadow-md transition-all ${
                  isInCart
                    ? 'cursor-not-allowed bg-[#ff9c7e]'
                    : 'hover:scale-95 hover:bg-[#e64a19]'
                }`}
                disabled={isInCart || product?.stock === 0}
                onClick={addToCartHandler}
              >
                <CartIcon
                  stroke="white"
                  width={25}
                  height={25}
                  className="group-hover:scale-110 transition"
                />{' '}
                Add to Cart
              </button>
              <button
                className="opacity-70 cursor-pointer hover:scale-105 transition-all"
                onClick={wishlistHandler}
              >
                <Heart
                  size={34}
                  strokeWidth={1}
                  stroke={isInWishlist ? 'red' : '#A00'}
                  fill={isInWishlist ? 'red' : 'transparent'}
                />
              </button>
            </div>

            <div className="mt-3">
              {product?.stock > 0 ? (
                <span className="text-green-600 font-medium">In Stock</span>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>
            <div className="mt-3 text-gray-600 text-sm">
              Estimated Delivery:{' '}
              <strong>{estimatedDelivery.toDateString()}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetailsCard;
