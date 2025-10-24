'use client';
import { useQuery } from '@tanstack/react-query';
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder';
import { enhancements } from 'apps/seller-ui/src/utils/ai-enhancements';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { ChevronRight, Wand, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ColorSelector from 'packages/components/color-selector';
import CustomProperties from 'packages/components/custom-properties';
import CustomSpecifications from 'packages/components/custom-specifications';
import Input from 'packages/components/inputs';
import RichTextEditor from 'packages/components/rich-text-editor';
import SizeSelector from 'packages/components/size-selector';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface ImageInterface {
  fileId: string;
  fileUrl: string;
}

const Page = () => {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm();
  const [openImageModal, setOpenImageModal] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [originalImage, setOriginalImage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [images, setImages] = useState<(ImageInterface | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/product/api/get-categories');
        return res.data;
      } catch (error) {
        console.log(error);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const { data: discountCodes = [], isLoading: isLoadingDiscountCodes } =
    useQuery({
      queryKey: ['shop-discounts'],
      queryFn: async () => {
        const res = await axiosInstance.get('/product/api/get-discount-codes', {
          params: { activeOnly: 'true' }, // Only fetch active discount codes
        });
        return res?.data?.discountCodes || [];
      },
    });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};
  const selectedCategory = watch('category');
  const regularPrice = watch('regularPrice');

  const subCategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await axiosInstance.post('/product/api/create-product', data);
      toast.success('Product created successfully!');
      router.push('/dashboard/all-products');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create product');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      const formData = watch();

      // Validate required fields for draft
      if (!formData.title || !formData.slug) {
        toast.error('Title and Slug are required to save draft');
        return;
      }

      // Save draft to backend
      await axiosInstance.post('/product/api/save-product-draft', formData);
      toast.success('Draft saved successfully!');

      // Optionally redirect to drafts page
      // router.push('/dashboard/drafts');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save draft');
      console.log(error);
    } finally {
      setSavingDraft(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;

    setIsImageUploading(true);

    try {
      const base64Image = await convertToBase64(file);
      const response = await axiosInstance.post(
        '/product/api/upload-product-image',
        { image: base64Image }
      );

      const updatedImages = [...images];
      const uploadedImage: ImageInterface = {
        fileId: response.data.fileId,
        fileUrl: response.data.fileUrl,
      };

      updatedImages[index] = uploadedImage;

      if (index === images.length - 1 && images.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue('images', updatedImages);
    } catch (error) {
      console.log(error);
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const updatedImages = [...images];
      const imageToDelete = updatedImages[index];

      if (imageToDelete && typeof imageToDelete === 'object') {
        await axiosInstance.delete('/product/api/delete-product-image', {
          data: { fileId: imageToDelete.fileId! },
        });
      }
      updatedImages.splice(index, 1);

      // Add null placeholder if less than 8 images
      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue('images', updatedImages);
    } catch (error) {
      console.log(error);
    }
  };

  const applyTransformation = async (effect: string) => {
    if (!selectedImage || processing) return;

    setProcessing(true);
    setActiveEffect(effect);

    try {
      const baseUrl = originalImage || selectedImage.split('?')[0];
      const transformedUrl = `${baseUrl}?tr=${effect}`;
      setSelectedImage(transformedUrl);

      if (!originalImage) {
        setOriginalImage(baseUrl);
      }
    } catch (error) {
      console.error('Error applying transformation:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setOriginalImage(imageUrl);
    setActiveEffect(null); // Reset active effect when selecting a new image
  };

  const resetTransformation = () => {
    if (originalImage) {
      setSelectedImage(originalImage);
      setActiveEffect(null);
    }
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
        <Link
          href="/dashboard"
          className="text-sm text-[#80DEEA] cursor-pointer"
        >
          Dashboard
        </Link>
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
              images={images}
              isImageUploading={isImageUploading}
              setSelectedImage={handleSelectImage}
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
                images={images}
                isImageUploading={isImageUploading}
                setSelectedImage={handleSelectImage}
                onImageChange={handleImageChange}
                onRemoveImage={handleRemoveImage}
                defaultImage={img?.fileUrl || null}
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
                  rows={3}
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
                  label="Slugs *"
                  placeholder="product-slug"
                  {...register('slug', {
                    required: 'Separate related product slugs with a comma,',
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        'Invalid slugs format! Use lowercase letters, numbers, and hyphens only.',
                    },
                    minLength: {
                      value: 3,
                      message: 'Slugs must be at least 3 characters long.',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Slugs cannot exceed 50 characters.',
                    },
                  })}
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slug.message as string}
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
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash On Delivery *
                </label>
                <select
                  {...register('cod', { required: 'This field is required' })}
                  className="w-full border outline-none border-gray-700 bg-transparent p-3 rounded-md text-white"
                >
                  <option value="">Select an option</option>
                  <option value="yes" className="bg-black">
                    Yes
                  </option>
                  <option value="no" className="bg-black">
                    No
                  </option>
                </select>
                {errors.cod && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cod.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="w-2/4">
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Category *
                </label>

                {isLoading ? (
                  <p className="text-gray-400">Loading categories...</p>
                ) : isError ? (
                  <p className="text-red-500">Error loading categories</p>
                ) : (
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: 'Category is required' }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category: string) => (
                          <option
                            key={category}
                            value={category}
                            className="bg-black"
                          >
                            {category}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                )}
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.category.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                {
                  <>
                    <label className="block font-semibold text-gray-300 mb-1">
                      Sub Category *
                    </label>
                    <Controller
                      name="subCategory"
                      control={control}
                      rules={{ required: 'Sub Category is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                        >
                          <option value="">Select a sub category</option>
                          {subCategories.map((subCat: string) => (
                            <option
                              key={subCat}
                              value={subCat}
                              className="bg-black"
                            >
                              {subCat}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </>
                }
              </div>

              <div className="mt-2">
                <label
                  htmlFor="detailDescription"
                  className="block font-semibold text-gray-300 mb-1"
                >
                  Detailed Description (min. 100 words) *
                </label>

                <Controller
                  name="detailDescription"
                  control={control}
                  rules={{
                    required: 'Detailed Description is required',
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount >= 100 ||
                        `Detailed Description must be at least 100 words (currently ${wordCount} words)`
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  )}
                />

                {errors.detailDescription && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.detailDescription.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Product Video URL"
                  placeholder="https://www.youtube.com/watch?v=example"
                  {...register('videoUrl', {
                    pattern: {
                      value:
                        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/,
                      message: 'Video URL must be a valid YouTube link',
                    },
                  })}
                />

                {errors.videoUrl && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.videoUrl.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Regular Price *"
                  placeholder="1200"
                  type="number"
                  {...register('regularPrice', {
                    required: 'Regular Price is required',
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: 'Regular Price must be at least 1',
                    },
                    validate: (value) =>
                      !isNaN(value) || 'Only numbers are allowed',
                  })}
                />

                {errors.regularPrice && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.regularPrice.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Sale Price"
                  placeholder="1000"
                  type="number"
                  {...register('salePrice', {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: 'Sale Price must be at least 1',
                    },
                    validate: (value) => {
                      if (isNaN(value)) return 'Only numbers are allowed';
                      if (regularPrice && value >= regularPrice) {
                        return 'Sale Price must be less than Regular Price';
                      }
                      return true;
                    },
                  })}
                />

                {errors.salePrice && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.salePrice.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Stock *"
                  placeholder="100"
                  type="number"
                  {...register('stock', {
                    required: 'Stock  is required',
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: 'Stock  must be at least 1',
                    },
                    max: {
                      value: 10000,
                      message: 'Stock  cannot exceed 10,000',
                    },
                    validate: (value) => {
                      if (isNaN(value)) return 'Only numbers are allowed';
                      if (!Number.isInteger(value))
                        return 'Stock must be whole number';
                      return true;
                    },
                  })}
                />

                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <SizeSelector control={control} errors={errors} />
              </div>

              {/* Discount Codes (optional) */}
              <div className="mt-3">
                <label
                  htmlFor="discountCodes"
                  className="block font-semibold text-gray-300 mb-1"
                >
                  Discount Codes (optional)
                </label>

                {isLoadingDiscountCodes ? (
                  <p className="text-gray-400 text-center">
                    Loading Discount Codes...
                  </p>
                ) : discountCodes.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No active discount codes available. Create one first!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes?.map((discount: any) => {
                      const isExpired =
                        discount.expiresAt &&
                        new Date(discount.expiresAt) < new Date();
                      const isLimitReached =
                        discount.usageLimit &&
                        discount.usageLimit > 0 &&
                        discount.usedCount >= discount.usageLimit;
                      const isDisabled =
                        !discount.isActive || isExpired || isLimitReached;

                      return (
                        <button
                          key={discount.id}
                          type="button"
                          disabled={isDisabled}
                          className={`px-3 py-1 rounded-md text-sm border transition ${
                            watch('discountCodes')?.includes(discount.id)
                              ? 'bg-blue-600 text-white border-blue-400'
                              : isDisabled
                              ? 'bg-gray-900 text-gray-600 border-gray-700 cursor-not-allowed'
                              : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-400'
                          }`}
                          onClick={() => {
                            if (isDisabled) return;
                            const currentSelection =
                              watch('discountCodes') || [];
                            const updatedSelection = currentSelection.includes(
                              discount.id
                            )
                              ? currentSelection.filter(
                                  (id: string) => id !== discount.id
                                )
                              : [...currentSelection, discount.id];
                            setValue('discountCodes', updatedSelection);
                          }}
                          title={
                            isExpired
                              ? 'Expired'
                              : isLimitReached
                              ? 'Usage limit reached'
                              : !discount.isActive
                              ? 'Inactive'
                              : ''
                          }
                        >
                          {discount.code} - {discount.name}{' '}
                          {discount.type === 'percentage'
                            ? `(${discount.value}% off)`
                            : `(₹${discount.value} off)`}
                          {isExpired && ' 🔴'}
                          {isLimitReached && ' ⚠️'}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {openImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-[450px] max-w-md">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-xl font-semibold text-white">
                Enhance Image
              </h3>
              <X
                size={20}
                className="cursor-pointer"
                onClick={() => setOpenImageModal(false)}
              />
            </div>

            <div className="relative w-full h-[250px] flex justify-center items-center rounded-md overflow-hidden border border-gray-600">
              <Image
                src={selectedImage || ''}
                fill
                sizes="(max-width: 768px) 100vw, 450px"
                className="object-contain"
                alt="Image preview"
              />
            </div>
            {selectedImage && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-white text-sm font-semibold">
                    AI Enhancements
                  </h3>
                  {activeEffect && (
                    <button
                      type="button"
                      onClick={resetTransformation}
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-auto">
                  {enhancements?.map(({ label, effect }) => (
                    <button
                      key={effect}
                      type="button"
                      className={`p-2 rounded-md flex items-center gap-2 transition ${
                        activeEffect === effect
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-500'
                      } `}
                      onClick={() => applyTransformation(effect)}
                      disabled={processing}
                    >
                      <Wand size={18} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        {isDirty && (
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={savingDraft}
            className={`px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition ${
              savingDraft ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {savingDraft ? 'Saving...' : 'Save Draft'}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  );
};
export default Page;
