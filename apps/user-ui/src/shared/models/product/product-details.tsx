'use client';

import { ProductType } from '@/packages/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import ImageMagnifier from '../../components/image-magnifier';

const ProductDetails = ({ product }: { product: ProductType }) => {
  const [currentImage, setCurrentImage] = useState<string>(
    product?.images && product.images.length > 0
      ? product.images[0].url
      : '/default-product-image.jpg'
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHoverInteraction = useRef(false);

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

  useEffect(() => {
    if (isHoverInteraction.current) return;
    scrollToIndex(currentIndex);
  }, [currentIndex]);

  const prevImage = () => {
    if (currentIndex > 0) {
      isHoverInteraction.current = false;
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentImage(product.images[newIndex].url);
    }
  };

  const nextImage = () => {
    if (currentIndex < product.images.length - 1) {
      isHoverInteraction.current = false;
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentImage(product.images[newIndex].url);
    }
  };

  return (
    <div className="w-full bg-[#f5f5f5] py-5">
      <div className="w-[90%] bg-white lg:w-[84%] mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[33%_43%_24%] gap-6">
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
                  className={`relative size-16 flex-shrink-0 bg-white rounded-lg cursor-pointer border-2 overflow-hidden transition-all ${
                    currentIndex === index
                      ? 'border-blue-500 ring-1 ring-blue-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    isHoverInteraction.current = false;
                    setCurrentImage(image.url);
                    setCurrentIndex(index);
                    scrollToIndex(index);
                  }}
                  onMouseEnter={() => {
                    isHoverInteraction.current = true;
                    setCurrentImage(image.url);
                    setCurrentIndex(index);
                  }}
                >
                  <Image
                    src={image?.url || '/default-product-image.jpg'}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
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
      </div>
    </div>
  );
};
export default ProductDetails;
