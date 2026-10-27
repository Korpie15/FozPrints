// Enforced: anything not listed here is blocked. Add a source here before adding a new
// third-party script, image host, iframe or API, or the browser will refuse to load it.
const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js inlines its bootstrap scripts and styles, so 'unsafe-inline' is needed without nonces
  // Cloudflare adds its Web Analytics beacon to the live domain (not Netlify previews)
  "script-src 'self' 'unsafe-inline' https://www.clarity.ms https://*.clarity.ms https://www.paypal.com https://*.paypal.com https://*.paypalobjects.com https://static.cloudflareinsights.com https://apis.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://files.stripe.com https://*.paypal.com https://*.paypalobjects.com https://*.clarity.ms https://c.bing.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.clarity.ms https://c.bing.com https://*.paypal.com https://*.paypalobjects.com https://cloudflareinsights.com",
  "frame-src https://*.paypal.com https://www.google.com",
  "form-action 'self' https://checkout.stripe.com https://*.paypal.com",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  // Stops other sites showing this store inside an iframe (clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), usb=(), interest-cohort=()' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Netlify sets CONTEXT during the build: keep previews and branch deploys out of search results
  ...(process.env.CONTEXT && process.env.CONTEXT !== 'production'
    ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
    : []),
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
