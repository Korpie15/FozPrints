import type { Metadata } from 'next';
import { AboutContent } from '@/components/AboutContent';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About Foz Prints & FAQ',
  description:
    'Learn how Foz Prints designs engineering-grade, heat-resistant 3D printed parts for the SG Subaru Forester in Australia. Frequently asked questions and contact info.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Foz Prints & FAQ | Custom Subaru Forester Parts',
    description:
      'Learn how Foz Prints designs engineering-grade, heat-resistant 3D printed parts for the SG Subaru Forester in Australia. Frequently asked questions and contact info.',
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
        text: 'No. We use ASA (Acrylonitrile Styrene Acrylate), an engineering-grade material designed for outdoor and automotive use. It is UV resistant and heat resistant up to approximately 95°C.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Smooth and Textured?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Textured is printed using a fuzzy skin technique that mimics the grain of the OEM Subaru dashboard. Smooth is a standard clean 3D printed finish.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I install the kit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We provide detailed digital step-by-step guides with photos and video transcripts in our Manuals section.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you ship internationally?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We currently ship within Australia only, via Australia Post. Shipping costs and delivery estimates are calculated at checkout.',
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
