'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ShopifyProduct } from '@/types/shopify';
import '../styles/carousel.css';

interface FeaturedCarouselProps {
  products: ShopifyProduct[];
}

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resetTimer, setResetTimer] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const itemsToShow = 4;
  const maxIndex = products.length - itemsToShow;

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (!isMounted) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) return 0;
        return prev + 1;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [maxIndex, resetTimer, isMounted]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) return maxIndex;
      return prev - 1;
    });
    setResetTimer(prev => prev + 1);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      if (prev >= maxIndex) return 0;
      return prev + 1;
    });
    setResetTimer(prev => prev + 1);
  };

  return (
    <div className="carousel-container">
      <button 
        onClick={goToPrevious} 
        className="carousel-button carousel-button-prev"
        aria-label="Previous product"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="carousel-content">
        <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}>
          {products.map((product) => (
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
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={`dot-${index}`}
            onClick={() => {
              setCurrentIndex(index);
              setResetTimer(prev => prev + 1);
            }}
            className={`carousel-dot ${index === currentIndex ? 'carousel-dot-active' : ''}`}
            aria-label={`Go to position ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
