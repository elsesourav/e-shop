'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { Clock, Edit, Send, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface DraftProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  regularPrice: number;
  salePrice: number;
  stock: number;
  category: string;
  subCategory: string;
  brand: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    url: string;
    fileId: string;
  }>;
}

const DraftsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch drafts
  const { data, isLoading, error } = useQuery({
    queryKey: ['draft-products'],
    queryFn: async () => {
      const response = await axiosInstance.get(
        '/products/api/get-draft-products'
      );
      return response.data;
    },
  });

  // Delete draft mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/products/api/delete-draft-product/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-products'] });
      toast.success('Draft deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete draft');
    },
  });

  // Publish draft mutation
  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.put(`/products/api/publish-draft-product/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-products'] });
      toast.success('Product published successfully!');
      router.push('/dashboard/all-products');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to publish draft');
    },
  });

  const handleEdit = (slug: string) => {
    router.push(`/dashboard/create-product?draft=${slug}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePublish = (id: string, draft: DraftProduct) => {
    // Check if draft has all required fields
    if (!draft.description || !draft.category || !draft.subCategory) {
      toast.error('Please complete all required fields before publishing');
      handleEdit(draft.slug);
      return;
    }

    if (window.confirm('Are you sure you want to publish this product?')) {
      publishMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading drafts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Failed to load drafts</p>
        </div>
      </div>
    );
  }

  const drafts: DraftProduct[] = data?.drafts || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Drafts</h1>
        <p className="text-gray-600 mt-2">
          Manage your saved product drafts. Complete and publish them when
          ready.
        </p>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No drafts yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Start creating a product and save it as a draft.
          </p>
          <button
            onClick={() => router.push('/dashboard/create-product')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {draft.images?.[0]?.url ? (
                  <Image
                    src={draft.images[0].url}
                    alt={draft.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                  DRAFT
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {draft.title}
                </h3>

                {draft.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {draft.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Price: </span>
                    <span className="font-semibold text-gray-900">
                      ${draft.salePrice || draft.regularPrice || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stock: </span>
                    <span className="font-semibold text-gray-900">
                      {draft.stock || 0}
                    </span>
                  </div>
                </div>

                {draft.category && (
                  <div className="text-xs text-gray-500 mb-3">
                    {draft.category}
                    {draft.subCategory && ` > ${draft.subCategory}`}
                  </div>
                )}

                <div className="text-xs text-gray-400 mb-4">
                  Last saved: {formatDate(draft.updatedAt)}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(draft.slug)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handlePublish(draft.id, draft)}
                    disabled={publishMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:bg-gray-400"
                  >
                    <Send className="w-4 h-4" />
                    Publish
                  </button>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraftsPage;
