'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** idle → dropping (item falls into the cart icon) → added (tick shown) → idle */
export type AddedPhase = 'idle' | 'dropping' | 'added';

const DROP_MS = 450;
const ADDED_MS = 1600;

/**
 * Drives the add-to-cart animation on a button. Call `trigger()` after the item
 * is added; render from `phase`. Pressing again mid-animation starts it over.
 */
export function useAddedFlash(): [AddedPhase, () => void] {
  const [phase, setPhase] = useState<AddedPhase>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const trigger = useCallback(() => {
    clear();
    setPhase('dropping');
    timers.current.push(
      setTimeout(() => setPhase('added'), DROP_MS),
      setTimeout(() => setPhase('idle'), DROP_MS + ADDED_MS)
    );
  }, []);

  useEffect(() => clear, []);

  return [phase, trigger];
}
