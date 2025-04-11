let analyticsLoaded = false;

export const loadAnalytics = async () => {
  if (analyticsLoaded) return;

  const [ReactGA, Clarity] = await Promise.all([
    import('react-ga4').then(module => module.default),
    import('@microsoft/clarity').then(module => module.default)
  ]);

  // Initialize analytics with these modules
  // ...

  analyticsLoaded = true;
};

import Clarity from '@microsoft/clarity';
import ReactGA from 'react-ga4';

// Initialize analytics services
export const initializeAnalytics = (consent: boolean | string = false) => {
  const clarityId = import.meta.env.VITE_MICROSOFT_CLARITY_ID;
  const googleAnalyticsId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

  // Handle different consent levels
  const fullConsent = consent === true || consent === 'true';
  const essentialOnly = consent === 'essential';

  // Initialize Google Analytics in a basic configuration regardless of consent
  // but with different consent modes
  if (googleAnalyticsId) {
    ReactGA.initialize(googleAnalyticsId, {
      gtagOptions: {
        // Configure consent parameters
        'consent_mode': {
          'analytics_storage': fullConsent ? 'granted' : 'denied',
          'functionality_storage': fullConsent || essentialOnly ? 'granted' : 'denied',
          'ad_storage': 'denied', // Always deny ad storage as we don't use ads
        }
      }
    });

    // Send initial pageview only with full consent
    if (fullConsent) {
      ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    }
  }

  // Only initialize Clarity with full consent
  if (clarityId && fullConsent) {
    Clarity.init({
      projectId: clarityId,
      upload: 'always',
      delay: 500, // Small delay to ensure the page is loaded
    });
  }
};

// Enable analytics tracking when consent is granted
export const enableAnalytics = () => {
  const clarityId = import.meta.env.VITE_MICROSOFT_CLARITY_ID;
  const googleAnalyticsId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

  if (clarityId) {
    // For Clarity, we need to reinitialize with consent
    Clarity.init({
      projectId: clarityId,
      upload: 'always',
    });
  }

  if (googleAnalyticsId && ReactGA.isInitialized) {
    // Update consent status
    ReactGA.gtag('consent', 'update', {
      'analytics_storage': 'granted',
      'functionality_storage': 'granted'
    });

    // Send pageview after consent is granted
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }
};

// Disable analytics tracking when consent is withdrawn
export const disableAnalytics = () => {
  const googleAnalyticsId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

  if (googleAnalyticsId && ReactGA.isInitialized) {
    // Update consent status
    ReactGA.gtag('consent', 'update', {
      'analytics_storage': 'denied',
      'functionality_storage': 'denied'
    });
  }

  // For Clarity, we would need to reload the page to stop tracking completely
};

// Track events (only if consent was given)
export const trackEvent = (category: string, action: string, label?: string) => {
  const consent = localStorage.getItem('cookieConsent');
  if (consent === 'true') {
    ReactGA.event({
      category,
      action,
      label
    });
  }
};