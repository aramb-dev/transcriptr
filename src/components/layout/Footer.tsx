import React from "react";
import Link from "next/link";

interface FooterProps {
  onOpenFeedbackModal: (type: "general" | "issue" | "feature") => void;
  onOpenChangelog: () => void;
}

export function Footer({ onOpenFeedbackModal, onOpenChangelog }: FooterProps) {
  return (
    <footer className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      <div className="flex flex-col items-center justify-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
        <a
          href="#feedback"
          onClick={(e) => {
            e.preventDefault();
            onOpenFeedbackModal("general");
          }}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Provide Feedback
        </a>
        <span>•</span>
        <a
          href="#issue"
          onClick={(e) => {
            e.preventDefault();
            onOpenFeedbackModal("issue");
          }}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Report an Issue
        </a>
        <span>•</span>
        <a
          href="#feature"
          onClick={(e) => {
            e.preventDefault();
            onOpenFeedbackModal("feature");
          }}
          className="text-blue-600 hover:underline dark:text-blue-400"
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
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Changelog
        </a>
        <span>•</span>
        <a
          href="https://github.com/aramb-dev/transcriptr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Star on GitHub
        </a>
        <span>•</span>
        <Link
          href="/terms"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Terms of Service
        </Link>
        <span>•</span>
        <Link
          href="/privacy"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Privacy Policy
        </Link>
        <span>•</span>
        <Link
          href="/docs"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Documentation
        </Link>
      </div>
      <p className="mt-4">
        © {new Date().getFullYear()} Transcriptr. All rights reserved.
      </p>
    </footer>
  );
}
