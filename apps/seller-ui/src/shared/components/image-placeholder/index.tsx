import { Pencil, WandSparkles, X } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, useEffect, useState } from 'react';

interface Props {
  size: string;
  small?: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onRemoveImage?: (index: number) => void;
  defaultImage?: string | null;
  setOpenImageModal: (openImageModal: boolean) => void;
  setSelectedImage: (image: string) => void;
  isImageUploading: boolean;
  images: ({
    fileId: string;
    fileUrl: string;
  } | null)[];
  index?: any;
}

const ImagePlaceholder = ({
  size,
  small,
  onImageChange,
  onRemoveImage,
  defaultImage,
  setOpenImageModal,
  setSelectedImage,
  isImageUploading,
  images,
  index,
}: Props) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    defaultImage || null
  );

  useEffect(() => {
    setImagePreview(defaultImage || null);
  }, [defaultImage]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImagePreview(file ? URL.createObjectURL(file) : null);
      onImageChange(file, index!);
    }
  };

  const handleRemoveClick = (i: number) => {
    setImagePreview(null);
    if (onRemoveImage) {
      onRemoveImage(i);
    }
  };

  return (
    <div
      className={`relative w-full cursor-pointer bg-[#1E1E1E] border border-gray-600 rounded-lg flex flex-col justify-center items-center ${
        small ? 'h-[180px]' : 'h-[450px]'
      }`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id={`image-upload-${index}`}
      />

      {imagePreview ? (
        <>
          <button
            type="button"
            disabled={isImageUploading}
            onClick={() => handleRemoveClick?.(index!)}
            className="absolute top-3 right-3 p-2 !rounded bg-red-600 shadow-lg"
          >
            <X size={16} color="white" />
          </button>
          <button
            type="button"
            disabled={isImageUploading}
            className="absolute top-3 right-[70px] p-2 !rounded bg-blue-600 shadow-lg cursor-pointer"
            onClick={() => {
              setOpenImageModal(true);
              setSelectedImage(images[index]?.fileUrl || '');
            }}
          >
            <WandSparkles size={16} color="white" />
          </button>
          <Image
            width={400}
            height={300}
            src={imagePreview}
            alt={`Image preview ${index}`}
            className="w-full h-full object-cover rounded-lg"
          />
        </>
      ) : (
        <>
          <label
            htmlFor={`image-upload-${index}`}
            className="absolute top-3 right-3 p-2 !rounded bg-slate-700 shadow-lg cursor-pointer"
          >
            <Pencil size={16} color="white" />
          </label>
          <p
            className={`text-gray-400 font-semibold ${
              small ? 'text-xl' : 'text-4xl'
            }`}
          >
            {size}
          </p>
          <p
            className={`text-gray-500 pt-2 text-center ${
              small ? 'text-sm' : 'text-lg'
            }`}
          >
            Please chose an image <br />
            according to the aspect ratio
          </p>
        </>
      )}
    </div>
  );
};
export default ImagePlaceholder;
