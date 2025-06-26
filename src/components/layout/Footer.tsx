import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onOpenFeedbackModal: (type: 'general' | 'issue' | 'feature') => void;
  onOpenChangelog: () => void;
}

export function Footer({ onOpenFeedbackModal, onOpenChangelog }: FooterProps) {
  return (
    <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <a
          href="#feedback"
          onClick={(e) => {
            e.preventDefault();
            onOpenFeedbackModal('general');
          }}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Provide Feedback
        </a>
        <span>•</span>
        <a
          href="#issue"
          onClick={(e) => {
            e.preventDefault();
            onOpenFeedbackModal('issue');
          }}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Report an Issue
        </a>
        <span>•</span>
        <a
          href="#feature"
          onClick={(e) => {
            e.preventDefault();
            onOpenFeedbackModal('feature');
          }}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Suggest a Feature
        </a>
        <span>•</span>
        <a
          href="#changelog"
          onClick={(e) => {
            e.preventDefault();
            onOpenChangelog();
          }}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Changelog
        </a>
        <span>•</span>
        <a
          href="https://github.com/aramb-dev/transcriptr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Star on GitHub
        </a>
        <span>•</span>
        <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
          Terms of Service
        </Link>
        <span>•</span>
        <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
          Privacy Policy
        </Link>
        <span>•</span>
        <Link to="/docs" className="text-blue-600 dark:text-blue-400 hover:underline">
          Documentation
        </Link>
      </div>
      <p className="mt-4">© {new Date().getFullYear()} Transcriptr. All rights reserved.</p>
    </footer>
  );
}