import Image from 'next/image';
import { useState } from 'react';

const ProductDetailsCard = ({
  product,
  setIsOpen,
}: {
  product: any;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [activeImage, setActiveImage] = useState<number>(0);
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
            <Image
              src={product?.images?.[activeImage]?.url}
              alt={product?.images?.[activeImage]?.url}
              width={400}
              height={400}
              className="w-full rounded-lg object-contain"
            />
            {/* Thumbnail Navigation */}
            <div className="flex gap-2 mt-4">
              {product?.images?.map((image: any, index: number) => (
                <div
                  key={index}
                  className={`cursor-pointer border-2 rounded-md ${
                    index === activeImage
                      ? 'border-gray-900'
                      : 'border-transparent'
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <Image
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    width={80}
                    height={80}
                    className="rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
            


          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetailsCard;
