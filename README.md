# Foz Prints 🚗

A modern, headless e-commerce platform for selling Subaru Forester 3D printed parts and merchandise, built with Next.js and Stripe.

## Features

- 🛒 **Full E-commerce Functionality**: Stripe-powered product catalog, cart, and hosted checkout
- ⚡ **Performance**: Server-rendered product pages with Next.js App Router
- 🔄 **Instant Local Cart**: Zustand state management with localStorage persistence
- 📦 **Australia Post Shipping**: Domestic (Australia-only) parcel options with live rates
- 🔐 **Secure Checkout**: Powered by Stripe Checkout (Credit Card, Apple Pay, Google Pay, Link)
- 📱 **Mobile First**: Responsive layout with carousel and quick-add actions

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Payments & Catalog**: Stripe API & Stripe Checkout
- **State Management**: Zustand
- **Icons**: Lucide React
- **Hosting**: Netlify

## Product photos

Stripe's file storage is slow to serve images, so product photos are mirrored onto this site.
After adding or changing photos on a Stripe product, run:

```bash
npm run sync-images
```

then commit `public/product-images/` and `lib/product-images.json` and deploy. Photos that haven't been
synced still load (from Stripe) but more slowly.

## Stock and the admin page

Everything is made to order, so what can be sold comes from the raw materials on hand (ASA filament,
heat inserts, boxes, bubble mailers), not from a count per product. Each product variant has a recipe
(print weight, heat inserts, print time, packaging) in the `part_recipes` table, and `lib/materials.ts`
works out how many can be made. `schema.sql` creates the tables and the starting figures.

**`/admin`** shows and edits the stock: set a count after a stock-take, add or remove, record what is on
order and mark a delivery as arrived. Every change is logged with who made it. It is locked behind
Cloudflare Access (one-time email code), and the app checks the Access login itself, so going round
Cloudflare to the Netlify address does not get in.

One-time setup:

1. **Cloudflare Zero Trust → Access → Applications → Add → Self-hosted.** Add two public hostnames on
   `fozprints.com.au`: path `admin` and path `api/admin`. Add a policy that allows only your email.
   Copy the application's **Audience (AUD) tag**.
2. **Netlify → Site configuration → Environment variables**, then redeploy:
   - `ACCESS_TEAM_DOMAIN`: `https://<team-name>.cloudflareaccess.com`
   - `ACCESS_AUD`: the AUD tag from step 1
   - `ADMIN_EMAILS`: the same allowed emails, comma-separated (a second check on top of Access)
3. Open `https://fozprints.com.au/admin` and sign in with the emailed code.

If those variables are missing or a request did not come through Access, the admin refuses it. To try it
locally, set `DEV_ADMIN_BYPASS=true`, which skips the login on `localhost` only.

## Environment Variables

Copy `.env.example` to `.env.local` and add your keys:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook Secret (from Stripe CLI for local dev, or Stripe Dashboard in production)
STRIPE_WEBHOOK_SECRET=whsec_...

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Local Webhook Testing (Optional)

To test order completion webhooks and emails locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed `whsec_...` secret to your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

## Project Structure

```
fozprints/
├── app/                      # Next.js App Router
│   ├── api/
│   │   ├── checkout/         # Stripe Checkout Session generator
│   │   ├── contact/          # Contact form handler
│   │   └── webhooks/stripe/  # Stripe fulfillment webhook
│   ├── cart/                 # Cart page with Stripe checkout action
│   ├── checkout/success/     # Order success screen
│   ├── manuals/              # Installation guides
│   ├── policies/[handle]/    # Static shop policies
│   ├── products/             # Product catalog & dynamic detail pages
│   ├── layout.tsx            # Root layout with Header and Footer
│   └── page.tsx              # Homepage with featured carousel
├── components/               # UI components
│   ├── CartButton.tsx        # Cart badge with live item count
│   ├── FeaturedCarousel.tsx  # Homepage product carousel
│   ├── Footer.tsx            # Footer with static policies
│   ├── Header.tsx            # Navigation header
│   ├── ProductCard.tsx       # Product grid card with quick-add
│   └── ProductDetails.tsx    # Product gallery & variant selector
├── lib/
│   ├── policies.ts           # Australian e-commerce shop policies
│   ├── store.ts              # Zustand local cart store
│   ├── stripe.ts             # Stripe server SDK client & fetchers
│   └── utils.ts              # Price formatting utilities
└── types/
    └── product.ts            # Product, Variant, and CartItem types
```
