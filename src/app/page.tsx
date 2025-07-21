"use client";

import { Suspense, useState, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { TranscriptionForm } from "../components/transcription/TranscriptionForm";
import { Toaster } from "sonner";
import { FeedbackModals } from "../components/feedback/FeedbackModals";
import { ChangelogModal } from "../components/ChangelogModal";
import TranscriptionHistory from "../components/transcription/TranscriptionHistory";
import {
  fadeInUp,
  slideInRight,
  expandCenter,
} from "../lib/animations";
import { TranscriptionSession } from "@/lib/persistence-service";

const TranscriptionResult = lazy(
  () => import("../components/transcription/TranscriptionResult"),
);
const TranscriptionError = lazy(() =>
  import("../components/transcription/TranscriptionError").then((module) => ({
    default: module.TranscriptionError,
  })),
);

export default function Page() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showResult] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [formKey, setFormKey] = useState(Date.now()); // Key to force re-render TranscriptionForm when needed

  // For handling session selection from history
  const [selectedSession, setSelectedSession] =
    useState<TranscriptionSession | null>(null);
  const [transcriptionResult] = useState<string | null>(
    null,
  );

  // Updated to use the new window method instead of direct DOM manipulation
  const openFeedbackModal = (type: "general" | "issue" | "feature") => {
    if (window.openFeedbackModal) {
      window.openFeedbackModal(type);
    }
  };

  const openChangelogModal = () => {
    setShowChangelogModal(true);
  };

  const closeChangelogModal = () => {
    setShowChangelogModal(false);
  };

  const openHistoryModal = () => {
    setShowHistoryModal(true);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      // Import dynamically to prevent circular dependencies
      const { deleteSession } = await import("@/lib/persistence-service");
      await deleteSession(sessionId);
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleSelectSession = (session: TranscriptionSession) => {
    setSelectedSession(session);
    closeHistoryModal();
    // Force re-render the TranscriptionForm component to pick up the selected session
    setFormKey(Date.now());
  };

  const handleShowSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white py-12 text-gray-900 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
      <div className="container mx-auto max-w-4xl px-4">
        <Header
          onOpenChangelog={openChangelogModal}
          onShowHistory={openHistoryModal}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key="card"
            variants={expandCenter}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Card className="w-full overflow-hidden rounded-xl border-0 shadow-lg dark:bg-gray-800/60 dark:backdrop-blur-sm">
              <CardContent className="p-0">
                <Suspense
                  fallback={
                    <div className="p-8 text-center">Loading form...</div>
                  }
                >
                  <TranscriptionForm
                    key={formKey}
                    onShowSuccess={handleShowSuccess}
                    initialSession={selectedSession}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed top-4 right-4 flex items-center gap-3 rounded-lg bg-green-100 p-4 shadow-lg dark:bg-green-900/70"
            variants={slideInRight}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600 dark:text-green-400"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span className="font-medium text-green-800 dark:text-green-200">
              Transcription complete!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer
        onOpenFeedbackModal={openFeedbackModal}
        onOpenChangelog={openChangelogModal}
      />

      <Suspense fallback={null}>
        <FeedbackModals />
      </Suspense>

      <AnimatePresence>
        {showChangelogModal && <ChangelogModal onClose={closeChangelogModal} />}
      </AnimatePresence>

      <AnimatePresence>
        {showHistoryModal && (
          <TranscriptionHistory
            open={showHistoryModal}
            onOpenChange={setShowHistoryModal}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResult && (
          <Suspense fallback={<div>Loading result...</div>}>
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <TranscriptionResult transcription={transcriptionResult || ""} />
            </motion.div>
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showError && (
          <Suspense fallback={<div>Loading error details...</div>}>
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <TranscriptionError
                status="failed"
                error="An unknown error occurred."
                onReset={() => setShowError(false)}
                apiResponses={[]}
                showApiDetails={false}
                setShowApiDetails={() => {}}
                formatTimestamp={() => ""}
              />
            </motion.div>
          </Suspense>
        )}
      </AnimatePresence>

      <Toaster />
    </div>
  );
}
