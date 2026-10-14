import '@/styles/product-details.css';
import '@/styles/skeleton.css';

export default function ProductDetailLoading() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      {/* Breadcrumbs skeleton */}
      <div className="skeleton skeleton-breadcrumbs" />

      {/* Details skeleton grid */}
      <div className="skeleton-details-grid">
        {/* Left Column: Images */}
        <div className="product-images">
          <div className="skeleton skeleton-main-image" />
          <div className="skeleton-thumbnails">
            <div className="skeleton skeleton-thumb" />
            <div className="skeleton skeleton-thumb" />
            <div className="skeleton skeleton-thumb" />
            <div className="skeleton skeleton-thumb" />
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="product-info">
          <div className="skeleton skeleton-detail-title" />
          <div className="skeleton skeleton-detail-price" />

          {/* Variant picker placeholder */}
          <div className="skeleton" style={{ height: '2.75rem', width: '100%', borderRadius: '0.375rem', marginBottom: '1rem' }} />

          {/* Action button placeholder */}
          <div className="skeleton skeleton-detail-btn" />

          {/* Description paragraphs */}
          <div style={{ marginTop: '1rem' }}>
            <div className="skeleton skeleton-detail-paragraph" />
            <div className="skeleton skeleton-detail-paragraph" />
            <div className="skeleton skeleton-detail-paragraph" style={{ width: '80%' }} />
            <div className="skeleton skeleton-detail-paragraph" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
