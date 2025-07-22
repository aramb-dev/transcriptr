import React, { useState } from "react";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { ScrollRevealSection } from "../ui/scroll-reveal-section";

interface TranscriptionResultProps {
  transcription: string;
  onNewTranscription?: () => void;
  onOpenStudio?: () => void;
}

export default function TranscriptionResult({
  transcription,
  onNewTranscription,
  onOpenStudio,
}: TranscriptionResultProps) {
  // State for copy functionality
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Extract the transcript text
  const transcriptText = React.useMemo(() => {
    try {
      const parsed =
        typeof transcription === "string"
          ? JSON.parse(transcription)
          : transcription;
      return parsed?.text || transcription;
    } catch {
      return transcription;
    }
  }, [transcription]);

  // Copy function
  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(transcriptText);
      setCopySuccess(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Simple download function
  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      // Create a simple text file download
      const blob = new Blob([transcriptText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transcription.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      toast.success("Downloaded successfully!");
    } catch {
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Unified Transcription Card */}
      <ScrollRevealSection>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Header */}
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <svg
                      className="h-4 w-4 text-green-600 dark:text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Transcription Complete
                  </h1>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your audio has been successfully transcribed
                </p>
              </div>

              <div className="flex items-center gap-3">
                {onOpenStudio && (
                  <Button
                    onClick={onOpenStudio}
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                      <polyline points="15,9 15,15 9,15" />
                    </svg>
                    Open in Studio
                  </Button>
                )}

                {onNewTranscription && (
                  <Button
                    variant="outline"
                    onClick={onNewTranscription}
                    className="flex items-center gap-2 border-gray-400 text-gray-700 hover:border-gray-500 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    New Transcription
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Content Actions */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Transcript
              </h2>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAll}
                  disabled={copySuccess}
                  className="flex items-center gap-2 border-gray-400 text-gray-700 hover:border-gray-500 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                >
                  {copySuccess ? (
                    <>
                      <Copy className="h-4 w-4 text-green-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy All</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="flex items-center gap-2 border-gray-400 text-gray-700 hover:border-gray-500 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                >
                  {isDownloading ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>Download (.txt)</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Transcript Content */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              <div className="max-h-[400px] overflow-y-auto p-4">
                <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                  {transcriptText || "No transcript available"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollRevealSection>
    </div>
  );
}
