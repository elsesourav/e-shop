'use client';

import axiosInstance from '@/utils/axiosInstance';
import ConfirmationModal from '@packages/components/confirmation-modal';
import Countries from '@packages/constant/countries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Pencil, Plus, Trash, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const ShippingAddressSection = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: 'Home',
      name: '',
      address: '',
      city: '',
      zpi: '',
      country: 'India',
      phone: '',
      isDefault: true,
    },
  });

  // Add Address Mutation
  const { mutate: addAddress } = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post('/api/add-address', data);
      return res.data.address;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-addresses'] });
      reset();
      setShowModal(false);
      toast.success('Address added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add address');
    },
  });

  // Update Address Mutation
  const { mutate: updateAddress } = useMutation({
    mutationFn: async ({
      addressId,
      data,
    }: {
      addressId: string;
      data: any;
    }) => {
      const res = await axiosInstance.put(
        `/api/update-address/${addressId}`,
        data
      );
      return res.data.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-addresses'] });
      reset();
      setShowModal(false);
      setEditingAddress(null);
      toast.success('Address updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update address');
    },
  });

  // Delete Address Mutation
  const { mutate: deleteAddress } = useMutation({
    mutationFn: async (addressId: string) => {
      await axiosInstance.delete(`/api/delete-address/${addressId}`);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-addresses'] });
      setShowDeleteModal(false);
      setAddressToDelete(null);
      toast.success('Address deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    },
  });

  // Get Address
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['shipping-addresses'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/get-addresses');
      return res.data.addresses;
    },
  });

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      isDefault: data.isDefault === 'true',
    };

    if (addresses && addresses.length === 0 && !editingAddress) {
      payload.isDefault = true;
    }

    if (editingAddress) {
      updateAddress({ addressId: editingAddress.id, data: payload });
    } else {
      addAddress(payload);
    }
  };

  const onModalOpen = () => {
    setEditingAddress(null);
    reset({
      label: 'Home',
      name: '',
      address: '',
      city: '',
      zpi: '',
      country: 'India',
      phone: '',
      isDefault: true,
    });
    setShowModal(true);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Saved Address</h2>
          <button
            onClick={() => onModalOpen()}
            className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
          >
            <Plus className="size-4" />
            Add New Address
          </button>
        </div>

        {/* Address List */}
        <div>
          {addressesLoading ? (
            <p className="text-sm text-gray-500">Loading addresses...</p>
          ) : addresses && addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address: any) => (
                <div
                  key={address.id}
                  className={`border shadow-none hover:shadow-sm transition p-4 rounded-md ${
                    address.isDefault
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="font-semibold text-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="size-4 text-gray-500" />
                      {address.label}{' '}
                      {address.isDefault && (
                        <span className="text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-full ml-2">
                          Default
                        </span>
                      )}
                      {/* Delete and Update */}
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingAddress(address);
                            reset({
                              ...address,
                              isDefault: address.isDefault ? 'true' : 'false',
                            });
                            setShowModal(true);
                          }}
                          className="text-gray-500 hover:text-blue-600"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            setAddressToDelete(address.id);
                            setShowDeleteModal(true);
                          }}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <Trash className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">
                      {address.name} - {address.phone}
                    </p>
                    <p>
                      {address.address}, {address.city}, {address.zpi},{' '}
                      {address.country}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No saved addresses found.</p>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed !inset-0 bg-black bg-opacity-30 flex justify-center items-center z-[100]">
          <div className="bg-white w-full max-w-md p-6 rounded-md shadow-md relative">
            <button className="absolute top-2 right-3 text-gray-500 hover:text-gray-800">
              <X className="size-5" onClick={() => setShowModal(false)} />
            </button>
            <h3 className="font-semibold text-lg mb-4 text-gray-800">
              {editingAddress ? 'Update Address' : 'Add New Address'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <select {...register('label')} className="form-input">
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>

              <input
                placeholder="Name"
                type="text"
                className="form-input"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}

              <input
                placeholder="Phone Number"
                type="text"
                className="form-input"
                {...register('phone', { required: 'Phone Number is required' })}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}

              <textarea
                placeholder="Address (Street and Area)"
                rows={3}
                className="form-input resize-none"
                {...register('address', {
                  required: 'Address is required',
                })}
              />
              {errors.address && (
                <p className="text-xs text-red-500">{errors.address.message}</p>
              )}

              <input
                placeholder="City / District / Town"
                type="text"
                className="form-input"
                {...register('city', { required: 'City is required' })}
              />
              {errors.city && (
                <p className="text-xs text-red-500">{errors.city.message}</p>
              )}

              <input
                placeholder="ZIP Code"
                type="text"
                className="form-input"
                {...register('zpi', { required: 'ZIP Code is required' })}
              />
              {errors.zpi && (
                <p className="text-xs text-red-500">{errors.zpi.message}</p>
              )}

              <select {...register('country')} className="form-input">
                <option value="">Select One</option>
                {Countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>

              {errors.country && (
                <p className="text-xs text-red-500">{errors.country.message}</p>
              )}

              <select {...register('isDefault')} className="form-input">
                <option value="true">Set as Default</option>
                {addresses && addresses.length > 0 && (
                  <option value="false">Set as Non-Default</option>
                )}
              </select>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingAddress ? 'Update Address' : 'Add Address'}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAddressToDelete(null);
        }}
        onConfirm={() => {
          if (addressToDelete) {
            deleteAddress(addressToDelete);
          }
        }}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};
export default ShippingAddressSection;
