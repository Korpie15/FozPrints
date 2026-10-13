/** @type {import('next').NextConfig} */
const nextConfig = {
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
  async redirects() {
    return [
      {
        source: '/products/sg-forester-nav-pod',
        destination: '/products/subaru-forester-sg-2003-2008-double-din-pod-upgrade-kit-usdm-spec',
        permanent: true,
      },
      {
        source: '/products/sg-forester-nav-pod-kit',
        destination: '/products/subaru-forester-sg-2003-2008-double-din-pod-upgrade-kit-usdm-spec',
        permanent: true,
      },
      {
        source: '/products/sg-forester-pod-kit',
        destination: '/products/subaru-forester-sg-2003-2008-double-din-pod-upgrade-kit-usdm-spec',
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
