import type { Metadata } from 'next';
import { AboutContent } from '@/components/AboutContent';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About Foz Prints & FAQ',
  description:
    'Custom 3D printed parts for the SG Subaru Forester, made in Australia from heat-resistant ASA. Read about the design process, FAQs, and get in touch.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Foz Prints & FAQ | Custom Subaru Forester Parts',
    description:
      'Custom 3D printed parts for the SG Subaru Forester, made in Australia from heat-resistant ASA. Read about the design process, FAQs, and get in touch.',
    url: `${SITE_URL}/about`,
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Will these parts melt in the Australian sun?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The parts are printed in ASA (Acrylonitrile Styrene Acrylate), an automotive-grade thermoplastic with heat resistance up to ~95°C and full UV stability. It won’t soften or sag sitting on an Australian dashboard in mid-summer.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Smooth and Textured?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Textured uses a fuzzy skin finish that closely matches the grain and matte look of the factory SG Subaru dashboard, so it blends straight into the cabin. Smooth is a clean, uniform 3D printed surface without the grain texture. Both are finished parts ready to install out of the box.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I install the kit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Step-by-step digital install guides with photos are available in the Manuals section.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you ship internationally?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Currently shipping is within Australia only via Australia Post. Rates and estimated delivery times calculate automatically at checkout based on your postcode.',
      },
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <AboutContent />
    </>
  );
}
