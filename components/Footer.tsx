import Link from 'next/link';
import { getShopPolicies } from '@/lib/policies';
import { AnalyticsSettingsButton } from '@/components/AnalyticsConsent';
import { BUSINESS_ABN, GST_NOTE, NON_AFFILIATION } from '@/lib/site';
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
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0ea5e9' }}>Foz</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e0f2fe' }}>Prints</span>
            </Link>
            <p>
              Heat-resistant 3D printed parts for the SG Subaru Forester. Designed and 3D printed in Australia.
            </p>
          </div>

          <div className="footer-section">
            <h2>Shop</h2>
            <Link href="/products">All Products</Link>
            <Link href="/manuals">Install Manuals</Link>
          </div>

          <div className="footer-section">
            <h2>Support</h2>
            <Link href="/about#contact">Contact Us</Link>
            <a href="mailto:info@fozprints.com.au">info@fozprints.com.au</a>
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
            <h2>Company</h2>
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
            <AnalyticsSettingsButton />
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Foz Prints, ABN {BUSINESS_ABN}. All rights reserved.
          </p>
          <p>{GST_NOTE}</p>
          <p className="footer-disclaimer">{NON_AFFILIATION}</p>
        </div>
      </div>
    </footer>
  );
}
