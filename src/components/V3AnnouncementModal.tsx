import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, Music2, Play } from "lucide-react";
import Confetti from "react-confetti";
import { Button } from "./ui/button";
import { AnimatedBackdrop } from "./ui/animated-backdrop";
import { expandCenter } from "../lib/animations";

interface V3AnnouncementModalProps {
  onClose: () => void;
}

export function V3AnnouncementModal({ onClose }: V3AnnouncementModalProps) {
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
    localStorage.setItem("seenV3", "true");
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
                  <Play className="h-6 w-6 text-white" />
                </div>
                <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
                  V3 is here!
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
                Experience the future of transcription with Transcription Studio!
                V3 brings a revolutionary interactive workspace with OpenAI's
                official Whisper model for unmatched accuracy.
              </p>

              {/* Feature highlights */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-blue-100 p-1 dark:bg-blue-900">
                    <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-600 dark:text-blue-400">
                      🎬 Transcription Studio
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Brand new interactive workspace with an integrated audio
                      player. Click any segment to jump to that exact moment in
                      the audio!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-purple-100 p-1 dark:bg-purple-900">
                    <Music2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-purple-600 dark:text-purple-400">
                      🤖 OpenAI Whisper Model
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Upgraded to OpenAI's official Whisper model with precise
                      timestamps for every segment. Better accuracy, better
                      results.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-green-100 p-1 dark:bg-green-900">
                    <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-600 dark:text-green-400">
                      ⏱️ Interactive Playback
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Watch segments highlight in real-time as audio plays. Export
                      professional SRT and VTT subtitle files with perfect
                      timestamps.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to action */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Try the new Studio! Upload an audio file and click "Open in
                  Studio" to experience interactive playback.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  onClick={handleClose}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
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
