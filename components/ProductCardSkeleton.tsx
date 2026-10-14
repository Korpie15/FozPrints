import '@/styles/skeleton.css';

export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card" role="status" aria-label="Loading product">
      <div className="skeleton skeleton-card-image" />
      <div className="skeleton-card-content">
        <div className="skeleton skeleton-card-title" />
        <div className="skeleton skeleton-card-desc" />
        <div className="skeleton skeleton-card-desc-short" />
        <div className="skeleton-card-footer">
          <div className="skeleton skeleton-card-price" />
          <div className="skeleton skeleton-card-btn" />
        </div>
      </div>
    </div>
  );
}
