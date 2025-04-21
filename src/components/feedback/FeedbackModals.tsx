import React, { useState } from 'react';
import { FeedbackForm } from './FeedbackForm';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AnimatedBackdrop } from '../ui/animated-backdrop';

type FeedbackType = 'general' | 'issue' | 'feature';

export function FeedbackModals() {
  const [activeModal, setActiveModal] = useState<FeedbackType | null>(null);

  // Replace the global window.feedbackType with a proper state management approach
  React.useEffect(() => {
    // Create a global access point for other components to open the modal
    window.openFeedbackModal = (type: FeedbackType) => {
      setActiveModal(type);
    };

    return () => {
      window.openFeedbackModal = undefined;
    };
  }, []);

  // For modal titles
  const modalTitles = {
    general: "Provide Feedback",
    issue: "Report an Issue",
    feature: "Suggest a Feature"
  };

  return (
    <AnimatePresence>
      {activeModal && (
        <AnimatedBackdrop onClick={() => setActiveModal(null)}>
          <motion.div
            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {modalTitles[activeModal]}
                </h2>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <FeedbackForm
                initialType={activeModal}
                onClose={() => setActiveModal(null)}
              />
            </div>
          </motion.div>
        </AnimatedBackdrop>
      )}
    </AnimatePresence>
  );
}

// Add a proper TypeScript interface for the window object
declare global {
  interface Window {
    openFeedbackModal?: (type: 'general' | 'issue' | 'feature') => void;
    feedbackType: 'general' | 'issue' | 'feature' | 'other';
  }
}