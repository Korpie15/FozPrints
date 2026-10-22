'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { CartItem } from '@/types/product';
import { Loader2 } from 'lucide-react';

interface PayPalCheckoutButtonProps {
  items: CartItem[];
  toPostcode: string;
  serviceCode?: string;
  promoCode?: string;
}

export function PayPalCheckoutButton({
  items,
  toPostcode,
  serviceCode,
  promoCode,
}: PayPalCheckoutButtonProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

  if (!clientId) {
    // If Client ID isn't configured in client env, skip rendering
    return null;
  }

  return (
    <div style={{ marginTop: '0.75rem', width: '100%' }}>
      {isProcessing && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            color: '#38bdf8',
            fontSize: '0.875rem',
          }}
        >
          <Loader2 size={18} className="animate-spin" />
          <span>Processing PayPal payment...</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            color: '#ef4444',
            fontSize: '0.85rem',
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}
        >
          {errorMessage}
        </div>
      )}

      <PayPalScriptProvider
        options={{
          clientId,
          currency: 'AUD',
          intent: 'capture',
          'disable-funding': 'card,paylater',
        }}
      >
        <PayPalButtons
          fundingSource="paypal"
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 44,
          }}
          disabled={isProcessing || items.length === 0}
          createOrder={async () => {
            setErrorMessage(null);
            try {
              const res = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  items,
                  toPostcode,
                  serviceCode,
                  promoCode,
                }),
              });

              const data = await res.json();
              if (!res.ok || data.error) {
                throw new Error(data.error || 'Failed to initialize PayPal order.');
              }

              return data.id;
            } catch (err: any) {
              setErrorMessage(err.message || 'PayPal order creation failed.');
              throw err;
            }
          }}
          onApprove={async (data) => {
            setIsProcessing(true);
            setErrorMessage(null);

            try {
              const res = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderID,
                }),
              });

              const captureData = await res.json();
              if (!res.ok || captureData.error) {
                throw new Error(captureData.error || 'Payment capture failed.');
              }

              router.push(`/checkout/success?session_id=paypal_${data.orderID}`);
            } catch (err: any) {
              setErrorMessage(err.message || 'Error completing your payment.');
              setIsProcessing(false);
            }
          }}
          onError={(err: any) => {
            console.error('PayPal Buttons Error:', err);
            setErrorMessage('An error occurred during PayPal checkout. Please try again.');
          }}
          onCancel={() => {
            setErrorMessage(null);
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}
