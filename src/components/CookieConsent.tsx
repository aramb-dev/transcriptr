import { useState } from 'react';
import { Button } from './ui/button';
import { AlertCircle, Cookie } from 'lucide-react';
import { toast } from 'sonner';

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function showCookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  toast.custom(
    (t) => (
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Cookie className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Cookie consent</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                We use cookies to analyze site traffic and improve your experience.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 whitespace-nowrap"
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
              className="flex-1 whitespace-nowrap"
              onClick={() => {
                checkForAdBlocker(onAccept);
                toast.dismiss(t);
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
      id: 'cookie-consent'
    }
  );
}

function checkForAdBlocker(onAccept: () => void) {
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

    if (isBlocked) {
      // Show ad blocker warning as a separate toast
      toast(
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Ad blocker detected</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Disabling your ad blocker would help us improve your experience through analytics.
            </p>
          </div>
        </div>,
        {
          duration: 6000,
          position: 'bottom-right',
        }
      );
    }

    // Accept cookies regardless of ad blocker status
    onAccept();
  }, 100);
}