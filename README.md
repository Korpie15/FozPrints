# Foz Prints 🚗

A modern, headless e-commerce platform for selling Subaru Forester prints and merchandise, built with Next.js 14+ and Shopify Storefront API.

## Features

- 🛒 **Full E-commerce Functionality**: Product listings, cart, checkout
- 🎨 **Modern UI**: Built with Tailwind CSS and Lucide icons
- ⚡ **Performance**: Server-side rendering with Next.js App Router
- 🔄 **Real-time Cart**: Zustand state management with localStorage persistence
- 📱 **Responsive Design**: Mobile-first approach
- 🔐 **Secure Checkout**: Powered by Shopify's secure payment processing
- 🎯 **SEO Optimized**: Server-side rendering for better search rankings

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**:  CSS
- **E-commerce**: Shopify Storefront API (GraphQL)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+ installed
- A Shopify store (free trial available)
- Shopify Storefront API access token

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Shopify

1. **Create a Shopify Store** (if you don't have one):
   - Go to [Shopify](https://www.shopify.com)
   - Sign up for a free trial

2. **Create a Storefront API Access Token**:
   - In your Shopify admin, go to: **Settings** → **Apps and sales channels** → **Develop apps**
   - Click **"Create an app"**
   - Name it "Foz Prints" or similar
   - Go to **Configuration** tab
   - Under **Storefront API**, click **Configure**
   - Enable all read permissions (Product listings, Cart, etc.)
   - Click **Save**
   - Go to **API credentials** tab
   - Copy the **Storefront API access token**

3. **Add Products to Your Store**:
   - Add your products in your Shopify admin
   - Include good images, descriptions, and prices

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Shopify credentials:

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store-name.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
fozprints/
├── app/                      # Next.js App Router pages
│   ├── cart/                 # Shopping cart page
│   ├── products/             # Product listing and detail pages
│   │   └── [handle]/         # Dynamic product pages
│   ├── layout.tsx            # Root layout with header/footer
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── CartButton.tsx        # Header cart button with count
│   ├── Footer.tsx            # Site footer
│   ├── Header.tsx            # Site header/navigation
│   ├── ProductCard.tsx       # Product grid item
│   └── ProductDetails.tsx    # Product detail page component
├── lib/                      # Utility functions and API clients
│   ├── shopify.ts            # Shopify Storefront API client
│   ├── store.ts              # Zustand state management
│   └── utils.ts              # Helper functions
├── types/                    # TypeScript type definitions
│   └── shopify.ts            # Shopify API types
├── public/                   # Static assets
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality
- `npm run type-check` - Check TypeScript types

## Key Features Implementation

### Shopping Cart
- Persistent cart using Shopify Cart API
- Stored cart ID in localStorage via Zustand
- Add, update, remove cart items
- Real-time cart count in header

### Product Management
- Server-side rendered product pages for SEO
- Dynamic routing for individual products
- Variant selection support
- Real-time availability checking

### Checkout
- Seamless redirect to Shopify's secure checkout
- All payment methods supported by Shopify
- Order management through Shopify admin

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
   - `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`
   - `NEXT_PUBLIC_SITE_URL`
5. Deploy!

### Other Platforms

This Next.js app can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

## Customization

### Styling
- Primary color scheme is defined in the config
- Modify `app/globals.css` for global styles

### Adding Features
- **Search**: Add Shopify search API integration
- **Filters**: Implement product filtering by category, price, etc.
- **Reviews**: Use Shopify product metafields or third-party app
- **Wishlist**: Extend Zustand store for wishlist functionality
- **User Accounts**: Integrate Shopify Customer API

## Troubleshooting

### Products Not Loading
- Verify your Shopify credentials in `.env.local`
- Check that your Storefront API token has correct permissions
- Ensure products are published to your "Online Store" sales channel

### Cart Not Working
- Check browser console for errors
- Verify Shopify Cart API is enabled
- Clear localStorage and try again

### Build Errors
- Run `npm run type-check` to find TypeScript issues
- Ensure all dependencies are installed: `npm install`

## Support

For issues or questions:
1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Review [Shopify Storefront API docs](https://shopify.dev/docs/api/storefront)
3. Open an issue in this repository

## License

This project is open source and available under the MIT License.

---

Built with ❤️ for Subaru Forester enthusiasts
# FozPrints
# FozPrints
# FozPrints
