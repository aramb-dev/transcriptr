import { useEffect, useState } from 'react';
import { showCookieConsent } from '../CookieConsent';
import { initializeAnalytics, enableAnalytics, disableAnalytics, trackEvent } from '../../lib/analytics';

export function useConsentManager() {
  const [cookieConsent, setCookieConsent] = useState<boolean | string | null>(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .adsbox {
        height: 1px;
        width: 1px;
        position: absolute;
        left: -10000px;
        top: -10000px;
      }
    `;
    document.head.appendChild(style);

    const savedConsent = localStorage.getItem('cookieConsent');
    if (savedConsent !== null) {
      setCookieConsent(savedConsent);
      initializeAnalytics(savedConsent);
    } else {
      initializeAnalytics(false);
      showCookieConsent({
        onAccept: () => {
          localStorage.setItem('cookieConsent', 'true');
          setCookieConsent(true);
          enableAnalytics();
          trackEvent('Consent', 'Accept', 'Cookie Consent');
        },
        onDecline: () => {
          localStorage.setItem('cookieConsent', 'false');
          setCookieConsent(false);
          disableAnalytics();
        },
        onEssentialOnly: () => {
          localStorage.setItem('cookieConsent', 'essential');
          setCookieConsent('essential');
          // Don't enable tracking analytics but still allow essential cookies
          disableAnalytics();
          trackEvent('Consent', 'Essential Only', 'Cookie Consent');
        }
      });
    }

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return cookieConsent;
}