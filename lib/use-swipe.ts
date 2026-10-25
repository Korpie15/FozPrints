import { useRef, type TouchEvent } from 'react';

const MIN_DISTANCE = 50;

/**
 * Touch handlers for a one-finger horizontal swipe of at least 50px.
 * Two-finger gestures (pinch) and mostly vertical drags (scrolling) are ignored.
 */
export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  return {
    handlers: {
      onTouchStart: (e: TouchEvent) => {
        swiped.current = false;
        start.current = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
      },
      onTouchEnd: (e: TouchEvent) => {
        if (!start.current) return;
        const dx = e.changedTouches[0].clientX - start.current.x;
        const dy = e.changedTouches[0].clientY - start.current.y;
        start.current = null;

        if (Math.abs(dx) >= MIN_DISTANCE && Math.abs(dx) > Math.abs(dy)) {
          swiped.current = true;
          if (dx < 0) onSwipeLeft();
          else onSwipeRight();
        }
      },
    },
    /** True straight after a swipe, so the tap that ended it can be ignored. */
    consumeSwipe: () => {
      const value = swiped.current;
      swiped.current = false;
      return value;
    },
  };
}
