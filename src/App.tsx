import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { TranscriptionForm } from './components/transcription/TranscriptionForm';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Card, CardContent } from './components/ui/card';
import { FeedbackModals } from './components/feedback/FeedbackModals';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Toaster } from './components/ui/sonner';
import { useConsentManager } from './components/analytics/ConsentManager';

// Default to general feedback
window.feedbackType = 'general';

declare global {
  interface Window {
    feedbackType: 'general' | 'issue' | 'feature' | 'other';
  }
}

function MainApp() {
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize analytics consent
  useConsentManager();

  const openFeedbackModal = (type: 'general' | 'issue' | 'feature') => {
    document.getElementById(`${type}-feedback-modal`)?.classList.remove('hidden');
  };

  const handleShowSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <Header />

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

      <Footer onOpenFeedbackModal={openFeedbackModal} />

      <FeedbackModals />

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
    </Routes>
  );
}