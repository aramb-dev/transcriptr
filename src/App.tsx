import { useState, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent } from './components/ui/card';
import { ChangelogModal } from './components/ChangelogModal';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Toaster } from './components/ui/sonner';
import { useConsentManager } from './components/analytics/ConsentManager';
import { TermsOfService, PrivacyPolicy, Changelog, Feedback } from './components/routes/LazyRoutes';

// Default to general feedback
window.feedbackType = 'general';

declare global {
  interface Window {
    feedbackType: 'general' | 'issue' | 'feature' | 'other';
  }
}

const TranscriptionForm = lazy(() => import('./components/transcription/TranscriptionForm').then(
  module => ({ default: module.TranscriptionForm })
));
const FeedbackModals = lazy(() => import('./components/feedback/FeedbackModals').then(
  module => ({ default: module.FeedbackModals })
));
const TranscriptionResult = lazy(() => import('./components/transcription/TranscriptionResult'));
const TranscriptionError = lazy(() => import('./components/transcription/TranscriptionError'));

function MainApp() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showError, setShowError] = useState(false);

  // Initialize analytics consent
  useConsentManager();

  const openFeedbackModal = (type: 'general' | 'issue' | 'feature') => {
    document.getElementById(`${type}-feedback-modal`)?.classList.remove('hidden');
  };

  const openChangelogModal = () => {
    document.getElementById('changelog-modal')?.classList.remove('hidden');
  };

  const closeChangelogModal = () => {
    document.getElementById('changelog-modal')?.classList.add('hidden');
  };

  const handleShowSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <Header onOpenChangelog={openChangelogModal} />

        <Card className="w-full overflow-hidden border-0 shadow-lg rounded-xl dark:bg-gray-800/60 dark:backdrop-blur-sm">
          <CardContent className="p-0">
            <TranscriptionForm onShowSuccess={handleShowSuccess} />
          </CardContent>
        </Card>
      </div>

      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 dark:bg-green-900/70 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span className="text-green-800 dark:text-green-200 font-medium">Transcription complete!</span>
        </div>
      )}

      <Footer onOpenFeedbackModal={openFeedbackModal} onOpenChangelog={openChangelogModal} />

      <FeedbackModals />
      <ChangelogModal onClose={closeChangelogModal} />

      <Suspense fallback={<div>Loading...</div>}>
        {showResult && <TranscriptionResult />}
        {showError && <TranscriptionError />}
      </Suspense>

      <Toaster />
    </div>
  );
}

// Add loading indicator for lazy-loaded routes
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/terms" element={
        <Suspense fallback={<LoadingFallback />}>
          <TermsOfService />
        </Suspense>
      } />
      <Route path="/privacy" element={
        <Suspense fallback={<LoadingFallback />}>
          <PrivacyPolicy />
        </Suspense>
      } />
      <Route path="/changelog" element={
        <Suspense fallback={<LoadingFallback />}>
          <Changelog />
        </Suspense>
      } />
      <Route path="/feedback" element={
        <Suspense fallback={<LoadingFallback />}>
          <Feedback />
        </Suspense>
      } />
    </Routes>
  );
}