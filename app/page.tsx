import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getProducts } from '@/lib/stripe';
import { Product } from '@/types/product';
import { FeaturedCarousel } from '@/components/FeaturedCarousel';
import '../styles/home.css';

export const dynamic = 'force-dynamic';

// =========================================================================
// HERO BACKGROUND IMAGE:
// 1. Clean Installed Dash:   '/images/hero-bg-installed.png'
// 2. Hand Installing Hood:  '/images/hero-bg-installing.png'
// =========================================================================
const HERO_BACKGROUND_IMAGE = '/images/hero-bg-installed.png';

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
      {/* Hero Section with Photo Backdrop */}
      <section className="home-hero">
        <div className="home-hero-bg">
          <Image
            src={HERO_BACKGROUND_IMAGE}
            alt="Subaru Forester Double DIN Pod Installed"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
        </div>
        <div className="home-hero-overlay"></div>

        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Precision 3D Printed Parts for the Subaru Forester
            </h1>

            <p className="hero-description">
              Custom 3D printed parts, and accessories designed to meet your needs
            </p>

            {/* Action Buttons */}
            <div className="hero-actions">
              <Link href="/products" className="btn btn-primary btn-lg">
                Shop All Products
                <ArrowRight size={18} />
              </Link>
              <Link href="/manuals" className="btn btn-secondary btn-lg">
                <BookOpen size={18} />
                Install Manuals
              </Link>
            </div>
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
          <Link href="/about#contact" className="btn btn-primary btn-lg">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
