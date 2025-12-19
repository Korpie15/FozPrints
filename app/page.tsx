import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getProductsByHandles } from '@/lib/shopify';
import { FeaturedCarousel } from '@/components/FeaturedCarousel';
import '../styles/home.css';

export default async function HomePage() {
  // Manually select featured products by their handles
  // Replace these handles with your actual product handles from Shopify
  const featuredHandles = [
    'sg-forester-pod-kit',
    'subaru-forester-sg-2003-2008-double-din-lower-storage-cubby', 
    'rooftop-tent-anderson-plug-holder-t-slot-power-mount',
    'rooftop-tent-cable-organiser-t-slot-wire-router'
  ];
  
  const featuredProducts = await getProductsByHandles(featuredHandles);

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
          <Link href="/about#contact" className="btn btn-primary btn-lg">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
