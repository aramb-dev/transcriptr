"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { MobileButton } from "../ui/mobile-button";
import { Copy, Download, RotateCcw, FileText, Share2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface MobileTranscriptionResultProps {
  transcription: string;
  onNewTranscription: () => void;
}

export function MobileTranscriptionResult({
  transcription,
  onNewTranscription,
}: MobileTranscriptionResultProps) {
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Copy to clipboard function
  const handleCopyToClipboard = async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(transcription);
      setCopySuccess(true);
      toast.success("Transcription copied to clipboard!");
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy text to clipboard");
    } finally {
      setIsCopying(false);
    }
  };

  // Download as text file
  const handleDownloadText = async () => {
    setIsDownloading(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `transcription_${timestamp}.txt`;
      
      const blob = new Blob([transcription], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      toast.success("Transcription downloaded!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download transcription");
    } finally {
      setIsDownloading(false);
    }
  };

  // Share function (if supported by browser)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Transcription Result",
          text: transcription,
        });
      } catch (error) {
        console.error("Share failed:", error);
        // Fallback to copy
        handleCopyToClipboard();
      }
    } else {
      // Fallback to copy on browsers that don't support sharing
      handleCopyToClipboard();
    }
  };

  // Show a preview of the transcription (first few lines)
  const getPreview = () => {
    const lines = transcription.split('\n').filter(line => line.trim());
    const previewLines = lines.slice(0, 3);
    const hasMore = lines.length > 3;
    
    return {
      preview: previewLines.join('\n'),
      hasMore,
      totalLines: lines.length
    };
  };

  const { preview, hasMore, totalLines } = getPreview();

  return (
    <div className="mobile:p-4 md:p-6">
      {/* Mobile Header */}
      <div className="mb-6 flex items-center justify-between mobile:mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mobile:text-lg">
          Your Transcription
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewTranscription}
          className="text-blue-600 hover:text-blue-700 mobile:text-sm"
        >
          <RotateCcw className="mr-1 h-4 w-4 mobile:h-3 mobile:w-3" />
          New
        </Button>
      </div>

      {/* Transcription Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 mobile:mb-4"
      >
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 mobile:rounded-xl mobile:p-4">
          {/* Preview Text */}
          <div className="mb-4">
            <div className="max-h-32 overflow-hidden text-sm leading-relaxed text-gray-700 dark:text-gray-300 mobile:text-base mobile:leading-6">
              {preview}
              {hasMore && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 mobile:text-sm">
                  ... and {totalLines - 3} more lines
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400 mobile:text-sm">
            <span>{transcription.length} characters</span>
            <span>{totalLines} lines</span>
            <span>{Math.ceil(transcription.split(' ').length / 200)} min read</span>
          </div>
        </div>
      </motion.div>

      {/* Primary Actions */}
      <div className="mb-6 space-y-3 mobile:mb-4">
        {/* Copy Button - Most Important Action */}
        <MobileButton
          variant="mobileCta"
          size="touch"
          onClick={handleCopyToClipboard}
          disabled={isCopying}
          className="w-full"
        >
          {copySuccess ? (
            <>
              <Copy className="mr-2 h-5 w-5 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-5 w-5" />
              {isCopying ? "Copying..." : "Copy to Clipboard"}
            </>
          )}
        </MobileButton>

        {/* Share/Download Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Share Button (or copy fallback) */}
          <MobileButton
            variant="mobile"
            size="touch"
            onClick={handleShare}
            className="flex-1"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </MobileButton>

          {/* Quick Download */}
          <MobileButton
            variant="mobile"
            size="touch"
            onClick={handleDownloadText}
            disabled={isDownloading}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Saving..." : "Download"}
          </MobileButton>
        </div>
      </div>

      {/* Full Text View - Expandable */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6 mobile:mb-4"
      >
        <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 mobile:rounded-xl">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="flex w-full items-center justify-between p-4 text-left mobile:p-4"
          >
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mobile:text-base">
                View Full Text & Export Options
              </span>
            </div>
            <div className="text-gray-400">
              {showExportOptions ? '−' : '+'}
            </div>
          </button>

          {showExportOptions && (
            <div className="border-t border-gray-200 p-4 dark:border-gray-700 mobile:p-4">
              {/* Full Text */}
              <div className="mb-4 max-h-64 overflow-y-auto rounded-md bg-white p-3 text-sm leading-relaxed text-gray-700 dark:bg-gray-800 dark:text-gray-300 mobile:max-h-48 mobile:text-base mobile:leading-6 mobile-scroll-container">
                {transcription.split('\n').map((line, index) => (
                  <p key={index} className="mb-2 last:mb-0">
                    {line || '\u00A0'} {/* Non-breaking space for empty lines */}
                  </p>
                ))}
              </div>

              {/* Export Options */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mobile:text-base">
                  More Export Options:
                </h4>
                <div className="text-xs text-gray-500 dark:text-gray-400 mobile:text-sm">
                  For PDF, Word, and other formats, use the desktop version or the "New Transcription" button above to access full export options.
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Bottom Action - New Transcription */}
      <div className="border-t border-gray-200 pt-4 dark:border-gray-700 mobile:pt-4">
        <Button
          variant="outline"
          onClick={onNewTranscription}
          className="w-full mobile:h-12 mobile:text-base mobile:font-medium touch-feedback"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Start New Transcription
        </Button>
      </div>
    </div>
  );
}
