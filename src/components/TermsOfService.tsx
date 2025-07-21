import React from "react";
import Link from "next/link";

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white py-12 text-gray-900 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Transcriptr
          </Link>
        </div>

        <div className="mb-12 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <div className="prose dark:prose-invert max-w-none">
            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
              Terms of Service
            </h1>
            <p className="mb-8 text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                1. Acceptance of Terms
              </h2>
              <p className="mb-4">
                By accessing and using Transcriptr ("the Service"), you agree to
                comply with and be bound by these Terms of Service. If you do
                not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                2. Description of Service
              </h2>
              <p className="mb-4">
                Transcriptr is an AI-powered audio-to-text transcription tool
                that allows users to convert audio files to text format using
                machine learning technology.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                3. User Responsibilities
              </h2>
              <p className="mb-4">
                You are responsible for any content you upload to the Service.
                You agree not to upload content that:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>Violates any laws or regulations</li>
                <li>Infringes on intellectual property rights of others</li>
                <li>Contains malicious code or harmful components</li>
                <li>
                  Contains private or sensitive information without proper
                  authorization
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                4. Data Processing and Storage
              </h2>
              <p className="mb-4">
                Audio files are processed using third-party services including
                Replicate and Firebase. Large files may be temporarily stored in
                Firebase Storage to facilitate processing. For details on how
                your data is handled, please see our{" "}
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                5. Service Limitations
              </h2>
              <p className="mb-4">
                The Service is provided "as is" and without warranty of any
                kind. Transcription accuracy depends on various factors
                including audio quality, accents, background noise, and other
                variables. We do not guarantee 100% accuracy in transcriptions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                6. Usage Limits
              </h2>
              <p className="mb-4">
                We reserve the right to implement usage limits to ensure service
                quality for all users. Excessive use that impacts service
                performance may be restricted.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                7. Third-Party Services
              </h2>
              <p className="mb-4">
                The Service uses third-party APIs and services including
                Replicate for transcription processing and Firebase for
                temporary file storage. Your use of the Service is also subject
                to the terms and policies of these third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                8. Modifications to the Service
              </h2>
              <p className="mb-4">
                We reserve the right to modify or discontinue the Service at any
                time without notice. We shall not be liable to you or any third
                party for any modification, suspension, or discontinuance of the
                Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                9. Changes to Terms
              </h2>
              <p className="mb-4">
                We may update these Terms of Service from time to time. We will
                notify users of significant changes by posting a notice on our
                website or through other communication channels.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                10. Contact Information
              </h2>
              <p className="mb-4">
                If you have questions or concerns about these Terms of Service,
                please contact us through our{" "}
                <a
                  href="https://github.com/aramb-dev/transcriptr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  GitHub repository
                </a>{" "}
                or by using the Feedback form on the main page.
              </p>
            </section>
          </div>
        </div>

        <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Transcriptr. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
