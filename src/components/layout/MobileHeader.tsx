"use client";

import React from "react";
import { MobileNavigation } from "../ui/mobile-navigation";

interface MobileHeaderProps {
  onOpenChangelog: () => void;
  onShowHistory?: () => void;
  onOpenFeedbackModal: (type: "general" | "issue" | "feature") => void;
  onShowV3?: () => void;
}

export function MobileHeader({
  onOpenChangelog,
  onShowHistory,
  onOpenFeedbackModal,
  onShowV3,
}: MobileHeaderProps) {
  return (
    <header className="mb-6 md:hidden">
      {/* Mobile Header Content */}
      <div className="flex items-center justify-between px-1">
        {/* Left side - History button */}
        <div className="flex-1">
          {onShowHistory && (
            <button
              onClick={onShowHistory}
              className="flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 active:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
              aria-label="View transcription history"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              History
            </button>
          )}
        </div>

        {/* Center - App Title */}
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
            Transcriptr
          </h1>
        </div>

        {/* Right side - Mobile Navigation Menu */}
        <div className="flex flex-1 justify-end">
          <MobileNavigation
            onOpenChangelog={onOpenChangelog}
            onShowHistory={onShowHistory}
            onOpenFeedbackModal={onOpenFeedbackModal}
            onShowV3={onShowV3}
          />
        </div>
      </div>

      {/* Mobile Subtitle */}
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Convert audio to text with AI-powered transcription
        </p>
      </div>

      {/* Mobile Attribution - Simplified */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          By{" "}
          <a
            href="https://aramb.dev"
            className="text-blue-600 hover:underline dark:text-blue-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abdur-Rahman Bilal
          </a>
        </p>
      </div>
    </header>
  );
}
