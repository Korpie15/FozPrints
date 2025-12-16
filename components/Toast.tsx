'use client';

import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import '../styles/toast.css';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-container">
      <div className="toast toast-success">
        <CheckCircle className="toast-icon" size={20} />
        <span className="toast-message">{message}</span>
        <button onClick={onClose} className="toast-close" aria-label="Close notification">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
