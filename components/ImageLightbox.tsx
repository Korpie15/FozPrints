'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ProductImage } from '@/types/product';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useSwipe } from '@/lib/use-swipe';

interface ImageLightboxProps {
  images: ProductImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/**
 * Full-screen product photo viewer. Swipe, the arrow buttons or the arrow keys
 * change photo; pinch zooms (the browser's own zoom); Escape or ✕ closes.
 */
export function ImageLightbox({ images, index, onIndexChange, onClose }: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);

  const count = images.length;
  const showPrevious = () => onIndexChange((index - 1 + count) % count);
  const showNext = () => onIndexChange((index + 1) % count);
  const swipe = useSwipe(showNext, showPrevious);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && count > 1) showPrevious();
      else if (e.key === 'ArrowRight' && count > 1) showNext();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const image = images[index];
  if (!image) return null;

  return createPortal(
    <div
      ref={dialogRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Product photos"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button type="button" className="lightbox-button lightbox-close" onClick={onClose} aria-label="Close photos">
        <X size={24} />
      </button>

      <div className="lightbox-image" {...swipe.handlers}>
        <Image src={image.url} alt={image.altText || ''} fill sizes="100vw" style={{ objectFit: 'contain' }} />
      </div>

      {count > 1 && (
        <>
          <button type="button" className="lightbox-button lightbox-prev" onClick={showPrevious} aria-label="Previous photo">
            <ChevronLeft size={28} />
          </button>
          <button type="button" className="lightbox-button lightbox-next" onClick={showNext} aria-label="Next photo">
            <ChevronRight size={28} />
          </button>
          <p className="lightbox-counter" aria-live="polite">
            {index + 1} / {count}
          </p>
        </>
      )}
    </div>,
    document.body
  );
}
