'use client';

import Pagination from '@packages/components/pagination';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ProductCard from 'src/shared/components/cards/product-card';
import axiosInstance from '@src/utils/axiosInstance';
import ShopCategories from '@packages/constant/categories';

const Products = () => {
  const router = useRouter();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        `/shops/api/get-filtered-shops`,
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
  }, [page, selectedCategories]);

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
                {ShopCategories.map((category: any) => (
                  <li
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="accent-blue-600"
                        value={category}
                        checked={selectedCategories.includes(category)}
                        onChange={(e) => toggleCategory(category)}
                      />
                      {category}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sizes */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1 mt-2">
              Sizes
            </h3>
            <div className="max-h-[300px] !mt-4 overflow-y-auto custom-scrollbar pr-2">
              <ul className="space-y-2">
                {SIZES.map((size) => (
                  <li
                    key={size.value}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="accent-blue-600"
                        value={size.value}
                        checked={selectedSize.includes(size.value)}
                        onChange={(e) => {
                          setPage(1);
                          setSelectedSize((prevSizes) => {
                            if (prevSizes.includes(size.value)) {
                              return prevSizes.filter((s) => s !== size.value);
                            } else {
                              return [...prevSizes, size.value];
                            }
                          });
                        }}
                      />
                      <span className="h-4 w-8 flex items-center justify-center border border-gray-400 rounded-sm text-xs font-bold">
                        {size.value}
                      </span>
                      {size.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colors */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1 mt-2">
              Colors
            </h3>
            <div className="max-h-[300px] !mt-4 overflow-y-auto custom-scrollbar pr-2">
              <ul className="space-y-2">
                {COLORS.map((color) => (
                  <li
                    key={color.value}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="accent-blue-600"
                        value={color.value}
                        checked={selectedColor.includes(color.value)}
                        onChange={(e) => {
                          setPage(1);
                          setSelectedColor((prevColors) => {
                            if (prevColors.includes(color.value)) {
                              return prevColors.filter(
                                (c) => c !== color.value
                              );
                            } else {
                              return [...prevColors, color.value];
                            }
                          });
                        }}
                      />
                      <div
                        className="size-4 rounded-sm"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 px-2 lg:px-3">
            {isProductLoading ? (
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
            ) : products.length === 0 ? (
              <p>No products found.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {products.map((product, i) => (
                  <ProductCard key={i} product={product} />
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
