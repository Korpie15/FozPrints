# Foz Prints 🚗

A modern, headless e-commerce platform for selling Subaru Forester 3D printed parts and merchandise, built with Next.js and Stripe.

## Features

- 🛒 **Full E-commerce Functionality**: Stripe-powered product catalog, cart, and hosted checkout
- ⚡ **Performance**: Server-rendered product pages with Next.js App Router
- 🔄 **Instant Local Cart**: Zustand state management with localStorage persistence
- 📦 **Australia Post Shipping**: Configured domestic and international parcel options
- 🔐 **Secure Checkout**: Powered by Stripe Checkout (Credit Card, Apple Pay, Google Pay, Link)
- ✉️ **Automated Emails**: Customer receipts and workshop notifications via Resend
- 📱 **Mobile First**: Responsive layout with carousel and quick-add actions

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Payments & Catalog**: Stripe API & Stripe Checkout
- **State Management**: Zustand
- **Email Delivery**: Resend
- **Icons**: Lucide React
- **Hosting**: Netlify

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

# Transactional Email (optional)
RESEND_API_KEY=re_...
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
