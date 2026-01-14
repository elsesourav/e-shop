'use client';

import { Calendar, Eye, Package, Pencil, TrendingDown } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

interface ProductCardProps {
  product: {
    id: string;
    slug?: string;
    title: string;
    brand?: string;
    images?: { url: string }[];
    salePrice: number;
    regularPrice: number;
    stock?: number;
    ratings?: number;
    startingDate?: string;
    endingDate?: string;
  };
  isEvent?: boolean;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

/**
 * Formats a number into a localized price string
 */
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Calculates discount percentage
 */
const calculateDiscount = (regular: number, sale: number): number => {
  if (!regular || regular <= sale) return 0;
  return Math.round(((regular - sale) / regular) * 100);
};

const ProductCard = ({
  product,
  isEvent = false,
  showActions = true,
  onEdit,
  onView,
}: ProductCardProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  const discount = useMemo(
    () => calculateDiscount(product.regularPrice, product.salePrice),
    [product.regularPrice, product.salePrice]
  );

  const isLowStock =
    product.stock !== undefined && product.stock <= 5 && product.stock > 0;
  const isOutOfStock = product.stock === 0;

  // Event countdown timer
  useEffect(() => {
    if (!isEvent || !product.endingDate) return;

    const calculateTimeLeft = () => {
      const endTime = new Date(product.endingDate!).getTime();
      const now = Date.now();
      const distance = endTime - now;

      if (distance <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(timer);
  }, [isEvent, product.endingDate]);

  return (
    <div className="group relative bg-gray-800/60 rounded-xl overflow-hidden border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/20">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
        {product.images?.[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <Package className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {isEvent && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-md shadow-lg">
              SALE
            </span>
          )}
          {isLowStock && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-md shadow-lg">
              LOW STOCK
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-600 text-white rounded-md shadow-lg">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded-md shadow-lg flex items-center gap-0.5">
            <TrendingDown className="w-3 h-3" />
            {discount}%
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            {onView && (
              <button
                onClick={() => onView(product.id)}
                className="w-8 h-8 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center text-gray-700 hover:text-blue-600 transition-colors shadow-lg"
                title="View"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(product.id)}
                className="w-8 h-8 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center text-gray-700 hover:text-purple-600 transition-colors shadow-lg"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <h4 className="text-sm font-medium text-white line-clamp-2 mb-2 min-h-[2.5rem] leading-tight">
          {product.brand && (
            <span className="font-bold text-gray-300">{product.brand} </span>
          )}
          {product.title}
        </h4>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-base font-bold text-white">
            ₹{formatPrice(product.salePrice)}
          </span>
          {product.regularPrice > product.salePrice && (
            <span className="text-xs text-gray-500 line-through">
              ₹{formatPrice(product.regularPrice)}
            </span>
          )}
          {discount > 0 && (
            <span className="text-xs font-semibold text-green-400">
              {discount}% off
            </span>
          )}
        </div>

        {/* Event Timer */}
        {isEvent && timeLeft && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <Calendar className="w-3 h-3 text-orange-400" />
            <span
              className={`font-medium ${
                timeLeft === 'Ended' ? 'text-red-400' : 'text-orange-400'
              }`}
            >
              {timeLeft}
            </span>
          </div>
        )}

        {/* Stock indicator */}
        {product.stock !== undefined &&
          product.stock > 0 &&
          product.stock <= 10 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                <span>Stock</span>
                <span>{product.stock} left</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    product.stock <= 3
                      ? 'bg-red-500'
                      : product.stock <= 5
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(product.stock * 10, 100)}%` }}
                />
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default ProductCard;
