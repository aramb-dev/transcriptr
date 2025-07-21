"use client";

import React from "react";
import Link from "next/link";

export default function PrivacyPolicy() {
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
              Privacy Policy
            </h1>
            <p className="mb-8 text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                1. Introduction
              </h2>
              <p className="mb-4">
                This Privacy Policy explains how Transcriptr ("we", "our", or
                "us") collects, uses, and shares your information when you use
                our service. We respect your privacy and are committed to
                protecting your personal data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                2. Information We Collect
              </h2>

              <div className="mb-6">
                <h3 className="mb-3 text-xl font-medium text-gray-800 dark:text-gray-300">
                  2.1 Audio Files
                </h3>
                <p className="mb-4">
                  When you upload audio files for transcription, we process this
                  content to generate textual transcriptions. For files below
                  our size threshold, processing occurs directly in your
                  browser. For larger files, we temporarily upload them to
                  Firebase Storage to facilitate processing.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-xl font-medium text-gray-800 dark:text-gray-300">
                  2.2 Analytics and Usage Data
                </h3>
                <p className="mb-4">
                  With your consent, we collect usage data through Google
                  Analytics and Microsoft Clarity to improve our service. This
                  includes:
                </p>
                <ul className="mb-4 list-disc space-y-2 pl-6">
                  <li>Usage statistics (pages visited, features used)</li>
                  <li>
                    Technical information (browser type, operating system)
                  </li>
                  <li>Performance metrics and error data</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-xl font-medium text-gray-800 dark:text-gray-300">
                  2.3 Feedback Information
                </h3>
                <p className="mb-4">
                  When you submit feedback, report issues, or suggest features,
                  we collect the information you provide, which may include:
                </p>
                <ul className="mb-4 list-disc space-y-2 pl-6">
                  <li>Your name (if provided)</li>
                  <li>Your email address (optional)</li>
                  <li>
                    Browser and operating system information for issue reports
                  </li>
                  <li>The content of your feedback or issue report</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                3. How We Use Your Information
              </h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>
                  Process and generate transcriptions from your audio files
                </li>
                <li>Improve and optimize our service</li>
                <li>Respond to your feedback and fix reported issues</li>
                <li>Understand how users interact with our application</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                4. Data Retention
              </h2>
              <p className="mb-4">
                We do not permanently store your audio files or transcriptions
                on our servers. Data is processed and then:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>
                  For browser-based processing: Data remains in your browser
                  only
                </li>
                <li>
                  For cloud processing: Temporarily stored files are deleted
                  after processing is complete (typically within minutes)
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                5. Third-Party Services
              </h2>
              <p className="mb-4">We use the following third-party services:</p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>Replicate: Processes audio files for transcription</li>
                <li>Firebase Storage: Temporarily stores larger audio files</li>
                <li>
                  Google Analytics: Tracks usage patterns (with consent only)
                </li>
                <li>
                  Microsoft Clarity: Monitors user experience (with consent
                  only)
                </li>
                <li>
                  Netlify: Hosts the application and processes form submissions
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                6. Your Rights
              </h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>Decline analytics cookies and tracking</li>
                <li>Request deletion of any data we hold about you</li>
                <li>Access information about what data we process</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                7. Analytics Opt-Out
              </h2>
              <p className="mb-4">
                You can opt out of analytics tracking by declining cookies when
                prompted. You can also use browser extensions that block
                tracking or enable "Do Not Track" settings in your browser.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                8. Changes to This Policy
              </h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will
                notify users of significant changes by posting a notice on our
                website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
                9. Contact Us
              </h2>
              <p className="mb-4">
                If you have questions or concerns about this Privacy Policy,
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
