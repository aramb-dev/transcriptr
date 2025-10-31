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
                  Transform your audio files into accurate transcriptions in
                  just a few simple steps.
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
                          Select language and other settings
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
                      Universal Format Support
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Supports 10+ audio formats with automatic conversion for
                    M4A, AAC, WMA, and more
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
                <div className="mb-6 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl">🔄</span>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">
                      Automatic Format Conversion
                    </h4>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>New!</strong> Transcriptr now automatically converts
                    unsupported formats (M4A, AAC, MP4, WMA, etc.) to MP3 before
                    transcription. No manual conversion needed!
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 font-medium text-gray-900 dark:text-gray-100">
                      ✅ Directly Supported (Fast Processing)
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">•</span>
                        <strong>MP3</strong> - Most common audio format
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">•</span>
                        <strong>WAV</strong> - Waveform Audio File
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">•</span>
                        <strong>FLAC</strong> - Free Lossless Audio Codec
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">•</span>
                        <strong>OGG</strong> - Open-source audio format
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 font-medium text-gray-900 dark:text-gray-100">
                      🔄 Auto-Converted (Slightly Longer Processing)
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-2">
                        <span className="text-blue-500">•</span>
                        <strong>M4A</strong> - MPEG-4 Audio (iPhone recordings)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-500">•</span>
                        <strong>AAC</strong> - Advanced Audio Coding
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-500">•</span>
                        <strong>MP4</strong> - MPEG-4 with audio track
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-500">•</span>
                        <strong>WMA</strong> - Windows Media Audio
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-500">•</span>
                        <strong>AIFF</strong> - Audio Interchange File Format
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-500">•</span>
                        <strong>CAF</strong> - Core Audio Format (macOS)
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 <strong>Tip:</strong> Directly supported formats (MP3,
                      WAV, FLAC, OGG) process immediately, while other formats
                      are automatically converted first.
                    </p>
                  </div>
                  <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⏱️ <strong>Processing Time:</strong> Auto-converted files
                      take 30-60 seconds longer due to the conversion step, but
                      the process is fully automated.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Audio Conversion Process */}
            <section className="mb-10">
              <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                🔄 Audio Conversion Process
              </h2>
              <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:from-purple-900/20 dark:to-pink-900/20">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  When you upload unsupported formats like M4A or AAC, here's
                  what happens automatically:
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
                        1
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          Format Detection
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          System automatically detects if conversion is needed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
                        2
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          Secure Upload
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Your file is securely uploaded to temporary storage
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
                        3
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          Automatic Conversion
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          CloudConvert API converts your audio to MP3 format
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
                        4
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          Start Transcription
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Converted MP3 is sent for AI transcription processing
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="rounded-md bg-indigo-50 p-3 dark:bg-indigo-900/20">
                    <p className="text-sm text-indigo-800 dark:text-indigo-200">
                      🔒 <strong>Privacy:</strong> All temporary files are
                      automatically deleted after processing. Your original
                      audio is never permanently stored.
                    </p>
                  </div>
                  <div className="rounded-md bg-green-50 p-3 dark:bg-green-900/20">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      👁️ <strong>Transparency:</strong> You can view detailed
                      conversion progress in the "View Details" section during
                      processing.
                    </p>
                  </div>
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
                    <p>
                      • Most audio formats are now supported (MP3, WAV, FLAC,
                      OGG, M4A, AAC, etc.)
                    </p>
                    <p>
                      • If your format isn't supported, try converting to MP3 or
                      WAV first
                    </p>
                    <p>
                      • Check that the file size doesn't exceed the upload limit
                    </p>
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
                    <p>
                      • For persistent issues, use the feedback form to report
                      bugs
                    </p>
                  </div>
                </details>

                <details className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <summary className="cursor-pointer font-medium text-gray-900 dark:text-gray-100">
                    Browser Compatibility
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      • Use modern browsers: Chrome, Firefox, Safari, or Edge
                    </p>
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
                    <p>
                      • Use lower batch sizes for large files to avoid memory
                      issues
                    </p>
                    <p>• Close other browser tabs to free up resources</p>
                    <p>
                      • Consider splitting very long recordings into segments
                    </p>
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
                    What audio formats can I upload?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You can upload almost any audio format! We support MP3, WAV,
                    FLAC, OGG directly, and automatically convert M4A, AAC, MP4,
                    WMA, AIFF, and CAF files to MP3 before transcription.
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                    Is my audio data secure?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Yes, your audio files are processed securely and
                    automatically deleted after transcription. We don't store
                    your audio permanently.
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                    What's the maximum file size?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    File size limits depend on your plan. Free users can upload
                    files up to 25MB, while premium users enjoy higher limits.
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                    How accurate are the transcriptions?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Transcription accuracy typically ranges from 85-95%
                    depending on audio quality, language, and speech clarity.
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                    Can I edit transcriptions after they're generated?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Currently, you can copy and edit transcriptions in external
                    applications. Built-in editing features are planned for
                    future releases.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Need more help? Check out our{" "}
                  <Link
                    href="/changelog"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    changelog
                  </Link>{" "}
                  or submit{" "}
                  <button
                    onClick={() => window.openFeedbackModal?.("general")}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    feedback
                  </button>
                  {"."}
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
