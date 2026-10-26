import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { InternationalInterestModal } from '@/components/InternationalInterestModal';
import { AnalyticsConsent } from '@/components/AnalyticsConsent';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/site';

const siteUrl = SITE_URL;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0369a1',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Foz Prints - Precision 3D Printed Subaru Forester Parts',
    template: '%s | Foz Prints',
  },
  description:
    'Premium 3D printed automotive parts and accessories designed and manufactured in Australia for the SG Subaru Forester (2003 to 2008). Heat and UV-resistant engineering materials.',
  keywords: [
    'Subaru Forester',
    'SG Forester',
    'SG Forester Nav Pod',
    'Forester Navigation Pod',
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
      'Premium 3D printed automotive parts and accessories designed and manufactured in Australia for the SG Subaru Forester (2003 to 2008).',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Foz Prints - Precision 3D Printed Subaru Forester Parts',
    description:
      'Premium 3D printed automotive parts and accessories designed and manufactured in Australia for the SG Subaru Forester (2003 to 2008).',
    images: [DEFAULT_OG_IMAGE.url],
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
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Header />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <Footer />
        <InternationalInterestModal />
        <AnalyticsConsent />
      </body>
    </html>
  );
}
