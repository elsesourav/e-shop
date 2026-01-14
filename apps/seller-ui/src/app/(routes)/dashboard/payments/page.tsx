'use client';
import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFacetedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Search, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';
import Link from 'next/link';
import BreadCrumbs from '@/shared/components/breadcrumbs';

const fetchOrders = async () => {
  const response = await axiosInstance.get('/order/api/get-seller-orders');
  return response.data.orders;
};

const SellerPayments = () => {
  const [globalFilter, setGlobalFilter] = useState<string>('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Order ID',
        cell: ({ row }: any) => (
          <span className="text-white text-sm truncate">
            #{row.original.id.slice(-6).toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: 'user.name',
        header: 'Buyer',
        cell: ({ row }: any) => (
          <span className="text-white">
            {row.original.user?.name || 'Guest'}
          </span>
        ),
      },
      {
        header: 'Seller Earnings',
        cell: ({ row }: any) => {
          const sellerEarnings = row.original.totalAmount * 0.9; // 90% to seller
          return (
            <span className="text-white">₹{sellerEarnings.toFixed(0)}</span>
          );
        },
      },
      {
        header: 'Admin Commission',
        cell: ({ row }: any) => {
          const adminCommission = row.original.totalAmount * 0.1; // Assuming 10% platform fee
          return (
            <span className="text-white">₹{adminCommission.toFixed(0)}</span>
          );
        },
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Status',
        cell: ({ row }: any) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
              row.original.paymentStatus === 'PAID'
                ? 'bg-green-600'
                : 'bg-yellow-500'
            }`}
          >
            {row.original.paymentStatus}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }: any) => {
          const date = new Date(row.original.createdAt);
          return (
            <span className="text-white text-sm">
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </span>
          );
        },
      },
      {
        header: 'Actions',
        cell: ({ row }: any) => (
          <Link
            href={`/orders/${row.original.id}`}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            <Eye size={18} />
          </Link>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: orders || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    globalFilterFn: 'includesString',
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-2">Payments</h2>

      {/* BreadCrumbs */}
      <BreadCrumbs title="Payments" />

      {/* Search Bar */}
      <div className="my-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search Orders"
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table  */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading Orders...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left text-sm font-medium px-4 py-2"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center text-white py-4"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default SellerPayments;
