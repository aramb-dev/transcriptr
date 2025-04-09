import React from 'react';
import { Link } from 'react-router-dom';

export function TermsOfService() {
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
        <h1>Terms of Service</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using Transcriptr ("the Service"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Transcriptr is an AI-powered audio-to-text transcription tool that allows users to convert audio files to text format using machine learning technology.
        </p>

        <h2>3. User Responsibilities</h2>
        <p>
          You are responsible for any content you upload to the Service. You agree not to upload content that:
        </p>
        <ul>
          <li>Violates any laws or regulations</li>
          <li>Infringes on intellectual property rights of others</li>
          <li>Contains malicious code or harmful components</li>
          <li>Contains private or sensitive information without proper authorization</li>
        </ul>

        <h2>4. Data Processing and Storage</h2>
        <p>
          Audio files are processed using third-party services including Replicate and Firebase. Large files may be temporarily stored in Firebase Storage to facilitate processing. For details on how your data is handled, please see our Privacy Policy.
        </p>

        <h2>5. Service Limitations</h2>
        <p>
          The Service is provided "as is" and without warranty of any kind. Transcription accuracy depends on various factors including audio quality, accents, background noise, and other variables. We do not guarantee 100% accuracy in transcriptions.
        </p>

        <h2>6. Usage Limits</h2>
        <p>
          We reserve the right to implement usage limits to ensure service quality for all users. Excessive use that impacts service performance may be restricted.
        </p>

        <h2>7. Third-Party Services</h2>
        <p>
          The Service uses third-party APIs and services including Replicate for transcription processing and Firebase for temporary file storage. Your use of the Service is also subject to the terms and policies of these third parties.
        </p>

        <h2>8. Modifications to the Service</h2>
        <p>
          We reserve the right to modify or discontinue the Service at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
        </p>

        <h2>9. Changes to Terms</h2>
        <p>
          We may update these Terms of Service from time to time. We will notify users of significant changes by posting a notice on our website or through other communication channels.
        </p>

        <h2>10. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us through our GitHub repository or by using the Feedback form on the main page.
        </p>
      </div>
    </div>
  );
}