import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, Zap, Star } from "lucide-react";
import Confetti from "react-confetti";
import { Button } from "./ui/button";
import { AnimatedBackdrop } from "./ui/animated-backdrop";
import { expandCenter } from "../lib/animations";

interface V2AnnouncementModalProps {
  onClose: () => void;
}

export function V2AnnouncementModal({ onClose }: V2AnnouncementModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Set window dimensions for confetti
    const updateWindowDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateWindowDimensions();
    window.addEventListener("resize", updateWindowDimensions);

    // Start confetti animation
    setShowConfetti(true);

    // Stop confetti after 6 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 6800);

    return () => {
      window.removeEventListener("resize", updateWindowDimensions);
      clearTimeout(confettiTimer);
    };
  }, []);

  const handleClose = () => {
    // Set the flag to prevent showing again
    localStorage.setItem("seenV2", "true");
    onClose();
  };

  return (
    <>
      <AnimatedBackdrop onClick={handleClose}>
        <motion.div
          className="relative max-h-[90vh] w-full max-w-2xl overflow-auto"
          onClick={(e) => e.stopPropagation()}
          variants={expandCenter}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
            {/* Header with close button */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-2">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
                  V2 is here!
                </h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Main content */}
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Welcome to the completely redesigned Transcriptr! We've rebuilt the entire platform from the ground up to deliver a faster, more reliable, and feature-rich transcription experience.
              </p>

              {/* Feature highlights */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-green-100 p-1 dark:bg-green-900">
                    <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-600 dark:text-green-400">
                      Lightning Fast Performance
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Completely rewritten with Next.js for blazing-fast load times and seamless user experience.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-blue-100 p-1 dark:bg-blue-900">
                    <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-600 dark:text-blue-400">
                      Enhanced Reliability
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Improved error handling, better file format support, and automatic retry mechanisms for failed transcriptions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-amber-100 p-1 dark:bg-amber-900">
                    <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-amber-600 dark:text-amber-400">
                      Modern Interface
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Beautiful new design with improved accessibility, better mobile support, and intuitive user workflows.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to action */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Ready to experience the future of transcription? Upload your first file and see the difference!
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button onClick={handleClose} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Get Started
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Confetti positioned above the modal */}
        {showConfetti && (
          <div className="pointer-events-none fixed inset-0 z-[60]">
            <Confetti
              width={windowDimensions.width}
              height={windowDimensions.height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.3}
              colors={[
                "#3b82f6", // blue-500
                "#10b981", // emerald-500
                "#f59e0b", // amber-500
                "#ef4444", // red-500
                "#8b5cf6", // violet-500
                "#06b6d4", // cyan-500
              ]}
            />
          </div>
        )}
      </AnimatedBackdrop>
    </>
  );
}

// Hook to check if V2 announcement should be shown
export function useV2Announcement() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if user has seen V2 announcement
    const hasSeenV2 = localStorage.getItem("seenV2");
    if (!hasSeenV2) {
      setShouldShow(true);
    }
  }, []);

  const hideAnnouncement = () => {
    setShouldShow(false);
  };

  return { shouldShow, hideAnnouncement };
}
