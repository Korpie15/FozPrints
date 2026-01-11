'use client';

import { Download, ChevronRight, AlertCircle, Video, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import '../../../styles/manual-detail.css';

export default function DoubleDinPodUpgradeKitManual() {
  const [openTroubleshooting, setOpenTroubleshooting] = useState<number | null>(null);
  
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="manual-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/manuals">Manuals</Link>
          <ChevronRight size={16} />
          <span>Double DIN Pod Upgrade Kit</span>
        </div>

        {/* Header */}
        <div className="manual-header">
          <h1>Double DIN Pod Upgrade Kit Installation Guide</h1>
          <p className="manual-subtitle">For Subaru Forester SG (2003-2008), USDM Spec</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleDownloadPDF}
              className="download-pdf-button"
            >
              <Download size={20} />
              Download PDF Version
            </button>
            <a
              href="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
              target="_blank"
              rel="noopener noreferrer"
              className="download-pdf-button"
              style={{ textDecoration: 'none' }}
            >
              <Video size={20} />
              Watch Video Walkthrough
            </a>
          </div>
        </div>

        {/* Tools Required */}
        <div className="manual-section-with-image">
          <div className="manual-section-text">
            <h2>Tools Required</h2>
            <ul className="tools-list">
              <li>Phillips head screwdriver (electric screwdriver will make things go faster)</li>
              <li>Trim removal tool (optional but recommended), flat head screwdriver will also work fine</li>
            </ul>
            <br />
            <br />
            <h2>Parts Required</h2>
            <br />
            <h4>Included in the Kit:</h4>
            <ul className="tools-list">
              <li>Nav pod</li>
              <li>Left and right brackets</li>
              <li>Front cover</li>
              <li>4 screws</li>
            </ul>
            <br />
            <h4>Not Included:</h4>
            <ul className="tools-list">
              <li>Headunit</li>
            </ul>
          </div>
          <div className="manual-section-image">
            <Image
              src="/images/parts-layout.jpg"
              alt="Parts and tools layout"
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

        {/* Installation Steps */}
        <div className="manual-section">
          <h2>Installation Instructions</h2>
          
          {/* Section 1: Removal */}
          <h3 style={{ marginTop: '2rem', marginBottom: '1.5rem', fontSize: '1.5rem', color: '#111827' }}>Removal of the Existing Top Storage Compartment</h3>

          {/* Step 1 */}
          <div className="installation-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Remove the Storage Compartment</h3>
              <p>
                Use a flat-head screwdriver or trim removal tool to pop off the top storage compartment
                by moving around the edges at the front. It is only held in by clips and no screws.
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
              <h3>Disconnect clock wiring harness</h3>
              <p>
                Locate the one cable plugged into the storage compartment and unplug it. Once unplugged,
                tuck the wiring harness out of the way as low as possible. 
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
              <h3>Remove the Storage Compartment</h3>
              <p>
                Everything should now be disconnected and you can fully remove the storage compartment 
                from the dash. But don't put it to the side just yet!
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
              <h3>Remove the screws from the Storage Compartment</h3>
              <p>
                Turn the existing storage compartment upside down and remove the two screws from the front of the storage compartment. 
                Ensure you put these screws aside as you will need them later to install the front cover of the nav pod.
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
          <h3 style={{ marginTop: '3rem', marginBottom: '1.5rem', fontSize: '1.5rem', color: '#111827' }}>Installing the Nav Pod</h3>

          {/* Step 5 */}
          <div className="installation-step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>Attach the Left and Right Brackets</h3>
              <p>
                Attach the left and right radio mount brackets to your headunit by aligning the holes 
                in the brackets with the holes in the sides of your headunit. Use the 4 screws provided 
                to securely fasten the brackets to the headunit, use 2 screws per side.
              </p>
              <div className="step-images two-images">
              <div className="step-image">
                <Image
                  src="/images/step5-image1.jpg"
                  alt="Attaching and lining up brackets to headunit"
                  width={400}
                  height={300}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              <div className="step-image">
                <Image
                  src="/images/step5-image2.jpg"
                  alt="Front on view of headunit with brackets attached"
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
              <h3>Run wiring</h3>
              <p>
                Run all necessary wiring up and into the space where the new nav pod kit will be
                installed. This includes your radio antenna and wiring harness and possibly your reverse
                camera or any other cables you may have.
              </p>
            </div>
          </div>

          {/* Step 7 */}
          <div className="installation-step">
            <div className="step-number">7</div>
            <div className="step-content">
              <h3>Connect wiring</h3>
              <p>
                Plug all necessary wiring into the rear of your headunit now before installing it
                into the nav pod.
              </p>
            </div>
          </div>

          {/* Step 8 */}
          <div className="installation-step">
            <div className="step-number">8</div>
            <div className="step-content">
              <h3>Align the headunit</h3>
              <p>
                Place in the headunit with the brackets in the empty gap where the previous storage compartment was.
                Ensure you align the holes on the left and right brackets with the holes in the car.
              </p>
              <div className="step-images two-images">
              <div className="step-image">
                <Image
                  src="/images/step8-image1.jpg"
                  alt="Red circles showing where to align headunit brackets to car mounting points"
                  width={400}
                  height={300}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              <div className="step-image">
                <Image
                  src="/images/step8-image2.jpg"
                  alt="Headunit with brackets aligned to car mounting points"
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
              <h3>Secure and install your headunit</h3>
              <p>
                Screw in the headunit with 4 screws loosely to allow for minor adjustments later on.
                <strong> Caution:</strong> Ensure screws are handled carefully during installation to prevent them from
                falling into the dashboard assembly.
              </p>
              <div className="step-images single-image wider panoramic-container">
              <div className="step-image panoramic">
                <Image
                  src="/images/step9-image.jpg"
                  alt="Screwing in headunit with brackets into car mounting points"
                  width={600}
                  height={400}
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
              <h3>Install the front cover</h3>
              <p>
                Place in the front cover and screw in the two screws on either side using the two screws you put aside in step 4. 
                You might notice a gap forming underneath the headunit to the front cover. Simply flex and adjust the
                positions and angles of the mounts and screws until you are happy with the fitment.
              </p>
              <div className="step-images single-image">
              <div className="step-image">
                <Image
                  src="/images/step10-image1.jpg"
                  alt="Image shhowing gap between headunit and front cover"
                  width={600}
                  height={400}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            </div>
              < br/>
              <p>In the end it should look something like this:</p>
              <div className="step-images single-image">
              <div className="step-image">
                <Image
                  src="/images/step10-image2.jpg"
                  alt="Shows gap disappearing once screws are tightened properly"
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
              <h3>Tighten all screws</h3>
              <p>
                Once you are happy with the positioning of the headunit and front cover, go ahead and tighten all screws securely.
              </p>
            </div>
          </div>

          {/* Step 12 */}
          <div className="installation-step">
            <div className="step-number">12</div>
            <div className="step-content">
              <h3>Install the navpod</h3>
              <p>
                Simply place on and press down on the nav pod. A little force may be required. Just
                push down until it all fits snugly in place.
              </p>
              <div className="step-images two-images">
              <div className="step-image">
                <Image
                  src="/images/step12-image1.jpg"
                  alt="Navpod loosely placed on top of headunit"
                  width={400}
                  height={300}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              <div className="step-image">
                <Image
                  src="/images/step12-image2.jpg"
                  alt="Navpod fully installed on top of headunit"
                  width={400}
                  height={300}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="manual-section">
          <h2>Troubleshooting</h2>
          <div className="troubleshooting-list">
            <div className="troubleshooting-item">
              <button 
                className={`troubleshooting-question ${openTroubleshooting === 1 ? 'troubleshooting-question-active' : ''}`}
                onClick={() => setOpenTroubleshooting(openTroubleshooting === 1 ? null : 1)}
              >
                <span>Wiring harness interferes with installation</span>
                <ChevronDown className={`troubleshooting-icon ${openTroubleshooting === 1 ? 'troubleshooting-icon-active' : ''}`} size={20} />
              </button>
              {openTroubleshooting === 1 && (
                <div className="troubleshooting-answer">
                  <p>
                    Make sure the clock wiring harness is tucked as low as possible after 
                    disconnecting. You may need to push it further down with your fingers to 
                    create enough clearance for the headunit.
                  </p>
                </div>
              )}
            </div>

            <div className="troubleshooting-item">
              <button 
                className={`troubleshooting-question ${openTroubleshooting === 2 ? 'troubleshooting-question-active' : ''}`}
                onClick={() => setOpenTroubleshooting(openTroubleshooting === 2 ? null : 2)}
              >
                <span>Brackets don't align with car mounting points</span>
                <ChevronDown className={`troubleshooting-icon ${openTroubleshooting === 2 ? 'troubleshooting-icon-active' : ''}`} size={20} />
              </button>
              {openTroubleshooting === 2 && (
                <div className="troubleshooting-answer">
                  <p>
                    Double-check you have the correct model kit for your Forester year (SG 2003-2008 USDM). 
                    Ensure the brackets are attached to the correct sides of the headunit. Try loosening 
                    the bracket screws slightly to allow for minor adjustments.
                  </p>
                </div>
              )}
            </div>

            <div className="troubleshooting-item">
              <button 
                className={`troubleshooting-question ${openTroubleshooting === 3 ? 'troubleshooting-question-active' : ''}`}
                onClick={() => setOpenTroubleshooting(openTroubleshooting === 3 ? null : 3)}
              >
                <span>Gap between headunit and front cover</span>
                <ChevronDown className={`troubleshooting-icon ${openTroubleshooting === 3 ? 'troubleshooting-icon-active' : ''}`} size={20} />
              </button>
              {openTroubleshooting === 3 && (
                <div className="troubleshooting-answer">
                  <p>
                    This is normal initially. Before tightening, flex and adjust the position of the 
                    brackets and headunit. You may need to loosen all screws, reposition, and 
                    gradually tighten them evenly to eliminate the gap.
                  </p>
                </div>
              )}
            </div>

            <div className="troubleshooting-item">
              <button 
                className={`troubleshooting-question ${openTroubleshooting === 4 ? 'troubleshooting-question-active' : ''}`}
                onClick={() => setOpenTroubleshooting(openTroubleshooting === 4 ? null : 4)}
              >
                <span>Screws keep falling into the dashboard</span>
                <ChevronDown className={`troubleshooting-icon ${openTroubleshooting === 4 ? 'troubleshooting-icon-active' : ''}`} size={20} />
              </button>
              {openTroubleshooting === 4 && (
                <div className="troubleshooting-answer">
                  <p>
                    Work carefully and consider using magnetic-tip screwdrivers. Hold screws with 
                    your fingers as you start threading them. If a screw does fall, you may be able 
                    to retrieve it from below.
                  </p>
                </div>
              )}
            </div>

            <div className="troubleshooting-item">
              <button 
                className={`troubleshooting-question ${openTroubleshooting === 5 ? 'troubleshooting-question-active' : ''}`}
                onClick={() => setOpenTroubleshooting(openTroubleshooting === 5 ? null : 5)}
              >
                <span>Nav pod won't press down fully</span>
                <ChevronDown className={`troubleshooting-icon ${openTroubleshooting === 5 ? 'troubleshooting-icon-active' : ''}`} size={20} />
              </button>
              {openTroubleshooting === 5 && (
                <div className="troubleshooting-answer">
                  <p>
                    Ensure the front cover is properly installed and all mounting tabs are aligned. 
                    Check that no wiring is obstructing the installation. Apply firm, even pressure 
                    across the entire nav pod surface until you hear/feel it click into place.
                  </p>
                </div>
              )}
            </div>

            <div className="troubleshooting-item">
              <button 
                className={`troubleshooting-question ${openTroubleshooting === 6 ? 'troubleshooting-question-active' : ''}`}
                onClick={() => setOpenTroubleshooting(openTroubleshooting === 6 ? null : 6)}
              >
                <span>Headunit feels loose after installation</span>
                <ChevronDown className={`troubleshooting-icon ${openTroubleshooting === 6 ? 'troubleshooting-icon-active' : ''}`} size={20} />
              </button>
              {openTroubleshooting === 6 && (
                <div className="troubleshooting-answer">
                  <p>
                    Check all 6 screws are properly tightened (4 for the headunit brackets and 2 for 
                    the front cover). Ensure brackets are firmly attached to the headunit. The nav pod 
                    pressing down on top also helps secure everything in place.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="support-box">
          <h3>Need Help?</h3>
          <p>
            If you encounter any issues during installation, please contact us at{' '}
            <a href="mailto:info@fozprints.com.au">info@fozprints.com.au</a>
          </p>
        </div>
      </div>
    </div>
  );
}
