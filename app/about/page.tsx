'use client';

import { Mail, MapPin, Phone, ChevronDown } from 'lucide-react';
import '../../styles/about.css';
import { FormEvent, useState } from 'react';

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    // Create mailto link with form data
    const mailtoLink = `mailto:info@fozprints.com.au?subject=${encodeURIComponent(subject as string)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    
    // Open email client
    window.location.href = mailtoLink;
  };
  return (
    <div className="about-page">
      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <h1>About Foz Prints</h1>
          <div className="about-content">
            <p>
              Welcome to Foz Prints, your premier destination for high-quality Subaru Forester 
              prints and merchandise. We're passionate about the iconic Subaru Forester and 
              dedicated to bringing unique, artistic designs to fellow enthusiasts.
            </p>
            <p>
              Our collection features carefully curated prints that celebrate the spirit of 
              adventure and reliability that the Subaru Forester represents. Each design is 
              created with attention to detail and printed using premium materials to ensure 
              lasting quality.
            </p>
            <p>
              Whether you're looking to decorate your garage, office, or give the perfect gift 
              to a Subaru enthusiast, we've got you covered. Our prints are printed on demand 
              to reduce waste and ensure the freshest product for every order.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <p className="faq-intro">
            Find answers to common questions about our products and services.
          </p>

          <div className="faq-list">
            <div className="faq-item">
              <button 
                className={`faq-question ${openFaq === 1 ? 'faq-question-active' : ''}`}
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
              >
                <span>What materials are your prints made from?</span>
                <ChevronDown className={`faq-icon ${openFaq === 1 ? 'faq-icon-active' : ''}`} size={20} />
              </button>
              {openFaq === 1 && (
                <div className="faq-answer">
                  <p>
                    Our prints are made using premium quality materials including high-grade paper stock 
                    and archival inks that ensure vibrant colors and long-lasting durability. Each print 
                    is carefully inspected before shipping to guarantee the highest quality standards.
                  </p>
                </div>
              )}
            </div>

            <div className="faq-item">
              <button 
                className={`faq-question ${openFaq === 2 ? 'faq-question-active' : ''}`}
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
              >
                <span>How long does shipping take?</span>
                <ChevronDown className={`faq-icon ${openFaq === 2 ? 'faq-icon-active' : ''}`} size={20} />
              </button>
              {openFaq === 2 && (
                <div className="faq-answer">
                  <p>
                    Standard shipping typically takes 5-7 business days within Australia. Express shipping 
                    options are available at checkout for faster delivery. You'll receive a tracking number 
                    once your order ships so you can monitor its progress.
                  </p>
                </div>
              )}
            </div>

            <div className="faq-item">
              <button 
                className={`faq-question ${openFaq === 3 ? 'faq-question-active' : ''}`}
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
              >
                <span>Do you offer custom designs?</span>
                <ChevronDown className={`faq-icon ${openFaq === 3 ? 'faq-icon-active' : ''}`} size={20} />
              </button>
              {openFaq === 3 && (
                <div className="faq-answer">
                  <p>
                    Yes! We love working with customers on custom designs. Whether you want a specific 
                    model year, color, or have a unique idea in mind, get in touch with us through the 
                    contact form below and we'll discuss how we can bring your vision to life.
                  </p>
                </div>
              )}
            </div>

            <div className="faq-item">
              <button 
                className={`faq-question ${openFaq === 4 ? 'faq-question-active' : ''}`}
                onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
              >
                <span>What is your return policy?</span>
                <ChevronDown className={`faq-icon ${openFaq === 4 ? 'faq-icon-active' : ''}`} size={20} />
              </button>
              {openFaq === 4 && (
                <div className="faq-answer">
                  <p>
                    We want you to be completely satisfied with your purchase. If you're not happy with 
                    your order, you can return it within 30 days of delivery for a full refund or exchange. 
                    Items must be in their original condition and packaging. Contact us to initiate a return.
                  </p>
                </div>
              )}
            </div>

            <div className="faq-item">
              <button 
                className={`faq-question ${openFaq === 5 ? 'faq-question-active' : ''}`}
                onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}
              >
                <span>Are frames included with the prints?</span>
                <ChevronDown className={`faq-icon ${openFaq === 5 ? 'faq-icon-active' : ''}`} size={20} />
              </button>
              {openFaq === 5 && (
                <div className="faq-answer">
                  <p>
                    Prints are sold unframed by default to keep costs down and allow you to choose the 
                    perfect frame for your space. However, we do offer framed options for select prints. 
                    Check the product page for framing availability, or contact us for recommendations.
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
  );
}
