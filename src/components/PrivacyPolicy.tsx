import React from 'react';
import { Link } from 'react-router-dom';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Transcriptr
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-12">
          <div className="prose dark:prose-invert max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Privacy Policy</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">1. Introduction</h2>
              <p className="mb-4">
                This Privacy Policy explains how Transcriptr ("we", "our", or "us") collects, uses, and shares your information when you use our service. We respect your privacy and are committed to protecting your personal data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">2. Information We Collect</h2>

              <div className="mb-6">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-300 mb-3">2.1 Audio Files</h3>
                <p className="mb-4">
                  When you upload audio files for transcription, we process this content to generate textual transcriptions. For files below our size threshold, processing occurs directly in your browser. For larger files, we temporarily upload them to Firebase Storage to facilitate processing.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-300 mb-3">2.2 Analytics and Usage Data</h3>
                <p className="mb-4">
                  With your consent, we collect usage data through Google Analytics and Microsoft Clarity to improve our service. This includes:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Usage statistics (pages visited, features used)</li>
                  <li>Technical information (browser type, operating system)</li>
                  <li>Performance metrics and error data</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-300 mb-3">2.3 Feedback Information</h3>
                <p className="mb-4">
                  When you submit feedback, report issues, or suggest features, we collect the information you provide, which may include:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Your name (if provided)</li>
                  <li>Your email address (optional)</li>
                  <li>Browser and operating system information for issue reports</li>
                  <li>The content of your feedback or issue report</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Process and generate transcriptions from your audio files</li>
                <li>Improve and optimize our service</li>
                <li>Respond to your feedback and fix reported issues</li>
                <li>Understand how users interact with our application</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">4. Data Retention</h2>
              <p className="mb-4">
                We do not permanently store your audio files or transcriptions on our servers. Data is processed and then:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>For browser-based processing: Data remains in your browser only</li>
                <li>For cloud processing: Temporarily stored files are deleted after processing is complete (typically within minutes)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">5. Third-Party Services</h2>
              <p className="mb-4">
                We use the following third-party services:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Replicate: Processes audio files for transcription</li>
                <li>Firebase Storage: Temporarily stores larger audio files</li>
                <li>Google Analytics: Tracks usage patterns (with consent only)</li>
                <li>Microsoft Clarity: Monitors user experience (with consent only)</li>
                <li>Netlify: Hosts the application and processes form submissions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">6. Your Rights</h2>
              <p className="mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Decline analytics cookies and tracking</li>
                <li>Request deletion of any data we hold about you</li>
                <li>Access information about what data we process</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">7. Analytics Opt-Out</h2>
              <p className="mb-4">
                You can opt out of analytics tracking by declining cookies when prompted. You can also use browser extensions that block tracking or enable "Do Not Track" settings in your browser.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">8. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify users of significant changes by posting a notice on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">9. Contact Us</h2>
              <p className="mb-4">
                If you have questions or concerns about this Privacy Policy, please contact us through our <a href="https://github.com/aramb-dev/transcriptr" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">GitHub repository</a> or by using the Feedback form on the main page.
              </p>
            </section>
          </div>
        </div>

        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          <p>© {new Date().getFullYear()} Transcriptr. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}