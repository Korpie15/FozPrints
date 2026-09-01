import { getProducts } from '@/lib/stripe';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types/product';
import '@/styles/products.css';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>All Products</h1>
          <p>
            Browse our complete catalog of Subaru Forester prints
          </p>
        </div>

        {products.length === 0 ? (
          <div className="products-error">
            <p>
              No products found. Please ensure your active products are created in Stripe.
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
