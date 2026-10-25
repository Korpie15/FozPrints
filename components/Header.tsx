'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Globe, Sparkles } from 'lucide-react';
import { CartButton } from '@/components/CartButton';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { LAUNCH_OFFER } from '@/lib/promo';
import { openInternationalWaitlist } from '@/components/InternationalInterestModal';
import '../styles/header.css';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const headerRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  // While the mobile menu is open: keep keyboard focus in the header, close on
  // Escape, and stop the page behind it from scrolling
  useFocusTrap(headerRef, isMobileMenuOpen, mobileNavRef);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDismissed = sessionStorage.getItem('fozprints_announcement_dismissed');
      if (isDismissed === 'true') {
        setIsAnnouncementVisible(false);
      }
    }
  }, []);

  // Reserve exactly the header's height above the page. The banner wraps to
  // two lines on narrow screens, so its height can't be hard-coded. The mobile
  // menu is left out so opening it covers the page instead of pushing it down.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateOffset = () => {
      const height = header.offsetHeight - (mobileNavRef.current?.offsetHeight ?? 0);
      document.documentElement.style.setProperty('--header-offset', `${height}px`);
    };

    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const handleDismissAnnouncement = () => {
    setIsAnnouncementVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('fozprints_announcement_dismissed', 'true');
    }
  };

  return (
    <header className="header" ref={headerRef}>
      {/* Announcement Bar */}
      {isAnnouncementVisible && (
        <div className="header-announcement">
          <div className="header-announcement-content">
            <div className="header-announcement-desktop-only">
              <span>
                Launch offer: <strong>${LAUNCH_OFFER.discount} off</strong> the {LAUNCH_OFFER.productName} ({LAUNCH_OFFER.limit}) with code
              </span>
              <code className="header-promo-code">{LAUNCH_OFFER.code}</code>
              <span>plus free AU standard shipping</span>
            </div>
            <div className="header-announcement-mobile-only">
              <div className="header-announcement-line1">
                <strong>${LAUNCH_OFFER.discount} off</strong> with code <code className="header-promo-code">{LAUNCH_OFFER.code}</code>
              </div>
              <div className="header-announcement-line2">
                {LAUNCH_OFFER.productName}, {LAUNCH_OFFER.limit}. Free AU standard shipping.
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
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav id="mobile-nav" className="mobile-nav" ref={mobileNavRef} aria-label="Mobile">
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
        </nav>
      )}
    </header>
  );
}
