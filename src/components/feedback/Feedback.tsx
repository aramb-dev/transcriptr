import React from 'react';
import Link from 'next/link';
import { FeedbackForm } from './FeedbackForm';

export function Feedback() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Transcriptr
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Feedback</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-8">
            We appreciate your feedback to improve Transcriptr. Please fill out the form below to let us know your thoughts, report issues, or suggest new features.
          </p>

          <div className="mb-4">
            <FeedbackForm />
          </div>
        </div>

        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          <p>© {new Date().getFullYear()} Transcriptr. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}