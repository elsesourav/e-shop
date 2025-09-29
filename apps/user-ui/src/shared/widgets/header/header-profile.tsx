import Link from 'next/link';
import { ProfileIcon, HeartIcon, CartIcon } from '../../../assets/svg';

const HeaderProfile = () => {
  return (
    <div className="flex items-center gap-8 pd-2">
      <div className="flex items-center gap-2">
        <Link
          href={'/login'}
          className="border-2 size-[50px] border-[#010F1C1A] rounded-full flex items-center justify-center"
        >
          <ProfileIcon />
        </Link>
        <Link href={'/login'}>
          <span className="block font-medium">Hello,</span>
          <span className="block font-semibold">Sign In</span>
        </Link>
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
