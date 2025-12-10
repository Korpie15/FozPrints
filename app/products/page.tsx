import { getProducts } from '@/lib/shopify';
import { ProductCard } from '@/components/ProductCard';
import { ShopifyProduct } from '@/types/shopify';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">All Parts</h1>
        <p className="text-lg text-gray-600">
          Browse our complete catalog of Subaru Forester prints
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No products found. Please configure your Shopify store.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: ShopifyProduct) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
