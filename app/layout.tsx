import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fozprints.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0284c7',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Foz Prints - Precision 3D Printed Subaru Forester Parts',
    template: '%s | Foz Prints',
  },
  description:
    'Premium 3D printed automotive parts and accessories designed and manufactured in Australia for the SG Subaru Forester (2003-2008). Heat and UV-resistant engineering materials.',
  keywords: [
    'Subaru Forester',
    'SG Forester',
    'Double DIN Pod',
    '3D printed car parts',
    'Forester accessories',
    'Foz Prints',
    'Forester dash pod',
  ],
  alternates: {
    canonical: './',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: siteUrl,
    siteName: 'Foz Prints',
    title: 'Foz Prints - Precision 3D Printed Subaru Forester Parts',
    description:
      'Premium 3D printed automotive parts and accessories designed and manufactured in Australia for the SG Subaru Forester (2003-2008).',
    images: [
      {
        url: '/images/hero-bg-installed.png',
        width: 1200,
        height: 630,
        alt: 'Subaru Forester Double DIN Pod Upgrade Kit Installed',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Foz Prints - Precision 3D Printed Subaru Forester Parts',
    description:
      'Premium 3D printed automotive parts and accessories designed and manufactured in Australia for the SG Subaru Forester (2003-2008).',
    images: ['/images/hero-bg-installed.png'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
