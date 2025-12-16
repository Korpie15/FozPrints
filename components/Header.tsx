import Link from 'next/link';
import { CartButton } from '@/components/CartButton';
import '../styles/header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link href="/" className="header-logo">
            <span className="logo-text-primary">Foz</span>
            <span className="logo-text-secondary">Prints</span>
          </Link>
          
          <nav className="header-nav">
            <Link href="/products" className="nav-link">
              All Products
            </Link>
            <Link href="/products?category=prints" className="nav-link">
              Prints
            </Link>
            <Link href="/products?category=apparel" className="nav-link">
              Apparel
            </Link>
            <Link href="/products?category=accessories" className="nav-link">
              Accessories
            </Link>
          </nav>
        </div>

        <div className="header-right">
          <CartButton />
        </div>
      </div>
    </header>
  );
}
