import type { Metadata } from 'next';
import { AboutContent } from '@/components/AboutContent';
import { ABOUT_PAGE_NAV_POD_FAQS } from '@/lib/product-seo';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About Foz Prints & FAQ',
  description:
    'Custom 3D printed parts for the SG Subaru Forester, made in Australia from heat-resistant ASA. Read about the design process, FAQs, and get in touch.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: 'About Foz Prints & FAQ',
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
        text: 'They’re designed not to. The parts are printed in ASA (Acrylonitrile Styrene Acrylate), a UV-stable engineering plastic with a heat deflection temperature of around 95°C (manufacturer data), well above PLA’s roughly 55°C. Very high cabin temperatures can still affect any plastic, so we recommend a windscreen sunshade when you park in direct sun.',
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
        text: 'We currently ship within Australia only, via Australia Post. The Nav Pod Kit ships free with Australia Post standard shipping. For everything else, the shipping cost and delivery estimate are calculated at checkout from your postcode.',
      },
    },
    ...ABOUT_PAGE_NAV_POD_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
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
