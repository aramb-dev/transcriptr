import React from "react";
import Link from "next/link";

interface HeaderProps {
  onOpenChangelog: () => void;
  onShowHistory?: () => void;
}

export function Header({ onOpenChangelog, onShowHistory }: HeaderProps) {
  return (
    <header className="mb-8 text-center">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 justify-start">
          {onShowHistory && (
            <button
              onClick={onShowHistory}
              className="flex items-center text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              History
            </button>
          )}
        </div>

        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Transcriptr
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Convert audio to text with AI-powered transcription
          </p>
        </div>

        <div className="flex flex-1 justify-end">
          <a
            href="#changelog"
            onClick={(e) => {
              e.preventDefault();
              onOpenChangelog();
            }}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Changelog
          </a>
        </div>
      </div>

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Developed by{" "}
        <a
          href="https://github.com/aramb-dev"
          className="text-blue-600 hover:underline dark:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abdur-Rahman Bilal (aramb-dev)
        </a>{" "}
        and AI |{" "}
        <a
          href="https://github.com/aramb-dev/transcriptr"
          className="text-blue-600 hover:underline dark:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Github
        </a>
      </p>
    </header>
  );
}
