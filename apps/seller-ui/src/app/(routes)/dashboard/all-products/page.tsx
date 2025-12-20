'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import DeleteConfirmationModal from 'apps/seller-ui/src/shared/components/models/delete.confirmation.model';
import RecoverConfirmationModal from 'apps/seller-ui/src/shared/components/models/recover.confirmation.model';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import {
  BarChart,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Star,
  Trash,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

// Fetch products with server-side filtering and pagination
const fetchProducts = async (params: {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  order?: string;
  stockStatus?: string;
  showDeleted?: boolean;
  status?: string;
}) => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', params.page.toString());
  queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.order) queryParams.append('order', params.order);
  if (params.stockStatus) queryParams.append('stockStatus', params.stockStatus);
  if (params.showDeleted) queryParams.append('showDeleted', 'true');
  if (params.status) queryParams.append('status', params.status);

  const res = await axiosInstance.get(
    `/products/api/get-shop-products?${queryParams.toString()}`
  );
  return res?.data;
};

// Fetch product stats separately (optimized endpoint)
const fetchProductStats = async () => {
  const res = await axiosInstance.get('/products/api/get-shop-product-stats');
  return res?.data;
};

const ProductList = () => {
  // Search and filter states
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [stockStatus, setStockStatus] = useState<string>('');
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  const [productStatus, setProductStatus] = useState<string>('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  // Modal states
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showRecoverModal, setShowRecoverModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch product stats separately (always visible, not affected by filters)
  const { data: statsData } = useQuery({
    queryKey: ['shop-product-stats'],
    queryFn: fetchProductStats,
    staleTime: 5 * 60 * 1000, // 5 minutes - stats change less frequently
    refetchOnMount: true,
  });

  const stats = statsData?.stats || {
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  };

  // Fetch products with current filters
  const { data, isLoading } = useQuery({
    queryKey: [
      'shop-products',
      currentPage,
      itemsPerPage,
      searchQuery,
      sortBy,
      sortOrder,
      stockStatus,
      showDeleted,
      productStatus,
    ],
    queryFn: () =>
      fetchProducts({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        sortBy,
        order: sortOrder,
        stockStatus,
        showDeleted,
        status: productStatus,
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });

  const products = (data as any)?.products || [];
  const pagination = (data as any)?.pagination || {
    currentPage: 1,
    totalPages: 0,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Handle search with Enter key or button click
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1); // Reset to first page
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle stock status filter
  const handleStockStatusClick = (status: string) => {
    if (stockStatus === status) {
      setStockStatus(''); // Clear filter if clicking the same status
    } else {
      setStockStatus(status);
    }
    setCurrentPage(1); // Reset to first page
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  // Handle sort by change
  const handleSortByChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  // Handle product status change
  const handleProductStatusChange = (newStatus: string) => {
    if (newStatus === 'DELETED') {
      setShowDeleted(true);
      setProductStatus('');
    } else {
      setShowDeleted(false);
      setProductStatus(newStatus);
    }
    setCurrentPage(1);
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSortBy('title');
    setSortOrder('asc');
    setStockStatus('');
    setShowDeleted(false);
    setProductStatus('');
    setCurrentPage(1);
    setItemsPerPage(20);
  };

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await axiosInstance.put(
        `/products/api/delete-product/${productId}`
      );
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      queryClient.invalidateQueries({ queryKey: ['shop-product-stats'] }); // Refresh stats
      toast.success(
        'Product deleted successfully! You can recover it within 1 day.'
      );
      setShowDeleteModal(false);
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete product');
    },
  });

  // Recover product mutation
  const recoverProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await axiosInstance.put(
        `/products/api/recover-product/${productId}`
      );
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      queryClient.invalidateQueries({ queryKey: ['shop-product-stats'] }); // Refresh stats
      toast.success('Product recovered successfully!');
      setShowRecoverModal(false);
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to recover product'
      );
    },
  });

  const handleDeleteClick = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct.id);
    }
  };

  const handleRecoverClick = (product: any) => {
    setSelectedProduct(product);
    setShowRecoverModal(true);
  };

  const handleRecoverConfirm = () => {
    if (selectedProduct) {
      recoverProductMutation.mutate(selectedProduct.id);
    }
  };

  // Calculate hours and minutes left for recovery
  const getTimeLeft = (deletePermanentlyAt: string | Date) => {
    if (!deletePermanentlyAt) return { hours: 0, minutes: 0 };
    const now = new Date().getTime();
    const deleteTime = new Date(deletePermanentlyAt).getTime();
    const totalMinutes = Math.max(
      0,
      Math.floor((deleteTime - now) / (1000 * 60))
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  };

  const handleAnalyticsClick = (product: any) => {
    setSelectedProduct(product);
    setAnalyticsData({
      views: product.viewCount || 0,
      sold: product.soldCount || 0,
      rating: product.ratings || 0,
      reviewsCount: product.reviews?.length || 0,
      stock: product.stock || 0,
      revenue: (product.salePrice * (product.soldCount || 0)).toFixed(2),
    });
    setShowAnalytics(true);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }: any) => {
          const imageUrl = row.original.images?.[0]?.url || '/placeholder.png';
          return (
            <Image
              src={imageUrl}
              alt={row.original.title || 'Product'}
              width={48}
              height={48}
              className="size-12 rounded-md object-cover"
            />
          );
        },
      },
      {
        accessorKey: 'title',
        header: 'Product Name',
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title && row.original.title.length > 30
              ? `${row.original.title.slice(0, 30)}...`
              : row.original.title || 'Untitled';

          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-blue-400 hover:underline transition-all duration-200"
              target="_blank"
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: 'salePrice',
        header: 'Price',
        cell: ({ row }: any) => (
          <div className="flex flex-col">
            <span className="font-semibold">
              ₹{row.original.salePrice?.toFixed(2) || '0.00'}
            </span>
            {row.original.regularPrice > row.original.salePrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{row.original.regularPrice?.toFixed(2)}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }: any) => (
          <span
            className={`font-semibold ${
              row.original.stock >= 10
                ? 'text-green-500'
                : row.original.stock >= 5
                ? 'text-yellow-500'
                : 'text-red-500'
            }`}
          >
            {row.original.stock || 0}
          </span>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }: any) => (
          <div className="flex flex-col text-sm">
            <span className="font-medium">
              {row.original.category || 'N/A'}
            </span>
            <span className="text-gray-400 text-xs">
              {row.original.subCategory || ''}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }: any) => {
          const status = row.original.status || 'ACTIVE';
          const statusColors: any = {
            ACTIVE: 'bg-green-500/20 text-green-400',
            DRAFT: 'bg-yellow-500/20 text-yellow-400',
            PENDING: 'bg-blue-500/20 text-blue-400',
            OUT_OF_STOCK: 'bg-red-500/20 text-red-400',
          };

          return (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                statusColors[status] || statusColors.ACTIVE
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'ratings',
        header: 'Rating',
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" size={16} />
            <span className="text-white font-medium">
              {row.original.ratings?.toFixed(1) || '0.0'}
            </span>
            <span className="text-xs text-gray-400">
              ({row.original.reviews?.length || 0})
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        cell: ({ row }: any) => {
          const isDeleted = row.original.isDeleted;

          return (
            <div className="flex gap-2">
              {!isDeleted && (
                <>
                  <Link
                    href={`/${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                    target="_blank"
                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition"
                    title="View Product"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    href={`/dashboard/edit-product/${row.original.id}`}
                    className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded transition"
                    title="Edit Product"
                  >
                    <Pencil size={18} />
                  </Link>
                  <button
                    onClick={() => handleAnalyticsClick(row.original)}
                    className="p-2 text-green-400 hover:bg-green-400/10 rounded transition"
                    title="View Analytics"
                  >
                    <BarChart size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(row.original)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded transition"
                    title="Delete Product"
                  >
                    <Trash size={18} />
                  </button>
                </>
              )}
              {isDeleted && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRecoverClick(row.original)}
                    disabled={recoverProductMutation.isPending}
                    className="p-2 text-green-400 hover:bg-green-400/10 rounded transition disabled:opacity-50 flex items-center gap-1"
                    title="Recover Product"
                  >
                    <RefreshCw size={18} />
                  </button>
                  {row.original.deletePermanentlyAt &&
                    (() => {
                      const { hours, minutes } = getTimeLeft(
                        row.original.deletePermanentlyAt
                      );
                      return (
                        <span className="text-xs text-orange-400 whitespace-nowrap">
                          {hours > 0 && `${hours}h `}
                          {minutes}m left
                        </span>
                      );
                    })()}
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [
      handleAnalyticsClick,
      handleDeleteClick,
      handleRecoverClick,
      recoverProductMutation.isPending,
      getTimeLeft,
    ]
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full min-h-screen p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">All Products</h2>
        <Link
          href="/dashboard/create-product"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex gap-2 justify-center items-center"
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center mb-4">
        <Link
          href="/dashboard"
          className="text-blue-400 transition hover:text-blue-300 hover:underline cursor-pointer"
        >
          Dashboard
        </Link>
        <ChevronRight size={20} className="text-gray-200" />
        <span className="text-white font-medium">All Products</span>
      </div>

      {/* Stats Summary - Always Visible and Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => handleStockStatusClick('')}
          className={`text-left bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 transition-all hover:bg-blue-900/50 hover:border-blue-600 ${
            stockStatus === '' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <p className="text-blue-400 text-sm mb-1">Total Products</p>
          <p className="text-white text-2xl font-bold">{stats.total || 0}</p>
        </button>
        <button
          onClick={() => handleStockStatusClick('in-stock')}
          className={`text-left bg-green-900/30 border border-green-700/50 rounded-lg p-4 transition-all hover:bg-green-900/50 hover:border-green-600 ${
            stockStatus === 'in-stock' ? 'ring-2 ring-green-500' : ''
          }`}
        >
          <p className="text-green-400 text-sm mb-1">In Stock</p>
          <p className="text-white text-2xl font-bold">{stats.inStock || 0}</p>
        </button>
        <button
          onClick={() => handleStockStatusClick('low-stock')}
          className={`text-left bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 transition-all hover:bg-yellow-900/50 hover:border-yellow-600 ${
            stockStatus === 'low-stock' ? 'ring-2 ring-yellow-500' : ''
          }`}
        >
          <p className="text-yellow-400 text-sm mb-1">Low Stock</p>
          <p className="text-white text-2xl font-bold">{stats.lowStock || 0}</p>
        </button>
        <button
          onClick={() => handleStockStatusClick('out-of-stock')}
          className={`text-left bg-red-900/30 border border-red-700/50 rounded-lg p-4 transition-all hover:bg-red-900/50 hover:border-red-600 ${
            stockStatus === 'out-of-stock' ? 'ring-2 ring-red-500' : ''
          }`}
        >
          <p className="text-red-400 text-sm mb-1">Out of Stock</p>
          <p className="text-white text-2xl font-bold">
            {stats.outOfStock || 0}
          </p>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        {/* Search Bar with Button */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-gray-900 p-3 rounded-lg border border-gray-800">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search by product name, category, or SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-transparent outline-none text-white placeholder-gray-500"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="text-gray-400 hover:text-white transition ml-2"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Search
          </button>
        </div>

        {/* Simple Filters Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries per page (max 100)</span>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Sort by:</span>

            {/* Sort By Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSortByChange(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 outline-none text-sm"
            >
              <option value="title">Name (A-Z)</option>
              <option value="updatedAt">Updated Date</option>
              <option value="salePrice">Price</option>
            </select>

            {/* Toggle Order Button */}
            <button
              onClick={toggleSortOrder}
              className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 hover:bg-gray-700 transition text-sm flex items-center gap-2"
              title={`Currently: ${
                sortOrder === 'asc' ? 'Ascending' : 'Descending'
              }`}
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>

            {/* Product Status Filter */}
            <select
              value={showDeleted ? 'DELETED' : productStatus}
              onChange={(e) => handleProductStatusChange(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 outline-none text-sm"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="DRAFT">Draft</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="DELETED">Deleted Products</option>
            </select>

            {/* Reset Filters Button */}
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 hover:bg-gray-700 transition text-sm flex items-center gap-2"
              title="Reset all filters"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* Results Info */}
        {pagination.totalProducts > 0 && (
          <div className="text-sm text-gray-400 text-center">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, pagination.totalProducts)} of{' '}
            {pagination.totalProducts} products
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto bg-gray-900/50 border border-gray-800 rounded-lg">
        {isLoading ? (
          <div className="text-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading Products...</p>
          </div>
        ) : (
          <table className="w-full text-white">
            <thead className="bg-gray-800/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left p-4 font-semibold text-gray-300"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center p-12 text-gray-400"
                  >
                    {searchQuery
                      ? 'No products found matching your search.'
                      : 'No products available. Create your first product!'}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-gray-800 hover:bg-gray-800/30 transition"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded transition ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && selectedProduct && analyticsData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full border border-gray-700">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
              <h3 className="text-xl font-semibold text-white">
                Product Analytics
              </h3>
              <button
                onClick={() => {
                  setShowAnalytics(false);
                  setSelectedProduct(null);
                  setAnalyticsData(null);
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-medium text-white mb-2">
                {selectedProduct.title}
              </h4>
              <p className="text-gray-400 text-sm">{selectedProduct.slug}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="text-blue-400" size={20} />
                  <p className="text-blue-400 text-sm">Total Views</p>
                </div>
                <p className="text-white text-2xl font-bold">
                  {analyticsData.views}
                </p>
              </div>

              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart className="text-green-400" size={20} />
                  <p className="text-green-400 text-sm">Total Sold</p>
                </div>
                <p className="text-white text-2xl font-bold">
                  {analyticsData.sold}
                </p>
              </div>

              <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="text-yellow-400" size={20} fill="#fde047" />
                  <p className="text-yellow-400 text-sm">Rating</p>
                </div>
                <p className="text-white text-2xl font-bold">
                  {analyticsData.rating.toFixed(1)}
                </p>
              </div>

              <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
                <p className="text-purple-400 text-sm mb-2">Reviews</p>
                <p className="text-white text-2xl font-bold">
                  {analyticsData.reviewsCount}
                </p>
              </div>

              <div className="bg-orange-900/30 border border-orange-700/50 rounded-lg p-4">
                <p className="text-orange-400 text-sm mb-2">Stock</p>
                <p className="text-white text-2xl font-bold">
                  {analyticsData.stock}
                </p>
              </div>

              <div className="bg-teal-900/30 border border-teal-700/50 rounded-lg p-4">
                <p className="text-teal-400 text-sm mb-2">Revenue</p>
                <p className="text-white text-2xl font-bold">
                  ₹{analyticsData.revenue}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <DeleteConfirmationModal
          selectedProduct={selectedProduct}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedProduct(null);
          }}
          onConfirm={handleDeleteConfirm}
          isPending={deleteProductMutation.isPending}
        />
      )}

      {/* Recover Confirmation Modal */}
      {showRecoverModal &&
        selectedProduct &&
        (() => {
          const { hours, minutes } = getTimeLeft(
            selectedProduct.deletePermanentlyAt || new Date()
          );
          return (
            <RecoverConfirmationModal
              selectedProduct={selectedProduct}
              onCancel={() => {
                setShowRecoverModal(false);
                setSelectedProduct(null);
              }}
              onConfirm={handleRecoverConfirm}
              isPending={recoverProductMutation.isPending}
              hoursLeft={hours}
              minutesLeft={minutes}
            />
          );
        })()}
    </div>
  );
};
export default ProductList;
