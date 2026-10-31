import Image from 'next/image';
import Link from 'next/link';
import { CompareSlider } from './CompareSlider';

/**
 * Photos for the "fits the original Subaru parts" FAQ answer: the before/after slider and the
 * two mixed-part photos. Shown in the Nav Pod Kit FAQ and the About page FAQ.
 * The photos are already sized WebP files, so they're served as-is (`unoptimized`):
 * re-compressing them blurred the ASA texture.
 */
export function OemFitmentMedia() {
  return (
    <div className="faq-media">
      <figure className="faq-media-figure">
        <CompareSlider
          beforeSrc="/images/photos/compare/original.webp"
          beforeAlt="Original Subaru USDM nav pod installed on an SG Forester dashboard"
          beforeLabel="Original (OEM)"
          afterSrc="/images/photos/compare/new.webp"
          afterAlt="Foz Prints nav pod installed in the same position on an SG Forester dashboard"
          afterLabel="Foz Prints"
          width={1600}
          height={1200}
        />
        <figcaption className="faq-media-caption">
          Drag the slider to compare the original pod with the Foz Prints pod, shot from the same spot.
        </figcaption>
      </figure>
      <div className="faq-media-pair">
        <figure className="faq-media-figure">
          <Image
            src="/images/photos/oem-fitment/orig-facia-new-pod.webp"
            alt="Original Subaru front fascia fitted into a Foz Prints nav pod"
            width={1600}
            height={1200}
            sizes="(max-width: 640px) 100vw, 360px"
            unoptimized
          />
          <figcaption className="faq-media-caption">Original fascia in a Foz Prints pod</figcaption>
        </figure>
        <figure className="faq-media-figure">
          <Image
            src="/images/photos/oem-fitment/orig-nav-new-facia.webp"
            alt="Foz Prints front fascia fitted into an original Subaru nav pod"
            width={1600}
            height={2133}
            sizes="(max-width: 640px) 100vw, 360px"
            unoptimized
          />
          <figcaption className="faq-media-caption">Foz Prints fascia in an original pod</figcaption>
        </figure>
      </div>
      <Link href="/products/dash-replacement-parts" className="faq-media-link">
        Shop Dash Replacement Parts
      </Link>
    </div>
  );
}
