'use client';

import { useEffect } from 'react';

// Things that get a small "pressed" bounce when tapped or clicked. Add
// data-no-press to an element to leave it out.
const PRESSABLE = [
  'button',
  '.btn',
  '[role="button"]',
  '.product-card-image',
  '.product-card-button',
  '.cart-button',
].join(', ');

/**
 * Gives every button, product card and button-style link a quick squash-and-spring
 * when pressed, so it's obvious the press registered. One listener for the whole
 * site instead of wiring each button. Uses the CSS `scale` property (see
 * globals.css), so it never fights an element's own `transform`.
 */
export function PressFeedback() {
  useEffect(() => {
    const bounce = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return;
      const el = target.closest<HTMLElement>(PRESSABLE);
      if (!el || el.closest('[data-no-press]')) return;
      if (el.matches(':disabled, [aria-disabled="true"]')) return;
      // A data attribute rather than a class, because React rewrites className
      // when a button's state changes on click (e.g. add to cart), which would
      // cut the bounce short. Remove and re-add so a quick second press restarts it.
      el.removeAttribute('data-pressed');
      void el.offsetWidth;
      el.setAttribute('data-pressed', '');
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0) bounce(e.target);
    };
    // Keyboard presses (Enter / Space) fire a click with no pointer
    const onClick = (e: MouseEvent) => {
      if (e.detail === 0) bounce(e.target);
    };
    const onAnimationEnd = (e: AnimationEvent) => {
      if (e.animationName === 'press-bounce' && e.target instanceof Element) {
        e.target.removeAttribute('data-pressed');
      }
    };

    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('click', onClick);
    document.addEventListener('animationend', onAnimationEnd);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('click', onClick);
      document.removeEventListener('animationend', onAnimationEnd);
    };
  }, []);

  return null;
}
