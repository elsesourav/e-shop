'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteDiscountCodeModal from 'apps/seller-ui/src/shared/components/models/delete.discount-code.model';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { AxiosError } from 'axios';
import { ChevronRight, Plus, Trash, X } from 'lucide-react';
import Link from 'next/link';
import Input from 'packages/components/inputs';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ['shop-discounts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/product/api/get-discount-codes');
      return res?.data?.discountCodes || [];
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      type: 'percentage',
      value: 0.0,
      code: '',
    },
  });

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete(
        `/product/api/delete-discount-code/${id}`
      );
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-discounts'] });
      toast.success('Discount code deleted successfully.');
      setShowDeleteModal(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete discount code.'
      );
    },
  })

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post(
        '/product/api/create-discount-code',
        data
      );
      return res?.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shop-discounts'] });
      toast.success('Discount code created successfully.');
      reset();
      setShowModal(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create discount code.'
      );
    },
  });

  const onSubmit = async (data: any) => {
    if (discountCodes.length >= 8) {
      toast.error('You can create up to 8 discount codes.');
      return;
    }
    createDiscountCodeMutation.mutate(data);
  };

  const handleDiscountDelete = async (discount: any) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  };

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">Discount Codes</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Create Discount
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center text-white">
        <Link
          href="/dashboard"
          className="text-sm text-[#80DEEA] cursor-pointer"
        >
          Dashboard
        </Link>
        <ChevronRight size={20} className="opacity-80" />
        <span>Discount Codes</span>
      </div>

      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount Codes
        </h3>
        {isLoading ? (
          <p className="text-gray-400 text-center">Loading Discount...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes?.map((discount: any) => (
                <tr
                  key={discount.id}
                  className="border-b border-gray-700 hover:bg-blue-900 transition"
                >
                  <td className="p-3">{discount?.name}</td>
                  <td className="p-3 capitalize">
                    {discount.type === 'percentage'
                      ? 'Percentage (%)'
                      : 'Flat (₹)'}
                  </td>
                  <td className="p-3">
                    {discount.type === 'percentage'
                      ? `${discount.value}%`
                      : `₹${discount.value}`}
                  </td>
                  <td className="p-3">{discount.code}</td>
                  <td className="p-3 flex justify-center items-center">
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition"
                      onClick={() => handleDiscountDelete(discount)}
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && discountCodes?.length === 0 && (
          <p className="w-full pt-4 block text-gray-400 text-center">
            No Discount Codes Available.
          </p>
        )}
      </div>

      {/* Create Discount Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-[450px] max-w-md">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-xl font-semibold text-white">
                Create Discount Code
              </h3>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowModal(false)}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
              {/* Title */}
              <div className="mt-2">
                <Input
                  label="Title (Public Name)"
                  {...register('name', { required: 'Title is required' })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Type */}
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Discount Type
                </label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full p-3 outline-none bg-transparent rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat (₹)</option>
                    </select>
                  )}
                />
                {errors.type && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>

              {/* Value */}
              <div className="mt-2">
                <Input
                  label="Discount Value"
                  type="number"
                  min={1}
                  {...register('value', {
                    required: 'Value is required',
                  })}
                />
                {errors.value && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.value.message}
                  </p>
                )}
              </div>

              {/* Code */}
              <div className="mt-2">
                <Input
                  label="Discount Code"
                  {...register('code', { required: 'Code is required' })}
                />
                {errors.code && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.code.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={createDiscountCodeMutation.isPending}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md flex items-center justify-center gap-2 transition"
              >
                <Plus size={18} />
                {createDiscountCodeMutation.isPending
                  ? 'Creating...'
                  : 'Create'}
              </button>

              {createDiscountCodeMutation.isError && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  {(
                    createDiscountCodeMutation.error as AxiosError<{
                      message: string;
                    }>
                  )?.response?.data?.message || 'Something went wrong.'}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {
        showDeleteModal && selectedDiscount && (
          <DeleteDiscountCodeModal
            discount={selectedDiscount}
            onClose={() => {
              setShowDeleteModal(false);
            }}
            onConfirm={() => deleteDiscountCodeMutation.mutate(selectedDiscount.id)}
          />
        )
      }
    </div>
  );
};
export default Page;
