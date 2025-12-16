import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/shopify';
import { ProductDetails } from '@/components/ProductDetails';

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    // In Next.js 15+, params is a Promise and needs to be awaited
    const { handle } = await params;
    const product = await getProduct(handle);

    if (!product) {
      notFound();
    }

    return (
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <ProductDetails product={product} />
      </div>
    );
  } catch (error) {
    console.error('Error loading product:', error);
    notFound();
  }
}
