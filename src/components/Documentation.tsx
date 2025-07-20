import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

export function Documentation() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold mb-6">Documentation</h1>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This section will guide you through the initial setup and basic usage of the application.
                Learn how to upload your first audio file and get your transcription.
              </p>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Step 1: Upload your audio file using the provided interface.</li>
                <li>Step 2: Select your desired language and diarization options.</li>
                <li>Step 3: Click "Transcribe" and wait for the process to complete.</li>
                <li>Step 4: Review and download your transcription.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Explore the powerful features Transcriptr offers to enhance your transcription experience.
              </p>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Multi-language Support:</strong> Transcribe audio in various languages.</li>
                <li><strong>Diarization:</strong> Separate speakers in your transcription.</li>
                <li><strong>Session Persistence:</strong> Your transcription progress is saved automatically.</li>
                <li><strong>Export Options:</strong> Download transcriptions in multiple formats (e.g., PDF, DOCX).</li>
                <li><strong>History:</strong> Access your past transcriptions easily.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Troubleshooting</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Encountering issues? Find solutions to common problems here.
              </p>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Upload Errors:</strong> Ensure your file is a supported audio format (MP3, WAV, FLAC, OGG) and within size limits.</li>
                <li><strong>Transcription Failures:</strong> Check your internet connection and try again. For persistent issues, report a bug via the feedback form.</li>
                <li><strong>Browser Compatibility:</strong> Use a modern web browser like Chrome, Firefox, or Edge for the best experience.</li>
              </ul>
            </section>

            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-center">
              <Link to="/">
                <Button variant="outline" className="gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}