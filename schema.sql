-- Stock per Stripe Price ID (already exists in Neon; recorded here for reference)
CREATE TABLE IF NOT EXISTS inventory (
  id          text PRIMARY KEY,           -- Stripe Price ID (price_...)
  stock_count integer NOT NULL DEFAULT 0 CHECK (stock_count >= 0)
);

-- Stripe webhook events already applied to inventory (makes retries idempotent)
CREATE TABLE IF NOT EXISTS processed_stripe_events (
  event_id     text PRIMARY KEY,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- PayPal orders created by our server: what was charged, so capture can trust it
CREATE TABLE IF NOT EXISTS paypal_orders (
  order_id   text PRIMARY KEY,           -- PayPal Order ID
  lines      jsonb NOT NULL,             -- [{ "priceId": "price_...", "quantity": 1 }]
  amount     text NOT NULL,              -- AUD total sent to PayPal, e.g. '149.00'
  postcode       text NOT NULL,          -- postcode the shipping was quoted for
  service_code   text NOT NULL,          -- AUS_PARCEL_REGULAR or AUS_PARCEL_EXPRESS
  shipping_cents integer NOT NULL,       -- shipping charged
  created_at timestamptz NOT NULL DEFAULT now()
);
