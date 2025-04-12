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
      date: '2023-10-15', // Update with your actual release date
      version: '1.3.0',
      changes: {
        new: [
          'Added support for OGG audio format',
          'Implemented code splitting for better performance'
        ],
        improved: [
          'Reduced JavaScript bundle size by optimizing imports',
          'Decreased initial load time with deferred script loading',
          'Optimized Google Tag Manager loading process'
        ],
        fixed: [
          'Fixed build process issues with manual chunks',
          'Resolved issues with large JavaScript bundle sizes',
          'Fixed performance bottlenecks identified in PageSpeed Insights'
        ]
      }
    },
    {
      date: '2023-07-25',
      version: '1.2.0',
      changes: {
        new: [
          'Added PDF generation using Printerz templates',
          'Added support for speaker diarization',
          'Added this changelog to track updates'
        ],
        improved: [
          'Enhanced transcription accuracy with new Whisper models',
          'Improved error handling during file uploads'
        ],
        fixed: [
          'Fixed CORS issues with Firebase Storage',
          'Fixed UI glitches in dark mode',
          'Fixed PDF preview functionality'
        ]
      }
    },
    {
      date: '2023-06-10',
      version: '1.1.0',
      changes: {
        new: [
          'Added DOCX document export format',
          'Added feedback submission system',
          'Implemented Google Analytics and Microsoft Clarity (opt-in)'
        ],
        improved: [
          'Better mobile responsiveness across all screens',
          'Faster audio processing with optimized file handling'
        ],
        fixed: [
          'Fixed bug where large files would fail to upload',
          'Resolved issues with Markdown formatting in the export'
        ]
      }
    },
    {
      date: '2023-05-01',
      version: '1.0.0',
      changes: {
        new: [
          'Initial release of Transcriptr',
          'Support for MP3, WAV, and FLAC audio formats',
          'Multiple export formats: TXT, MD',
          'Language detection and selection'
        ]
      }
    }
  ];

  const content = (
    <div className={`bg-white dark:bg-gray-800 ${isModal ? 'rounded-lg shadow-xl' : 'rounded-xl shadow-lg'} overflow-hidden`}>
      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Changelog</h1>
          {isModal && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
              aria-label="Close changelog"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="space-y-10">
          {changelogItems.map((item, index) => (
            <div key={index} className="relative">
              <div className="flex items-baseline mb-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">v{item.version}</h2>
                <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{item.date}</span>
              </div>

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