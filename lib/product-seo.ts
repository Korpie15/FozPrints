import { Product } from '@/types/product';

/** The Nav Pod's name for page titles, Stripe and Google */
export const NAV_POD_NAME = 'Subaru Forester SG Double DIN Nav Pod Kit (2003 to 2008)';
/** The Nav Pod's name for banners, buttons and the manual */
export const NAV_POD_SHORT_NAME = 'Nav Pod Kit';

export function isNavPodProduct(product: { handle?: string; title?: string }): boolean {
  const h = (product.handle || '').toLowerCase();
  const t = (product.title || '').toLowerCase();
  return (
    h.includes('double-din-pod') ||
    h.includes('nav-pod') ||
    h.includes('pod-kit') ||
    t.includes('double din pod') ||
    t.includes('nav pod')
  );
}

export interface NavPodFaq {
  question: string;
  answer: string;
  /** Extra photos shown under the answer on the product page (not part of the Google FAQ text) */
  media?: 'oem-fitment';
}

export const NAV_POD_FAQS: NavPodFaq[] = [
  {
    question: 'Will the Nav Pod Kit fit standard 7-inch double DIN head units?',
    answer:
      'Yes, the Foz Prints SG Forester Double DIN Nav Pod is engineered to standard Double DIN dimensions (180mm x 100mm face) and fits aftermarket shallow-depth head units with Apple CarPlay / Android Auto, digital media receivers, and gauge displays.',
  },
  {
    question: 'Which Subaru Forester models and years does the Nav Pod Kit fit?',
    answer:
      'It is designed for the second-generation Subaru Forester (SG chassis, model years 2003 to 2008) including XT, 2.5X, and 2.5XS with the USDM-spec dashboard pocket.',
  },
  {
    question: 'What material is used and will it warp in summer heat?',
    answer:
      'The Nav Pod Kit is 3D printed in ASA (Acrylonitrile Styrene Acrylate), a UV-stable engineering plastic with a heat deflection temperature of around 95°C (manufacturer data). It is chosen to hold its shape and colour on a sunny dashboard, but very high cabin temperatures can still affect any plastic, so we recommend a windscreen sunshade when parked in direct sun.',
  },
  {
    question: 'How difficult is the Nav Pod Kit installation?',
    answer:
      'Installation is a straightforward DIY process taking approximately 20-30 minutes using basic hand tools (Phillips screwdriver and trim tool). No cutting of your factory dashboard is required. Full step-by-step instructions are available in our online manual.',
  },
  {
    question: 'Will your parts fit with the original Subaru (OEM) nav pod parts?',
    answer:
      'Yes. If you have one or some of the parts from the factory USDM nav pod kit (Subaru part no. H0010SA950ML), any of our parts are made to fit. Our pod works with the original fascia, and our fascia works with the original pod, so you can mix and match. Slide the comparison below to see our pod next to the original, then see the original and Foz Prints parts fitted together. Need just one part? Replacement top covers, front fascias and radio mount brackets are in the shop as Dash Replacement Parts. Our parts are aftermarket, not genuine Subaru parts.',
    media: 'oem-fitment',
  },
  {
    question: 'What is the difference between the USDM spec and JDM spec nav pod?',
    answer:
      'The USDM spec (factory part no. H0010SA950ML) has a recessed, streamlined housing that sits further back into the dash cavity for a clean, factory-style look. The JDM spec (factory part no. H0017SA908) sits further forward with a steeper hood. Because the centre SG Forester dash pocket footprint is identical, our USDM spec pod fits both RHD (Australia, UK, Japan) and LHD (USA, Canada, Europe) Foresters.',
  },
];

export function getProductSeoData(product: Product) {
  const isNavPod = isNavPodProduct(product);

  const title =
    product.metadata?.seo_title ||
    (isNavPod ? NAV_POD_NAME : product.title);

  const description =
    product.metadata?.seo_description ||
    (isNavPod
      ? 'Relocate your SG Forester head unit to eye level with our custom 3D printed double DIN navigation pod upgrade kit. Designed to fit the factory dash, printed in UV-stable ASA.'
      : product.shortDescription ||
        product.description ||
        `Precision 3D printed ${product.title} designed for Subaru Forester models.`);

  const keywords = isNavPod
    ? [
        'SG Forester Nav Pod',
        'Forester Navigation Pod',
        'Subaru Forester Double DIN Pod',
        'SG Forester Dash Pod',
        'Forester Stereo Relocation',
        'Forester 2003-2008 Nav Housing',
        'Subaru H0010SA950ML',
        'H0010SA950ML replacement',
        'SG Forester nav pod broken clips',
        'H0017SA908',
      ]
    : undefined;

  return {
    isNavPod,
    title,
    description,
    keywords,
  };
}
