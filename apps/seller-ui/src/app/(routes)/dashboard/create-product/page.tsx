'use client';
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder';
import { ChevronRight } from 'lucide-react';
import ColorSelector from 'packages/components/color-selector';
import CustomProperties from 'packages/components/custom-properties';
import CustomSpecifications from 'packages/components/custom-specifications';
import Input from 'packages/components/inputs';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const Page = () => {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const handleImageChange = (file: File | null, index: number) => {
    const updatedImages = [...images];
    updatedImages[index] = file;

    if (index === images.length - 1 && images.length < 8) {
      updatedImages.push(null);
    }

    setImages(updatedImages);
    setValue('images', updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      let updatedImages = [...prevImages];

      if (index === -1) {
        updatedImages[0] = null;
      } else {
        updatedImages.splice(index, 1);
      }

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      return updatedImages;
    });
    setValue('images', images);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
    >
      {/* Heading & Breadcrumbs */}
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
        Create Product
      </h2>
      <div className="flex items-center">
        <span className="text-sm text-[#80DEEA] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-80" />
        <span>Create Product</span>
      </div>

      {/* Content Layout */}
      <div className="py-4 w-full flex gap-6">
        {/* Left Side - Image Upload Section */}
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceholder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              small={false}
              index={0}
              onImageChange={handleImageChange}
              onRemoveImage={handleRemoveImage}
            />
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            {images?.slice(1).map((img, index) => (
              <ImagePlaceholder
                key={index}
                setOpenImageModal={setOpenImageModal}
                size="765 x 850"
                small
                index={index + 1}
                onImageChange={handleImageChange}
                onRemoveImage={handleRemoveImage}
                defaultImage={img ? URL.createObjectURL(img) : null}
              />
            ))}
          </div>
        </div>

        {/* Right Side - Form Inputs */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/* Product Title Input */}
            <div className="w-2/4">
              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register('title', {
                  required: 'Product title is required',
                })}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message as string}
                </p>
              )}

              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="short description (max 150 words) *"
                  placeholder="Enter product description for quick view"
                  {...register('description', {
                    required: 'description is required',
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Description cannot exceed 150 words (currently ${wordCount} words)`
                      );
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="apple,flagship,5g"
                  {...register('tags', {
                    required: 'Separate related product tags with a comma,',
                  })}
                />
                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Warranty *"
                  placeholder="1 Year / No Warranty"
                  {...register('warranty', {
                    required: 'Warranty information is required',
                  })}
                />
                {errors.warranty && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.warranty.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Slags *"
                  placeholder="product-slag"
                  {...register('slags', {
                    required: 'Separate related product slags with a comma,',
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        'Invalid slags format! Use lowercase letters, numbers, and hyphens only.',
                    },
                    minLength: {
                      value: 3,
                      message: 'Slags must be at least 3 characters long.',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Slags cannot exceed 50 characters.',
                    },
                  })}
                />
                {errors.slags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slags.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Brand"
                  placeholder="Apple"
                  {...register('brand')}
                />
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.brand.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <ColorSelector control={control} error={errors} />
              </div>

              <div className="mt-2">
                <CustomSpecifications control={control} error={errors} />
              </div>

              <div className="mt-2">
                <CustomProperties control={control} error={errors} />
              </div>

              <div className="mt-2">
                <label className='block font-semibold text-gray-300 mb-1'>Cash On Delivery *</label>
                <select
                  {...register('cod', { required: 'This field is required' })}
                  className="w-full border outline-none border-gray-700 bg-transparent p-3 rounded-md text-white"
                >
                  <option value="">Select an option</option>
                  <option value="yes" className="bg-black">Yes</option>
                  <option value="no" className="bg-black">No</option>
                </select>
                {errors.cod && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cod.message as string}
                  </p>
                )}
              </div>

            </div>

            <div className="w-2/4">
              <label className='block font-semibold text-gray-300 mb-1'>Category *</label>
              
            </div>
          </div>
        </div>
      </div>
      {/* <div className="flex mt-6 justify-end gap-3"></div> */}
    </form>
  );
};
export default Page;
