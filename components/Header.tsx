'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { CartButton } from '@/components/CartButton';
import '../styles/header.css';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="header">
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
              FAQ's
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
            FAQ's
          </Link>
          <Link href="/about#contact" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
            Contact
          </Link>
          <Link href="/manuals" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
            Manuals
          </Link>
        </div>
      )}
    </header>
  );
}
