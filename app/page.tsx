import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getProducts, getProductsByHandles } from '@/lib/stripe';
import { FeaturedCarousel } from '@/components/FeaturedCarousel';
import '../styles/home.css';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const featuredHandles = [
    'sg-forester-pod-kit',
    'subaru-forester-sg-2003-2008-double-din-lower-storage-cubby',
    'rooftop-tent-anderson-plug-holder-t-slot-power-mount',
    'rooftop-tent-cable-organiser-t-slot-wire-router',
  ];

  let featuredProducts = await getProductsByHandles(featuredHandles);

  // If handle matching returned fewer items, fallback to the top active products
  if (featuredProducts.length === 0) {
    const allProducts = await getProducts();
    featuredProducts = allProducts.slice(0, 4);
  }

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
