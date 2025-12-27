'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CartIcon, HeartIcon, ProfileIcon } from '@src/assets/svg';
import useUser from '@src/hooks/useUser';
import { useStore } from '@src/store';

const HeaderProfile = () => {
  const { user, isLoading } = useUser();
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);

  const [wishlistAnimate, setWishlistAnimate] = useState(false);
  const [cartAnimate, setCartAnimate] = useState(false);

  useEffect(() => {
    if (wishlist?.length > 0) {
      setWishlistAnimate(true);
      const timer = setTimeout(() => setWishlistAnimate(false), 600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [wishlist?.length]);

  useEffect(() => {
    if (cart?.length > 0) {
      setCartAnimate(true);
      const timer = setTimeout(() => setCartAnimate(false), 600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [cart?.length]);

  return (
    <div className="flex items-center gap-6 pd-2">
      <div className="flex items-center gap-2">
        {!isLoading && user ? (
          <>
            <Link
              href={'/profile'}
              className="border-2 size-[50px] border-[#010F1C1A] rounded-full flex items-center justify-center"
            >
              <ProfileIcon />
            </Link>
            <Link href={'/profile'} className="min-w-16">
              <span className="block font-medium">Hello,</span>
              <span className="block font-semibold">
                {user?.name?.split(' ')[0]}
              </span>
            </Link>
          </>
        ) : (
          <>
            <Link
              href={'/login'}
              className="border-2 size-[50px] border-[#010F1C1A] rounded-full flex items-center justify-center"
            >
              <ProfileIcon />
            </Link>
            <Link href={'/login'} className="min-w-16">
              <span className="block font-medium">Hello,</span>
              <span className="block font-semibold">
                {isLoading ? '...' : 'Sign In'}
              </span>
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-5">
        <Link href={'/wishlist'} className="relative">
          <HeartIcon
            width={28}
            height={28}
            className={`transition-transform duration-300 [transform-style:preserve-3d] ${
              wishlistAnimate
                ? '[transform:rotateY(180deg)_scale(1.1)]'
                : '[transform:rotateY(180deg)_scale(1.0)]'
            }`}
            fill={wishlistAnimate ? '#f005' : 'transparent'}
          />
          {wishlist?.length > 0 && (
            <div className="h-[22px] px-[6px] min-w-[22px] text-center border border-white bg-red-500/90 shadow-inner shadow-red-800 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] transition-all duration-300">
              <span className="text-white font-medium text-sm">
                {wishlist?.length}
              </span>
            </div>
          )}
        </Link>
        <Link href={'/cart'} className="relative">
          <CartIcon
            width={28}
            height={28}
            className={`transition-transform duration-300 [transform-style:preserve-3d] ${
              cartAnimate
                ? '[transform:rotateY(180deg)_scale(1.1)]'
                : '[transform:rotateY(180deg)_scale(1.0)]'
            }`}
            fill={cartAnimate ? '#f005' : 'transparent'}
          />
          {cart?.length > 0 && (
            <div className="h-[22px] px-[6px] min-w-[22px] text-center border border-white bg-red-500/90 shadow-inner shadow-red-800 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] transition-all duration-300">
              <span className="text-white font-medium text-sm">
                {cart?.length}
              </span>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
};
export default HeaderProfile;
