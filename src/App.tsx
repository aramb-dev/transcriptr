import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout'; // Import the new layout
import { LoadingFallback } from './components/ui/LoadingFallback'; // Import the new loading component
import { TermsOfService, PrivacyPolicy, Changelog, Feedback } from './components/routes/LazyRoutes';

// Default to general feedback
window.feedbackType = 'general';

declare global {
  interface Window {
    feedbackType: 'general' | 'issue' | 'feature' | 'other';
  }
}

// Keep lazy loading for routes
// const TranscriptionResult = lazy(() => import('./components/transcription/TranscriptionResult')); // No longer needed here
// const TranscriptionError = lazy(() => import('./components/transcription/TranscriptionError')); // No longer needed here

export default function App() {
  return (
    <Routes>
      {/* Use MainLayout for the main application route */}
      <Route path="/" element={<MainLayout />} />
      {/* Keep lazy loading for other routes */}
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