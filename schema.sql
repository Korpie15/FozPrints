-- Stock per Stripe Price ID (already exists in Neon; recorded here for reference)
CREATE TABLE IF NOT EXISTS inventory (
  id          text PRIMARY KEY,           -- Stripe Price ID (price_...)
  stock_count integer NOT NULL DEFAULT 0 CHECK (stock_count >= 0)
);

-- Raw materials on hand. Everything is made to order, so what can be sold is
-- worked out from these, not typed in per product (see lib/materials.ts).
-- To restock or correct a count:  UPDATE materials SET on_hand = 2400 WHERE id = 'filament_asa_black';
CREATE TABLE IF NOT EXISTS materials (
  id        text PRIMARY KEY,
  name      text NOT NULL,
  unit      text NOT NULL,                         -- 'g' or 'each'
  on_hand   integer NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
  waste_pct integer NOT NULL DEFAULT 0 CHECK (waste_pct >= 0)  -- extra used on top of the recipe (supports, purge, failed prints)
);

-- Stock on its way (shown on /admin). "Received" moves it into on_hand.
ALTER TABLE materials ADD COLUMN IF NOT EXISTS on_order integer NOT NULL DEFAULT 0 CHECK (on_order >= 0);

-- Who changed which material on /admin, and when
CREATE TABLE IF NOT EXISTS stock_log (
  id            bigserial PRIMARY KEY,
  at            timestamptz NOT NULL DEFAULT now(),
  material_id   text NOT NULL,
  action        text NOT NULL,        -- set, adjust, setOnOrder, receive, setWaste
  change        integer NOT NULL,     -- change to on_hand (0 for order and waste edits)
  on_hand_after integer NOT NULL,
  note          text NOT NULL DEFAULT '',
  by_email      text NOT NULL
);

-- What one unit of a product variant uses, and how long it takes to print.
-- A variant with a row here is sold from materials; any other still uses `inventory`.
CREATE TABLE IF NOT EXISTS part_recipes (
  price_id      text PRIMARY KEY,                  -- Stripe Price ID (price_...)
  name          text NOT NULL,                     -- readable label, for humans only
  filament_g    integer NOT NULL DEFAULT 0 CHECK (filament_g >= 0),     -- measured print weight, before waste
  heat_inserts  integer NOT NULL DEFAULT 0 CHECK (heat_inserts >= 0),
  print_minutes integer NOT NULL DEFAULT 0 CHECK (print_minutes >= 0),  -- time to print one unit
  packaging     text NOT NULL CHECK (packaging IN ('box', 'mailer'))    -- 'mailer' = small enough for a bubble mailer
);

INSERT INTO materials (id, name, unit, on_hand, waste_pct) VALUES
  ('filament_asa_black', 'ASA filament (black)', 'g',    3250, 10),
  ('box',                'Shipping box',          'each', 9,    0),
  ('bubble_mailer',      'Bubble mailer',         'each', 0,    0),
  ('heat_insert',        'Heat insert',           'each', 50,   0)
ON CONFLICT (id) DO NOTHING;

-- Tracked by hand on /admin: the shop does not deduct it per order
INSERT INTO materials (id, name, unit, on_hand, waste_pct) VALUES
  ('honeycomb_paper', 'Honeycomb packing paper', 'm', 0, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO part_recipes (price_id, name, filament_g, heat_inserts, print_minutes, packaging) VALUES
  ('price_1UAm8QDV66BLpkjB0jQSOvpR', 'Nav Pod Kit - Smooth',                       329, 0, 1034, 'box'),
  ('price_1UAmDwDV66BLpkjB486XPemH', 'Nav Pod Kit - Textured',                     329, 0, 1034, 'box'),
  ('price_1UVf5yDV66BLpkjBEWqgj50R', 'Cubby - Single section, standard holes',     271, 0, 630,  'box'),
  ('price_1UVf56DV66BLpkjBT4CU3zFJ', 'Cubby - Single section, heat inserts',       271, 8, 630,  'box'),
  ('price_1UVf6fDV66BLpkjBhrDPCvKP', 'Cubby - Split section, standard holes',      271, 0, 630,  'box'),
  ('price_1UVf6HDV66BLpkjB4vk69l6X', 'Cubby - Split section, heat inserts',        271, 8, 630,  'box'),
  ('price_1UWQeZDV66BLpkjBzUBZV38R', 'Dash Replacement Parts - Top Cover Smooth',  250, 0, 750,  'box'),
  ('price_1UWQebDV66BLpkjBHRkAfbs9', 'Dash Replacement Parts - Top Cover Textured',250, 0, 750,  'box'),
  ('price_1UWQedDV66BLpkjB8RuhVImG', 'Dash Replacement Parts - Front Fascia Trim', 46,  0, 170,  'mailer'),
  ('price_1UWQefDV66BLpkjBiJ3MEQhM', 'Dash Replacement Parts - Radio Mount Brackets (Pair)', 33, 0, 114, 'mailer'),
  ('price_1UAm8NDV66BLpkjB7sP6FFM8', 'Rooftop Tent Anderson Plug Holder',           6,  0, 33,   'mailer'),
  ('price_1UAm8PDV66BLpkjBnLi3PqRO', 'Rooftop Tent Cable Organiser',                11, 0, 49,   'mailer')
ON CONFLICT (price_id) DO NOTHING;

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
  discount_cents integer NOT NULL DEFAULT 0, -- LAUNCH50 discount given (counts toward the 10-use cap)
  created_at timestamptz NOT NULL DEFAULT now()
);
