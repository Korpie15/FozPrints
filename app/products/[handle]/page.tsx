import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/shopify';
import { ProductDetails } from '@/components/ProductDetails';

interface ProductPageProps {
  params: {
    handle: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.handle);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <ProductDetails product={product} />
    </div>
  );
}
