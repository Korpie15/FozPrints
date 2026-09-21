import Link from 'next/link';
import { getShopPolicies } from '@/lib/policies';
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
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0284c7' }}>Foz</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Prints</span>
            </Link>
            <p>
              Premium 3D printed automotive parts. Designed and built in Australia specifically for the SG Subaru Forester using UV-resistant, engineering-grade materials.
            </p>
          </div>

          <div className="footer-section">
            <h3>Shop</h3>
            <Link href="/products">All Products</Link>
            <Link href="/manuals">Install Manuals</Link>
          </div>

          <div className="footer-section">
            <h3>Support</h3>
            <Link href="/about#contact">Contact Us</Link>
            {policies?.shippingPolicy && (
              <Link href="/policies/shipping-policy">
                {policies.shippingPolicy.title}
              </Link>
            )}
            {policies?.refundPolicy && (
              <Link href="/policies/refund-policy">
                {policies.refundPolicy.title}
              </Link>
            )}
            <Link href="/about#faq">FAQ</Link>
          </div>

          <div className="footer-section">
            <h3>Company</h3>
            <Link href="/about">About Us</Link>
            {policies?.privacyPolicy && (
              <Link href="/policies/privacy-policy">
                {policies.privacyPolicy.title}
              </Link>
            )}
            {policies?.termsOfService && (
              <Link href="/policies/terms-of-service">
                {policies.termsOfService.title}
              </Link>
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
