import { Suspense, useState, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TranscriptionForm } from "../transcription/TranscriptionForm";
import { Toaster } from "sonner";
import { FeedbackModals } from "../feedback/FeedbackModals";
import { ChangelogModal } from "../ChangelogModal";
import TranscriptionHistory from "../transcription/TranscriptionHistory";
import { fadeInUp, expandCenter } from "../../lib/animations";
import { TranscriptionSession } from "@/lib/persistence-service";

const TranscriptionResult = lazy(
  () => import("../transcription/TranscriptionResult"),
);
const TranscriptionError = lazy(() =>
  import("../transcription/TranscriptionError").then((module) => ({
    default: module.TranscriptionError,
  })),
);

export function MainLayout() {
  const [showResult] = useState(false);
  const [showError] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [formKey, setFormKey] = useState(Date.now()); // Key to force re-render TranscriptionForm when needed

  // For handling session selection from history
  const [selectedSession, setSelectedSession] =
    useState<TranscriptionSession | null>(null);

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
              <TranscriptionResult transcription="" />
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
                error="An error occurred"
                onReset={() => {}}
                apiResponses={[]}
                showApiDetails={false}
                setShowApiDetails={() => {}}
                formatTimestamp={(date: Date) => date.toLocaleString()}
              />
            </motion.div>
          </Suspense>
        )}
      </AnimatePresence>

      <Toaster />
    </div>
  );
}
