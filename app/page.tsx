import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getProducts } from '@/lib/stripe';
import { Product } from '@/types/product';
import { FeaturedCarousel } from '@/components/FeaturedCarousel';
import '../styles/home.css';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const featuredHandles = [
    'subaru-forester-sg-2003-2008-double-din-pod-upgrade-kit-usdm-spec',
    'sg-forester-pod-kit',
    'subaru-forester-sg-2003-2008-double-din-lower-storage-cubby',
    'rooftop-tent-anderson-plug-holder-t-slot-power-mount',
    'rooftop-tent-cable-organiser-t-slot-wire-router',
  ];

  const allProducts = await getProducts();

  // Find products matching preferred featured handles in order
  const featuredProducts: Product[] = [];
  for (const handle of featuredHandles) {
    const found = allProducts.find(
      (p) => p.handle.toLowerCase() === handle.toLowerCase() || p.id === handle
    );
    if (found && !featuredProducts.some((p) => p.id === found.id)) {
      featuredProducts.push(found);
    }
  }

  // Top up with any remaining active products if under 4
  for (const prod of allProducts) {
    if (featuredProducts.length >= 4) break;
    if (!featuredProducts.some((p) => p.id === prod.id)) {
      featuredProducts.push(prod);
    }
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
