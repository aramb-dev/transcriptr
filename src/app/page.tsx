"use client";

import { Suspense, useState, useEffect, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { TranscriptionForm } from "../components/transcription/TranscriptionForm";
import { Toaster } from "sonner";
import { FeedbackModals } from "../components/feedback/FeedbackModals";
import { ChangelogModal } from "../components/ChangelogModal";
import { V3AnnouncementModal } from "../components/V3AnnouncementModal";
import TranscriptionHistory from "../components/transcription/TranscriptionHistory";
import { fadeInUp, expandCenter } from "../lib/animations";
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
  const [showResult] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showV3Modal, setShowV3Modal] = useState(false);
  const [formKey, setFormKey] = useState(Date.now()); // Key to force re-render TranscriptionForm when needed

  // For handling session selection from history
  const [selectedSession, setSelectedSession] =
    useState<TranscriptionSession | null>(null);
  const [transcriptionResult] = useState<string | null>(null);

  // Auto-show V3.2 announcement for users who haven't seen it
  useEffect(() => {
    const hasSeen = localStorage.getItem("v3.2SAW")
    if (!hasSeen) {
      setShowV3Modal(true)
    }
  }, [])

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

  const openV3Modal = () => {
    setShowV3Modal(true);
  };

  const closeV3Modal = () => {
    setShowV3Modal(false);
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

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white py-6 text-gray-900 md:py-12 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
      <div className="container mx-auto max-w-4xl px-4">
        <Header
          onOpenChangelog={openChangelogModal}
          onShowHistory={openHistoryModal}
          onOpenFeedbackModal={openFeedbackModal}
          onShowV3={openV3Modal}
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
                    initialSession={selectedSession}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

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
        {showV3Modal && <V3AnnouncementModal onClose={closeV3Modal} />}
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
