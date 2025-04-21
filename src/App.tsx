import { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from './components/layout/MainLayout';
import { LoadingFallback } from './components/ui/LoadingFallback';
import { TermsOfService, PrivacyPolicy, Changelog, Feedback } from './components/routes/LazyRoutes';

// Page Transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Default: General Feedback
window.feedbackType = 'general';

declare global {
  interface Window {
    feedbackType: 'general' | 'issue' | 'feature' | 'other';
  }
}

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <MainLayout />
            </motion.div>
          }
        />
        <Route path="/terms" element={
          <Suspense fallback={<LoadingFallback />}>
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <TermsOfService />
            </motion.div>
          </Suspense>
        } />
        <Route path="/privacy" element={
          <Suspense fallback={<LoadingFallback />}>
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <PrivacyPolicy />
            </motion.div>
          </Suspense>
        } />
        <Route path="/changelog" element={
          <Suspense fallback={<LoadingFallback />}>
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Changelog />
            </motion.div>
          </Suspense>
        } />
        <Route path="/feedback" element={
          <Suspense fallback={<LoadingFallback />}>
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Feedback />
            </motion.div>
          </Suspense>
        } />
      </Routes>
    </AnimatePresence>
  );
}