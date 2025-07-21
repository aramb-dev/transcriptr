import { useState, useEffect, useRef } from "react"; // <-- Add useRef
import { showCookieConsent } from "../CookieConsent";
import {
  initializeAnalytics,
  enableAnalytics,
  disableAnalytics,
  trackEvent,
} from "../../lib/analytics";

export function useConsentManager() {
  const [cookieConsent, setCookieConsent] = useState<boolean | string | null>(
    null,
  );
  const consentCheckInitiated = useRef(false); // <-- Add a ref to track if check has started

  useEffect(() => {
    // Add ad blocker detection style (only once)
    const style = document.createElement("style");
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

    // Only proceed if the consent check hasn't been initiated in this component instance
    if (!consentCheckInitiated.current) {
      consentCheckInitiated.current = true; // <-- Mark as initiated

      const savedConsent = localStorage.getItem("cookieConsent");
      if (savedConsent !== null) {
        console.log("ConsentManager: Found saved consent:", savedConsent); // Debug log
        setCookieConsent(savedConsent);
        initializeAnalytics(savedConsent);
      } else {
        console.log("ConsentManager: No saved consent found, showing banner."); // Debug log
        initializeAnalytics(false); // Initialize with consent denied
        showCookieConsent({
          onAccept: () => {
            console.log("ConsentManager: Consent Accepted"); // Debug log
            localStorage.setItem("cookieConsent", "true");
            setCookieConsent(true);
            enableAnalytics();
            trackEvent("Consent", "Accept", "Cookie Consent");
          },
          onDecline: () => {
            console.log("ConsentManager: Consent Declined"); // Debug log
            localStorage.setItem("cookieConsent", "false");
            setCookieConsent(false);
            disableAnalytics();
            trackEvent("Consent", "Decline", "Cookie Consent");
          },
          onEssentialOnly: () => {
            console.log("ConsentManager: Consent Essential Only"); // Debug log
            localStorage.setItem("cookieConsent", "essential");
            setCookieConsent("essential");
            // Don't enable tracking analytics but still allow essential cookies
            disableAnalytics(); // Ensure GA consent is denied/updated
            trackEvent("Consent", "Essential Only", "Cookie Consent");
          },
        });
      }
    } else {
      console.log("ConsentManager: Consent check already initiated, skipping."); // Debug log
    }

    // Cleanup function for the style element
    return () => {
      // Check if the style element exists before trying to remove it
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, []); // Empty dependency array ensures this effect runs once on mount (or twice in StrictMode dev)

  return cookieConsent;
}
