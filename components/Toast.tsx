'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { CheckCircle2, X, ArrowRight } from 'lucide-react';
import '../styles/toast.css';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Render into <body>: inside <main> the toast is trapped under the fixed header
  return createPortal(
    <div className="toast-container">
      <div className="toast toast-success">
        <CheckCircle2 className="toast-icon" size={18} />
        <span className="toast-message">{message}</span>
        <Link href="/cart" className="toast-cart-link" onClick={onClose}>
          <span>View Cart</span>
          <ArrowRight size={14} />
        </Link>
        <button onClick={onClose} className="toast-close" aria-label="Close notification">
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body
  );
}
