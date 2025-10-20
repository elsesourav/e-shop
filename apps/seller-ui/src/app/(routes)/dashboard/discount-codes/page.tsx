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
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      discountName: '',
      discountType: 'percentage',
      discountValue: 0.0,
      discountCode: '',
      minAmount: 0,
      maxAmount: undefined,
      usageLimit: 0,
      expiresAt: '',
      isActive: true,
    },
  });

  const discountType = watch('discountType');

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
  });

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
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Code</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Value</th>
                  <th className="p-3 text-left">Min Order</th>
                  <th className="p-3 text-left">Usage</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discountCodes?.map((discount: any) => {
                  const isExpired =
                    discount.expiresAt &&
                    new Date(discount.expiresAt) < new Date();
                  const isLimitReached =
                    discount.usageLimit &&
                    discount.usageLimit > 0 &&
                    discount.usedCount >= discount.usageLimit;

                  return (
                    <tr
                      key={discount.id}
                      className="border-b border-gray-700 hover:bg-blue-900 transition"
                    >
                      <td className="p-3">{discount?.name}</td>
                      <td className="p-3 font-mono text-sm">{discount.code}</td>
                      <td className="p-3 capitalize">
                        {discount.type === 'percentage'
                          ? 'Percentage'
                          : 'Fixed'}
                      </td>
                      <td className="p-3">
                        {discount.type === 'percentage'
                          ? `${discount.value}%`
                          : `₹${discount.value}`}
                        {discount.maxAmount && (
                          <span className="text-xs text-gray-400 block">
                            Max: ₹{discount.maxAmount}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {discount.minAmount > 0
                          ? `₹${discount.minAmount}`
                          : 'None'}
                      </td>
                      <td className="p-3">
                        {discount.usageLimit > 0
                          ? `${discount.usedCount || 0}/${discount.usageLimit}`
                          : `${discount.usedCount || 0}/∞`}
                      </td>
                      <td className="p-3">
                        {!discount.isActive ? (
                          <span className="text-gray-500 text-xs">
                            Inactive
                          </span>
                        ) : isExpired ? (
                          <span className="text-red-500 text-xs">Expired</span>
                        ) : isLimitReached ? (
                          <span className="text-orange-500 text-xs">
                            Limit Reached
                          </span>
                        ) : (
                          <span className="text-green-500 text-xs">Active</span>
                        )}
                        {discount.expiresAt && !isExpired && (
                          <span className="text-xs text-gray-400 block">
                            Until:{' '}
                            {new Date(discount.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                      <td className="p-3 flex justify-center items-center">
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition"
                          onClick={() => handleDiscountDelete(discount)}
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
                  {...register('discountName', {
                    required: 'Title is required',
                  })}
                />
                {errors.discountName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discountName.message}
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
                  name="discountType"
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
                {errors.discountType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.discountType.message}
                  </p>
                )}
              </div>

              {/* Value */}
              <div className="mt-2">
                <Input
                  label="Discount Value"
                  type="number"
                  min={1}
                  {...register('discountValue', {
                    required: 'Value is required',
                  })}
                />
                {errors.discountValue && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discountValue.message}
                  </p>
                )}
              </div>

              {/* Code */}
              <div className="mt-2">
                <Input
                  label="Discount Code"
                  placeholder="SAVE20"
                  {...register('discountCode', {
                    required: 'Code is required',
                  })}
                />
                {errors.discountCode && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discountCode.message}
                  </p>
                )}
              </div>

              {/* Min Amount */}
              <div className="mt-2">
                <Input
                  label="Minimum Order Amount (₹)"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  {...register('minAmount', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Cannot be negative' },
                  })}
                />
                {errors.minAmount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.minAmount.message}
                  </p>
                )}
              </div>

              {/* Max Amount (for percentage discounts) */}
              {discountType === 'percentage' && (
                <div className="mt-2">
                  <Input
                    label="Maximum Discount Amount (₹) - Optional"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="No limit"
                    {...register('maxAmount', {
                      valueAsNumber: true,
                      min: { value: 0, message: 'Cannot be negative' },
                    })}
                  />
                  {errors.maxAmount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.maxAmount.message}
                    </p>
                  )}
                </div>
              )}

              {/* Usage Limit */}
              <div className="mt-2">
                <Input
                  label="Usage Limit (0 = Unlimited)"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register('usageLimit', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Cannot be negative' },
                  })}
                />
                {errors.usageLimit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.usageLimit.message}
                  </p>
                )}
              </div>

              {/* Expiry Date */}
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  {...register('expiresAt')}
                  className="w-full p-3 outline-none bg-transparent rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.expiresAt && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.expiresAt.message}
                  </p>
                )}
              </div>

              {/* Active Status */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-gray-300 cursor-pointer"
                >
                  Active (Make available immediately)
                </label>
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

      {showDeleteModal && selectedDiscount && (
        <DeleteDiscountCodeModal
          discount={selectedDiscount}
          onClose={() => {
            setShowDeleteModal(false);
          }}
          onConfirm={() =>
            deleteDiscountCodeMutation.mutate(selectedDiscount.id)
          }
        />
      )}
    </div>
  );
};
export default Page;
