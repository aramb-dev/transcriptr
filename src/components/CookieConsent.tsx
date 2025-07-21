import { Button } from "./ui/button";
import { AlertCircle, Cookie } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { slideInRight, springTransition } from "../lib/animations";

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
  onEssentialOnly?: () => void;
}

// Check for ad blocker and handle the acceptance
const checkForAdBlocker = (
  onAccept: () => void,
  onDecline: () => void,
  onEssentialOnly: (() => void) | undefined,
  toastId: string,
) => {
  // Simple ad blocker detection - create a bait element
  const testElement = document.createElement("div");
  testElement.className = "adsbox";
  testElement.innerHTML = "&nbsp;";
  document.body.appendChild(testElement);

  // Give the browser a moment to hide the element if an ad blocker is active
  setTimeout(() => {
    const isBlocked =
      testElement.offsetHeight === 0 ||
      testElement.offsetWidth === 0 ||
      getComputedStyle(testElement).display === "none";

    document.body.removeChild(testElement);

    // If ad blocker is detected, update the toast content
    if (isBlocked) {
      // Dismiss the original toast
      toast.dismiss(toastId);

      // Show a new toast with ad blocker warning and choice options
      toast.custom(
        (t) => (
          <motion.div
            className="w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white font-sans shadow-md dark:border-gray-700 dark:bg-gray-800"
            variants={slideInRight}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={springTransition}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-blue-500 dark:text-blue-400" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Cookie consent
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    We use cookies to analyze site traffic and improve your
                    experience. By accepting, you consent to our use of
                    analytics tools including Google Analytics and Microsoft
                    Clarity as described in our{" "}
                    <Link
                      href="/privacy"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="underline transition-colors hover:text-blue-500"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-800 dark:bg-yellow-900/30">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Ad blocker detected. You can still use our service, but
                  disabling it would help us improve.
                </p>
              </div>

              <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:flex-1"
                  onClick={() => {
                    onDecline();
                    toast.dismiss(t);
                  }}
                >
                  Decline
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:flex-1"
                  onClick={() => {
                    if (onEssentialOnly) onEssentialOnly();
                    toast.dismiss(t);
                  }}
                >
                  Essential Only
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full sm:flex-1"
                  onClick={() => {
                    onAccept();
                    toast.dismiss(t);
                  }}
                >
                  Accept All
                </Button>
              </div>
            </div>
          </motion.div>
        ),
        {
          duration: Infinity,
          position: "bottom-right",
          closeButton: false,
          id: "cookie-consent-adblock",
        },
      );
    } else {
      // No ad blocker detected, proceed with acceptance
      onAccept();
      toast.dismiss(toastId);
    }
  }, 100);
};

export function showCookieConsent({
  onAccept,
  onDecline,
  onEssentialOnly,
}: CookieConsentProps) {
  // Generate a unique ID for the toast
  const toastId =
    "cookie-consent-" + Math.random().toString(36).substring(2, 9);

  // Show the initial cookie consent toast
  toast.custom(
    (t) => (
      <motion.div
        className="w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white font-sans shadow-md dark:border-gray-700 dark:bg-gray-800"
        variants={slideInRight}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={springTransition}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-blue-500 dark:text-blue-400" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Cookie consent
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                We use cookies to analyze site traffic and improve your
                experience. By accepting, you consent to our use of analytics
                tools including Google Analytics and Microsoft Clarity as
                described in our{" "}
                <Link
                  href="/privacy"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t);
                  }}
                  className="underline transition-colors hover:text-blue-500"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:flex-1"
              onClick={() => {
                onDecline();
                toast.dismiss(t);
              }}
            >
              Decline
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:flex-1"
              onClick={() => {
                if (onEssentialOnly) onEssentialOnly();
                toast.dismiss(t);
              }}
            >
              Essential Only
            </Button>
            <Button
              variant="default"
              size="sm"
              className="w-full sm:flex-1"
              onClick={() => {
                // When accepting, check for ad blocker
                checkForAdBlocker(
                  onAccept,
                  onDecline,
                  onEssentialOnly,
                  toastId,
                );
              }}
            >
              Accept All
            </Button>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: Infinity,
      position: "bottom-right",
      closeButton: false,
      id: toastId,
    },
  );

  return toastId;
}
