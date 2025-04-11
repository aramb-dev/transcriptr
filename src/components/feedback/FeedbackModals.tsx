import React from 'react';
import { FeedbackForm } from './FeedbackForm';

export function FeedbackModals() {
  return (
    <>
      {/* General Feedback Modal */}
      <div
        id="general-feedback-modal"
        className="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <div className="relative w-full max-w-md">
          <button
            onClick={() => document.getElementById('general-feedback-modal')?.classList.add('hidden')}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <FeedbackForm
            initialType="general"
            onClose={() => document.getElementById('general-feedback-modal')?.classList.add('hidden')}
          />
        </div>
      </div>

      {/* Issue Report Modal */}
      <div
        id="issue-feedback-modal"
        className="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <div className="relative w-full max-w-md">
          <button
            onClick={() => document.getElementById('issue-feedback-modal')?.classList.add('hidden')}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <FeedbackForm
            initialType="issue"
            onClose={() => document.getElementById('issue-feedback-modal')?.classList.add('hidden')}
          />
        </div>
      </div>

      {/* Feature Request Modal */}
      <div
        id="feature-feedback-modal"
        className="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <div className="relative w-full max-w-md">
          <button
            onClick={() => document.getElementById('feature-feedback-modal')?.classList.add('hidden')}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <FeedbackForm
            initialType="feature"
            onClose={() => document.getElementById('feature-feedback-modal')?.classList.add('hidden')}
          />
        </div>
      </div>
    </>
  );
}