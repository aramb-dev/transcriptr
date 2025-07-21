"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-12 text-gray-900 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
                Documentation
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Everything you need to know about using Transcriptr
              </p>
            </div>

            {/* Getting Started */}
            <section className="mb-10">
              <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                🚀 Getting Started
              </h2>
              <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  Transform your audio files into accurate transcriptions in just a few simple steps.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                        1
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          Upload Audio
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Upload your audio file or provide a URL
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                        2
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          Configure Options
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Select language, diarization, and other settings
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                        3
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          Start Transcription
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click "Transcribe" and monitor progress
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                        4
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          Download Results
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Review and export your transcription
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="mb-10">
              <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                ✨ Key Features
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl">🌍</span>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Multi-language Support
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Transcribe audio in 100+ languages with high accuracy
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl">👥</span>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Speaker Diarization
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically identify and separate different speakers
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl">💾</span>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Session Persistence
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your progress is automatically saved and restored
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl">📄</span>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Multiple Export Formats
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download as PDF, DOCX, or plain text with timestamps
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl">🕒</span>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Transcription History
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access and manage all your past transcriptions
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl">🎵</span>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Wide Format Support
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Supports MP3, WAV, FLAC, OGG, and more audio formats
                  </p>
                </div>
              </div>
            </section>

            {/* Supported Formats */}
            <section className="mb-10">
              <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                📁 Supported Audio Formats
              </h2>
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-900/50">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                      Compressed Formats
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• MP3 - Most common audio format</li>
                      <li>• OGG - Open-source audio format</li>
                      <li>• AAC - Advanced Audio Coding</li>
                      <li>• M4A - MPEG-4 Audio</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                      Uncompressed Formats
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• WAV - Waveform Audio File</li>
                      <li>• FLAC - Free Lossless Audio Codec</li>
                      <li>• AIFF - Audio Interchange File Format</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Tip:</strong> For best results, use uncompressed formats like WAV or FLAC when possible.
                  </p>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section className="mb-10">
              <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                🔧 Troubleshooting
              </h2>
              <div className="space-y-4">
                <details className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <summary className="cursor-pointer font-medium text-gray-900 dark:text-gray-100">
                    Upload Issues
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>• Ensure your file is in a supported format (MP3, WAV, FLAC, OGG)</p>
                    <p>• Check that the file size doesn't exceed the upload limit</p>
                    <p>• Try refreshing the page if uploads are failing</p>
                    <p>• Verify your internet connection is stable</p>
                  </div>
                </details>

                <details className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <summary className="cursor-pointer font-medium text-gray-900 dark:text-gray-100">
                    Transcription Failures
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>• Check your internet connection and try again</p>
                    <p>• Ensure the audio quality is clear and audible</p>
                    <p>• Try reducing the batch size in advanced options</p>
                    <p>• For persistent issues, use the feedback form to report bugs</p>
                  </div>
                </details>

                <details className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <summary className="cursor-pointer font-medium text-gray-900 dark:text-gray-100">
                    Browser Compatibility
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>• Use modern browsers: Chrome, Firefox, Safari, or Edge</p>
                    <p>• Enable JavaScript for full functionality</p>
                    <p>• Clear browser cache if experiencing issues</p>
                    <p>• Disable ad blockers if uploads are blocked</p>
                  </div>
                </details>

                <details className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <summary className="cursor-pointer font-medium text-gray-900 dark:text-gray-100">
                    Performance Tips
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>• Shorter audio files (under 1 hour) process faster</p>
                    <p>• Use lower batch sizes for large files to avoid memory issues</p>
                    <p>• Close other browser tabs to free up resources</p>
                    <p>• Consider splitting very long recordings into segments</p>
                  </div>
                </details>
              </div>
            </section>

            {/* FAQ */}
            <section className="mb-10">
              <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                ❓ Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                    Is my audio data secure?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Yes, your audio files are processed securely and automatically deleted after transcription. We don't store your audio permanently.
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                    What's the maximum file size?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    File size limits depend on your plan. Free users can upload files up to 25MB, while premium users enjoy higher limits.
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                    How accurate are the transcriptions?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Transcription accuracy typically ranges from 85-95% depending on audio quality, language, and speech clarity.
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                    Can I edit transcriptions after they're generated?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Currently, you can copy and edit transcriptions in external applications. Built-in editing features are planned for future releases.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Need more help? Check out our{" "}
                  <Link href="/changelog" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    changelog
                  </Link>{" "}
                  or submit{" "}
                  <button
                    onClick={() => window.openFeedbackModal?.("general")}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    feedback
                  </button>
                  .
                </p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
