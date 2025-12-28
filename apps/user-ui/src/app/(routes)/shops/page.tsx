'use client';

import ShopCard from '@/shared/components/cards/shops-card';
import Pagination from '@packages/components/pagination';
import ShopCategories from '@packages/constant/categories';
import Countries from '@packages/constant/countries';
import axiosInstance from '@src/utils/axiosInstance';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Products = () => {
  const router = useRouter();

  const [isShopsLoading, setIsShopsLoading] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [shops, setShops] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);

  const getSearchParamsURL = () => {
    const query = new URLSearchParams();
    if (selectedCategories.length > 0)
      query.append('categories', selectedCategories.join(','));
    if (selectedCountries.length > 0)
      query.append('countries', selectedCountries.join(','));
    query.append('page', page.toString());
    query.append('limit', '12');
    return query.toString();
  };

  const updateURL = () => {
    const query = getSearchParamsURL();
    router.replace(`/shops?${decodeURIComponent(query)}`);
  };

  const fetchFilteredShops = async () => {
    setIsShopsLoading(true);
    try {
      const params = {
        categories:
          selectedCategories.length > 0
            ? selectedCategories.join(',')
            : undefined,
        countries:
          selectedCountries.length > 0
            ? selectedCountries.join(',')
            : undefined,
        page,
        limit: 12,
      };

      const response = await axiosInstance.get(
        `/products/api/get-filtered-shops`,
        { params }
      );
      
      setShops(response.data.shops);
      setTotalPages(response.data.pagination.totalPages);
      setIsShopsLoading(false);
    } catch (error) {
      console.error('Error fetching filtered shops:', error);
    } finally {
      setIsShopsLoading(false);
    }
  };

  useEffect(() => {
    updateURL();
    fetchFilteredShops();
  }, [page, selectedCategories, selectedCountries]);

  const toggleCategory = (category: string) => {
    setPage(1); // Reset to first page on filter change
    setSelectedCategories((prevCategories) => {
      if (prevCategories.includes(category)) {
        return prevCategories.filter((cat) => cat !== category);
      } else {
        return [...prevCategories, category];
      }
    });
  };

  const toggleCountry = (country: string) => {
    setPage(1); // Reset to first page on filter change
    setSelectedCountries((prevCountries) => {
      if (prevCountries.includes(country)) {
        return prevCountries.filter((c) => c !== country);
      } else {
        return [...prevCountries, country];
      }
    });
  };

  return (
    <div className="w-full bg-[#f5f5f5] pb-10">
      <div className="w-[90%] lg:w-[84%] m-auto">
        <div className="pb-[50px]">
          <h1 className="md:pt-[40px] font-semibold text-[44px] leading-1 mb-[14px] font-jost">
            All Shops
          </h1>

          <Link href="/" className="text-[#55585b] hover:underline">
            Home
          </Link>
          <span className="inline-block p-[2px] mx-1 my-1 bg-[#a8acb0] rounded-full" />
          <span className="text-[#55585b]">All Shops</span>
        </div>

        <div className="w-full flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-[270px] bg-white !rounded p-4 space-y-6 shadow-md h-fit">
            {/* Categories */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1">
              Categories
            </h3>
            <div className="max-h-[300px] !mt-4 overflow-y-auto custom-scrollbar pr-2">
              <ul className="space-y-2">
                {ShopCategories.map(
                  (category: { label: string; value: string }) => (
                    <li
                      key={category.value}
                      className="flex items-center justify-between"
                    >
                      <label className="flex items-center gap-3 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="accent-blue-600"
                          value={category.value}
                          checked={selectedCategories.includes(category.value)}
                          onChange={(e) => toggleCategory(category.value)}
                        />
                        {category.label}
                      </label>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Categories */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1 mt-2">
              Categories
            </h3>
            <div className="max-h-[300px] !mt-4 overflow-y-auto custom-scrollbar pr-2">
              <ul className="space-y-2">
                {Countries.map((country) => (
                  <li
                    key={country.code}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="accent-blue-600"
                        value={country.code}
                        checked={selectedCountries.includes(country.code)}
                        onChange={() => toggleCountry(country.code)}
                      />
                      <div
                        className="size-4 rounded-sm"
                        style={{ backgroundColor: country.code }}
                      />
                      {country.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Shop Grid */}
          <div className="flex-1 px-2 lg:px-3">
            {isShopsLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 rounded-md p-4 m-2 animate-pulse bg-white"
                  >
                    <div className="bg-gray-200 h-48 w-full mb-4 rounded" />
                    <div className="h-6 bg-gray-200 mb-2 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 mb-2 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : shops.length === 0 ? (
              <p>No shops found.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {shops.map((shop, i) => (
                  <ShopCard key={i} shop={shop} />
                ))}
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>


        </div>
      </div>
    </div>
  );
};
export default Products;
