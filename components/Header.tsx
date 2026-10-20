'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Globe, Sparkles } from 'lucide-react';
import { CartButton } from '@/components/CartButton';
import { openInternationalWaitlist } from '@/components/InternationalInterestModal';
import '../styles/header.css';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDismissed = sessionStorage.getItem('fozprints_announcement_dismissed');
      if (isDismissed === 'true') {
        setIsAnnouncementVisible(false);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (!isAnnouncementVisible) {
        root.style.setProperty('--main-header-offset', '4rem');
        root.style.setProperty('--mobile-header-offset', '3.5rem');
      } else {
        root.style.setProperty('--main-header-offset', '6.25rem');
        root.style.setProperty('--mobile-header-offset', '5.5rem');
      }
    }
  }, [isAnnouncementVisible]);

  const handleDismissAnnouncement = () => {
    setIsAnnouncementVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('fozprints_announcement_dismissed', 'true');
    }
  };

  return (
    <header className="header">
      {/* Announcement Bar */}
      {isAnnouncementVisible && (
        <div className="header-announcement">
          <div className="header-announcement-content">
            <div className="header-announcement-desktop-only">
              <span>
                Launch Offer: <strong>$50 OFF</strong> first 10 Full Nav Pod Kits with code
              </span>
              <code className="header-promo-code">LAUNCH50</code>
              <span>+ Free AU Standard Shipping!</span>
            </div>
            <div className="header-announcement-mobile-only">
              <div className="header-announcement-line1">
                Launch Offer: <strong>$50 OFF</strong> with code <code className="header-promo-code">LAUNCH50</code>
              </div>
              <div className="header-announcement-line2">
                + Free AU Standard Shipping
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openInternationalWaitlist('Subaru Forester SG Double DIN Pod Kit')}
            className="header-intl-btn header-announcement-desktop-only"
            aria-label="Register international shipping interest"
          >
            <Globe size={12} style={{ flexShrink: 0 }} />
            Outside Australia? Register Interest
          </button>

          <button
            type="button"
            onClick={handleDismissAnnouncement}
            className="header-announcement-close"
            aria-label="Close launch offer banner"
            title="Close announcement"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="header-container">
        <div className="header-left">
          <Link href="/" className="header-logo" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="logo-text-primary">Foz</span>
            <span className="logo-text-secondary">Prints</span>
          </Link>
          
          <nav className="header-nav">
            <Link href="/products" className="nav-link">
              All Products
            </Link>
            <Link href="/about" className="nav-link">
              About
            </Link>
            <Link href="/about#faq" className="nav-link">
              FAQs
            </Link>
            <Link href="/about#contact" className="nav-link">
              Contact
            </Link>
            <Link href="/manuals" className="nav-link">
              Manuals
            </Link>
          </nav>
        </div>

        <div className="header-right">
          <CartButton />
          <button 
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          <Link href="/products" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
            All Products
          </Link>
          <Link href="/about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
            About
          </Link>
          <Link href="/about#faq" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
            FAQs
          </Link>
          <Link href="/about#contact" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
            Contact
          </Link>
          <Link href="/manuals" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
            Manuals
          </Link>
          <button
            type="button"
            className="mobile-nav-link"
            style={{ textAlign: 'left', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', cursor: 'pointer' }}
            onClick={() => {
              setIsMobileMenuOpen(false);
              openInternationalWaitlist('Subaru Forester SG Double DIN Pod Kit');
            }}
          >
            <Globe size={18} />
            Outside Australia? Register Interest
          </button>
        </div>
      )}
    </header>
  );
}
