'use client';

import { useQuery } from '@tanstack/react-query';
import ProductCard from '../shared/components/cards/product-card';
import SectionTitle from '../shared/components/section/section-title';
import Hero from '../shared/models/hero';
import axiosInstance from '../utils/axiosInstance';
import LoadingCard from '@/shared/components/loading-card/page';
import ShopCard from '@/shared/components/cards/shops-card';

const Page = () => {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        '/products/api/get-all-products?page=1&limit=10'
      );
      return res.data?.products;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const { data: latestProducts } = useQuery({
    queryKey: ['latest-product'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        '/products/api/get-all-products?page=1&limit=10&sortBy=createdAt&sortOrder=desc'
      );
      return res.data?.products;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const { data: shops, isLoading: isShopsLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const res = await axiosInstance.get('/products/api/get-top-shops');
      return res.data?.shops;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        '/products/api/get-all-events?page=1'
      );
      return res.data?.products;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return (
    <div className="bg-[#f5f5f5] pb-10">
      <Hero />
      <div className="md:w-[80%] w-[90%] my-10 m-auto">
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>

        {isLoading && LoadingCard(5)}

        {!isLoading && !isError && products && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        {!isLoading && !isError && products && products.length === 0 && (
          <p className="text-center text-gray-500">No products found.</p>
        )}

        {/* Latest Products */}
        <div className="my-8 ">
          <SectionTitle title="Latest Products" />
        </div>

        {isLoading && LoadingCard(5)}

        {!isLoading &&
          !isError &&
          latestProducts &&
          latestProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {latestProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        {!isLoading &&
          !isError &&
          latestProducts &&
          latestProducts.length === 0 && (
            <p className="text-center text-gray-500">No products found.</p>
          )}

        {/* Top Shops */}
        <div className="my-8 ">
          <SectionTitle title="Top Shops" />
        </div>

        {isShopsLoading && LoadingCard(5)}

        {!isShopsLoading && shops && shops.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {shops.map((shop: any) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}

        {!isShopsLoading && shops && shops.length === 0 && (
          <p className="text-center text-gray-500">No shops found.</p>
        )}

        {/* Top Offers */}
        <div className="my-8 ">
          <SectionTitle title="Top Offers" />
        </div>

        {isEventsLoading && LoadingCard(5)}

        {!isEventsLoading && events && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {events.map((product: any) => (
              <ProductCard key={product.id} product={product} isEvent />
            ))}
          </div>
        )}

        {!isEventsLoading && events && events.length === 0 && (
          <p className="text-center text-gray-500">No offers found.</p>
        )}
      </div>
    </div>
  );
};
export default Page;
