import Link from 'next/link';
import { CartButton } from '@/components/CartButton';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">Foz</span>
              <span className="text-2xl font-bold text-gray-900">Prints</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link 
              href="/products" 
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              All Parts
            </Link>
            <Link 
              href="/products?category=engine" 
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              Engine
            </Link>
            <Link 
              href="/products?category=exterior" 
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              Exterior
            </Link>
            <Link 
              href="/products?category=interior" 
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              Interior
            </Link>
          </nav>
        </div>

        <CartButton />
      </div>
    </header>
  );
}
