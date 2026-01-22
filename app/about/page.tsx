'use client';

import { Mail, MapPin, Phone, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import '../../styles/about.css';
import { FormEvent, useState } from 'react';
import { Toast } from '../../components/Toast';

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
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
      }),
      });

      if (response.ok) {
      setShowToast(true);
      form.reset();
      } else {
      alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('An error occurred. Please try again later.');
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
                alt="3D printed Subaru parts showing the R&D process"
                width={600}
                height={600}
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
                    We save trees by going digital! After you place your order, you will receive an email containing a PDF Installation Guide and a link to a YouTube video tutorial walking you through the process step-by-step.
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
                <span>How long does shipping take?</span>
                <ChevronDown className={`faq-icon ${openFaq === 4 ? 'faq-icon-active' : ''}`} size={20} />
              </button>
              {openFaq === 4 && (
                <div className="faq-answer">
                  <p>
                    All parts are printed to order. Please allow a <strong>1-5 business day lead time</strong> for us to manufacture your items before they are dispatched.
                    For delivery estimates, please view our full <a href="/policies/shipping-policy" className="faq-link">Shipping Policy</a>.
                  </p>
                </div>
              )}
            </div>

            {/* Q5: Returns */}
            <div className="faq-item">
              <button 
                className={`faq-question ${openFaq === 5 ? 'faq-question-active' : ''}`}
                onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}
              >
                <span>What is your return policy?</span>
                <ChevronDown className={`faq-icon ${openFaq === 5 ? 'faq-icon-active' : ''}`} size={20} />
              </button>
              {openFaq === 5 && (
                <div className="faq-answer">
                  <p>
                    Because our items are manufactured to order, all sales are final. However, if your item arrives damaged or defective, we will absolutely make it right <a href="/policies/refund-policy" className="faq-link">Refund Policy</a> page.
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

              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
