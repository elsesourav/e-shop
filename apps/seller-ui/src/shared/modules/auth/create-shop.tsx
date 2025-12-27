import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import ShopCategories from '@packages/constant/categories';

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string | null;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`,
        data
      );

      return response.data;
    },
    onSuccess: () => {
      setActiveStep(2);
    }
  });

  const onSubmit = (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  }

  const countWords = (text: string) => text.trim().split(/\s+/).length;
    

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-3xl font-semibold text-center mb-2">
          Setup New Shop
        </h3>

        <label
          htmlFor="name"
          className="block text-gray-700 mb-1 text-sm font-medium"
        >
          Name *
        </label>
        <input
          type="text"
          placeholder="Shop Name"
          {...register('name', {
            required: 'Shop name is required',
          })}
          className="w-full px-3 py-2 border border-gray-300 outline-0 rounded-md mb-1"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.name.message)}
          </p>
        )}

        <label
          htmlFor="address"
          className="block text-gray-700 mb-1 text-sm font-medium"
        >
          Address *
        </label>
        <input
          type="text"
          placeholder="Shop Location"
          {...register('address', {
            required: 'Shop address is required',
          })}
          className="w-full px-3 py-2 border border-gray-300 outline-0 rounded-md mb-1"
        />
        {errors.address && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.address.message)}
          </p>
        )}

        <label
          htmlFor="openingHours"
          className="block text-gray-700 mb-1 text-sm font-medium"
        >
          Opening Hours *
        </label>
        <input
          type="text"
          placeholder="e.g., Mon-Fri 9AM-6PM"
          {...register('openingHours', {
            required: 'Shop opening hours are required',
          })}
          className="w-full px-3 py-2 border border-gray-300 outline-0 rounded-md mb-1"
        />
        {errors.openingHours && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.openingHours.message)}
          </p>
        )}

        {/* shop categories */}
        <label
          htmlFor="category"
          className="block text-gray-700 mb-1 text-sm font-medium"
        >
          Category *
        </label>
        <select
          {...register('category', {
            required: 'Shop category is required',
          })}
          className="w-full px-3 py-2 border border-gray-300 outline-0 rounded-md mb-1"
        >
          <option value="">Select a category</option>
          {ShopCategories.map((category, index) => (
            <option key={index} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.category.message)}
          </p>
        )}

        <label
          htmlFor="description"
          className="block text-gray-700 mb-1 text-sm font-medium"
        >
          Description (100 words max) *
        </label>
        <textarea
          rows={4}
          cols={10}
          placeholder="Shop description"
          {...register('description', {
            required: 'Shop description is required',
            validate: (value) =>
              countWords(value) <= 100 || 'Description cannot exceed 100 words',
          })}
          className="w-full px-3 py-2 border border-gray-300 outline-0 rounded-md mb-1 resize-none"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.description.message)}
          </p>
        )}

        <label
          htmlFor="website"
          className="block text-gray-700 mb-1 text-sm font-medium"
        >
          Website
        </label>
        <input
          type="text"
          placeholder="https://www.example.com"
          {...register('website', {
            // required: 'Shop website is required',
            pattern: {
              value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*\/?$/,
              message: 'Invalid website URL',
            },
          })}
          className="w-full px-3 py-2 border border-gray-300 outline-0 rounded-md mb-1"
        />
        {errors.website && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.website.message)}
          </p>
        )}

        <button
          type="submit"
          disabled={shopCreateMutation.isPending}
          className="w-full text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all duration-200 my-4"
        >
          {shopCreateMutation.isPending ? 'Creating shop...' : 'Create Shop'}
        </button>
      </form>
    </div>
  );
};

export default CreateShop;
