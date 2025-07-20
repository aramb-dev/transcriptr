import { Suspense, useState, useEffect, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Header } from './Header';
import { Footer } from './Footer';
import { TranscriptionForm } from '../transcription/TranscriptionForm';
import { Toaster } from 'sonner';
import { FeedbackModals } from '../feedback/FeedbackModals';
import { ChangelogModal } from '../ChangelogModal';
import TranscriptionHistory from '../transcription/TranscriptionHistory';
import { fadeInUp, slideInRight, expandCenter, fadeOutDown, exitTransition } from '../../lib/animations';
import { TranscriptionSession } from '@/lib/persistence-service';

const TranscriptionResult = lazy(() => import('../transcription/TranscriptionResult'));
const TranscriptionError = lazy(() => import('../transcription/TranscriptionError'));

export function MainLayout() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [formKey, setFormKey] = useState(Date.now()); // Key to force re-render TranscriptionForm when needed
  
  // For handling session selection from history
  const [selectedSession, setSelectedSession] = useState<TranscriptionSession | null>(null);

  // Updated to use the new window method instead of direct DOM manipulation
  const openFeedbackModal = (type: 'general' | 'issue' | 'feature') => {
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
      const { deleteSession } = await import('@/lib/persistence-service');
      await deleteSession(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
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
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <Header onOpenChangelog={openChangelogModal} onShowHistory={openHistoryModal} />

        <AnimatePresence mode="wait">
          <motion.div
            key="card"
            variants={expandCenter}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={exitTransition}
          >
            <Card className="w-full overflow-hidden border-0 shadow-lg rounded-xl dark:bg-gray-800/60 dark:backdrop-blur-sm">
              <CardContent className="p-0">
                <Suspense fallback={<div className="p-8 text-center">Loading form...</div>}>
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
            className="fixed top-4 right-4 bg-green-100 dark:bg-green-900/70 p-4 rounded-lg shadow-lg flex items-center gap-3"
            variants={slideInRight}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={exitTransition}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span className="text-green-800 dark:text-green-200 font-medium">Transcription complete!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer onOpenFeedbackModal={openFeedbackModal} onOpenChangelog={openChangelogModal} />

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
              transition={exitTransition}
            >
              <TranscriptionResult />
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
              transition={exitTransition}
            >
              <TranscriptionError />
            </motion.div>
          </Suspense>
        )}
      </AnimatePresence>

      <Toaster />
    </div>
  );
}
