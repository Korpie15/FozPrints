import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import '@/styles/home.css';
import '@/styles/skeleton.css';

export default function RootLoading() {
  return (
    <div>
      {/* Skeleton Hero */}
      <section className="home-hero">
        <div className="container">
          <div className="hero-content">
            <div className="skeleton skeleton-hero-title-1" />
            <div className="skeleton skeleton-hero-title-2" />
            <div className="skeleton skeleton-hero-desc" />
            <div className="skeleton skeleton-hero-desc" style={{ width: '65%' }} />
            <div className="skeleton-hero-actions">
              <div className="skeleton skeleton-hero-btn" />
              <div className="skeleton skeleton-hero-btn" />
            </div>
          </div>
        </div>
      </section>

      {/* Skeleton Featured Products */}
      <section className="home-products">
        <div className="container">
          <h2>Featured Products</h2>
          <div className="products-grid" style={{ marginTop: '2rem' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
