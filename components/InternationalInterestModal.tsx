'use client';

import { useState, useEffect } from 'react';
import { X, Globe, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface InternationalInterestModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  productInterest?: string;
}

export function openInternationalWaitlist(productInterest?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-international-waitlist', { detail: { productInterest } }));
  }
}

const COMMON_COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'New Zealand',
  'Japan',
  'Germany',
  'Norway',
  'Sweden',
  'Switzerland',
  'Netherlands',
  'France',
  'Poland',
  'Ireland',
  'South Africa',
  'Other',
];

export function InternationalInterestModal({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  productInterest: defaultProductInterest = 'Subaru Forester SG Double DIN Pod Kit',
}: InternationalInterestModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United States');
  const [otherCountry, setOtherCountry] = useState('');
  const [notes, setNotes] = useState('');
  const [productInterest, setProductInterest] = useState(defaultProductInterest);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  // Listen for global open events
  useEffect(() => {
    const handleGlobalOpen = (e: any) => {
      if (e.detail?.productInterest) {
        setProductInterest(e.detail.productInterest);
      }
      setSuccessMessage(null);
      setErrorMessage(null);
      setInternalIsOpen(true);
    };
    window.addEventListener('open-international-waitlist', handleGlobalOpen);
    return () => window.removeEventListener('open-international-waitlist', handleGlobalOpen);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetCountry = country === 'Other' ? otherCountry.trim() : country;
    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!targetCountry) {
      setErrorMessage('Please specify your country.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/international-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          country: targetCountry,
          productInterest,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to submit.');
      }

      setSuccessMessage(data.message || "Thank you! We'll notify you as soon as international shipping opens.");
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#111827',
          border: '1px solid #374151',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          color: '#f9fafb',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <button
          onClick={handleClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>

        {successMessage ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
              You&apos;re on the priority list!
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {successMessage}
            </p>
            <button
              onClick={handleClose}
              style={{
                padding: '0.75rem 1.75rem',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Back to Store
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(2, 132, 199, 0.15)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Globe size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  International Shipping Waitlist
                </h3>
              </div>
            </div>

            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              We currently ship exclusively within Australia during our launch phase. Register your country below to be notified first when international shipping opens, plus receive an early-bird launch discount code!
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                borderRadius: '0.5rem',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                color: '#7dd3fc',
              }}
            >
              <Sparkles size={16} style={{ flexShrink: 0 }} />
              <span>USDM, JDM & EUDM SG Forester fitments are tested and ready.</span>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#e5e7eb' }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Miller"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.375rem',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#e5e7eb' }}>
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.375rem',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#e5e7eb' }}>
                  Country / Region <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.375rem',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                >
                  {COMMON_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {country === 'Other' && (
                  <input
                    type="text"
                    required
                    value={otherCountry}
                    onChange={(e) => setOtherCountry(e.target.value)}
                    placeholder="Enter your country name"
                    style={{
                      width: '100%',
                      marginTop: '0.5rem',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.375rem',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#e5e7eb' }}>
                  Your Vehicle / Model (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 2004 Forester XT (USDM), RHD/LHD notes"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.375rem',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>

              {errorMessage && (
                <div style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {errorMessage}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #374151',
                    borderRadius: '0.375rem',
                    color: '#9ca3af',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    padding: '0.75rem',
                    backgroundColor: '#0284c7',
                    border: 'none',
                    borderRadius: '0.375rem',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Notify Me When Available'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
