'use client';

import { Mail, MapPin, Phone } from 'lucide-react';
import '../../styles/about.css';
import { FormEvent } from 'react';

export default function AboutPage() {
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
