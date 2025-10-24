'use client';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BarChart,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Search,
  Star,
  Trash,
} from 'lucide-react';

const fetchProducts = async () => {
  const res = await axiosInstance.post('/product/api/get-all-products');
  return res?.data?.products;
};
const ProductList = () => {
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['shop-products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const columns = useMemo(() => [
    {
      accessorKey: 'image',
      header: 'Image',
      cell: ({ row }: any) => (
        <Image
          src={row.original.image}
          alt={row.original.name}
          className="size-12 rounded-md object-cover"
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }: any) => {
        const truncatedTitle =
          row.original.name.length > 25
            ? `${row.original.name.slice(0, 25)}...`
            : row.original.name;

        return (
          <Link
            href={`${process.env.NEXT_PUBLIC_SERVER_URI}/product/${row.original.slug}`}
            className="text-blue-400 hover:underline transition-all duration-200"
          >
            {truncatedTitle}
          </Link>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }: any) => <span>₹{row.original.salePrice.toFixed(2)}</span>,
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }: any) => (
        <span
          className={
            row.original.stock >= 5 ? 'text-green-500' : 'text-red-500'
          }
        >
          {row.original.stock}
        </span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }: any) => (
        <span>
          {row.original.category} | {row.original.subcategory}
        </span>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1 text-yellow-400">
          <Star fill="#fde047" size={18} />{' '}
          <span className="text-white">{row.original.rating || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex gap-3">
          <Link
            href={`/product/${row.original.id}`}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            <Eye size={18} />
          </Link>
          <Link
            href={`/product/edit/${row.original.id}`}
            className="text-yellow-400 hover:text-yellow-300 transition"
          >
            <Pencil size={18} />
          </Link>
          <button className="text-green-400 hover:text-green-300 transition">
            <BarChart size={18} />
          </button>
          <button className="text-red-400 hover:text-red-300 transition">
            <Trash size={18} />
          </button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: products,
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
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

      {/* Search Bar */}
      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search products..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full bg-transparent outline-none text-white placeholder-gray-500"
        />
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto bg-black/50 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading Products...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="text-left p-3">
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
                    className="text-center p-6 text-gray-400"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3 align-middle">
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
    </div>
  );
};
export default ProductList;
