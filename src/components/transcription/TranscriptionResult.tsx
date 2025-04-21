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
};

// Helper function to determine if we're running on Netlify
const isNetlify = typeof window !== 'undefined' &&
                 (window.location.hostname.includes('netlify.app') ||
                  process.env.DEPLOY_ENV === 'netlify');

// Helper function to determine server URL
const determineServerUrl = () => {
  // Check if we're running in development or production
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isLocalDev) {
    // In development, the server is likely running on port 3001
    return 'http://localhost:3001';
  } else {
    // In production, the API endpoints are on the same domain
    return '';
  }
};

// Function to generate PDF using the Printerz API
const generatePdf = async (templateId: string, data: any): Promise<Blob> => {
  try {
    // Determine server URL based on environment
    const serverUrl = determineServerUrl();

    // Create a toast to show progress
    const toastId = toast.loading('Generating PDF...');

    const response = await fetch(`${serverUrl}/api/printerz/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateId,
        printerzData: data
      })
    });

    if (!response.ok) {
      toast.error('PDF generation failed', { id: toastId });
      throw new Error(`PDF generation failed with status: ${response.status}`);
    }

    // Convert response to blob
    const blob = await response.blob();
    toast.success('PDF generated successfully', { id: toastId });
    return blob;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

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

  // --- Primary PDF Generation (Printerz) ---
  const generatePrimaryPdf = async (transcription: string, title: string): Promise<Blob> => {
    setIsGeneratingPdf(true);
    setPdfError(null);
    setPrimaryPdfFailed(false); // Reset failure flag

    try {
      console.log('Generating PDF with Printerz template');
      const printerzData = { title, content: transcription };
      // Updated template ID
      const templateId = import.meta.env.VITE_PRINTERZ_TEMPLATE_ID || 'ed33b161-5082-45d7-9c58-4003f55a2ad4';
      console.log(`Using template ID: ${templateId}`);

      // Use the generatePdf function which calls the API proxy
      const blob = await generatePdf(templateId, printerzData);

      setPdfBlob(blob); // Store the generated blob
      createPdfPreview(blob); // Update preview
      return blob; // Return the blob for the download handler
    } catch (error) {
      console.error("Error generating PDF via Printerz:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate PDF via primary method";
      setPdfError(errorMessage);
      setPrimaryPdfFailed(true); // Set failure flag
      throw new Error(errorMessage); // Re-throw error to be caught by caller
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // --- Fallback PDF Generation (jsPDF) ---
  const generateFallbackPdf = async (transcription: string, title: string): Promise<Blob> => {
    setIsGeneratingPdf(true); // Use the same loading state
    setPdfError(null); // Clear previous error

    try {
      console.log("Generating PDF using client-side fallback (jsPDF)");
      const { jsPDF } = await dynamicImports.getJsPdf(); // Assuming you add jsPDF to dynamicImports
      const doc = new jsPDF();

      const splitTitle = doc.splitTextToSize(title, 180);
      doc.setFontSize(16);
      doc.text(splitTitle, 15, 20);

      doc.setFontSize(12);
      // Handle potential RTL text - jsPDF might need specific handling or fonts
      // Basic split, may not render RTL correctly without more setup
      const textLines = doc.splitTextToSize(transcription, 180);
      doc.text(textLines, 15, 40);

      const blob = doc.output('blob');
      setPdfBlob(blob); // Store the fallback blob
      createPdfPreview(blob); // Update preview
      toast.success("Fallback PDF generated.");
      return blob;
    } catch (fallbackError) {
      console.error("Fallback PDF generation failed:", fallbackError);
      const errorMessage = fallbackError instanceof Error ? fallbackError.message : "Fallback PDF generation failed";
      setPdfError(errorMessage);
      toast.error("Fallback PDF generation failed.");
      throw new Error(errorMessage); // Re-throw
    } finally {
      setIsGeneratingPdf(false);
    }
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

  const [showFallbackConfirm, setShowFallbackConfirm] = useState(false);

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

  // Also update the generateDocx function to use dynamic imports
  const generateDocx = async () => {
    setIsGeneratingDocx(true);
    try {
      // Dynamically import docx when needed
      const docx = await dynamicImports.getDocx();
      const { Document, Paragraph, Packer } = docx;

      const paragraphs = transcription
        .split('\n')
        .map(line => new Paragraph({
          text: line.trim() || ' ',
          spacing: {
            after: 200
          }
        }));

      const doc = new Document({
        sections: [{
          properties: {},
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
    setShowFallbackConfirm(false); // Hide fallback confirmation on new attempt

    let blobToDownload: Blob | null = null;
    let downloadFilename: string = '';

    try {
      const timestamp = new Date().toLocaleDateString().replace(/\//g, '-');
      downloadFilename = `Transcription_${pdfTitle.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.${format}`;

      if (format === 'txt') {
        blobToDownload = new Blob([transcription], { type: 'text/plain' });
      } else if (format === 'md') {
        // Basic markdown - could be enhanced
        const mdContent = `# ${pdfTitle}\n\n${transcription}`;
        blobToDownload = new Blob([mdContent], { type: 'text/markdown' });
      } else if (format === 'pdf') {
        // --- PDF Specific Logic ---
        try {
          // Attempt primary generation (Printerz)
          // Pass false for forPreview, true means generate only if not exists
          blobToDownload = await generatePrimaryPdf(transcription, pdfTitle);
          toast.success("PDF generated successfully!");
        } catch (primaryError) {
          // Primary failed, ask user about fallback
          console.error("Primary PDF generation failed, asking for fallback.", primaryError);
          setShowFallbackConfirm(true);
          // Do not proceed to download yet
          setIsDownloading(false); // Stop loading indicator for now
          return; // Exit handleDownload, wait for user confirmation
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
      } else if (format !== 'pdf') { // Don't show error if PDF failed and we're showing confirm
         toast.error(`Failed to generate ${format.toUpperCase()} file.`);
      }
    } catch (error) {
      // Catch errors from non-PDF generation or download triggering
      console.error(`Error preparing download for ${format}:`, error);
      toast.error(`Failed to download ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Only set downloading to false if not waiting for fallback confirmation
      if (!showFallbackConfirm) {
         setIsDownloading(false);
      }
    }
  };

  // --- Function to handle fallback confirmation ---
  const handleConfirmFallback = async () => {
    setShowFallbackConfirm(false); // Hide confirmation
    setIsDownloading(true); // Show loading state again

    let blobToDownload: Blob | null = null;
    let downloadFilename: string = '';

    try {
      blobToDownload = await generateFallbackPdf(transcription, pdfTitle);

      if (blobToDownload) {
        const timestamp = new Date().toLocaleDateString().replace(/\//g, '-');
        downloadFilename = `Transcription_${pdfTitle.replace(/[^a-z0-9]/gi, '_')}_${timestamp}_fallback.pdf`;

        // Trigger download
        try {
          const url = URL.createObjectURL(blobToDownload);
          const a = document.createElement('a');
          a.href = url;
          a.download = downloadFilename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (downloadError) {
          console.error("Standard download method failed for fallback:", downloadError);
          await createDownloadableDataUrl(blobToDownload, downloadFilename);
        }
      } else {
         toast.error("Fallback PDF generation failed to produce a file.");
      }
    } catch (fallbackError) {
      // Error already handled by toast inside generateFallbackPdf
      console.error("Error during fallback PDF generation/download:", fallbackError);
    } finally {
      setIsDownloading(false);
    }
  };

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

      // Add PDF - Try primary, then fallback if needed (no user consent here, just try)
      let pdfBlobForZip: Blob | null = null;
      try {
        pdfBlobForZip = await generatePrimaryPdf(transcription, pdfTitle);
      } catch (e) {
        console.warn("Primary PDF failed for ZIP, trying fallback...");
        try {
          pdfBlobForZip = await generateFallbackPdf(transcription, pdfTitle);
        } catch (fallbackError) {
          console.error("Fallback PDF also failed for ZIP:", fallbackError);
          toast.error("Failed to generate PDF for ZIP file.");
        }
      }
      if (pdfBlobForZip) {
        zip.file("transcription.pdf", pdfBlobForZip);
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

  // --- Add Confirmation UI ---
  // You can use a modal or a toast with action buttons
  useEffect(() => {
    if (showFallbackConfirm) {
      const toastId = toast.error("Primary PDF generation failed.", {
        description: "Would you like to try a fallback method? (May be less reliable)",
        action: {
          label: "Try Fallback",
          onClick: () => {
            handleConfirmFallback();
            toast.dismiss(toastId);
          },
        },
        cancel: {
          label: "Cancel",
          onClick: () => {
             setShowFallbackConfirm(false);
             toast.dismiss(toastId);
          }
        },
        duration: Infinity // Keep toast until user interacts
      });
      // Cleanup function to dismiss toast if component unmounts
      return () => toast.dismiss(toastId);
    }
  }, [showFallbackConfirm]); // Dependency array ensures this runs only when needed

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
                {isGeneratingPdf ? 'Generating PDF...' : (isDownloading && format === 'pdf' ? 'Downloading...' : 'Download as PDF')}
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