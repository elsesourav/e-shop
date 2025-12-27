'use client';

import { ProductType } from '@packages/types';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquareText,
  Minus,
  Package,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CartIcon } from '@src/assets/svg';
import useDeviceTracking from '@src/hooks/useDeviceTracking';
import useLocationTracking from '@src/hooks/useLocationTracking';
import useUser from '@src/hooks/useUser';
import { useStore } from '@src/store';
import { formatPrice } from '@src/utils/utils';
import ImageMagnifier from '@src/shared/components/image-magnifier';
import Ratings from '@src/shared/components/ratings';
import ProductCard from '@src/shared/components/cards/product-card';
import axiosInstance from '@src/utils/axiosInstance';

const ProductDetails = ({ product }: { product: ProductType }) => {
  const [currentImage, setCurrentImage] = useState<string>(
    product?.images && product.images.length > 0
      ? product.images[0].url
      : '/default-product-image.jpg'
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>(
    product?.colors?.[0] || ''
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product?.sizes?.[0] || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    product?.salePrice,
    product?.regularPrice,
  ]);
  const [recommendedProducts, setRecommendedProducts] = useState<ProductType[]>(
    []
  );

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

  const fetchRecommendedProducts = async () => {
    try {
      const query = new URLSearchParams();
      query.append('priceMin', priceRange[0].toString());
      query.append('priceMax', priceRange[1].toString());
      query.append('category', product?.category || '');
      query.append('page', '1');
      query.append('limit', '12');

      const response = await axiosInstance.get(
        `/products/api/get-filtered-products?${query.toString()}`
      );

      setRecommendedProducts(response.data.products);
    } catch (error) {
      console.log(product);

      console.log('Error fetching recommended products:', error);
      setRecommendedProducts([]);
    }
  };

  useEffect(() => {
    fetchRecommendedProducts();
  }, [priceRange]);

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const activeThumbnail = scrollRef.current.children[index] as HTMLElement;
      if (activeThumbnail) {
        activeThumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentImage(product.images[newIndex].url);
      scrollToIndex(newIndex);
    }
  };

  const nextImage = () => {
    if (currentIndex < product.images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentImage(product.images[newIndex].url);
      scrollToIndex(newIndex);
    }
  };

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

  const discountPercentage = Math.round(
    ((product?.regularPrice - product?.salePrice) / product?.regularPrice) * 100
  );

  return (
    <div className="w-full bg-[#f5f5f5] py-5">
      <div className="w-[90%] bg-white lg:w-[84%] mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[33fr_43fr_24fr] gap-6">
        {/* Left column - product image */}
        <div className="p-4">
          <div
            ref={containerRef}
            className="relative w-full aspect-square flex items-center justify-center bg-white border border-gray-100"
            style={{ zIndex: 10 }}
          >
            {/* Main Image with zoom */}
            <ImageMagnifier src={currentImage} zoomLevel={3} />
          </div>
          {/* Thumbnail images */}
          <div className="grid grid-cols-[40px_1fr_40px] items-center gap-2 mt-4 w-full">
            <div className="flex justify-center">
              {product?.images?.length > 4 && (
                <button
                  className="bg-white p-2 rounded-full shadow-md border border-gray-100 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={prevImage}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft size={20} />
                </button>
              )}
            </div>

            <div
              ref={scrollRef}
              className="flex gap-2 overflow-x-auto w-full px-1 py-2 scrollbar-hide"
            >
              {product?.images?.map((image: any, index: number) => (
                <div
                  key={index}
                  className={`relative size-16 flex-shrink-0 cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                    index === currentIndex
                      ? 'border-blue-500 ring-1 ring-blue-500'
                      : 'border-gray-400 hover:border-gray-500'
                  }`}
                  onClick={() => {
                    setCurrentImage(image.url);
                    setCurrentIndex(index);
                    scrollToIndex(index);
                  }}
                >
                  <Image
                    src={image?.url || '/default-product-image.jpg'}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className={`object-cover ${
                      currentIndex === index &&
                      'rounded-xl outline outline-[30px] outline-blue-500'
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              {product?.images?.length > 4 && (
                <button
                  className="bg-white p-2 rounded-full shadow-md border border-gray-100 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={nextImage}
                  disabled={currentIndex === product.images.length - 1}
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Middle column - product info */}
        <div className="p-4">
          {/* Product Title & Wishlist */}
          <h1 className="text-xl mb-2 font-medium">{product?.title}</h1>
          <div className="w-full flex items-center justify-between">
            <div className="flex gap-2 mt-2 text-yellow-500">
              <Ratings ratings={product?.ratings} />
              <Link href={`#reviews`} className="text-blue-500 hover:underline">
                (0 Reviews)
              </Link>
            </div>
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

          {/* Product Brand */}
          <div className="py-2 border-b border-gray-200">
            <span className="text-gray-500">
              Brand:
              <span className="pl-2 text-blue-950 font-medium">
                {product?.brand || 'No Brand'}
              </span>
            </span>
          </div>

          {/* Price Section */}
          <div className="mt-3 flex items-center gap-5">
            <span className="text-3xl font-semibold text-gray-900">
              ₹{formatPrice(product?.salePrice, true)}
            </span>
            <span className="text-2xl text-green-600 font-light">
              {discountPercentage}% OFF
            </span>
            <span className="text-2xl text-gray-600 line-through">
              ₹{formatPrice(product?.regularPrice, true)}
            </span>
          </div>

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

          {/* Stock, Quantity and Cart */}
          <div className="mt-8 flex items-center justify-between gap-5">
            <div className="flex items-center gap-4">
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
                  className="px-3 cursor-pointer py-2 bg-gray-300 font-semibold hover:text-blue-700 rounded-r-md transition-all duration-240"
                  onClick={() => setQuantity((pre) => Math.min(99, pre + 1))}
                >
                  <Plus size={24} />
                </button>
              </div>

              <div className="flex items-center text-lg">
                {product?.stock > 0 ? (
                  <div>
                    <span className="text-green-600 font-semibold">
                      In Stock
                    </span>
                    <span className="text-gray-500 font-medium">
                      {' '}
                      ({product?.stock})
                    </span>
                  </div>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </div>
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
          </div>
        </div>

        {/* Right column - Seller info */}
        <div className="bg-[#fafafa] -mt-6">
          <div className="mb-1 p-3 border-b border-b-gray-100">
            <span className="text-sm text-gray-600">Delivery Option</span>
            <div className="flex items-center text-gray-600 gap-1">
              <MapPin size={18} className="ml-[-5px]" />
              <span className="text-lg font-normal">
                {location?.city || 'Your City'},{' '}
                {location?.country_name || 'Your Country'}
              </span>
            </div>
          </div>

          <div className="mb-1 px-3 pb-1 border-b border-b-gray-100">
            <span className="text-sm text-gray-600">Return & Warranty</span>
            <div className="flex items-center text-gray-600 gap-1">
              <Package size={18} className="ml-[-5px]" />
              <span className="text-base font-normal">7 Days Returns</span>
            </div>
            <div className="flex items-center py-2 text-gray-600 gap-1">
              <ShieldCheck size={18} className="ml-[-5px]" />
              <span className="text-base font-normal">
                Warranty not available
              </span>
            </div>
          </div>

          <div className="px-3 py-1">
            {/* Sold by section */}
            <div className="w-[85%] rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600 font-light">
                    Sold by
                  </span>
                  <span className="block max-w-[150px] truncate font-medium text-lg">
                    {product?.shop?.name || 'Unknown Seller'}
                  </span>
                </div>
                <Link
                  href={'#'}
                  className="text-blue-500 text-sm flex items-center gap-1"
                >
                  <MessageSquareText size={18} />
                  Chat Now
                </Link>
              </div>
            </div>

            {/* Seller Performance stats  */}
            <div className="border-t border-t-gray-300 mt-3 pt-3">
              <table className="w-full outline-none text-center">
                <thead className="text-[12px] text-gray-500">
                  <tr>
                    <td>Positive Seller Ratings</td>
                    <td>Ship on Time</td>
                    <td>Chat Response Rate</td>
                  </tr>
                </thead>
                <tbody className="text-lg font-semibold">
                  <tr>
                    <td>90%</td>
                    <td>100%</td>
                    <td>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Go to Store */}
            <div className="text-center mt-4 border-t border-t-gray-200 pt-2">
              <Link
                href={`/shop/${product?.shop?.id}`}
                className="text-blue-500 font-medium text-sm hover:underline"
              >
                GO TO STORE
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[90%] bg-white lg:w-[84%] mx-auto mt-5">
        <div className="min-h-[40vh] h-full p-5">
          <h3 className="text-lg font-semibold">Product Description</h3>

          <div
            className="prose prose-sm text-slate-500 max-w-none"
            dangerouslySetInnerHTML={{
              __html: product?.detailDescription || '',
            }}
          />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="w-[90%] bg-white lg:w-[84%] mx-auto mt-5">
        <div className="min-h-[10vh] h-full p-5">
          <h3 className="text-lg font-semibold">
            Reviews & Ratings of {product?.title}
          </h3>

          <p className="text-center pt-14">No Reviews available yet!</p>
        </div>
      </div>

      {/* Suggestions */}
      <div className="w-[90%] bg-white lg:w-[84%] mx-auto mt-5">
        <div className="w-full h-full my-5 p-5">
          <h3 className="text-xl font-semibold mb-2">
            You may also like these products
          </h3>

          {/* Render recommended products here when available */}
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {recommendedProducts.length === 0 ? (
              <p className="text-center col-span-full">
                No recommended products available.
              </p>
            ) : (
              recommendedProducts?.map((prod: ProductType) => (
                <ProductCard key={prod.id} product={prod} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetails;
