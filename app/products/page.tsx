import type { Metadata } from 'next';
import { getProducts } from '@/lib/stripe';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types/product';
import '@/styles/products.css';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Subaru Forester 3D Printed Parts Catalog',
  description:
    'Browse our complete catalog of precision 3D printed double DIN pods, storage cubbies, cable organizers, and accessories for the SG Subaru Forester.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Subaru Forester 3D Printed Parts Catalog | Foz Prints',
    description:
      'Browse our complete catalog of precision 3D printed double DIN pods, storage cubbies, cable organizers, and accessories for the SG Subaru Forester.',
    url: `${SITE_URL}/products`,
  },
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>Subaru Forester 3D Printed Parts</h1>
          <p>
            Browse our complete catalog of engineering-grade 3D printed parts and custom Forester accessories.
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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
