"use client";

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { disableAnalytics, enableAnalytics } from '../../lib/analytics';
import { toast } from 'sonner';

export const AnalyticsOptOut = () => {
  const [isOptedOut, setIsOptedOut] = useState<boolean | null>(null);

  useEffect(() => {
    // Ensure this runs only on the client
    const optOutStatus = localStorage.getItem('analytics_opt_out');
    setIsOptedOut(optOutStatus === 'true');
  }, []);

  const handleOptOut = () => {
    localStorage.setItem('analytics_opt_out', 'true');
    setIsOptedOut(true);
    disableAnalytics();
    toast.success("You have successfully opted out of analytics tracking.");
  };

  const handleOptIn = () => {
    localStorage.setItem('analytics_opt_out', 'false');
    setIsOptedOut(false);
    if (localStorage.getItem('cookieConsent') === 'true') {
      enableAnalytics();
    }
    toast.success("You have opted back in to analytics tracking.");
  };

  if (isOptedOut === null) {
    // Render nothing or a loading skeleton until client-side state is determined
    return null;
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      {isOptedOut ? (
        <div>
          <p className="mb-3 text-base">
            You are currently opted out of analytics tracking. We respect your privacy and will not collect any non-essential data during your visits.
          </p>
          <Button onClick={handleOptIn} variant="outline" size="sm">
            Opt-In to Analytics
          </Button>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-base">
            You can withdraw your consent for analytics tracking at any time. This will stop the collection of non-essential data used to improve our service.
          </p>
          <Button onClick={handleOptOut} variant="secondary" size="sm">
            Opt-Out of Analytics
          </Button>
        </div>
      )}
    </div>
  );
};