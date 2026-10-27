import type { Metadata } from 'next';
import { getProducts } from '@/lib/stripe';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types/product';
import '@/styles/products.css';
import { DEFAULT_OG_IMAGE, PRODUCT_DISPLAY_ORDER, SITE_URL } from '@/lib/site';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Subaru Forester 3D Printed Parts Catalogue',
  description:
    'Browse our complete catalogue of precision 3D printed double DIN pods, storage cubbies, cable organisers, and accessories for the SG Subaru Forester.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: 'Subaru Forester 3D Printed Parts Catalogue | Foz Prints',
    description:
      'Browse our complete catalogue of precision 3D printed double DIN pods, storage cubbies, cable organisers, and accessories for the SG Subaru Forester.',
    url: `${SITE_URL}/products`,
  },
};

export default async function ProductsPage() {
  const position = (handle: string) => {
    const index = PRODUCT_DISPLAY_ORDER.indexOf(handle.toLowerCase());
    return index === -1 ? PRODUCT_DISPLAY_ORDER.length : index;
  };
  const products = [...(await getProducts())].sort((a, b) => position(a.handle) - position(b.handle));

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>Subaru Forester 3D Printed Parts</h1>
          <p>
            Factory-fit navigation pods, interior storage, and touring accessories for the SG Forester.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="products-error">
            <p>
              No products found. Please check back soon or contact us for custom print requests.
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} titleLevel="h2" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
