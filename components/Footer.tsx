import '../styles/footer.css';

export function Footer() {
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
            <a href="/products?category=prints">Prints</a>
            <a href="/products?category=apparel">Apparel</a>
            <a href="/products?category=accessories">Accessories</a>
          </div>

          <div className="footer-section">
            <h3>Support</h3>
            <a href="/about#contact">Contact Us</a>
            <a href="#">Shipping Info</a>
            <a href="#">Returns</a>
            <a href="#">FAQ</a>
          </div>

          <div className="footer-section">
            <h3>Company</h3>
            <a href="/about">About Us</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
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
