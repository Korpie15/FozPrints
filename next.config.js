// Report-only for now: violations are logged in the browser console, nothing is blocked.
// Once the console stays clean across the site and both checkouts, rename the header
// to Content-Security-Policy to enforce it.
const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js inlines its bootstrap scripts and styles, so 'unsafe-inline' is needed without nonces
  "script-src 'self' 'unsafe-inline' https://www.clarity.ms https://*.clarity.ms https://www.paypal.com https://*.paypal.com https://*.paypalobjects.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://files.stripe.com https://placehold.co https://*.paypal.com https://*.paypalobjects.com https://*.clarity.ms https://c.bing.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.clarity.ms https://c.bing.com https://*.paypal.com https://*.paypalobjects.com",
  "frame-src https://*.paypal.com",
  "form-action 'self' https://checkout.stripe.com https://*.paypal.com",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  // Stops other sites showing this store inside an iframe (clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), usb=(), interest-cohort=()' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Stripe serves its files with "no-store", so without this the optimizer
    // only keeps resized images for 60s and keeps re-fetching them from Stripe.
    // Stripe file links are unique per upload, so a long cache is safe.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.stripe.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/products/subaru-forester-sg-2003-2008-double-din-pod-upgrade-kit-usdm-spec',
        destination: '/products/subaru-forester-sg-double-din-nav-pod-kit-20032008-usdm-spec',
        permanent: true,
      },
      {
        source: '/products/sg-forester-nav-pod',
        destination: '/products/subaru-forester-sg-double-din-nav-pod-kit-20032008-usdm-spec',
        permanent: true,
      },
      {
        source: '/products/sg-forester-nav-pod-kit',
        destination: '/products/subaru-forester-sg-double-din-nav-pod-kit-20032008-usdm-spec',
        permanent: true,
      },
      {
        source: '/products/sg-forester-pod-kit',
        destination: '/products/subaru-forester-sg-double-din-nav-pod-kit-20032008-usdm-spec',
        permanent: true,
      },
      {
        source: '/manuals/sg-forester-nav-pod',
        destination: '/manuals/double-DIN-pod-upgrade-kit',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
