'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product } from '@/types/product';
import '../styles/carousel.css';

interface FeaturedCarouselProps {
  products: Product[];
}

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resetTimer, setResetTimer] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Show only first 4 products
  const displayProducts = products.slice(0, 4);
  const maxIndex = displayProducts.length - 1;

  useEffect(() => {
    setIsMounted(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) return maxIndex;
      return prev - 1;
    });
    setResetTimer((prev) => prev + 1);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      if (prev >= maxIndex) return 0;
      return prev + 1;
    });
    setResetTimer((prev) => prev + 1);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <>
      {/* Desktop: show all products in a static grid */}
      <div className="featured-grid">
        {displayProducts.map((product) => (
          <div key={product.id} className="featured-grid-item">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Mobile: carousel with one product at a time */}
      <div className="carousel-container">
        <button
          onClick={goToPrevious}
          className="carousel-button carousel-button-prev"
          aria-label="Previous product"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="carousel-content">
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {displayProducts.map((product) => (
              <div key={product.id} className="carousel-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={goToNext}
          className="carousel-button carousel-button-next"
          aria-label="Next product"
        >
          <ChevronRight size={24} />
        </button>

        {/* Dots indicator */}
        <div className="carousel-dots">
          {displayProducts.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => {
                setCurrentIndex(index);
                setResetTimer((prev) => prev + 1);
              }}
              className={`carousel-dot ${index === currentIndex ? 'carousel-dot-active' : ''}`}
              aria-label={`Go to position ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
