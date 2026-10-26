'use client';

import { useEffect, useState } from 'react';

let request: Promise<boolean> | null = null;

/** One request per page load, shared by every component that asks */
function fetchAvailability(): Promise<boolean> {
  request ??= fetch('/api/promo')
    .then((res) => (res.ok ? res.json() : { launchOfferAvailable: false }))
    .then((data) => Boolean(data.launchOfferAvailable))
    .catch(() => false);
  return request;
}

/**
 * Whether the launch offer can still be used: null while checking, then true or false.
 * Banners show unless it's known to be over; the cart only applies the code once it's confirmed.
 */
export function useLaunchOfferAvailable(): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    fetchAvailability().then((value) => {
      if (active) setAvailable(value);
    });
    return () => {
      active = false;
    };
  }, []);
  return available;
}
