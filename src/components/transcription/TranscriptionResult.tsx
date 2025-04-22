import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { marked } from 'marked';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../lib/animations';
import { AnimatedList } from '../ui/animated-list';
import { SequentialRevealList } from '../ui/sequential-reveal-list';
import { ScrollRevealSection } from '../ui/scroll-reveal-section';

// Removed the heavy imports:
// import JSZip from 'jszip';
// import { saveAs } from 'file-saver';
// import { Document as DocxDocument, Paragraph, Packer } from 'docx';

// Create a helper function for dynamic imports
const dynamicImports = {
  // Load JSZip only when needed
  getJsZip: () => import('jszip').then(module => module.default),

  // Load FileSaver only when needed
  getFileSaver: () => import('file-saver').then(module => module.saveAs),

  // Load Docx only when needed
  getDocx: () => import('docx').then(module => module),

  // Load jsPDF only when needed
  getJsPdf: () => import('jspdf').then(module => module.jsPDF),
  
  // HTML document generator for multilingual support
  generateHTML: (title: string, content: string) => {
    // Check for RTL languages
    const containsArabic = /[\u0600-\u06FF]/.test(content);
    const containsHebrew = /[\u0590-\u05FF]/.test(content);
    const isRTL = containsArabic || containsHebrew;
    
    // Format current date
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const formattedDate = today.toLocaleDateString('en-US', options);
    
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
            ${isRTL ? 'direction: rtl; text-align: right;' : ''}
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
    return new Blob([htmlContent], { type: 'text/html' });
  }
};

// Helper function to determine if we're running on Netlify
const isNetlify = typeof window !== 'undefined' &&
                 (window.location.hostname.includes('netlify.app') ||
                  process.env.DEPLOY_ENV === 'netlify');

// Import the generatePdf function from the lib
import { generatePdf as generatePdfFromLib } from '../../lib/pdf-generation';

// Helper function for downloading data
const createDownloadableDataUrl = async (blob: Blob, filename: string): Promise<void> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = function() {
      const a = document.createElement('a');
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

// Helper function to get a safe filename
const getSafeFilename = (name: string): string => {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

// Helper function to get formatted date
const getFormattedDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

interface TranscriptionResultProps {
  transcription: string;
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

  // --- HTML Document Generation for better multilingual support ---
  const generatePrimaryPdf = async (transcription: string, title: string): Promise<Blob> => {
    setIsGeneratingPdf(true);
    setPdfError(null);
    setPrimaryPdfFailed(false); // Reset failure flag

    try {
      console.log('Generating HTML document for better multilingual support');
      
      // Generate HTML document using our helper
      const blob = dynamicImports.generateHTML(title, transcription);
      
      setPdfBlob(blob); // Store the generated blob
      
      // Create preview if possible (some browsers can preview HTML)
      try {
        createPdfPreview(blob);
      } catch (previewError) {
        console.warn("Could not create preview for HTML document", previewError);
      }
      
      toast.success("Document generated successfully!");
      return blob; // Return the blob for the download handler
    } catch (error) {
      console.error("Error generating document:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate document";
      setPdfError(errorMessage);
      setPrimaryPdfFailed(true); // Set failure flag
      throw new Error(errorMessage); // Re-throw error to be caught by caller
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Maintain the generateFallbackPdf function for backward compatibility
  // but it now just points to the primary method since that already handles fallbacks
  const generateFallbackPdf = async (transcription: string, title: string): Promise<Blob> => {
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
    pdfBlob // Expose blob directly if needed elsewhere, carefully
  };
};

// In your TranscriptionResult component:
export default function TranscriptionResult({ transcription }: TranscriptionResultProps) {
  // This will now work correctly
  const transcript = React.useMemo(() => {
    try {
      return typeof transcription === 'string' ? JSON.parse(transcription) : null;
    } catch (e) {
      console.warn('Failed to parse transcription data:', e);
      return null;
    }
  }, [transcription]);

  // Firebase storage related state
  const [firebasePdfUrl, setFirebasePdfUrl] = useState<string | null>(null);
  const [pdfFirebasePath, setPdfFirebasePath] = useState<string | null>(null);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const initialPdfTitleRef = useRef<string>('');

  // Use the enhanced PDF generation hook
  const {
    generatePrimaryPdf,
    generateFallbackPdf, // Get the new fallback function
    isGeneratingPdf,
    pdfError,
    pdfObjectUrl,
    hasPdf,
    primaryPdfFailed, // Get the failure status
    pdfBlob // Get the blob for download
  } = usePdfGeneration();

  // No longer need fallback confirmation state

  // Set default title with timestamp
  const getDefaultTitle = () => {
    const now = new Date();
    return `Transcription ${now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })} ${now.toLocaleTimeString('en-US')}`;
  };

  const [pdfTitle, setPdfTitle] = useState(getDefaultTitle());

  // When title changes, mark that the PDF has not been regenerated with this title
  useEffect(() => {
    // When title is set initially or reset
    initialPdfTitleRef.current = pdfTitle;
  }, []);

  // Handle PDF preview generation
  const handleGeneratePdfPreview = async () => {
    try {
      await generatePrimaryPdf(transcription, pdfTitle);
      setPdfGenerated(true);
    } catch (error) {
      console.error("PDF preview generation failed:", error);
    }
  };

  // Handle PDF download
  const handleDownloadPdf = async () => {
    try {
      await generatePrimaryPdf(transcription, pdfTitle);
      setPdfGenerated(true);
    } catch (error) {
      console.error("PDF download failed:", error);
    }
  };

  // Upload PDF to Firebase Storage
  const uploadPdfToFirebase = async (blob: Blob): Promise<{ url: string; path: string }> => {
    try {
      // Generate a unique filename with date and UUID
      const safeTitle = getSafeFilename(pdfTitle);
      const date = getFormattedDate();
      const uuid = uuidv4().substring(0, 8);
      const filename = `${safeTitle}-${date}-${uuid}.pdf`;
      const filePath = `transcriptions/${filename}`;

      console.log('Uploading PDF to Firebase:', filePath);

      // Create a storage reference
      const storageRef = ref(storage, filePath);

      // Upload the blob
      await uploadBytes(storageRef, blob, {
        contentType: 'application/pdf'
      });

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log('PDF uploaded to Firebase:', downloadURL);

      return { url: downloadURL, path: filePath };
    } catch (error) {
      console.error('Error uploading PDF to Firebase:', error);
      throw error;
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
          after: 300
        },
        // Set bidirectional text for RTL languages if needed
        bidirectional: isRTL
      });
      
      // Create paragraph for each line with proper text direction
      const paragraphs = [
        titleParagraph,
        ...transcription.split('\n').map(line => {
          const trimmedLine = line.trim() || ' ';
          return new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine,
                // Add proper font settings for non-Latin scripts
                font: {
                  name: "Arial Unicode MS",
                  // Use a common Unicode font that works with most languages
                },
              })
            ],
            spacing: {
              after: 200
            },
            // Set bidirectional text for RTL languages
            bidirectional: isRTL
          });
        })
      ];

      // Create document with correct text direction properties
      const doc = new Document({
        features: {
          // Enable better RTL language support
          updateFields: true,
        },
        sections: [{
          properties: {
            // Set RTL direction at document level if needed
            bidi: isRTL,
          },
          children: paragraphs
        }]
      });

      const blob = await Packer.toBlob(doc);
      return blob;
    } catch (error) {
      console.error('Error generating DOCX:', error);
      return null;
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  // --- Updated handleDownload Function ---
  const handleDownload = async (format: 'txt' | 'md' | 'pdf' | 'docx') => {
    if (!transcription) return;

    setIsDownloading(true); // Use a general downloading state for the button
    // No longer need to manage fallback confirmation

    let blobToDownload: Blob | null = null;
    let downloadFilename: string = '';

    try {
      const timestamp = new Date().toLocaleDateString().replace(/\//g, '-');
      // For PDF format, we're actually creating an HTML file for better multilingual support
      const fileExtension = format === 'pdf' ? 'html' : format;
      downloadFilename = `Transcription_${pdfTitle.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.${fileExtension}`;

      if (format === 'txt') {
        blobToDownload = new Blob([transcription], { type: 'text/plain' });
      } else if (format === 'md') {
        // Basic markdown - could be enhanced
        const mdContent = `# ${pdfTitle}\n\n${transcription}`;
        blobToDownload = new Blob([mdContent], { type: 'text/markdown' });
      } else if (format === 'pdf') {
        // --- PDF Specific Logic ---
        try {
          // Generate PDF using our enhanced function that handles both Printerz and local generation
          blobToDownload = await generatePrimaryPdf(transcription, pdfTitle);
          toast.success("PDF generated successfully!");
        } catch (error) {
          console.error("PDF generation failed:", error);
          toast.error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setIsDownloading(false);
          return;
        }
        // --- End PDF Specific Logic ---
      } else if (format === 'docx') {
        blobToDownload = await generateDocx(); // Assuming generateDocx returns a blob or null
      }

      // --- Trigger Download (if blob exists) ---
      if (blobToDownload) {
        try {
          const url = URL.createObjectURL(blobToDownload);
          const a = document.createElement('a');
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
      } else if (format !== 'pdf') { // Don't show error if PDF failed already
         toast.error(`Failed to generate ${format.toUpperCase()} file.`);
      }
    } catch (error) {
      // Catch errors from non-PDF generation or download triggering
      console.error(`Error preparing download for ${format}:`, error);
      toast.error(`Failed to download ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        dynamicImports.getFileSaver()
      ]);
      const zip = new JSZip();

      // Add txt and md
      zip.file("transcription.txt", transcription);
      const mdContent = `# ${pdfTitle}\n\n${transcription}`;
      zip.file("transcription.md", mdContent);

      // Add HTML document instead of PDF for better multilingual support
      try {
        // Use our HTML generator directly 
        const htmlBlob = dynamicImports.generateHTML(pdfTitle, transcription);
        zip.file("transcription.html", htmlBlob);
      } catch (error) {
        console.error("HTML document generation failed for ZIP:", error);
        toast.error("Failed to generate HTML document for ZIP file.");
      }

      // Add DOCX
      const docxBlob = await generateDocx();
      if (docxBlob) {
        zip.file("transcription.docx", docxBlob);
      }

      // Generate and save ZIP
      const content = await zip.generateAsync({ type: "blob" });
      const zipFilename = `Transcription_${pdfTitle.replace(/[^a-z0-9]/gi, '_')}.zip`;
      saveAs(content, zipFilename);
      toast.success("All available files zipped and downloaded.");

    } catch (error) {
      console.error('Error creating ZIP file:', error);
      toast.error('Failed to download files: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsDownloading(false);
    }
  };

  const renderMarkdown = () => {
    return { __html: marked(transcription) };
  };

  // Check if the title has changed since PDF generation
  const hasNameChanged = pdfGenerated && pdfTitle !== initialPdfTitleRef.current;

  // Regenerate PDF with new title
  const regeneratePdf = async () => {
    try {
      await handleGeneratePdfPreview();
      initialPdfTitleRef.current = pdfTitle;
    } catch (error) {
      console.error("Error regenerating PDF:", error);
    }
  };

  // In TranscriptionResult.tsx
  const handleGeneratePdf = async () => {
    try {
      const { generatePdf } = await import('../../lib/pdf-generation');
      const pdfBlob = await generatePdf(templateId, printerzData);
      // Handle the PDF...
    } catch (error) {
      // Handle error...
    }
  };

  // Define variants for list items
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const lines = transcription.split('\n');

  // No longer need confirmation UI since our PDF generation automatically falls back

  return (
    <div className="p-6">
      <ScrollRevealSection>
        <h2 className="text-2xl font-semibold mb-4">Transcription Result</h2>
        <div className="flex flex-wrap gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => handleDownloadAll()}
            disabled={isDownloading}
            className="flex items-center gap-2"
          >
            {isDownloading ? 'Downloading...' : 'Download All Formats (.zip)'}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </Button>
        </div>
      </ScrollRevealSection>

      <Tabs defaultValue="text" className="mt-6">
        <ScrollRevealSection delay={0.1}>
          <TabsList>
            <TabsTrigger value="text">Text</TabsTrigger>
            {/* Fix this line with proper null check */}
            {transcript && transcript.segments && (
              <TabsTrigger value="segments">Timestamped</TabsTrigger>
            )}
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
        </ScrollRevealSection>

        <TabsContent value="text" className="mt-4">
          <SequentialRevealList
            items={lines.map((line, idx) => (
              <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                {line}
              </div>
            ))}
            className="space-y-4"
          />
        </TabsContent>

        {/* Make sure to add null checks to all other places where transcript is used */}
        <TabsContent value="segments" className="mt-4">
          {transcript && transcript.segments ? (
            <SequentialRevealList
              items={transcript.segments.map((segment, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {segment.start ? new Date(segment.start * 1000).toISOString().substr(14, 8) : '00:00:00'} -
                      {segment.end ? new Date(segment.end * 1000).toISOString().substr(14, 8) : '00:00:00'}
                    </span>
                  </div>
                  <p className="mt-1">{segment.text}</p>
                </div>
              ))}
              className="space-y-4"
            />
          ) : (
            <p>No timestamped segments available</p>
          )}
        </TabsContent>

        {/* Export tab with download options */}
        <TabsContent value="export" className="mt-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Export Transcription</h3>

            <div className="mb-6">
              <Label htmlFor="pdf-title" className="mb-2 block">PDF Title</Label>
              <div className="flex gap-3">
                <Input
                  id="pdf-title"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  className="flex-1"
                  placeholder="Enter PDF title"
                />
                {hasNameChanged && (
                  <Button
                    onClick={regeneratePdf}
                    size="sm"
                    variant="outline"
                    disabled={isGeneratingPdf}
                  >
                    Update PDF
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => handleDownload('txt')}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 py-6 h-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Download as TXT
              </Button>

              <Button
                variant="outline"
                onClick={() => handleDownload('md')}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 py-6 h-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <path d="M14 2v6h6"></path>
                  <path d="M9 15v-4"></path>
                  <path d="M12 13.5l3-2.5"></path>
                  <path d="M12 11l-3-2.5"></path>
                </svg>
                Download as MD
              </Button>

              <Button
                variant="outline"
                onClick={() => handleDownload('pdf')}
                disabled={isDownloading || isGeneratingPdf}
                className="flex items-center justify-center gap-2 py-6 h-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <path d="M14 2v6h6"></path>
                  <path d="M5 12h14"></path>
                  <path d="M5 16h14"></path>
                  <path d="M9 20h6"></path>
                </svg>
                {isGeneratingPdf ? 'Creating Document...' : (isDownloading ? 'Downloading...' : 'Download as HTML (for multilingual support)')}
              </Button>

              <Button
                variant="outline"
                onClick={() => handleDownload('docx')}
                disabled={isDownloading || isGeneratingDocx}
                className="flex items-center justify-center gap-2 py-6 h-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <path d="M14 2v6h6"></path>
                  <path d="M8 12h8"></path>
                  <path d="M8 16h8"></path>
                </svg>
                {isGeneratingDocx ? 'Generating DOCX...' : 'Download as DOCX'}
              </Button>
            </div>

            {pdfObjectUrl && (
              <div className="mt-6">
                <h4 className="text-md font-medium mb-2">PDF Preview</h4>
                <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden h-96">
                  <iframe
                    src={pdfObjectUrl}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                </div>
              </div>
            )}

            {pdfError && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
                <p className="text-red-700 dark:text-red-300 text-sm">{pdfError}</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}