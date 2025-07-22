import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { ScrollRevealSection } from "../ui/scroll-reveal-section";

// Define interfaces for better type safety
interface TranscriptSegment {
  start?: number;
  end?: number;
  text: string;
}

// Removed the heavy imports:
// import JSZip from 'jszip';
// import { saveAs } from 'file-saver';
// import { Document as DocxDocument, Paragraph, Packer } from 'docx';

// Create a helper function for dynamic imports
const dynamicImports = {
  // Load JSZip only when needed
  getJsZip: () => import("jszip").then((module) => module.default),

  // Load FileSaver only when needed
  getFileSaver: () => import("file-saver").then((module) => module.saveAs),

  // Load Docx only when needed
  getDocx: () => import("docx").then((module) => module),

  // Load jsPDF only when needed
  getJsPdf: () => import("jspdf").then((module) => module.jsPDF),

  // HTML document generator for multilingual support
  generateHTML: (title: string, content: string) => {
    // Check for RTL languages
    const containsArabic = /[\u0600-\u06FF]/.test(content);
    const containsHebrew = /[\u0590-\u05FF]/.test(content);
    const isRTL = containsArabic || containsHebrew;

    // Format current date
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const formattedDate = today.toLocaleDateString("en-US", options);

    // Create HTML with proper styling and UTF-8 encoding
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, 'Noto Sans', 'Noto Sans Arabic', sans-serif;
            margin: 20px;
            color: #333;
            line-height: 1.5;
          }
          .header {
            border-bottom: 2px solid #0066cc;
            padding-bottom: 10px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #0066cc;
          }
          .date {
            color: #777;
            font-size: 12px;
          }
          .content {
            white-space: pre-wrap;
            ${isRTL ? "direction: rtl; text-align: right;" : ""}
          }
          .footer {
            margin-top: 30px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
            text-align: center;
            font-size: 10px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${title}</div>
          <div class="date">${formattedDate}</div>
        </div>
        <div class="content">${content}</div>
        <div class="footer">
          Generated with Transcriptr (https://transcriptr.aramb.dev)
        </div>
      </body>
      </html>
    `;

    // Convert HTML to Blob
    return new Blob([htmlContent], { type: "text/html" });
  },
};

// Helper function for downloading data
const createDownloadableDataUrl = async (
  blob: Blob,
  filename: string,
): Promise<void> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = function () {
      const a = document.createElement("a");
      a.href = reader.result as string;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        resolve();
      }, 100);
    };
    reader.readAsDataURL(blob);
  });
};

interface TranscriptionResultProps {
  transcription: string;
  onNewTranscription?: () => void;
  onOpenStudio?: () => void;
}

// Update the usePdfGeneration hook
const usePdfGeneration = () => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null);
  const [primaryPdfFailed, setPrimaryPdfFailed] = useState(false); // Track if Printerz failed

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfObjectUrl) {
        URL.revokeObjectURL(pdfObjectUrl);
      }
    };
  }, [pdfObjectUrl]);

  // Helper function to create a PDF preview from a blob
  const createPdfPreview = (blob: Blob) => {
    if (pdfObjectUrl) {
      URL.revokeObjectURL(pdfObjectUrl);
    }
    const url = URL.createObjectURL(blob);
    setPdfObjectUrl(url);
    return blob; // Return blob for chaining if needed
  };

  // --- PDF Generation using our library function ---
  const generatePrimaryPdf = async (
    transcription: string,
    title: string,
  ): Promise<Blob> => {
    setIsGeneratingPdf(true);
    setPdfError(null);
    setPrimaryPdfFailed(false); // Reset failure flag

    try {
      console.log("Generating PDF document using jsPDF");

      // Import the function only when needed
      const { generatePdf } = await import("../../lib/pdf-generation");

      // Generate PDF using our library function
      const blob = await generatePdf("", { title, content: transcription });

      setPdfBlob(blob); // Store the generated blob

      // Create preview if possible
      try {
        createPdfPreview(blob);
      } catch (previewError) {
        console.warn("Could not create preview for PDF document", previewError);
      }

      toast.success("PDF generated successfully!");
      return blob; // Return the blob for the download handler
    } catch (error) {
      console.error("Error generating PDF document:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate PDF";
      setPdfError(errorMessage);
      setPrimaryPdfFailed(true); // Set failure flag
      throw new Error(errorMessage); // Re-throw error to be caught by caller
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Maintain the generateFallbackPdf function for backward compatibility
  // but it now just points to the primary method since that already handles fallbacks
  const generateFallbackPdf = async (
    transcription: string,
    title: string,
  ): Promise<Blob> => {
    return generatePrimaryPdf(transcription, title);
  };

  return {
    generatePrimaryPdf, // Renamed for clarity
    generateFallbackPdf, // Added fallback function
    isGeneratingPdf,
    pdfError,
    pdfObjectUrl,
    hasPdf: !!pdfBlob,
    primaryPdfFailed, // Expose failure status
    pdfBlob, // Expose blob directly if needed elsewhere, carefully
  };
};

// In your TranscriptionResult component:
export default function TranscriptionResult({
  transcription,
  onNewTranscription,
  onOpenStudio,
}: TranscriptionResultProps) {
  // State for copy functionality
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Extract the transcript text
  const transcriptText = React.useMemo(() => {
    try {
      const parsed = typeof transcription === "string" ? JSON.parse(transcription) : transcription;
      return parsed?.text || transcription;
    } catch (e) {
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
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  // Firebase storage related state
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const initialPdfTitleRef = useRef<string>("");

  // Use the enhanced PDF generation hook
  const { generatePrimaryPdf, isGeneratingPdf, pdfError, pdfObjectUrl } =
    usePdfGeneration();

  // No longer need fallback confirmation state

  // Set default title with timestamp
  const getDefaultTitle = () => {
    const now = new Date();
    return `Transcription ${now.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })} ${now.toLocaleTimeString("en-US")}`;
  };

  const [pdfTitle, setPdfTitle] = useState(getDefaultTitle());

  // When title changes, mark that the PDF has not been regenerated with this title
  useEffect(() => {
    // When title is set initially or reset
    initialPdfTitleRef.current = pdfTitle;
  }, [pdfTitle]);

  // Handle PDF preview generation
  const handleGeneratePdfPreview = async () => {
    try {
      await generatePrimaryPdf(transcription, pdfTitle);
      setPdfGenerated(true);
    } catch (error) {
      console.error("PDF preview generation failed:", error);
    }
  };

  // Updated generateDocx function with better language support
  const generateDocx = async () => {
    setIsGeneratingDocx(true);
    try {
      // Dynamically import docx when needed
      const docx = await dynamicImports.getDocx();
      const { Document, Paragraph, Packer, TextRun, HeadingLevel } = docx;

      // Check for RTL languages
      const containsArabic = /[\u0600-\u06FF]/.test(transcription);
      const containsHebrew = /[\u0590-\u05FF]/.test(transcription);
      const isRTL = containsArabic || containsHebrew;

      // Create a title paragraph
      const titleParagraph = new Paragraph({
        text: pdfTitle,
        heading: HeadingLevel.HEADING_1,
        spacing: {
          after: 300,
        },
        // Set bidirectional text for RTL languages if needed
        bidirectional: isRTL,
      });

      // Create paragraph for each line with proper text direction
      const paragraphs = [
        titleParagraph,
        ...transcription.split("\n").map((line) => {
          const trimmedLine = line.trim() || " ";
          return new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine,
                // Add proper font settings for non-Latin scripts
                font: {
                  name: "Arial Unicode MS",
                  // Use a common Unicode font that works with most languages
                },
              }),
            ],
            spacing: {
              after: 200,
            },
            // Set bidirectional text for RTL languages
            bidirectional: isRTL,
          });
        }),
      ];

      // Create document with correct text direction properties
      const doc = new Document({
        features: {
          // Enable better RTL language support
          updateFields: true,
        },
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      return blob;
    } catch (error) {
      console.error("Error generating DOCX:", error);
      return null;
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  // --- Updated handleDownload Function ---
  const handleDownload = async (format: "txt" | "md" | "pdf" | "docx") => {
    if (!transcription) return;

    setIsDownloading(true); // Use a general downloading state for the button
    // No longer need to manage fallback confirmation

    let blobToDownload: Blob | null = null;
    let downloadFilename: string = "";

    try {
      const timestamp = new Date().toLocaleDateString().replace(/\//g, "-");
      // Use the correct file extension for the format
      const fileExtension = format;
      downloadFilename = `Transcription_${pdfTitle.replace(/[^a-z0-9]/gi, "_")}_${timestamp}.${fileExtension}`;

      if (format === "txt") {
        blobToDownload = new Blob([transcription], { type: "text/plain" });
      } else if (format === "md") {
        // Basic markdown - could be enhanced
        const mdContent = `# ${pdfTitle}\n\n${transcription}`;
        blobToDownload = new Blob([mdContent], { type: "text/markdown" });
      } else if (format === "pdf") {
        // --- PDF Specific Logic ---
        try {
          // Generate PDF using our enhanced function that handles both Printerz and local generation
          blobToDownload = await generatePrimaryPdf(transcription, pdfTitle);
          toast.success("PDF generated successfully!");
        } catch (error) {
          console.error("PDF generation failed:", error);
          toast.error(
            `PDF generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
          setIsDownloading(false);
          return;
        }
        // --- End PDF Specific Logic ---
      } else if (format === "docx") {
        blobToDownload = await generateDocx(); // Assuming generateDocx returns a blob or null
      }

      // --- Trigger Download (if blob exists) ---
      if (blobToDownload) {
        try {
          const url = URL.createObjectURL(blobToDownload);
          const a = document.createElement("a");
          a.href = url;
          a.download = downloadFilename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 100); // Cleanup
        } catch (downloadError) {
          console.error("Standard download method failed:", downloadError);
          // Fallback download method (using FileReader)
          await createDownloadableDataUrl(blobToDownload, downloadFilename);
        }
      } else if (format !== "pdf") {
        // Don't show error if PDF failed already
        toast.error(`Failed to generate ${format.toUpperCase()} file.`);
      }
    } catch (error) {
      // Catch errors from non-PDF generation or download triggering
      console.error(`Error preparing download for ${format}:`, error);
      toast.error(
        `Failed to download ${format.toUpperCase()}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // No longer need the confirmation handling since our PDF generation
  // automatically falls back to client-side generation

  // --- Updated handleDownloadAll ---
  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      const [JSZip, saveAs] = await Promise.all([
        dynamicImports.getJsZip(),
        dynamicImports.getFileSaver(),
      ]);
      const zip = new JSZip();

      // Add txt and md
      zip.file("transcription.txt", transcription);
      const mdContent = `# ${pdfTitle}\n\n${transcription}`;
      zip.file("transcription.md", mdContent);

      // Add PDF document
      try {
        // Import the generatePdf function only when needed
        const { generatePdf } = await import("../../lib/pdf-generation");
        const pdfBlob = await generatePdf("", {
          title: pdfTitle,
          content: transcription,
        });
        zip.file("transcription.pdf", pdfBlob);
      } catch (error) {
        console.error("PDF generation failed for ZIP:", error);
        toast.error("Failed to generate PDF for ZIP file.");
      }

      // Add DOCX
      const docxBlob = await generateDocx();
      if (docxBlob) {
        zip.file("transcription.docx", docxBlob);
      }

      // Generate and save ZIP
      const content = await zip.generateAsync({ type: "blob" });
      const zipFilename = `Transcription_${pdfTitle.replace(/[^a-z0-9]/gi, "_")}.zip`;
      saveAs(content, zipFilename);
      toast.success("All available files zipped and downloaded.");
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      toast.error(
        "Failed to download files: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Check if the title has changed since PDF generation
  const hasNameChanged =
    pdfGenerated && pdfTitle !== initialPdfTitleRef.current;

  // Regenerate PDF with new title
  const regeneratePdf = async () => {
    try {
      await handleGeneratePdfPreview();
      initialPdfTitleRef.current = pdfTitle;
    } catch (error) {
      console.error("Error regenerating PDF:", error);
    }
  };

  const lines = transcription.split("\n");

  // No longer need confirmation UI since our PDF generation automatically falls back

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
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
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
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadAll()}
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
                      <span>Download (.txt)</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
                <Button
                  onClick={onOpenStudio}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
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
                  className="flex items-center gap-2"
                >
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
      </ScrollRevealSection>

            {/* Transcript Content */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="max-h-[400px] overflow-y-auto p-4">
                <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-mono">
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
