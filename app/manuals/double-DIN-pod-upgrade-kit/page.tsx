import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Download, ChevronRight, AlertCircle } from 'lucide-react';
import { TroubleshootingAccordion } from '@/components/TroubleshootingAccordion';
import '../../../styles/manual-detail.css';
import { SITE_URL } from '@/lib/site';
import { NAV_POD_NAME } from '@/lib/product-seo';
import { NAV_POD_SAFETY } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Nav Pod Kit Installation Guide: Subaru Forester SG (2003 to 2008)',
  description:
    `Complete step-by-step DIY installation manual with photos for the ${NAV_POD_NAME}.`,
  keywords: [
    'SG Forester Nav Pod Install',
    'Subaru Forester Navigation Pod Installation Guide',
    'Forester Double DIN Pod Instructions',
    'SG Forester stereo relocation',
  ],
  alternates: {
    canonical: '/manuals/double-DIN-pod-upgrade-kit',
  },
  openGraph: {
    title: 'Nav Pod Kit Installation Guide: Subaru Forester SG (2003 to 2008) | Foz Prints',
    description:
      `Complete step-by-step DIY installation manual with photos for the ${NAV_POD_NAME}.`,
    url: `${SITE_URL}/manuals/double-DIN-pod-upgrade-kit`,
    images: [{ url: '/images/parts-layout.jpg', alt: 'Nav Pod Kit parts' }],
  },
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: `Installing the ${NAV_POD_NAME}`,
  description:
    'Complete step-by-step DIY guide to installing the Nav Pod Kit in a Subaru Forester SG (2003 to 2008).',
  totalTime: 'PT20M',
  tool: [
    { '@type': 'HowToTool', name: 'Phillips head screwdriver' },
    { '@type': 'HowToTool', name: 'Trim removal tool or flat head screwdriver' },
  ],
  supply: [
    { '@type': 'HowToSupply', name: 'Nav pod' },
    { '@type': 'HowToSupply', name: 'Left and Right Brackets' },
    { '@type': 'HowToSupply', name: 'Front cover' },
    { '@type': 'HowToSupply', name: '4 bracket screws (included)' },
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Pry Up the Storage Compartment',
      text: 'Use a flat-head screwdriver or trim removal tool to pop off the top storage compartment by moving around the edges at the front.',
    },
    {
      '@type': 'HowToStep',
      name: 'Disconnect clock wiring harness',
      text: 'Locate the cable plugged into the storage compartment and unplug it. Tuck the wiring harness low.',
    },
    {
      '@type': 'HowToStep',
      name: 'Attach the Left and Right Brackets',
      text: 'Attach the left and right brackets to your head unit using the 4 screws included in the kit (2 per side).',
    },
    {
      '@type': 'HowToStep',
      name: 'Install the Nav Pod',
      text: 'Press down on the Nav Pod until it fits snugly in place.',
    },
  ],
};

export default function DoubleDinPodUpgradeKitManual() {
  return (
    <div className="manual-detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/manuals">Manuals</Link>
          <ChevronRight size={16} />
          <span>Nav Pod Kit</span>
        </div>

        {/* Header */}
        <div className="manual-header">
          <h1>Nav Pod Kit Installation Guide</h1>
          <p className="manual-subtitle">For the Subaru Forester SG (2003 to 2008), USDM Spec</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/products/subaru-forester-sg-double-din-nav-pod-kit-20032008-usdm-spec"
              className="download-pdf-button"
              style={{
                textDecoration: 'none',
                backgroundColor: '#0369a1',
                borderColor: '#0369a1',
                color: '#ffffff',
              }}
            >
              Order the Nav Pod Kit &rarr;
            </Link>
            <a
              href="/manuals/double-din-pod-upgrade-kit-guide.pdf"
              download
              className="download-pdf-button"
              style={{ textDecoration: 'none' }}
            >
              <Download size={20} />
              Download PDF Version
            </a>
          </div>
        </div>

        {/* Tools Required */}
        <div className="manual-section-with-image">
          <div className="manual-section-text">
            <h2>Tools & Parts Required</h2>
            <h3 style={{ fontSize: '1.125rem', marginTop: '1rem' }}>Tools Required:</h3>
            <ul className="tools-list">
              <li>Phillips head screwdriver (a cordless driver speeds this up)</li>
              <li>Plastic trim tool (or flathead screwdriver wrapped in tape to protect dash plastic)</li>
            </ul>
            <h3 style={{ fontSize: '1.125rem', marginTop: '1.5rem' }}>Included in the Kit:</h3>
            <ul className="tools-list">
              <li>Nav pod</li>
              <li>Left and right brackets</li>
              <li>Front cover</li>
              <li>4 bracket screws (fix the brackets to your head unit in step 5)</li>
            </ul>
            <h3 style={{ fontSize: '1.125rem', marginTop: '1.5rem' }}>Not Included:</h3>
            <ul className="tools-list">
              <li>Aftermarket Double DIN head unit</li>
            </ul>

            <div className="manual-oem-callout">
              <strong>💡 Factory pod compatibility (Subaru part no. H0010SA950ML):</strong>
              <p>
                Foz Prints parts are designed to fit the factory Subaru USDM nav pod. If you are using this guide to replace a cracked shell, broken clips or missing brackets on an original pod, the mounting steps and hardware positions are the same.
              </p>
            </div>
          </div>
          <div className="manual-section-image">
            <Image
              src="/images/parts-layout.jpg"
              alt="Nav Pod Kit parts and the tools needed to install it"
              width={600}
              height={600}
              style={{ objectFit: 'cover', borderRadius: '0.5rem' }}
            />
          </div>
        </div>

        {/* Time Estimate */}
        <div className="info-box">
          <AlertCircle size={20} />
          <div>
            <strong>Estimated Time:</strong> 15-20 minutes
            <br />
            <strong>Difficulty:</strong> Easy
          </div>
        </div>

        {/* Safety */}
        <div className="info-box">
          <AlertCircle size={20} />
          <div>
            <strong>Before you start:</strong> disconnect the negative (-) battery terminal before unplugging or
            connecting any wiring. Some head units lose their presets, or ask for a security code, after the battery
            has been disconnected.
          </div>
        </div>

        <div className="info-box">
          <AlertCircle size={20} />
          <div>
            <strong>Important safety information</strong>
            <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.1rem', listStyle: 'disc' }}>
              {NAV_POD_SAFETY.map((point) => (
                <li key={point} style={{ marginBottom: '0.25rem' }}>{point}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Installation Steps */}
        <div className="manual-section">
          <h2>Step-by-Step Installation Instructions</h2>

          {/* Section 1: Removal */}
          <h3 style={{ marginTop: '2rem', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Part 1: Removal of Existing Top Storage Compartment
          </h3>

          {/* Step 1 */}
          <div className="installation-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Pry Up Storage Compartment</h3>
              <p>
                Use a trim removal tool or taped flathead screwdriver to gently pry along the front edge of the top storage compartment. It is held in place by friction clips without any hidden screws.
              </p>
              <div className="step-images single-image">
                <div className="step-image">
                  <Image
                    src="/images/step1-image.jpg"
                    alt="Using flathead screwdriver to pry out existing storage compartment"
                    width={600}
                    height={400}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="installation-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Disconnect Clock Wiring Harness</h3>
              <p>
                Locate the single cable plugged into the storage compartment and unplug it. Once unplugged, tuck the wiring harness out of the way as low as possible.
              </p>
              <div className="step-images two-images">
                <div className="step-image">
                  <Image
                    src="/images/step2-image1.jpg"
                    alt="Unplugging clock wiring harness from storage compartment"
                    width={600}
                    height={400}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
                <div className="step-image">
                  <Image
                    src="/images/step2-image2.jpg"
                    alt="Tucking wiring harness out of the way as low as possible"
                    width={400}
                    height={300}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="installation-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Lift Out Storage Compartment</h3>
              <p>
                With the harness detached, lift the storage compartment clear out of the dash cavity.
              </p>
              <div className="step-images single-image">
                <div className="step-image">
                  <Image
                    src="/images/step3-image.jpg"
                    alt="Removing the existing storage compartment"
                    width={600}
                    height={400}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="installation-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Remove Screws from Storage Compartment</h3>
              <p>
                Turn the existing storage compartment upside down and remove the two screws from the front. Put these screws aside to install the front cover later.
              </p>
              <div className="step-images single-image">
                <div className="step-image bottom-aligned">
                  <Image
                    src="/images/step4-image.jpg"
                    alt="Removing the screws from the storage compartment"
                    width={600}
                    height={400}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Installation */}
          <h3 style={{ marginTop: '3rem', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Part 2: Installing the Nav Pod
          </h3>

          {/* Step 5 */}
          <div className="installation-step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>Attach Left and Right Brackets</h3>
              <p>
                Attach the left and right radio mount brackets to your head unit by aligning the bracket holes with the head unit side mounting holes. Fasten using the 4 screws from the kit, 2 per side.
              </p>
              <div className="step-images two-images">
                <div className="step-image">
                  <Image
                    src="/images/step5-image1.jpg"
                    alt="Attaching and lining up brackets to head unit"
                    width={400}
                    height={300}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
                <div className="step-image">
                  <Image
                    src="/images/step5-image2.jpg"
                    alt="Front on view of head unit with brackets attached"
                    width={400}
                    height={300}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="installation-step">
            <div className="step-number">6</div>
            <div className="step-content">
              <h3>Run Wiring</h3>
              <p>
                Run all necessary wiring into the top dash cavity where the Nav Pod will sit. This includes radio antenna, main harness, and optional reverse camera wires.
              </p>
            </div>
          </div>

          {/* Step 7 */}
          <div className="installation-step">
            <div className="step-number">7</div>
            <div className="step-content">
              <h3>Connect Wiring</h3>
              <p>
                Plug all wiring into the back of your head unit before lowering it into place.
              </p>
              <p>
                <strong>Test before you fit it:</strong> reconnect the battery and check the head unit powers on,
                plays sound through every speaker, picks up radio and shows the reversing camera (if fitted). It&apos;s
                much easier to fix a loose plug now than after the pod is screwed in. Disconnect the battery again
                before carrying on.
              </p>
            </div>
          </div>

          {/* Step 8 */}
          <div className="installation-step">
            <div className="step-number">8</div>
            <div className="step-content">
              <h3>Align the Head Unit</h3>
              <p>
                Lower the head unit into the dash cavity and align bracket holes with the factory mounting points on the car frame.
              </p>
              <div className="step-images two-images">
                <div className="step-image">
                  <Image
                    src="/images/step8-image1.jpg"
                    alt="Red circles showing where to align head unit brackets to car mounting points"
                    width={400}
                    height={300}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
                <div className="step-image">
                  <Image
                    src="/images/step8-image2.jpg"
                    alt="Head unit with brackets aligned to car mounting points"
                    width={400}
                    height={300}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 9 */}
          <div className="installation-step">
            <div className="step-number">9</div>
            <div className="step-content">
              <h3>Secure Head Unit Mounts</h3>
              <p>
                Insert the car&apos;s 4 factory screws loosely into the mounting points (these are already in the car, not part of the kit). Keep them slightly loose for final adjustment.
              </p>
              <div className="step-images single-image wider panoramic-container">
                <div className="step-image panoramic">
                  <Image
                    src="/images/step9-image.jpg"
                    alt="Screwing in head unit with brackets into car mounting points"
                    width={773}
                    height={214}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 10 */}
          <div className="installation-step">
            <div className="step-number">10</div>
            <div className="step-content">
              <h3>Install Front Cover Panel</h3>
              <p>
                Position the front cover and insert the 2 screws set aside in step 4. Adjust the bracket positions until the gap under the head unit is fully closed.
              </p>
              <div className="step-images two-images">
                <div className="step-image">
                  <Image
                    src="/images/step10-image1.jpg"
                    alt="Gap alignment check between head unit and front cover panel"
                    width={600}
                    height={400}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
                <div className="step-image">
                  <Image
                    src="/images/step10-image2.jpg"
                    alt="Final flush fitment once screws are tightened"
                    width={600}
                    height={400}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 11 */}
          <div className="installation-step">
            <div className="step-number">11</div>
            <div className="step-content">
              <h3>Tighten Screws</h3>
              <p>
                Once satisfied with the alignment, tighten all mounting screws securely.
              </p>
            </div>
          </div>

          {/* Step 12 */}
          <div className="installation-step">
            <div className="step-number">12</div>
            <div className="step-content">
              <h3>Install Top Nav Pod Housing</h3>
              <p>
                Press the main nav pod housing straight down until it clicks securely over the assembly.
              </p>
              <div className="step-images two-images">
                <div className="step-image">
                  <Image
                    src="/images/step12-image1.jpg"
                    alt="Nav Pod loosely placed on top of the head unit"
                    width={400}
                    height={300}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
                <div className="step-image">
                  <Image
                    src="/images/step12-image2.jpg"
                    alt="Nav Pod fully installed on top of the head unit"
                    width={400}
                    height={300}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting Section */}
        <div className="manual-section">
          <h2>Troubleshooting & Frequently Asked Questions</h2>
          <TroubleshootingAccordion />
        </div>

        {/* Purchase Kit Callout */}
        <div className="support-box" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3>Need to Order Your Kit?</h3>
          <p>
            Upgrade your Forester dashboard today with our precision 3D printed double DIN navigation pod, printed in heat-resistant ASA.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <Link
              href="/products/subaru-forester-sg-double-din-nav-pod-kit-20032008-usdm-spec"
              className="download-pdf-button"
              style={{
                textDecoration: 'none',
                backgroundColor: '#0369a1',
                borderColor: '#0369a1',
                color: '#ffffff',
                display: 'inline-block',
              }}
            >
              Shop the Nav Pod Kit &rarr;
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="support-box">
          <h3>Need Help with Installation?</h3>
          <p>
            If you encounter any issues during installation, please contact us at{' '}
            <a href="mailto:info@fozprints.com.au">info@fozprints.com.au</a> or visit our{' '}
            <Link href="/about#contact">Contact Page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
