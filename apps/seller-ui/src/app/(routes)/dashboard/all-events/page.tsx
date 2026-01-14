'use client';
import axiosInstance from '@src/utils/axiosInstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Package,
  Trash,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface EventProduct {
  id: string;
  title: string;
  slug: string;
  salePrice: number;
  regularPrice: number;
  stock: number;
  startingDate: string;
  endingDate: string;
  images: { url: string }[];
  shop: { id: string; name: string };
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

type EventStatus = 'all' | 'active' | 'upcoming' | 'ended';

const AllEventsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<EventStatus>('all');
  const [editingEvent, setEditingEvent] = useState<EventProduct | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventProduct | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch shop events
  const { data, isLoading } = useQuery({
    queryKey: ['shop-events', currentPage, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '12');
      params.append('status', statusFilter);
      const res = await axiosInstance.get(
        `/products/api/get-shop-events?${params.toString()}`
      );
      return res?.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const events: EventProduct[] = data?.events || [];
  const pagination: Pagination = data?.pagination || {
    currentPage: 1,
    totalPages: 0,
    totalEvents: 0,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      startingDate: string;
      endingDate: string;
    }) => {
      const res = await axiosInstance.put(
        `/products/api/update-event/${data.id}`,
        {
          startingDate: data.startingDate,
          endingDate: data.endingDate,
        }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success('Event updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['shop-events'] });
      setEditingEvent(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update event');
    },
  });

  // Remove event mutation
  const removeEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete(
        `/products/api/remove-event/${id}`
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success('Event removed successfully!');
      queryClient.invalidateQueries({ queryKey: ['shop-events'] });
      queryClient.invalidateQueries({ queryKey: ['products-for-event'] });
      setDeletingEvent(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to remove event');
    },
  });

  const onUpdateSubmit = (formData: any) => {
    if (!editingEvent) return;
    updateEventMutation.mutate({
      id: editingEvent.id,
      startingDate: formData.startingDate,
      endingDate: formData.endingDate,
    });
  };

  const handleEditClick = (event: EventProduct) => {
    setEditingEvent(event);
    reset({
      startingDate: new Date(event.startingDate).toISOString().slice(0, 16),
      endingDate: new Date(event.endingDate).toISOString().slice(0, 16),
    });
  };

  const getEventStatus = (start: string, end: string) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now < startDate) {
      return { label: 'Upcoming', color: 'bg-blue-500/20 text-blue-400' };
    } else if (now >= startDate && now <= endDate) {
      return { label: 'Active', color: 'bg-green-500/20 text-green-400' };
    } else {
      return { label: 'Ended', color: 'bg-gray-500/20 text-gray-400' };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDiscountPercentage = (regular: number, sale: number) => {
    if (regular <= 0) return 0;
    return Math.round(((regular - sale) / regular) * 100);
  };

  const statusFilters: { value: EventStatus; label: string }[] = [
    { value: 'all', label: 'All Events' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ended', label: 'Ended' },
  ];

  return (
    <div className="w-full min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-400 mb-6">
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white">All Events</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">All Events</h1>
          <p className="text-gray-400">
            Manage your product events and promotions
          </p>
        </div>
        <Link
          href="/dashboard/create-event"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all"
        >
          <Calendar className="w-5 h-5" />
          Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setStatusFilter(filter.value);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === filter.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-black/30 rounded-xl border border-gray-700">
          <Calendar className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">
            No Events Found
          </h3>
          <p className="text-gray-500 mb-6">
            {statusFilter === 'all'
              ? 'Create your first event to promote your products'
              : `No ${statusFilter} events at the moment`}
          </p>
          <Link
            href="/dashboard/create-event"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Create Event
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => {
              const status = getEventStatus(
                event.startingDate,
                event.endingDate
              );
              return (
                <div
                  key={event.id}
                  className="bg-black/30 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
                >
                  {/* Product Image */}
                  <div className="relative h-40 bg-gray-800">
                    {event.images[0]?.url ? (
                      <Image
                        src={event.images[0].url}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                    >
                      {status.label}
                    </div>
                    {/* Discount Badge */}
                    <div className="absolute top-3 right-3 bg-red-500 px-2 py-1 rounded text-xs font-bold text-white">
                      -
                      {getDiscountPercentage(
                        event.regularPrice,
                        event.salePrice
                      )}
                      %
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 truncate">
                      {event.title}
                    </h3>

                    {/* Prices */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-green-400">
                        ${event.salePrice}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${event.regularPrice}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="space-y-1 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-400" />
                        <span>Start: {formatDate(event.startingDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-400" />
                        <span>End: {formatDate(event.endingDate)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(event)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingEvent(event)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg transition-colors text-sm"
                      >
                        <Trash className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  pagination.hasPrevPage
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-gray-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={!pagination.hasNextPage}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  pagination.hasNextPage
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(40,42,56)] rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Edit Event</h2>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400">Product</p>
              <p className="font-medium text-white truncate">
                {editingEvent.title}
              </p>
            </div>

            <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-4">
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
                    {errors.startingDate.message as string}
                  </p>
                )}
              </div>

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
                    {errors.endingDate.message as string}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateEventMutation.isPending}
                  className="flex-1 py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {updateEventMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Event'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEvent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(40,42,56)] rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Remove Event</h2>
              <button
                onClick={() => setDeletingEvent(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <p className="text-gray-400 mb-2">
              Are you sure you want to remove this event?
            </p>
            <p className="font-medium text-white mb-6">{deletingEvent.title}</p>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-400">
                This will only remove the event dates. The product will still be
                available for purchase.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingEvent(null)}
                className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => removeEventMutation.mutate(deletingEvent.id)}
                disabled={removeEventMutation.isPending}
                className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {removeEventMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove Event'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEventsPage;
