import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import '@/styles/products.css';
import '@/styles/skeleton.css';

export default function ProductsLoading() {
  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>Subaru Forester 3D Printed Parts</h1>
          <p>
            Factory-fit navigation pods, interior storage, and touring accessories for the SG Forester.
          </p>
        </div>

        <div className="products-grid" aria-label="Loading products catalog">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
