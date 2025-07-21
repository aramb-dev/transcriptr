import React from "react";
import Link from "next/link";
import { FeedbackForm } from "./FeedbackForm";

export function Feedback() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white py-12 text-gray-900 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
      <div className="container mx-auto max-w-2xl px-4">
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
          <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Feedback
          </h1>
          <p className="mb-8 text-gray-700 dark:text-gray-300">
            We appreciate your feedback to improve Transcriptr. Please fill out
            the form below to let us know your thoughts, report issues, or
            suggest new features.
          </p>

          <div className="mb-4">
            <FeedbackForm />
          </div>
        </div>

        <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Transcriptr. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
