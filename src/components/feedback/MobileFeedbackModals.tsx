import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileFeedbackForm } from "./MobileFeedbackForm";
import { FeedbackForm } from "./FeedbackForm";

type FeedbackType = "general" | "issue" | "feature";

export function MobileFeedbackModals() {
  const [activeModal, setActiveModal] = useState<FeedbackType | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Global modal access
  React.useEffect(() => {
    window.openFeedbackModal = (type: FeedbackType) => {
      setActiveModal(type);
    };

    return () => {
      window.openFeedbackModal = undefined;
    };
  }, []);

  const closeModal = () => setActiveModal(null);

  return (
    <AnimatePresence>
      {activeModal && (
        <>
          {isMobile ? (
            // Mobile: Full-screen modal
            <motion.div
              className="fixed inset-0 z-50 bg-white dark:bg-gray-900"
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
            >
              <MobileFeedbackForm
                initialType={activeModal}
                onClose={closeModal}
                isModal={true}
              />
            </motion.div>
          ) : (
            // Desktop: Centered modal with backdrop
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
              />
              
              {/* Modal content */}
              <motion.div
                className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FeedbackForm
                  initialType={activeModal}
                  onClose={closeModal}
                />
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// TypeScript declarations
declare global {
  interface Window {
    openFeedbackModal?: (type: "general" | "issue" | "feature") => void;
    feedbackType: "general" | "issue" | "feature" | "other";
  }
}
