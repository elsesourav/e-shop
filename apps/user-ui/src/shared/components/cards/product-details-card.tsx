import { Heart, MapPin, MessageCircleMore, Minus, Plus, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Ratings from '../ratings';
import { formatNumber } from '../../../utils/utils';
import { CartIcon } from '../../../assets/svg';

const ProductDetailsCard = ({
  product,
  setIsOpen,
}: {
  product: any;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [activeImage, setActiveImage] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  const router = useRouter();


  return (
    <div
      className="fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-[#0000001d] z-50"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-[90%] md:w-[70%] md:mt-14 2xl:mt-0 h-max overflow-scroll min-h-[70vh] p-4 md:p-6 bg-white shadow-md rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 h-full">
            <div className="w-full aspect-square mx-auto relative rounded-lg overflow-hidden bg-gray-50">
              <Image
                src={product?.images?.[activeImage]?.url}
                alt={product?.images?.[activeImage]?.url}
                fill
                className="object-contain"
              />
            </div>
            {/* Thumbnail Navigation */}
            <div className="grid grid-cols-8 gap-2 mt-4">
              {product?.images?.map((image: any, index: number) => (
                <div
                  key={index}
                  className={`relative w-full aspect-square cursor-pointer border-2 rounded-md ${
                    index === activeImage
                      ? 'border-gray-900'
                      : 'border-transparent'
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <Image
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover rounded-[inherit]"
                  />
                </div>
              ))}
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
                  ₹{formatNumber(product?.salePrice)}
                </h3>
                <h3 className="text-lg text-gray-600 line-through">
                  ₹{formatNumber(product?.regularPrice)}
                </h3>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-5">
              <div className="flex items-center rounded-md">
                <button
                  className="px-3 cursor-pointer py-2 bg-gray-300 hover:text-gray-400 text-black font-semibold rounded-l-md transition-all duration-200"
                  onClick={() => setQuantity((pre) => Math.max(1, pre - 1))}
                >
                  <Minus size={20} />
                </button>
                <span className="px-4 py-1 min-w-14 text-center bg-gray-100">
                  {quantity}
                </span>
                <button
                  className="px-3 cursor-pointer py-2 bg-gray-300 hover:text-gray-400 text-black font-semibold rounded-r-md transition-all duration-200"
                  onClick={() => setQuantity((pre) => Math.min(99, pre + 1))}
                >
                  <Plus size={20} />
                </button>
              </div>

              <button
                className={`flex px-4 py-2 items-center gap-2 bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-md shadow-md hover:scale-105 transition-all`}
              >
                <CartIcon stroke="#fff" className="size-5" /> Add to Cart
              </button>
              <button className="opacity-70 cursor-pointer hover:scale-105 transition-all">
                <Heart size={34} stroke='transparent' fill="red" />
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
              Estimated Delivery:{" "}
              <strong>{estimatedDelivery.toDateString()}</strong>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetailsCard;
