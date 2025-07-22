import React, { useState } from "react";
import { Button } from "../ui/button";
import { Copy, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { ScrollRevealSection } from "../ui/scroll-reveal-section";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import jsPDF from 'jspdf';

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
      const parsed = typeof transcription === "string" ? JSON.parse(transcription) : transcription;
      return parsed?.text || transcription;
    } catch (e) {
      return transcription;
    }
  }, [transcription]);

  // Detect if the transcription is in Arabic
  const isArabic = React.useMemo(() => {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(transcriptText);
  }, [transcriptText]);

  // Copy function
  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(transcriptText);
      setCopySuccess(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  // Download function for TXT
  const handleDownloadTxt = async () => {
    setIsDownloading(true);
    try {
      const blob = new Blob([transcriptText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transcription.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      toast.success("Downloaded as TXT!");
    } catch (error) {
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  // Download function for Markdown
  const handleDownloadMarkdown = async () => {
    setIsDownloading(true);
    try {
      // Format the text content as markdown with proper formatting
      const markdownContent = `# Transcription\n\n${transcriptText}`;
      const blob = new Blob([markdownContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transcription.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      toast.success("Downloaded as Markdown!");
    } catch (error) {
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  // Download function for DOCX
  const handleDownloadDocx = async () => {
    setIsDownloading(true);
    try {
      // Create a proper DOCX document using the docx library
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                text: "Transcription",
                heading: HeadingLevel.TITLE,
              }),
              new Paragraph({
                children: [new TextRun("")],
              }),
              ...transcriptText.split('\n').map((line: string) =>
                new Paragraph({
                  children: [new TextRun(line)],
                })
              ),
            ],
          },
        ],
      });

      // Generate the document buffer
      const buffer = await Packer.toBuffer(doc);

      // Create blob and download
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transcription.docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      toast.success("Downloaded as DOCX!");
    } catch (error) {
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  // Download function for PDF
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const pdf = new jsPDF();

      // Add title
      pdf.setFontSize(20);
      pdf.text("Transcription", 20, 30);

      // Add content with text wrapping
      pdf.setFontSize(12);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);

      // Split text into lines that fit the page width
      const lines = pdf.splitTextToSize(transcriptText, maxWidth);
      pdf.text(lines, margin, 50);

      // Save the PDF
      pdf.save("transcription.pdf");
      toast.success("Downloaded as PDF!");
    } catch (error) {
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Unified Transcription Card */}
      <ScrollRevealSection>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Transcription Complete
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Your audio has been successfully transcribed
                </p>
              </div>

              <div className="flex items-center gap-3">
                {onOpenStudio && (
                  <Button
                    onClick={onOpenStudio}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                      <polyline points="15,9 15,15 9,15"/>
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="16"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
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
            <div className="flex justify-between items-center mb-4">
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
                      <Copy className="w-4 h-4 text-green-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy All</span>
                    </>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isDownloading}
                      className="flex items-center gap-2 border-gray-400 text-gray-700 hover:border-gray-500 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                    >
                      {isDownloading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          <span>Download</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
                  >
                    <DropdownMenuItem onClick={handleDownloadTxt} className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                      Download as TXT
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadMarkdown} className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <path d="M10 12l2 2 4-4"/>
                      </svg>
                      Download as Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadDocx} className="flex items-center gap-2 relative">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <path d="M16 13H8M16 17H8"/>
                        <path d="M12 9h4"/>
                      </svg>
                      <span>Download as DOCX</span>
                      {isArabic && (
                        <span className="ml-auto px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                          BETA
                        </span>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadPdf} className="flex items-center gap-2 relative">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <path d="M8 16h8M8 12h8M8 8h4"/>
                      </svg>
                      <span>Download as PDF</span>
                      {isArabic && (
                        <span className="ml-auto px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                          BETA
                        </span>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Transcript Content */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="max-h-[400px] overflow-y-auto p-4">
                <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-mono">
                  {transcriptText || "No transcript available"}
                </div>
              </div>
            </div>

            {/* Arabic Format Warning */}
            {isArabic && (
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      Arabic Text Format Notice
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      DOCX files may have editing issues, and PDF files might not display Arabic text correctly.
                      For best results with Arabic content, we recommend using TXT or Markdown formats.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollRevealSection>
    </div>
  );
}
