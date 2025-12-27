'use client';

import Pagination from '@packages/components/pagination';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Range } from 'react-range';
import ProductCard from '@src/shared/components/cards/product-card';
import axiosInstance from '@src/utils/axiosInstance';

const MIN = 0;
const MAX = 1500;

const COLORS = [
  { name: 'Red', value: '#FF5733' },
  { name: 'Green', value: '#33FF57' },
  { name: 'Blue', value: '#3357FF' },
  { name: 'Yellow', value: '#F1C40F' },
  { name: 'Purple', value: '#9B59B6' },
  { name: 'Orange', value: '#E67E22' },
  { name: 'Turquoise', value: '#1ABC9C' },
  { name: 'Dark Blue', value: '#2C3E50' },
  { name: 'Gray', value: '#7F8C8D' },
  { name: 'Dark Gray', value: '#34495E' },
];

const SIZES = [
  { name: 'Extra Small', value: 'XS' },
  { name: 'Small', value: 'S' },
  { name: 'Medium', value: 'M' },
  { name: 'Large', value: 'L' },
  { name: 'Extra Large', value: 'XL' },
  { name: '2X Large', value: '2XL' },
  { name: '3X Large', value: '3XL' },
];

const Products = () => {
  const router = useRouter();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isProductLoading, setIsProductLoading] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1499]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([
    0, 1499,
  ]);

  const getSearchParamsURL = () => {
    const query = new URLSearchParams();
    query.append('minPrice', priceRange[0].toString());
    query.append('maxPrice', priceRange[1].toString());
    if (selectedCategories.length > 0)
      query.append('categories', selectedCategories.join(','));
    if (selectedSize.length > 0) query.append('sizes', selectedSize.join(','));
    if (selectedColor.length > 0)
      query.append('colors', selectedColor.join(','));
    query.append('page', page.toString());
    query.append('limit', '12');
    return query.toString();
  };

  const fetchFilteredProducts = async () => {
    setIsProductLoading(true);
    try {
      const params = {
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        categories:
          selectedCategories.length > 0
            ? selectedCategories.join(',')
            : undefined,
        sizes: selectedSize.length > 0 ? selectedSize.join(',') : undefined,
        colors: selectedColor.length > 0 ? selectedColor.join(',') : undefined,
        page,
        limit: 12,
      };

      const response = await axiosInstance.get(
        `/products/api/get-filtered-offers`,
        { params }
      );
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
      setIsProductLoading(false);
    } catch (error) {
      console.error('Error fetching filtered products:', error);
    } finally {
      setIsProductLoading(false);
    }
  };

  const updateURL = () => {
    const query = getSearchParamsURL();
    router.replace(`/offers?${decodeURIComponent(query)}`);
  };

  useEffect(() => {
    updateURL();
    fetchFilteredProducts();
  }, [page, selectedCategories, selectedSize, selectedColor, priceRange]);

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosInstance.get('products/api/get-categories');
      return res.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });

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

  return (
    <div className="w-full bg-[#f5f5f5] pb-10">
      <div className="w-[90%] lg:w-[84%] m-auto">
        <div className="pb-[50px]">
          <h1 className="md:pt-[40px] font-semibold text-[44px] leading-1 mb-[14px] font-jost">
            All Products
          </h1>

          <Link href="/" className="text-[#55585b] hover:underline">
            Home
          </Link>
          <span className="inline-block p-[2px] mx-1 my-1 bg-[#a8acb0] rounded-full" />
          <span className="text-[#55585b]">All Products</span>
        </div>

        <div className="w-full flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-[270px] bg-white !rounded p-4 space-y-6 shadow-md h-fit">
            <h3 className="text-xl font-Poppins font-medium">Price Range</h3>
            <div className="ml-2">
              <Range
                step={10}
                min={MIN}
                max={MAX}
                values={tempPriceRange}
                onChange={(values) =>
                  setTempPriceRange(values as [number, number])
                }
                onFinalChange={(values) => {
                  if (debounceTimer.current)
                    clearTimeout(debounceTimer.current);
                  debounceTimer.current = setTimeout(() => {
                    setPriceRange(values as [number, number]);
                  }, 1000);
                }}
                renderTrack={({ props, children }) => {
                  const [min, max] = tempPriceRange;
                  const percentageLeft = ((min - MIN) / (MAX - MIN)) * 100;
                  const percentageRight = ((max - MIN) / (MAX - MIN)) * 100;

                  return (
                    <div
                      {...props}
                      className="h-[6px] w-full bg-gray-200 rounded relative"
                      style={{ ...props.style }}
                    >
                      <div
                        className="absolute h-full bg-blue-600 rounded"
                        style={{
                          left: `${percentageLeft}%`,
                          width: `${percentageRight - percentageLeft}%`,
                        }}
                      />
                      {children}
                    </div>
                  );
                }}
                renderThumb={({ props }) => {
                  const { key, ...rest } = props;
                  return (
                    <div
                      key={key}
                      {...rest}
                      className="size-[18px] bg-white border-2 border-blue-600 rounded-full shadow focus:outline-none"
                    />
                  );
                }}
              />
              <div className="flex justify-between text-sm mt-2">
                <span>₹{tempPriceRange[0]}</span>
                <span>₹{tempPriceRange[1]}</span>
              </div>
            </div>

            {/* Categories */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1">
              Categories
            </h3>
            <div className="max-h-[300px] !mt-4 overflow-y-auto custom-scrollbar pr-2">
              <ul className="space-y-2">
                {isLoading ? (
                  <p>Loading...</p>
                ) : (
                  data.categories.map((category: any) => (
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
                  ))
                )}
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
