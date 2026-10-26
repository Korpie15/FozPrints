'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product } from '@/types/product';
import '../styles/carousel.css';

interface FeaturedCarouselProps {
  products: Product[];
}

/**
 * One list of product cards: a grid on wider screens, and on phones a
 * horizontal row that snaps card by card. Swiping scrolls the row natively;
 * the arrows and dots scroll it to a card.
 */
export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Show only first 4 products
  const displayProducts = products.slice(0, 4);

  if (!products || products.length === 0) {
    return null;
  }

  const cards = () => Array.from(trackRef.current?.children ?? []) as HTMLElement[];

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    const items = cards();
    if (!track || items.length === 0) return;

    const target = (index + items.length) % items.length;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left: items[target].offsetLeft - items[0].offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const handleScroll = () => {
    const track = trackRef.current;
    const items = cards();
    if (!track || items.length < 2) return;

    const step = items[1].offsetLeft - items[0].offsetLeft;
    setCurrentIndex(Math.round(track.scrollLeft / step));
  };

  return (
    <div className="featured-carousel" role="region" aria-roledescription="carousel" aria-label="Featured products">
      <button
        onClick={() => scrollToIndex(currentIndex - 1)}
        className="carousel-button carousel-button-prev"
        aria-label="Previous product"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="featured-grid" ref={trackRef} onScroll={handleScroll}>
        {displayProducts.map((product, index) => (
          <div
            key={product.id}
            className="featured-grid-item"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${displayProducts.length}`}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <button
        onClick={() => scrollToIndex(currentIndex + 1)}
        className="carousel-button carousel-button-next"
        aria-label="Next product"
      >
        <ChevronRight size={24} />
      </button>

      <div className="carousel-dots">
        {displayProducts.map((product, index) => (
          <button
            key={`dot-${product.id}`}
            onClick={() => scrollToIndex(index)}
            className={`carousel-dot ${index === currentIndex ? 'carousel-dot-active' : ''}`}
            aria-label={`Show product ${index + 1} of ${displayProducts.length}`}
            aria-current={index === currentIndex ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  );
}
