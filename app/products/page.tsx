import { getProducts } from '@/lib/shopify';
import { ProductCard } from '@/components/ProductCard';
import { ShopifyProduct } from '@/types/shopify';
import '../../styles/products.css';

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
              No products found. Please configure your Shopify store.
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product: ShopifyProduct) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
