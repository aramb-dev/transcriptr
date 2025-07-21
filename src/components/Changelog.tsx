import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface ChangelogProps {
  isModal?: boolean;
  onClose?: () => void;
}

interface ChangeItem {
  date: string;
  version: string;
  changes: {
    new?: string[];
    improved?: string[];
    fixed?: string[];
  };
}

export function Changelog({ isModal = false, onClose }: ChangelogProps) {
  // Define your changelog entries here in reverse chronological order (newest first)
  const changelogItems: ChangeItem[] = [
    {
      date: "Mon, 21 Jul 2025",
      version: "2.0.0",
      changes: {
        new: [
          "Added V2 Announcement modal for first-time visitors with celebratory confetti animation",
          "Implemented localStorage-based persistence to show announcement only once per user",
          "Added debug function `seenV2(false)` for developers to re-enable the announcement modal",
        ],
        improved: [
          "Enhanced user onboarding experience with welcoming V2 announcement",
          "Integrated confetti animation with proper z-index layering for visual celebration",
        ],
        fixed: [],
      },
    },
    {
      date: "Thu, 26 Jun 2025",
      version: "1.4.7",
      changes: {
        new: [],
        improved: [
          "Refactored `generatePdfLocally` function to reduce cognitive complexity.",
        ],
        fixed: [
          "Addressed cognitive complexity issue in PDF generation logic.",
        ],
      },
    },
    {
      date: "Thu, 26 Jun 2025",
      version: "1.4.6",
      changes: {
        new: [
          "Added basic content to the Documentation page.",
          'Added a "Back to Home" button on the Documentation page.',
        ],
        improved: [],
        fixed: [],
      },
    },
    {
      date: "Thu, 26 Jun 2025",
      version: "1.4.4",
      changes: {
        new: [],
        improved: [
          "Removed FFmpeg dependency and all related audio conversion logic.",
        ],
        fixed: ["Fixed build errors caused by FFmpeg dependency issues."],
      },
    },
    {
      date: "Wed, 23 Apr 2025",
      version: "1.4.3",
      changes: {
        new: [],
        improved: [
          "Enhanced transcription reliability with automatic batch size reduction",
          "Added smart retry logic for handling GPU memory limitations",
        ],
        fixed: [
          'Fixed "CUDA out of memory" errors by automatically reducing batch size and retrying',
          "Resolved transcription failures on larger audio files with dynamic resource allocation",
        ],
      },
    },
    {
      date: "Tue, 23 Apr 2025",
      version: "1.4.2",
      changes: {
        new: [
          "Added improved multilingual document generation for better international language support",
          "Implemented true PDF generation with proper multilingual text support",
        ],
        improved: [
          "Enhanced document export to properly handle Arabic, Hebrew, and other non-Latin scripts",
          "Optimized PDF generation with automatic RTL text direction detection",
          "Added automatic fallback to HTML format when PDF generation fails",
          "Implemented proper page layout with headers, footers, and multi-page support",
        ],
        fixed: [
          "Fixed issue with Arabic and other non-Latin text displaying as gibberish in exported documents",
          "Fixed document generation issues when Printerz API is unavailable",
          "Fixed inconsistent file extensions in document downloads",
        ],
      },
    },
    {
      date: "Mon, 21 Apr 2025",
      version: "1.4.1",
      changes: {
        new: [
          "Added dialog component for improved user interactions",
          "Implemented session persistence for transcriptions",
          "Added transcription history feature",
        ],
        improved: [
          "Refactored code to reduce cognitive complexity in transcription processing",
          "Enhanced exception handling in Firebase proxy service",
          "Optimized Replicate client by removing unused variables",
          "Enhanced transcription progress tracking with cleaner percentage ranges",
          "Redesigned layout components for better user experience",
        ],
        fixed: [
          "Fixed ignored exceptions in Firebase proxy service",
          "Removed useless variable assignment in Replicate client",
          "Reduced complexity in transcribe function for better maintainability",
          "Resolved typo where meta tag had placeholder information",
          "Fixed decimal values in progress percentages for a cleaner UI experience",
        ],
      },
    },
    {
      date: "Sun, 13 Apr 2025",
      version: "1.4.0",
      changes: {
        new: [
          "Implemented audio upload and transcription functionality with URL support",
          "Added SEO and social meta tags",
          "Integrated branding assets (favicon, social image)",
          "Introduced LoadingFallback component for lazy-loaded routes.",
          "Created cleanup service for managing temporary files in Firebase.",
        ],
        improved: [
          "Enhanced polling mechanism to fix timing issues",
          "Refactored polling logic into custom hook `useTranscriptionPolling`",
          "Replaced MainApp component with MainLayout for better organization.",
          "Refactored UploadAudio component to utilize new FileUploadInput and UrlInput components.",
          "Added cleanup functionality for temporary files in Firebase after transcription.",
          "Implemented lazy loading for transcription-related components in MainLayout.",
          "Enhanced URL validation logic in UploadAudio component.",
          "Updated Firebase upload utility to handle base64 data uploads.",
          "Improved error handling and logging in Replicate API interactions.",
        ],
        fixed: [
          "Resolved issue where polling stopped prematurely due to state update timing",
        ],
      },
    },
    {
      date: "Sat, 12 Apr 2025",
      version: "1.3.0",
      changes: {
        new: [
          "Added OGG support",
          "Optimized analytics loading",
          "Enhanced chunking strategy for improved performance",
        ],
        improved: ["Performance optimizations across the application"],
        fixed: [],
      },
    },
    {
      date: "Fri, 11 Apr 2025",
      version: "1.0.0",
      changes: {
        new: [
          "Added changelog and feedback components",
          "Added Google site verification HTML file",
          "Implemented dynamic imports for performance optimization",
          "Added Google Analytics integration",
          "Added TranscriptionProcessing and TranscriptionResult components",
          "Added PDF and DOCX generation capabilities",
        ],
        improved: ["Enhanced header and footer for changelog access"],
        fixed: [],
      },
    },
    {
      date: "Wed, 9 Apr 2025",
      version: "0.5.0",
      changes: {
        new: [
          "Integrated cookie consent management with analytics tracking",
          "Added ad blocker detection",
          "Added Terms of Service and Privacy Policy components",
        ],
        improved: ["Analytics initialization to use new Clarity library"],
        fixed: [],
      },
    },
    {
      date: "Tue, 8 Apr 2025",
      version: "0.4.0",
      changes: {
        new: [
          "Added feedback form and modal for user feedback collection",
          "Added Firebase configuration files",
          "Added HTML template and instructions for template generation",
          "Added .hintrc configuration file",
          "Enhanced PDF generation with Firebase upload",
        ],
        improved: [
          "Updated feedback modals to use specific IDs",
          "Enhanced feedback form handling with device info detection",
          "Updated README with environment variables section",
        ],
        fixed: [],
      },
    },
    {
      date: "Mon, 7 Apr 2025",
      version: "0.3.0",
      changes: {
        new: [
          "Added PDF generation support with pdfMake",
          "Integrated Printerz API for PDF generation",
          "Added customizable title input for PDFs",
        ],
        improved: ["Refactored code structure for improved readability"],
        fixed: ["Refactored PDF generation to remove unused code"],
      },
    },
    {
      date: "Mon, 31 Mar 2025",
      version: "0.2.0",
      changes: {
        new: [
          "Added Firebase integration for file storage",
          "Implemented FFmpeg download script",
          "Added audio conversion functionality",
          "Added CloudConvert function for audio conversion",
          "Implemented cookie consent management",
        ],
        improved: [
          "Enhanced dark mode support with improved text colors",
          "Updated audio format support and user guidance",
          "Refactored download-ffmpeg script to use ESM imports",
        ],
        fixed: [
          "Firebase file upload handling and cleanup process",
          "Implemented alternative FFmpeg download script",
          "Updated Netlify configuration",
          "Added debug environment function and enhanced file conversion error handling",
        ],
      },
    },
    {
      date: "Tue, 18 Mar 2025",
      version: "0.1.1",
      changes: {
        new: ["Added Netlify deployment support with API functions"],
        improved: ["Updated .gitignore to include .env and .netlify folders"],
        fixed: [
          "Disabled dark mode by changing Tailwind configuration",
          "Updated Netlify build command and TypeScript configuration",
        ],
      },
    },
    {
      date: "Mon, 17 Mar 2025",
      version: "0.1.0",
      changes: {
        new: [
          "Implemented custom file input hook",
          "Added audio upload component with improved error handling",
          "Enhanced Tailwind CSS configuration with backdrop filter and typography plugin",
          "Added Prettier configuration",
          "Updated README with project overview and setup instructions",
        ],
        improved: [
          "Audio transcription handling with improved error management",
          "Audio upload component layout",
          "TypeScript settings for module interoperability",
        ],
        fixed: [],
      },
    },
    {
      date: "Sun, 16 Mar 2025",
      version: "0.0.1",
      changes: {
        new: [
          "Initial project setup with Vite, React, and TypeScript",
          "Added environment configuration, PostCSS, and ESLint",
        ],
        improved: [],
        fixed: [],
      },
    },
  ];

  const content = (
    <div
      className={`bg-white dark:bg-gray-800 ${isModal ? "rounded-lg shadow-xl" : "rounded-xl shadow-lg"} overflow-hidden`}
    >
      <div className="p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Changelog
          </h2>
          {isModal && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Timeline */}
        <div className="relative space-y-8">
          {changelogItems.map((item, index) => (
            <div key={index} className="relative flex items-start sm:space-x-4">
              {/* Date and Version */}
              <div className="w-24 shrink-0 pr-4 text-right sm:w-32 sm:pr-0 sm:text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.date}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  v{item.version}
                </p>
              </div>

              {/* Dot */}
              <div className="absolute top-1 left-0 mt-1 hidden h-2 w-2 rounded-full bg-blue-500 sm:left-[calc(8rem+1rem-4px)] sm:block" />

              {/* Changes */}
              <div className="space-y-4 pl-0 sm:pl-4">
                {item.changes.new && item.changes.new.length > 0 && (
                  <div>
                    <h3 className="text-md mb-2 font-medium text-green-600 dark:text-green-400">
                      New
                    </h3>
                    <ul className="list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
                      {item.changes.new.map((change, i) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.changes.improved && item.changes.improved.length > 0 && (
                  <div>
                    <h3 className="text-md mb-2 font-medium text-blue-600 dark:text-blue-400">
                      Improved
                    </h3>
                    <ul className="list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
                      {item.changes.improved.map((change, i) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.changes.fixed && item.changes.fixed.length > 0 && (
                  <div>
                    <h3 className="text-md mb-2 font-medium text-amber-600 dark:text-amber-400">
                      Fixed
                    </h3>
                    <ul className="list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
                      {item.changes.fixed.map((change, i) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {index < changelogItems.length - 1 && (
                <div className="absolute top-10 bottom-0 left-0 hidden w-px bg-gray-200 sm:block dark:bg-gray-700" />
              )}
            </div>
          ))}
        </div>
      </div>

      {!isModal && (
        <div className="flex justify-center border-t border-gray-200 p-4 dark:border-gray-700">
          <Link href="/">
            <Button variant="outline" className="gap-2">
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
            </Button>
          </Link>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return content;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white py-12 text-gray-900 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
      <div className="container mx-auto max-w-3xl px-4">{content}</div>
    </div>
  );
}
