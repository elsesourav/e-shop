'use client';

import Link from 'next/link';
import { CartIcon, HeartIcon, ProfileIcon } from '../../../assets/svg';
import useUser from '../../../hooks/useUser';

const HeaderProfile = () => {
  const { user, isLoading } = useUser();

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
          <HeartIcon />
          <div className="size-6 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
            <span className="text-white font-medium text-sm">0</span>
          </div>
        </Link>
        <Link href={'/cart'} className="relative">
          <CartIcon width={32} height={35} />
          <div className="size-6 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
            <span className="text-white font-medium text-sm">0</span>
          </div>
        </Link>
      </div>
    </div>
  );
};
export default HeaderProfile;
