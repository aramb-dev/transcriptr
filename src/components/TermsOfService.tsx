import React from 'react';
import { Link } from 'react-router-dom';

export function TermsOfService() {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Terms of Service</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using Transcriptr ("the Service"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">2. Description of Service</h2>
              <p className="mb-4">
                Transcriptr is an AI-powered audio-to-text transcription tool that allows users to convert audio files to text format using machine learning technology.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">3. User Responsibilities</h2>
              <p className="mb-4">
                You are responsible for any content you upload to the Service. You agree not to upload content that:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Violates any laws or regulations</li>
                <li>Infringes on intellectual property rights of others</li>
                <li>Contains malicious code or harmful components</li>
                <li>Contains private or sensitive information without proper authorization</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">4. Data Processing and Storage</h2>
              <p className="mb-4">
                Audio files are processed using third-party services including Replicate and Firebase. Large files may be temporarily stored in Firebase Storage to facilitate processing. For details on how your data is handled, please see our <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">5. Service Limitations</h2>
              <p className="mb-4">
                The Service is provided "as is" and without warranty of any kind. Transcription accuracy depends on various factors including audio quality, accents, background noise, and other variables. We do not guarantee 100% accuracy in transcriptions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">6. Usage Limits</h2>
              <p className="mb-4">
                We reserve the right to implement usage limits to ensure service quality for all users. Excessive use that impacts service performance may be restricted.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">7. Third-Party Services</h2>
              <p className="mb-4">
                The Service uses third-party APIs and services including Replicate for transcription processing and Firebase for temporary file storage. Your use of the Service is also subject to the terms and policies of these third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">8. Modifications to the Service</h2>
              <p className="mb-4">
                We reserve the right to modify or discontinue the Service at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">9. Changes to Terms</h2>
              <p className="mb-4">
                We may update these Terms of Service from time to time. We will notify users of significant changes by posting a notice on our website or through other communication channels.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">10. Contact Information</h2>
              <p className="mb-4">
                If you have questions or concerns about these Terms of Service, please contact us through our <a href="https://github.com/aramb-dev/transcriptr" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">GitHub repository</a> or by using the Feedback form on the main page.
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