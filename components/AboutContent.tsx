'use client';

import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Toast } from './Toast';
import '../styles/about.css';

export function AboutContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSending) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    const website = formData.get('website');

    setIsSending(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          website,
        }),
      });

      if (response.ok) {
        setShowToast(true);
        form.reset();
      } else {
        const data = await response.json().catch(() => null);
        alert(data?.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('An error occurred. Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {showToast && (
        <Toast
          message="Message sent successfully!"
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="about-page">
        {/* About Section */}
        <section className="about-section">
          <div className="container">
            <h1>About Foz Prints</h1>
            <div className="about-content-grid">
              <div className="about-text">
                <p>
                  Finding decent interior parts for an SG Forester shouldn't mean paying hundreds of dollars for a
                  20-year-old cracked factory bezel, or settling for generic plastic that sags in the sun.
                </p>
                <p>
                  I started Foz Prints to fix that problem for my own car. That pile in the photo is what it actually 
                  took to get the fitment right: months of CAD revisions, test prints, and scrapped prototypes 
                  dialling in clip tolerances and shrinkage so everything snaps into place like factory trim.
                </p>
                <p>
                  Every part is printed locally in ASA, a UV-stable, heat-resistant engineering plastic chosen
                  for life on a black dashboard through an Australian summer.
                </p>
              </div>
              <div className="about-image">
                <Image
                  src="/images/aboutUs.jpg"
                  alt="Subaru Forester 3D printing research and development prototype parts"
                  width={600}
                  height={600}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="faq-section">
          <div className="container">
            <h2>Frequently Asked Questions</h2>
            <p className="faq-intro">
              Common questions about fitment, materials, and ordering.
            </p>

            <div className="faq-list">
              {/* Q1: Material / Heat Resistance */}
              <div className="faq-item">
                <button 
                  className={`faq-question ${openFaq === 1 ? 'faq-question-active' : ''}`}
                  onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                  aria-expanded={openFaq === 1}
                  aria-controls="faq-answer-1"
                >
                  <span>Will these parts melt in the Australian sun?</span>
                  <ChevronDown className={`faq-icon ${openFaq === 1 ? 'faq-icon-active' : ''}`} size={20} />
                </button>
                {openFaq === 1 && (
                  <div className="faq-answer" id="faq-answer-1">
                    <p>
                      They&apos;re designed not to. The parts are printed in <strong>ASA (Acrylonitrile Styrene Acrylate)</strong>, a UV-stable engineering plastic with a heat deflection temperature of around 95°C (manufacturer data), well above PLA&apos;s roughly 55°C. Very high cabin temperatures can still affect any plastic, so we recommend a windscreen sunshade when you park in direct sun.
                    </p>
                  </div>
                )}
              </div>

              {/* Q2: Smooth vs Textured */}
              <div className="faq-item">
                <button 
                  className={`faq-question ${openFaq === 2 ? 'faq-question-active' : ''}`}
                  onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                  aria-expanded={openFaq === 2}
                  aria-controls="faq-answer-2"
                >
                  <span>What is the difference between Smooth and Textured?</span>
                  <ChevronDown className={`faq-icon ${openFaq === 2 ? 'faq-icon-active' : ''}`} size={20} />
                </button>
                {openFaq === 2 && (
                  <div className="faq-answer" id="faq-answer-2">
                    <p>
                      <strong>Textured:</strong> Uses a fuzzy skin finish that closely matches the grain and matte look of the factory SG Subaru dashboard, so it blends straight into the cabin.
                      <br /><br />
                      <strong>Smooth:</strong> A clean, uniform 3D printed surface without the grain texture. Both are finished parts ready to install out of the box.
                    </p>
                  </div>
                )}
              </div>

              {/* Q3: Installation Instructions */}
              <div className="faq-item">
                <button 
                  className={`faq-question ${openFaq === 3 ? 'faq-question-active' : ''}`}
                  onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                  aria-expanded={openFaq === 3}
                  aria-controls="faq-answer-3"
                >
                  <span>How do I install the kit?</span>
                  <ChevronDown className={`faq-icon ${openFaq === 3 ? 'faq-icon-active' : ''}`} size={20} />
                </button>
                {openFaq === 3 && (
                  <div className="faq-answer" id="faq-answer-3">
                    <p>
                      Step-by-step digital install guides with photos are available in the <a href="/manuals" className="faq-link">Manuals section</a>.
                    </p>
                  </div>
                )}
              </div>

              {/* Q4: Shipping */}
              <div className="faq-item">
                <button 
                  className={`faq-question ${openFaq === 4 ? 'faq-question-active' : ''}`}
                  onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                  aria-expanded={openFaq === 4}
                  aria-controls="faq-answer-4"
                >
                  <span>Do you ship internationally?</span>
                  <ChevronDown className={`faq-icon ${openFaq === 4 ? 'faq-icon-active' : ''}`} size={20} />
                </button>
                {openFaq === 4 && (
                  <div className="faq-answer" id="faq-answer-4">
                    <p>
                      We currently ship within Australia only, via Australia Post. The Nav Pod Kit ships free with Australia Post standard shipping. For everything else, the shipping cost and delivery estimate are calculated at checkout from your postcode.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact-section">
          <div className="container">
            <h2>Contact Us</h2>
            <p className="contact-intro">
              Got a question about fitment, lead times, or custom prints? Drop a message below, or email{' '}
              <a href="mailto:info@fozprints.com.au" className="faq-link">info@fozprints.com.au</a>.
            </p>

            <div className="contact-form-section">
              <h3>Send us a message</h3>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" name="name" required maxLength={100} autoComplete="name" />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" required maxLength={254} autoComplete="email" />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input type="text" id="subject" name="subject" required maxLength={150} />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows={6} required maxLength={5000}></textarea>
                </div>

                {/* Honeypot: hidden from people, filled in by bots */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
                  <label htmlFor="website">Leave this field empty</label>
                  <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSending}>
                  {isSending ? 'Sending...' : 'Send Message'}
                </button>
                <p className="contact-privacy-note">
                  We only use your details to reply to your message. See our{' '}
                  <Link href="/policies/privacy-policy">Privacy Policy</Link>.
                </p>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
