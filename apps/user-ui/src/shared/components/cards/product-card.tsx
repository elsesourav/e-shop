import Link from 'next/link';
import Ratings from '../ratings';
import { useEffect, useState } from 'react';
import { Eye, Heart } from 'lucide-react';
import ProductDetailsCard from './product-details-card';
import { formatNumber } from '../../../utils/utils';
import { useStore } from '../../../store';
import useUser from '../../../hooks/useUser';
import useLocationTracking from '../../../hooks/useLocationTracking';
import useDeviceTracking from '../../../hooks/useDeviceTracking';
import { CartIcon } from '../../../assets/svg';

const ProductCard = ({
  product,
  isEvent,
}: {
  product: any;
  isEvent?: boolean;
}) => {
  const [tileLeft, setTileLeft] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

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

  useEffect(() => {
    if (isEvent && product?.endingDate) {
      const updateTimer = setInterval(() => {
        const endTime = new Date(product.endingDate).getTime();
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance <= 0) {
          setTileLeft('OFFER ENDED');
          clearInterval(updateTimer);
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((distance / (1000 * 60)) % 60);
        setTileLeft(`${days}d ${hours}h ${minutes}m left with this price`);
      }, 60 * 1000);

      return () => clearInterval(updateTimer);
    }
    return;
  }, [isEvent, product?.endingDate]);

  console.log(product);

  return (
    <div className="w-full min-h-[350px] h-max bg-white rounded-lg relative">
      {isEvent && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          OFFER
        </div>
      )}

      {product?.stock <= 5 && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          LIMITED STOCK
        </div>
      )}

      <Link href={`/product/${product?.slug}`}>
        <img
          src={
            product?.images[0]?.url ||
            'https://www.rallis.com/Upload/Images/thumbnail/Product-inside.png'
          }
          alt={product?.title}
          width={300}
          height={300}
          className="w-full h-[220px] object-cover mx-auto rounded-t-lg"
        />
      </Link>

      <Link
        href={`/shop/${product?.shop?.id}`}
        className="block text-blue-500 text-sm font-medium my-2 px-2"
      >
        {product?.shop?.name}
      </Link>

      <Link href={`/product/${product?.slug}`}>
        <h3 className="text-base text-gray-800 font-semibold px-2 line-clamp-2">
          <span className="font-extrabold">{product?.brand}</span>{' '}
          {product?.title}
        </h3>
      </Link>

      {product?.ratings > 0 && (
        <div className="pt-2 px-2 flex gap-2">
          <span className="font-bold text-sm text-gray-900">
            {product?.ratings?.toFixed(1)}
          </span>
          <Ratings ratings={product?.ratings} />
        </div>
      )}

      <div className="mt-3 flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <span className="font-bold font-lg text-gray-900">
            ₹{formatNumber(product?.salePrice)}
          </span>
          <span className="font-base text-sm text-gray-600 line-through">
            ₹{formatNumber(product?.regularPrice)}
          </span>
          <span className="font-bold text-sm text-gray-900">
            (
            {(
              ((product?.regularPrice - product?.salePrice) /
                product?.regularPrice) *
              100
            )?.toFixed(0)}
            % off)
          </span>
        </div>
      </div>

      {isEvent && tileLeft && (
        <div className="mt-2">
          <span className="text-xs inline-block bg-orange-100 text-red-600 font-semibold">
            {tileLeft}
          </span>
        </div>
      )}

      <div className="absolute z-10 flex flex-col gap-3 right-3 top-3">
        <div
          className="group cursor-pointer bg-white/50 hover:bg-white duration-300 transition-all rounded-full p-[4px] m-[2px] shadow-md"
          onClick={() =>
            isInWishlist
              ? removeFromWishlist(product.id, userInfo)
              : addToWishlist({ ...product, quantity: 1 }, userInfo)
          }
        >
          <Heart
            size={22}
            className="group-hover:scale-110 transition"
            stroke={isInWishlist ? 'red' : '#333'}
            fill={isInWishlist ? 'red' : 'transparent'}
          />
        </div>
        <div className="group cursor-pointer bg-white/50 hover:bg-white duration-300 transition-all rounded-full p-[5px] m-[1px] shadow-md">
          <Eye
            size={22}
            className="group-hover:scale-110 transition"
            onClick={() => setIsOpen(true)}
          />
        </div>
        <div
          className="group grid place-items-center cursor-pointer bg-white/50 hover:bg-white duration-300 transition-all rounded-full p-[4px] shadow-md"
          onClick={() =>
            !isInCart && addToCart({ ...product, quantity: 1 }, userInfo)
          }
        >
          <CartIcon
            width={25}
            height={25}
            stroke={isInCart ? '#700' : '#333'}
            fill={isInCart ? '#ff5722' : 'transparent'}
            className="group-hover:scale-110 transition"
          />
        </div>
      </div>

      {isOpen && <ProductDetailsCard product={product} setIsOpen={setIsOpen} />}
    </div>
  );
};
export default ProductCard;
