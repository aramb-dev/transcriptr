import React from 'react';

export function Header() {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Transcriptr</h1>
      <p className="text-gray-600 dark:text-gray-300">Convert audio to text with AI-powered transcription</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Developed by <a href="https://github.com/aramb-dev" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Abdur-Rahman Bilal (aramb-dev)</a> and AI | <a href="https://github.com/aramb-dev/transcriptr" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">View on Github</a>
      </p>
    </header>
  );
}