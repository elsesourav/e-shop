import ShopCategories from '@packages/constant/categories';
import { ShopType } from '@packages/types';
import { ArrowUpRight, MapPin, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface ShopsCardProps {
  shop: ShopType;
}

const getCategoryLabel = (categoryValue: string) => {
  const category = ShopCategories.find(
    (cat) => cat.value === categoryValue
  );
  return category ? category.label : categoryValue.replace(/_/g, ' ');
}

const ShopCard: FC<ShopsCardProps> = ({ shop }) => {
  console.log(shop);

  return (
    <div className="w-full rounded-md cursor-pointer bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg translate-y-0 hover:-translate-y-[1px] transition-all transition-200">
      {/* Cover */}
      <div className="h-[120px] w-full relative">
        <Image
          src={
            shop?.coverBanner ||
            'https://ik.imagekit.io/elsesourav/products/purav-logo.jpg?updatedAt=1761671622227'
          }
          alt={shop.name}
          fill
          className="object-cover w-full h-full"
        />
      </div>

      {/* Avatar */}
      <div className="relative flex justify-center -mt-8">
        <div className="size-16 rounded-full border-4 border-white overflow-hidden shadow bg-white">
          <Image
            src={
              shop?.avatar?.[0]?.url ||
              'https://ik.imagekit.io/elsesourav/products/purav-logo.jpg?updatedAt=1761671622227'
            }
            alt={shop.name}
            width={64}
            height={64}
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 !pt-2 text-center">
        <h3 className="text-base font-semibold text-gray-800">{shop.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {shop?.followers?.length ?? 0} Followers
        </p>

        {/* Address & Ratings */}
        <div className="flex items-center justify-center text-xs text-gray-500 mt-2 gap-4 flex-wrap">
          {shop?.address && (
            <span className="flex items-center gap-1 max-w-[120px]">
              <MapPin className="size-4 shrink-0" />
              <span className="truncate">{shop.address}</span>
            </span>
          )}

          <span className="flex items-center gap-1">
            <Star className="size-4 shrink-0 text-yellow-500 fill-yellow-400" />
            {shop?.ratings.toFixed(1) || 'N/A'}
          </span>
        </div>

        {/* Categories */}
        {shop?.category && (
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            <span className="bg-blue-50 capitalize text-blue-600 px-2 py-0.5 rounded-full">
              {getCategoryLabel(shop.category)}
            </span>
          </div>
        )}

        {/* Visit Button */}
        <div className="mt-4">
          <Link href={`/shops/${shop.id}`}>
            <button className="inline-flex items-center text-sm text-blue-600 font-medium hover:underline hover:text-blue-700 transition">
              Visit Shop
              <ArrowUpRight className="size-4 ml-1" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ShopCard;
