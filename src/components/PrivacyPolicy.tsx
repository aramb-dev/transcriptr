import React from 'react';
import { Link } from 'react-router-dom';

export function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Transcriptr
        </Link>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Introduction</h2>
        <p>
          This Privacy Policy explains how Transcriptr ("we", "our", or "us") collects, uses, and shares your information when you use our service. We respect your privacy and are committed to protecting your personal data.
        </p>

        <h2>2. Information We Collect</h2>

        <h3>2.1 Audio Files</h3>
        <p>
          When you upload audio files for transcription, we process this content to generate textual transcriptions. For files below our size threshold, processing occurs directly in your browser. For larger files, we temporarily upload them to Firebase Storage to facilitate processing.
        </p>

        <h3>2.2 Analytics and Usage Data</h3>
        <p>
          With your consent, we collect usage data through Google Analytics and Microsoft Clarity to improve our service. This includes:
        </p>
        <ul>
          <li>Usage statistics (pages visited, features used)</li>
          <li>Technical information (browser type, operating system)</li>
          <li>Performance metrics and error data</li>
        </ul>

        <h3>2.3 Feedback Information</h3>
        <p>
          When you submit feedback, report issues, or suggest features, we collect the information you provide, which may include:
        </p>
        <ul>
          <li>Your name (if provided)</li>
          <li>Your email address (optional)</li>
          <li>Browser and operating system information for issue reports</li>
          <li>The content of your feedback or issue report</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul>
          <li>Process and generate transcriptions from your audio files</li>
          <li>Improve and optimize our service</li>
          <li>Respond to your feedback and fix reported issues</li>
          <li>Understand how users interact with our application</li>
        </ul>

        <h2>4. Data Retention</h2>
        <p>
          We do not permanently store your audio files or transcriptions on our servers. Data is processed and then:
        </p>
        <ul>
          <li>For browser-based processing: Data remains in your browser only</li>
          <li>For cloud processing: Temporarily stored files are deleted after processing is complete (typically within minutes)</li>
        </ul>

        <h2>5. Third-Party Services</h2>
        <p>
          We use the following third-party services:
        </p>
        <ul>
          <li>Replicate: Processes audio files for transcription</li>
          <li>Firebase Storage: Temporarily stores larger audio files</li>
          <li>Google Analytics: Tracks usage patterns (with consent only)</li>
          <li>Microsoft Clarity: Monitors user experience (with consent only)</li>
          <li>Netlify: Hosts the application and processes form submissions</li>
        </ul>

        <h2>6. Your Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul>
          <li>Decline analytics cookies and tracking</li>
          <li>Request deletion of any data we hold about you</li>
          <li>Access information about what data we process</li>
        </ul>

        <h2>7. Analytics Opt-Out</h2>
        <p>
          You can opt out of analytics tracking by declining cookies when prompted. You can also use browser extensions that block tracking or enable "Do Not Track" settings in your browser.
        </p>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify users of significant changes by posting a notice on our website.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have questions or concerns about this Privacy Policy, please contact us through our GitHub repository or by using the Feedback form on the main page.
        </p>
      </div>
    </div>
  );
}