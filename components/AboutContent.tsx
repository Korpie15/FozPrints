'use client';

import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
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
                  Foz Prints was born out of necessity. As an SG Forester owner, 
                  I was tired of hunting for discontinued OEM parts or settling for brittle plastics that warped 
                  in the sun. I decided that if I couldn't buy the quality I wanted, I would engineer it.
                </p>
                <p>
                  What you see in this photo isn't just waste—it's the R&D process. It represents 
                  hundreds of hours of measuring, CAD modeling, and testing. We don't sell the first draft. 
                  We sell the version that finally met our standards after dozens of failed attempts.
                </p>
                <p>
                  We use advanced 3D printing techniques and heat-resistant ASA materials to create parts that 
                  blend seamlessly with your dashboard. Our goal is simple: to provide fellow enthusiasts with 
                  high-quality, functional upgrades that look and feel like factory equipment.
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
              Common questions about our 3D printed automotive parts.
            </p>

            <div className="faq-list">
              {/* Q1: Material / Heat Resistance */}
              <div className="faq-item">
                <button 
                  className={`faq-question ${openFaq === 1 ? 'faq-question-active' : ''}`}
                  onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                >
                  <span>Will these parts melt in the Australian sun?</span>
                  <ChevronDown className={`faq-icon ${openFaq === 1 ? 'faq-icon-active' : ''}`} size={20} />
                </button>
                {openFaq === 1 && (
                  <div className="faq-answer">
                    <p>
                      No. Unlike cheap PLA prints that warp in the heat, we use <strong>ASA (Acrylonitrile Styrene Acrylate)</strong>. 
                      This is an engineering-grade material specifically designed for outdoor and automotive use. 
                      It is UV resistant and heat resistant up to approximately 95°C, making it perfect for Australian summers.
                    </p>
                  </div>
                )}
              </div>

              {/* Q2: Smooth vs Textured */}
              <div className="faq-item">
                <button 
                  className={`faq-question ${openFaq === 2 ? 'faq-question-active' : ''}`}
                  onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                >
                  <span>What is the difference between Smooth and Textured?</span>
                  <ChevronDown className={`faq-icon ${openFaq === 2 ? 'faq-icon-active' : ''}`} size={20} />
                </button>
                {openFaq === 2 && (
                  <div className="faq-answer">
                    <p>
                      <strong>Textured:</strong> Printed using a "fuzzy skin" technique that mimics the grain of the OEM Subaru dashboard. This creates a matte, factory-style look that blends in seamlessly with your interior.
                      <br /><br />
                      <strong>Smooth:</strong> A standard, clean 3D printed finish. This option has a uniform surface for a simpler look without the added grain texture. Both options are finished products and ready to install.
                    </p>
                  </div>
                )}
              </div>

              {/* Q3: Installation Instructions */}
              <div className="faq-item">
                <button 
                  className={`faq-question ${openFaq === 3 ? 'faq-question-active' : ''}`}
                  onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                >
                  <span>How do I install the kit?</span>
                  <ChevronDown className={`faq-icon ${openFaq === 3 ? 'faq-icon-active' : ''}`} size={20} />
                </button>
                {openFaq === 3 && (
                  <div className="faq-answer">
                    <p>
                      We provide detailed digital step-by-step guides with photos for all our products. You can view or download the manual directly from our <a href="/manuals">Manuals section</a>.
                    </p>
                  </div>
                )}
              </div>

              {/* Q4: Shipping */}
              <div className="faq-item">
                <button 
                  className={`faq-question ${openFaq === 4 ? 'faq-question-active' : ''}`}
                  onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                >
                  <span>Do you ship internationally?</span>
                  <ChevronDown className={`faq-icon ${openFaq === 4 ? 'faq-icon-active' : ''}`} size={20} />
                </button>
                {openFaq === 4 && (
                  <div className="faq-answer">
                    <p>
                      We currently ship within Australia only, via Australia Post. Shipping costs and estimated delivery times will be calculated at checkout based on your postcode.
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
              Have questions or need assistance? We'd love to hear from you!
            </p>

            <div className="contact-form-section">
              <h3>Send us a message</h3>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" name="name" required />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" required />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input type="text" id="subject" name="subject" required />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows={6} required></textarea>
                </div>

                {/* Honeypot: hidden from people, filled in by bots */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
                  <label htmlFor="website">Leave this field empty</label>
                  <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSending}>
                  {isSending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
