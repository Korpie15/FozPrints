import { Product } from '@/types/product';

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

export const NAV_POD_FAQS = [
  {
    question: 'Will this SG Forester nav pod fit standard 7-inch double DIN head units?',
    answer:
      'Yes, the Foz Prints SG Forester Double DIN Nav Pod is engineered to standard Double DIN dimensions (180mm x 100mm face) and fits aftermarket shallow-depth head units with Apple CarPlay / Android Auto, digital media receivers, and gauge displays.',
  },
  {
    question: 'What models and years of Subaru Forester does this nav pod fit?',
    answer:
      'It is designed for the second-generation Subaru Forester (SG chassis, model years 2003 to 2008) including XT, 2.5X, and 2.5XS with the USDM-spec dashboard pocket.',
  },
  {
    question: 'What material is used and will it warp in summer heat?',
    answer:
      'Our nav pods are 3D printed using engineering-grade ASA (Acrylonitrile Styrene Acrylate). ASA offers superior UV resistance and heat tolerance up to 95°C (203°F), preventing dashboard warping and fading under hot Australian and American sun.',
  },
  {
    question: 'How difficult is the nav pod installation?',
    answer:
      'Installation is a straightforward DIY process taking approximately 20-30 minutes using basic hand tools (Phillips screwdriver and trim tool). No cutting of your factory dashboard is required. Full step-by-step instructions are available in our online manual.',
  },
];

export function getProductSeoData(product: Product) {
  const isNavPod = isNavPodProduct(product);

  const title =
    product.metadata?.seo_title ||
    (isNavPod ? 'SG Forester Nav Pod - Double DIN Upgrade Kit (2003-2008)' : product.title);

  const description =
    product.metadata?.seo_description ||
    (isNavPod
      ? 'Relocate your SG Forester head unit to eye level with our custom 3D printed double DIN navigation pod upgrade kit. OEM fitment in heat-resistant ASA.'
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
      ]
    : undefined;

  return {
    isNavPod,
    title,
    description,
    keywords,
  };
}
