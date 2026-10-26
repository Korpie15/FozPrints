'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import '../styles/consent.css';

const STORAGE_KEY = 'fozprints_analytics_consent';
const OPEN_SETTINGS_EVENT = 'fozprints:analytics-settings';
const CLARITY_PROJECT_ID = 'z0ivapi5ky';

type Consent = 'granted' | 'denied';

function readConsent(): Consent | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/** Clarity's own cookies, removed when a visitor withdraws consent. */
function clearClarityCookies() {
  const host = window.location.hostname;
  for (const name of ['_clck', '_clsk', 'CLID', 'ANONCHK', 'MR', 'MUID', 'SM']) {
    for (const domain of ['', `; domain=${host}`, `; domain=.${host.replace(/^www\./, '')}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  }
}

/**
 * Loads Microsoft Clarity only after the visitor opts in, and shows the
 * choice banner until they decide. The footer can reopen it.
 */
export function AnalyticsConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [isBannerOpen, setIsBannerOpen] = useState(false);

  useEffect(() => {
    const saved = readConsent();
    setConsent(saved);
    setIsBannerOpen(saved === null);

    const openSettings = () => setIsBannerOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, openSettings);
  }, []);

  // While the banner is open, pad the bottom of the page by its height so it
  // never sits on top of the footer, the cart total or the checkout buttons
  const bannerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const banner = bannerRef.current;
    if (!isBannerOpen || !banner) return;
    const root = document.documentElement;
    const update = () => root.style.setProperty('--consent-banner-height', `${banner.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(banner);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--consent-banner-height');
    };
  }, [isBannerOpen]);

  const choose = (choice: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Storage blocked: the choice still applies for this visit
    }
    setIsBannerOpen(false);

    if (choice === 'denied' && consent === 'granted') {
      // Clarity is already running on this page; a reload is the only clean way to stop it
      clearClarityCookies();
      window.location.reload();
      return;
    }
    setConsent(choice);
  };

  return (
    <>
      {consent === 'granted' && (
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
            `,
          }}
        />
      )}

      {isBannerOpen && (
        <div className="consent-banner" role="region" aria-labelledby="consent-title" ref={bannerRef}>
          <div className="consent-text">
            <p>
              <strong id="consent-title">Help us improve the site?</strong> With your OK, we use Microsoft
              Clarity to see how people use it (clicks, scrolling and pages visited). Microsoft processes
              this data, including outside Australia. <Link href="/policies/privacy-policy">Privacy policy</Link>
            </p>
          </div>
          <div className="consent-actions">
            <button type="button" className="consent-button" onClick={() => choose('denied')}>
              No thanks
            </button>
            <button type="button" className="consent-button" onClick={() => choose('granted')}>
              Allow analytics
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/** Footer link that reopens the analytics choice. */
export function AnalyticsSettingsButton() {
  return (
    <button
      type="button"
      className="footer-link-button"
      onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
    >
      Analytics settings
    </button>
  );
}
