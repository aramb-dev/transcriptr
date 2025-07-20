import { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from './components/layout/MainLayout';
import { LoadingFallback } from './components/ui/LoadingFallback';
import { TermsOfService, PrivacyPolicy, Changelog, Feedback, Documentation } from './components/routes/LazyRoutes';

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
      <MainLayout />
    </AnimatePresence>
  );
}