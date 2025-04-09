import { init as initClarity } from '@microsoft/clarity-js';
import ReactGA from 'react-ga4';

// Initialize analytics services
export const initializeAnalytics = (consent: boolean = false) => {
  const clarityId = import.meta.env.VITE_MICROSOFT_CLARITY_ID;
  const googleAnalyticsId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

  if (clarityId) {
    // Initialize Clarity with consent mode
    initClarity({
      projectId: clarityId,
      upload: consent ? 'always' : 'none', // Only track if consent is given
      delay: 500, // Small delay to ensure the page is loaded
    });
  }

  if (googleAnalyticsId) {
    // Initialize Google Analytics
    ReactGA.initialize(googleAnalyticsId, {
      gtagOptions: {
        // Configure consent parameters
        'consent_mode': {
          'analytics_storage': consent ? 'granted' : 'denied',
        }
      }
    });

    // Send initial pageview
    if (consent) {
      ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    }
  }
};

// Enable analytics tracking when consent is granted
export const enableAnalytics = () => {
  const clarityId = import.meta.env.VITE_MICROSOFT_CLARITY_ID;
  const googleAnalyticsId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

  if (clarityId) {
    // For Clarity, we need to reinitialize with consent
    initClarity({
      projectId: clarityId,
      upload: 'always',
    });
  }

  if (googleAnalyticsId && ReactGA.isInitialized) {
    // Update consent status
    ReactGA.gtag('consent', 'update', {
      'analytics_storage': 'granted'
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
      'analytics_storage': 'denied'
    });
  }

  // For Clarity, we would need to reload the page to stop tracking completely
  // But we can avoid initializing any new sessions
};

// Track events (only if consent was given)
export const trackEvent = (category: string, action: string, label?: string) => {
  if (localStorage.getItem('cookieConsent') === 'true') {
    ReactGA.event({
      category,
      action,
      label
    });
  }
};