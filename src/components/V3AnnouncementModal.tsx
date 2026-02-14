import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { X, Brain, Languages, RefreshCw } from "lucide-react"
import Confetti from "react-confetti"
import { Button } from "./ui/button"
import { AnimatedBackdrop } from "./ui/animated-backdrop"
import { expandCenter } from "../lib/animations"

const STORAGE_KEY = "v3.2SAW"

interface V3AnnouncementModalProps {
  onClose: () => void
}

export function V3AnnouncementModal({ onClose }: V3AnnouncementModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const updateWindowDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateWindowDimensions()
    window.addEventListener("resize", updateWindowDimensions)

    setShowConfetti(true)

    const confettiTimer = setTimeout(() => {
      setShowConfetti(false)
    }, 6800)

    return () => {
      window.removeEventListener("resize", updateWindowDimensions)
      clearTimeout(confettiTimer)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true")
    onClose()
  }

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
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
                  V3.2 -- AI Intelligence
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
                Transcriptr now runs on the AssemblyAI SDK with opt-in AI
                analysis features. Get chapters, summaries, sentiment, entities,
                and more -- all from a single transcription.
              </p>

              {/* Feature highlights */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-blue-100 p-1 dark:bg-blue-900">
                    <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-600 dark:text-blue-400">
                      AI Analysis Features
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Toggle Auto Chapters, Summarization, Sentiment Analysis,
                      Entity Detection, Key Phrases, Content Moderation, and
                      Topic Detection. Each feature appears as a new tab in the
                      Studio.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-purple-100 p-1 dark:bg-purple-900">
                    <Languages className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-purple-600 dark:text-purple-400">
                      30+ Language Support
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Auto-detect or manually select from 20+ languages.
                      AssemblyAI natively supports audio and video formats --
                      no conversion step needed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-green-100 p-1 dark:bg-green-900">
                    <RefreshCw className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-600 dark:text-green-400">
                      Smart Error Recovery
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      If a feature does not support the detected language, you
                      get a clear explanation and a one-click retry that
                      automatically disables the unsupported feature.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to action */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Enable AI features in the Transcription Options panel before
                  uploading. Results appear as tabs in the Studio.
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
                "#3b82f6",
                "#10b981",
                "#f59e0b",
                "#ef4444",
                "#8b5cf6",
                "#06b6d4",
              ]}
            />
          </div>
        )}
      </AnimatedBackdrop>
    </>
  )
}
