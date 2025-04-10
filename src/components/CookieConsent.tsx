import { Button } from './ui/button';
import { AlertCircle, Cookie } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

// Check for ad blocker and handle the acceptance
const checkForAdBlocker = (onAccept: () => void, onDecline: () => void, toastId: string) => {
  // Simple ad blocker detection - create a bait element
  const testElement = document.createElement('div');
  testElement.className = 'adsbox';
  testElement.innerHTML = '&nbsp;';
  document.body.appendChild(testElement);

  // Give the browser a moment to hide the element if an ad blocker is active
  setTimeout(() => {
    const isBlocked = testElement.offsetHeight === 0 ||
                      testElement.offsetWidth === 0 ||
                      getComputedStyle(testElement).display === 'none';

    document.body.removeChild(testElement);

    // If ad blocker is detected, update the toast content
    if (isBlocked) {
      // Dismiss the original toast
      toast.dismiss(toastId);

      // Show a new toast with ad blocker warning and choice options
      toast.custom(
        (t) => (
          <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <Cookie className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Cookie consent</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    We use cookies to analyze site traffic and improve your experience.
                    By accepting, you consent to our use of analytics tools including Google Analytics and Microsoft Clarity
                    as described in our <Link to="/privacy" className="underline">Privacy Policy</Link>.
                  </p>
                </div>
              </div>

              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Ad blocker detected. You can still use our service, but disabling it would help us improve.
                </p>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    onDecline();
                    toast.dismiss(t);
                  }}
                >
                  Decline
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    onAccept();
                    toast.dismiss(t);
                  }}
                >
                  Accept Anyway
                </Button>
              </div>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          position: 'bottom-right',
          closeButton: false,
          id: 'cookie-consent-adblock'
        }
      );
    } else {
      // No ad blocker detected, proceed with acceptance
      onAccept();
      toast.dismiss(toastId);
    }
  }, 100);
};

export function showCookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  // Generate a unique ID for the toast
  const toastId = 'cookie-consent-' + Math.random().toString(36).substring(2, 9);

  // Show the initial cookie consent toast
  toast.custom(
    (t) => (
      <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Cookie className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Cookie consent</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                We use cookies to analyze site traffic and improve your experience.
                By accepting, you consent to our use of analytics tools including Google Analytics and Microsoft Clarity
                as described in our <Link to="/privacy" className="underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                onDecline();
                toast.dismiss(t);
              }}
            >
              Decline
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => {
                // When accepting, check for ad blocker
                checkForAdBlocker(onAccept, onDecline, toastId);
              }}
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: 'bottom-right',
      closeButton: false,
      id: toastId
    }
  );

  return toastId;
}