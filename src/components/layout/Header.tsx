import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onOpenChangelog: () => void;
}

export function Header({ onOpenChangelog }: HeaderProps) {
  return (
    <header className="mb-8 text-center">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          {/* Empty div for flex layout balance */}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Transcriptr</h1>
          <p className="text-gray-600 dark:text-gray-300">Convert audio to text with AI-powered transcription</p>
        </div>

        <div className="flex-1 flex justify-end">
          <a
            href="#changelog"
            onClick={(e) => {
              e.preventDefault();
              onOpenChangelog();
            }}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Changelog
          </a>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Developed by <a href="https://github.com/aramb-dev" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Abdur-Rahman Bilal (aramb-dev)</a> and AI | <a href="https://github.com/aramb-dev/transcriptr" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">View on Github</a>
      </p>
    </header>
  );
}