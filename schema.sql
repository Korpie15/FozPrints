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
