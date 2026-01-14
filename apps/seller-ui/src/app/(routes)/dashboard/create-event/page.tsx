'use client';
import axiosInstance from '@src/utils/axiosInstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  ChevronRight,
  Clock,
  Package,
  Search,
  Tag,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  slug: string;
  salePrice: number;
  regularPrice: number;
  stock: number;
  startingDate: string | null;
  endingDate: string | null;
  images: { url: string }[];
}

interface EventFormData {
  productId: string;
  startingDate: string;
  endingDate: string;
}

const CreateEventPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [includeWithEvents, setIncludeWithEvents] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormData>();

  // Fetch products for event selection
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products-for-event', searchQuery, includeWithEvents],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (includeWithEvents) params.append('includeWithEvents', 'true');
      const res = await axiosInstance.get(
        `/products/api/get-products-for-event?${params.toString()}`
      );
      return res?.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const products: Product[] = productsData?.products || [];

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const res = await axiosInstance.post('/products/api/create-event', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Event created successfully!');
      queryClient.invalidateQueries({ queryKey: ['products-for-event'] });
      queryClient.invalidateQueries({ queryKey: ['shop-events'] });
      reset();
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create event');
    },
  });

  const onSubmit = (data: EventFormData) => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    createEventMutation.mutate({
      ...data,
      productId: selectedProduct.id,
    });
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleRemoveProduct = () => {
    setSelectedProduct(null);
  };

  // Calculate discount percentage
  const getDiscountPercentage = (regular: number, sale: number) => {
    if (regular <= 0) return 0;
    return Math.round(((regular - sale) / regular) * 100);
  };

  return (
    <div className="w-full min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-400 mb-6">
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white">Create Event</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Create Event</h1>
        <p className="text-gray-400">
          Set up a limited-time sale or promotional event for your products
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Product Selection */}
        <div className="bg-black/30 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            Select Product
          </h2>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Include products with events toggle */}
          <label className="flex items-center gap-2 mb-4 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={includeWithEvents}
              onChange={(e) => setIncludeWithEvents(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-transparent text-blue-500 focus:ring-blue-500"
            />
            Include products with existing events
          </label>

          {/* Selected Product */}
          {selectedProduct && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-400">
                  Selected Product
                </span>
                <button
                  onClick={handleRemoveProduct}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                {selectedProduct.images[0]?.url ? (
                  <Image
                    src={selectedProduct.images[0].url}
                    alt={selectedProduct.title}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-[60px] h-[60px] bg-gray-700 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">
                    {selectedProduct.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">
                      ${selectedProduct.salePrice}
                    </span>
                    <span className="text-gray-500 line-through">
                      ${selectedProduct.regularPrice}
                    </span>
                    <span className="text-red-400 text-xs">
                      -
                      {getDiscountPercentage(
                        selectedProduct.regularPrice,
                        selectedProduct.salePrice
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {isLoadingProducts ? (
              <div className="text-center py-8 text-gray-400">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No products available</p>
                <p className="text-sm mt-1">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Create products first to add events'}
                </p>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedProduct?.id === product.id
                      ? 'bg-blue-500/20 border border-blue-500/50'
                      : 'bg-gray-800/50 border border-transparent hover:bg-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  {product.images[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.title}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate text-sm">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-green-400">
                        ${product.salePrice}
                      </span>
                      <span className="text-gray-500">
                        Stock: {product.stock}
                      </span>
                      {product.startingDate && (
                        <span className="text-orange-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Has Event
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Event Details */}
        <div className="bg-black/30 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-400" />
            Event Details
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Starting Date */}
            <div>
              <label className="block font-semibold text-gray-300 mb-2">
                Starting Date & Time
              </label>
              <input
                type="datetime-local"
                {...register('startingDate', {
                  required: 'Starting date is required',
                })}
                className="w-full border outline-none border-gray-700 bg-transparent p-3 rounded-lg text-white focus:border-blue-500 transition-colors"
              />
              {errors.startingDate && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.startingDate.message}
                </p>
              )}
            </div>

            {/* Ending Date */}
            <div>
              <label className="block font-semibold text-gray-300 mb-2">
                Ending Date & Time
              </label>
              <input
                type="datetime-local"
                {...register('endingDate', {
                  required: 'Ending date is required',
                })}
                className="w-full border outline-none border-gray-700 bg-transparent p-3 rounded-lg text-white focus:border-blue-500 transition-colors"
              />
              {errors.endingDate && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.endingDate.message}
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-400 mb-1">
                    Event Info
                  </h4>
                  <p className="text-sm text-gray-400">
                    During the event period, your product will be featured in
                    the &quot;Offers&quot; section and will be highlighted to
                    customers. Make sure your stock is sufficient for the
                    increased demand.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedProduct || createEventMutation.isPending}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                selectedProduct && !createEventMutation.isPending
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {createEventMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Event...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  Create Event
                </>
              )}
            </button>
          </form>

          {/* Quick Tips */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Quick Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                Events with longer duration tend to perform better
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                Schedule events during peak shopping hours
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                Combine with discount codes for maximum impact
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
