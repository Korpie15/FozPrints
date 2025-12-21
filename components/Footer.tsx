import { getShopPolicies } from '@/lib/shopify';
import '../styles/footer.css';

export async function Footer() {
  let policies = null;
  
  try {
    policies = await getShopPolicies();
  } catch (error) {
    console.error('Error fetching shop policies:', error);
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0284c7' }}>Foz</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Prints</span>
            </div>
            <p>
              Your trusted source for Subaru Forester prints and merchandise. Quality products, 
              competitive prices, and fast shipping.
            </p>
          </div>

          <div className="footer-section">
            <h3>Shop</h3>
            <a href="/products">All Products</a>
          </div>

          <div className="footer-section">
            <h3>Support</h3>
            <a href="/about#contact">Contact Us</a>
            {policies?.shippingPolicy && (
              <a href="/policies/shipping-policy">
                {policies.shippingPolicy.title}
              </a>
            )}
            {policies?.refundPolicy && (
              <a href="/policies/refund-policy">
                {policies.refundPolicy.title}
              </a>
            )}
            <a href="/about#faq">FAQ</a>
          </div>

          <div className="footer-section">
            <h3>Company</h3>
            <a href="/about">About Us</a>
            {policies?.privacyPolicy && (
              <a href="/policies/privacy-policy">
                {policies.privacyPolicy.title}
              </a>
            )}
            {policies?.termsOfService && (
              <a href="/policies/terms-of-service">
                {policies.termsOfService.title}
              </a>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Foz Prints. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
