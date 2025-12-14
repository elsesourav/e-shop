import axiosInstance from "@/apps/user-ui/src/utils/axiosInstance";
import { Metadata } from "next";


async function fetchProductDetails(slug: string) {
  const response = await axiosInstance.get(`/products/api/get-product/${slug}`);
  return response.data?.product;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await fetchProductDetails(params?.slug);
  
  return {
    title: `${product?.title} | 'E-Shop'`,
    description: product?.description || 'Discover high-quality products at E-Shop.' ,
    openGraph: {
      title: `${product?.title} | 'E-Shop'`,
      description: product?.description || 'Discover high-quality products at E-Shop.',
      images: [product?.images?.[0]?.url || '/default-product-image.jpg'],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product?.title} | 'E-Shop'`,
      description: product?.description || 'Discover high-quality products at E-Shop.',
      images: [product?.images?.[0]?.url || '/default-product-image.jpg'],
    }
  };
}

const page = async ({ params }: { params: { slug: string } }) => {
  const productDetails = await fetchProductDetails(params?.slug);

  return (
    <div>

    </div>
  )
}
export default page