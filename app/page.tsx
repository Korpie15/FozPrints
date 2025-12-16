import Link from 'next/link';
import { ArrowRight, Shield, Truck, Wrench } from 'lucide-react';
import { getProducts } from '@/lib/shopify';
import { FeaturedCarousel } from '@/components/FeaturedCarousel';
import '../styles/home.css';

export default async function HomePage() {
  const products = await getProducts();
  const featuredProducts = products.slice(0, 12); // Get more products for carousel

  return (
    <div>
      {/* Hero Section */}
      <section className="home-hero">
        <div className="container">
          <h1>Premium Subaru Forester Prints</h1>
          <p>
            Unique prints and merchandise for Subaru Forester enthusiasts. 
            Quality products, fast shipping.
          </p>
          <Link href="/products" className="btn btn-primary btn-lg">
            Shop All Products
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="home-features">
        <div className="home-features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={32} />
            </div>
            <h3>Quality Guaranteed</h3>
            <p>
              All products are premium quality with satisfaction guarantee
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Truck size={32} />
            </div>
            <h3>Fast Shipping</h3>
            <p>
              Quick processing and reliable delivery to your door
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Wrench size={32} />
            </div>
            <h3>Expert Support</h3>
            <p>
              Knowledgeable team to help you find the perfect print
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="home-products">
        <div className="container">
          <h2>Featured Products</h2>
          
          <FeaturedCarousel products={featuredProducts} />

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/products" className="btn btn-primary">
              View All Products
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta">
        <div className="container">
          <h2>Can't Find What You're Looking For?</h2>
          <p>
            Our team can help you find the perfect print for your Subaru Forester.
          </p>
          <a href="#" className="btn btn-primary btn-lg">
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
