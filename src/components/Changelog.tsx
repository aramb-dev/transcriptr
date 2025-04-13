import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { X } from 'lucide-react';

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
      date: 'Sun, 13 Apr 2025',
      version: '1.4.0',
      changes: {
        new: [
          'Implemented audio upload and transcription functionality with URL support',
          'Added SEO and social meta tags',
          'Integrated branding assets (favicon, social image)',
          'Introduced LoadingFallback component for lazy-loaded routes.',
          'Created cleanup service for managing temporary files in Firebase.',
        ],
        improved: [
          'Enhanced polling mechanism to fix timing issues',
          'Refactored polling logic into custom hook `useTranscriptionPolling`',
          'Replaced MainApp component with MainLayout for better organization.',
          'Refactored UploadAudio component to utilize new FileUploadInput and UrlInput components.',
          'Added cleanup functionality for temporary files in Firebase after transcription.',
          'Implemented lazy loading for transcription-related components in MainLayout.',
          'Enhanced URL validation logic in UploadAudio component.',
          'Updated Firebase upload utility to handle base64 data uploads.',
          'Improved error handling and logging in Replicate API interactions.',
        ],
        fixed: [
          'Resolved issue where polling stopped prematurely due to state update timing',
        ]
      }
    },
    {
      date: 'Sat, 12 Apr 2025',
      version: '1.3.0',
      changes: {
        new: [
          'Added OGG support',
          'Optimized analytics loading',
          'Enhanced chunking strategy for improved performance'
        ],
        improved: [
          'Performance optimizations across the application'
        ],
        fixed: []
      }
    },
    {
      date: 'Fri, 11 Apr 2025',
      version: '1.0.0',
      changes: {
        new: [
          'Added changelog and feedback components',
          'Added Google site verification HTML file',
          'Implemented dynamic imports for performance optimization',
          'Added Google Analytics integration',
          'Added TranscriptionProcessing and TranscriptionResult components',
          'Added PDF and DOCX generation capabilities'
        ],
        improved: [
          'Enhanced header and footer for changelog access'
        ],
        fixed: []
      }
    },
    {
      date: 'Wed, 9 Apr 2025',
      version: '0.5.0',
      changes: {
        new: [
          'Integrated cookie consent management with analytics tracking',
          'Added ad blocker detection',
          'Added Terms of Service and Privacy Policy components'
        ],
        improved: [
          'Analytics initialization to use new Clarity library'
        ],
        fixed: []
      }
    },
    {
      date: 'Tue, 8 Apr 2025',
      version: '0.4.0',
      changes: {
        new: [
          'Added feedback form and modal for user feedback collection',
          'Added Firebase configuration files',
          'Added HTML template and instructions for template generation',
          'Added .hintrc configuration file',
          'Enhanced PDF generation with Firebase upload'
        ],
        improved: [
          'Updated feedback modals to use specific IDs',
          'Enhanced feedback form handling with device info detection',
          'Updated README with environment variables section'
        ],
        fixed: []
      }
    },
    {
      date: 'Mon, 7 Apr 2025',
      version: '0.3.0',
      changes: {
        new: [
          'Added PDF generation support with pdfMake',
          'Integrated Printerz API for PDF generation',
          'Added customizable title input for PDFs'
        ],
        improved: [
          'Refactored code structure for improved readability'
        ],
        fixed: [
          'Refactored PDF generation to remove unused code'
        ]
      }
    },
    {
      date: 'Mon, 31 Mar 2025',
      version: '0.2.0',
      changes: {
        new: [
          'Added Firebase integration for file storage',
          'Implemented FFmpeg download script',
          'Added audio conversion functionality',
          'Added CloudConvert function for audio conversion',
          'Implemented cookie consent management'
        ],
        improved: [
          'Enhanced dark mode support with improved text colors',
          'Updated audio format support and user guidance',
          'Refactored download-ffmpeg script to use ESM imports'
        ],
        fixed: [
          'Firebase file upload handling and cleanup process',
          'Implemented alternative FFmpeg download script',
          'Updated Netlify configuration',
          'Added debug environment function and enhanced file conversion error handling'
        ]
      }
    },
    {
      date: 'Tue, 18 Mar 2025',
      version: '0.1.1',
      changes: {
        new: [
          'Added Netlify deployment support with API functions'
        ],
        improved: [
          'Updated .gitignore to include .env and .netlify folders'
        ],
        fixed: [
          'Disabled dark mode by changing Tailwind configuration',
          'Updated Netlify build command and TypeScript configuration'
        ]
      }
    },
    {
      date: 'Mon, 17 Mar 2025',
      version: '0.1.0',
      changes: {
        new: [
          'Implemented custom file input hook',
          'Added audio upload component with improved error handling',
          'Enhanced Tailwind CSS configuration with backdrop filter and typography plugin',
          'Added Prettier configuration',
          'Updated README with project overview and setup instructions'
        ],
        improved: [
          'Audio transcription handling with improved error management',
          'Audio upload component layout',
          'TypeScript settings for module interoperability'
        ],
        fixed: []
      }
    },
    {
      date: 'Sun, 16 Mar 2025',
      version: '0.0.1',
      changes: {
        new: [
          'Initial project setup with Vite, React, and TypeScript',
          'Added environment configuration, PostCSS, and ESLint'
        ],
        improved: [],
        fixed: []
      }
    }
  ];


  const content = (
    <div className={`bg-white dark:bg-gray-800 ${isModal ? 'rounded-lg shadow-xl' : 'rounded-xl shadow-lg'} overflow-hidden`}>
      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Changelog</h2>
          {isModal && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Timeline */}
        <div className="relative space-y-8">
          {changelogItems.map((item, index) => (
            <div key={index} className="relative flex items-start sm:space-x-4">
              {/* Date and Version */}
              <div className="flex-shrink-0 w-24 sm:w-32 text-right sm:text-left pr-4 sm:pr-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.date}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">v{item.version}</p>
              </div>

              {/* Dot */}
              <div className="absolute left-0 sm:left-[calc(8rem+1rem-4px)] top-1 w-2 h-2 bg-blue-500 rounded-full mt-1 hidden sm:block" />

              {/* Changes */}
              <div className="space-y-4 pl-0 sm:pl-4">
                {item.changes.new && item.changes.new.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-green-600 dark:text-green-400 mb-2">New</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                      {item.changes.new.map((change, i) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.changes.improved && item.changes.improved.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-blue-600 dark:text-blue-400 mb-2">Improved</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                      {item.changes.improved.map((change, i) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.changes.fixed && item.changes.fixed.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-amber-600 dark:text-amber-400 mb-2">Fixed</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                      {item.changes.fixed.map((change, i) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {index < changelogItems.length - 1 && (
                <div className="absolute left-0 top-10 bottom-0 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {!isModal && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-center">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 max-w-3xl">
        {content}
      </div>
    </div>
  );
}