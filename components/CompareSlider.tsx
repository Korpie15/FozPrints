'use client';

import { useState } from 'react';
import Image from 'next/image';
import '../styles/compare-slider.css';

interface CompareSliderProps {
  beforeSrc: string;
  beforeAlt: string;
  beforeLabel: string;
  afterSrc: string;
  afterAlt: string;
  afterLabel: string;
  /** Natural size of both photos (they must share the same framing) */
  width: number;
  height: number;
  sizes?: string;
}

/**
 * Drag-to-compare photo pair. The "before" photo sits on the left of the divider and the
 * "after" photo on the right. A transparent range input covers the photo so mouse, touch
 * and keyboard (arrow keys) all move the divider.
 */
export function CompareSlider({
  beforeSrc,
  beforeAlt,
  beforeLabel,
  afterSrc,
  afterAlt,
  afterLabel,
  width,
  height,
  sizes = '(max-width: 768px) 100vw, 720px',
}: CompareSliderProps) {
  const [position, setPosition] = useState(50);

  return (
    <div className="compare-slider" style={{ aspectRatio: `${width} / ${height}` }}>
      {/* Served as-is: these WebPs are already sized, and re-compressing them blurs fine texture */}
      <Image src={afterSrc} alt={afterAlt} fill sizes={sizes} className="compare-slider-image" unoptimized />
      <div className="compare-slider-before" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image src={beforeSrc} alt={beforeAlt} fill sizes={sizes} className="compare-slider-image" unoptimized />
      </div>

      <span className="compare-slider-label compare-slider-label-before">{beforeLabel}</span>
      <span className="compare-slider-label compare-slider-label-after">{afterLabel}</span>

      <div className="compare-slider-divider" style={{ left: `${position}%` }} aria-hidden="true">
        <span className="compare-slider-handle">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 5 2 10l5 5M13 5l5 5-5 5" />
          </svg>
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="compare-slider-input"
        aria-label={`Drag to compare: ${beforeLabel} on the left, ${afterLabel} on the right`}
      />
    </div>
  );
}
