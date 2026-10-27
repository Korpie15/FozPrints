'use client';

import Script from 'next/script';

interface GoogleReviewsOptInProps {
  merchantId: number;
  orderId: string;
  email: string;
  deliveryCountry: string;
  estimatedDeliveryDate: string;
}

declare global {
  interface Window {
    gapi?: any;
    renderGoogleReviewsOptIn?: () => void;
  }
}

/**
 * Google Customer Reviews: Google shows the buyer a small "would you like to rate this
 * store?" box. If they agree, Google emails them a short survey after the delivery date.
 */
export function GoogleReviewsOptIn({ merchantId, orderId, email, deliveryCountry, estimatedDeliveryDate }: GoogleReviewsOptInProps) {
  if (typeof window !== 'undefined') {
    window.renderGoogleReviewsOptIn = () => {
      window.gapi?.load('surveyoptin', () => {
        window.gapi.surveyoptin.render({
          merchant_id: merchantId,
          order_id: orderId,
          email,
          delivery_country: deliveryCountry,
          estimated_delivery_date: estimatedDeliveryDate,
        });
      });
    };
  }

  return (
    <Script
      src="https://apis.google.com/js/platform.js?onload=renderGoogleReviewsOptIn"
      strategy="afterInteractive"
    />
  );
}
