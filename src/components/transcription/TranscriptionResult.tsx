import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { marked } from 'marked';
import { Document as DocxDocument, Paragraph, Packer } from 'docx';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

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

// Update the usePdfGeneration hook to include preview functionality
const usePdfGeneration = () => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null);

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfObjectUrl) {
        URL.revokeObjectURL(pdfObjectUrl);
      }
    };
  }, [pdfObjectUrl]);

  const generateTranscriptionPdf = async (transcription: string, title: string = 'Transcription', forPreview: boolean = false) => {
    // If we already have the PDF blob and are just previewing, don't regenerate
    if (pdfBlob && forPreview) {
      return createPdfPreview(pdfBlob);
    }

    setIsGeneratingPdf(true);
    setPdfError(null);

    try {
      console.log('Generating PDF with Printerz template');

      const printerzData = {
        title: title,
        content: transcription
      };

      // Use the environment variable for template ID with fallback
      const templateId = import.meta.env.VITE_PRINTERZ_TEMPLATE_ID || '9fa3ff8e-c6dc-49b5-93ba-3532638cfe47';

      console.log(`Using template ID: ${templateId}`);
      const blob = await generatePdf(templateId, printerzData);

      // Store the blob for future use
      setPdfBlob(blob);

      if (forPreview) {
        // Create preview URL
        createPdfPreview(blob);
        return blob;
      } else {
        // For download, create download link
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\//g, '-');

        const filename = `Transcription_${dateStr}.pdf`;

        // Use browser's download capability
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Clean up
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);

        return blob;
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      setPdfError(error instanceof Error ? error.message : "Failed to generate PDF");

      // Implement fallback PDF generation here if needed
      try {
        console.log("Falling back to client-side PDF generation");
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        // Add title
        const splitTitle = doc.splitTextToSize(title, 180);
        doc.setFontSize(16);
        doc.text(splitTitle, 15, 20);

        // Add content
        doc.setFontSize(12);
        const textLines = doc.splitTextToSize(transcription, 180);
        doc.text(textLines, 15, 40);

        const pdfBlob = doc.output('blob');
        setPdfBlob(pdfBlob);

        if (forPreview) {
          // Create preview URL
          createPdfPreview(pdfBlob);
          return pdfBlob;
        } else {
          // Download the fallback PDF
          const now = new Date();
          const dateStr = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).replace(/\//g, '-');

          const url = window.URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Transcription_${dateStr}_fallback.pdf`;
          document.body.appendChild(a);
          a.click();

          // Clean up
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 100);

          return pdfBlob;
        }
      } catch (fallbackError) {
        console.error("Fallback PDF generation failed:", fallbackError);
        setPdfError((error instanceof Error ? error.message : "PDF generation failed") +
                    " (Fallback method also failed)");
        throw error;
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Helper function to create a PDF preview from a blob
  const createPdfPreview = (blob: Blob) => {
    // First clean up any existing object URL
    if (pdfObjectUrl) {
      URL.revokeObjectURL(pdfObjectUrl);
    }

    // Create a new object URL for the blob
    const url = URL.createObjectURL(blob);
    setPdfObjectUrl(url);
    return blob;
  };

  return {
    generateTranscriptionPdf,
    isGeneratingPdf,
    pdfError,
    pdfObjectUrl,
    hasPdf: !!pdfBlob
  };
};

// In your TranscriptionResult component:
export function TranscriptionResult({ transcription }: TranscriptionResultProps) {
  // Firebase storage related state
  const [firebasePdfUrl, setFirebasePdfUrl] = useState<string | null>(null);
  const [pdfFirebasePath, setPdfFirebasePath] = useState<string | null>(null);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const initialPdfTitleRef = useRef<string>('');

  // Use the enhanced PDF generation hook
  const {
    generateTranscriptionPdf,
    isGeneratingPdf,
    pdfError,
    pdfObjectUrl,
    hasPdf
  } = usePdfGeneration();

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
      await generateTranscriptionPdf(transcription, pdfTitle, true);
      setPdfGenerated(true);
    } catch (error) {
      console.error("PDF preview generation failed:", error);
    }
  };

  // Handle PDF download
  const handleDownloadPdf = async () => {
    try {
      await generateTranscriptionPdf(transcription, pdfTitle, false);
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

  const generateDocx = async () => {
    setIsGeneratingDocx(true);
    try {
      const paragraphs = transcription
        .split('\n')
        .map(line => new Paragraph({
          text: line.trim() || ' ',
          spacing: {
            after: 200
          }
        }));

      const doc = new DocxDocument({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });

      const blob = await Packer.toBlob(doc);
      setIsGeneratingDocx(false);
      return blob;
    } catch (error) {
      console.error('Error generating DOCX:', error);
      setIsGeneratingDocx(false);
      return null;
    }
  };

  const handleDownload = async (format: 'txt' | 'md' | 'pdf' | 'docx') => {
    if (!transcription) return;

    setIsDownloading(true);

    try {
      const timestamp = new Date().toLocaleDateString().replace(/\//g, '-');
      const filename = `Transcription ${timestamp}`;

      let blob: Blob | null = null;

      if (format === 'txt') {
        blob = new Blob([transcription], { type: 'text/plain' });
      } else if (format === 'md') {
        blob = new Blob([transcription], { type: 'text/markdown' });
      } else if (format === 'pdf') {
        // Use existing PDF if available, otherwise generate new one
        if (hasPdf) {
          // Use the stored PDF blob
          blob = pdfBlob;
        } else {
          // Generate a new PDF
          blob = await generateTranscriptionPdf(transcription, pdfTitle, false);
        }
      } else if (format === 'docx') {
        blob = await generateDocx();
      }

      if (blob) {
        try {
          // Try the standard download approach first
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.${format}`;
          document.body.appendChild(a);
          a.click();

          setTimeout(() => {
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 100);
        } catch (downloadError) {
          console.error("Error with standard download method:", downloadError);
          // Fall back to our alternative download method
          await createDownloadableDataUrl(blob, `${filename}.${format}`);
        }
      }
    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
      toast.error(`Failed to download ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);

    try {
      const zip = new JSZip();

      // Add txt and md directly
      zip.file("transcription.txt", transcription);
      zip.file("transcription.md", transcription);

      // For PDF, use the existing blob or generate new one
      let pdfBlob: Blob;
      if (hasPdf) {
        pdfBlob = pdfBlob!;
      } else {
        // Generate a new PDF
        pdfBlob = await generateTranscriptionPdf(transcription, pdfTitle, false);
      }

      zip.file("transcription.pdf", pdfBlob);

      // Generate DOCX
      const docxBlob = await generateDocx();
      if (docxBlob) {
        zip.file("transcription.docx", docxBlob);
      }

      // Generate the ZIP file
      const content = await zip.generateAsync({ type: "blob" });

      // Save the ZIP file
      saveAs(content, "transcription-files.zip");

      toast.success("All files downloaded successfully");
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="txt" className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger value="txt" className="text-sm py-2 text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100">TXT</TabsTrigger>
          <TabsTrigger value="md" className="text-sm py-2 text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100">MD</TabsTrigger>
          <TabsTrigger value="pdf" className="text-sm py-2 text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100">PDF</TabsTrigger>
          <TabsTrigger value="docx" className="text-sm py-2 text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100">DOCX</TabsTrigger>
        </TabsList>

        <TabsContent value="txt" className="mt-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 h-80 overflow-auto shadow-inner">
            <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200">{transcription}</pre>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => handleDownload('txt')} className="gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download as TXT
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="md" className="mt-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-4 h-80 overflow-auto">
            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={renderMarkdown()} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => handleDownload('md')} className="gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download as MD
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="pdf" className="mt-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-4">
            {/* Title customization field */}
            <div className="mb-4 flex items-end space-x-2">
              <div className="flex-1">
                <Label htmlFor="pdf-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Choose a title for your PDF
                </Label>
                <Input
                  id="pdf-title"
                  type="text"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Transcription with timestamp will be added automatically"
                />
              </div>

              {/* Regenerate button shows when title changes after PDF generation */}
              {hasNameChanged && (
                <Button
                  onClick={regeneratePdf}
                  variant="outline"
                  size="sm"
                  className="mb-0.5"
                  disabled={isGeneratingPdf}
                >
                  Regenerate
                </Button>
              )}
            </div>

            <div className="min-h-80 flex flex-col items-center">
              {isGeneratingPdf ? (
                <div className="flex items-center justify-center h-80">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : pdfObjectUrl ? (
                <div className="w-full h-80 overflow-auto">
                  <iframe
                    src={pdfObjectUrl}
                    className="w-full h-full border-0"
                    title="PDF Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 space-y-4">
                  <p className="text-gray-500">Preview your PDF before downloading</p>
                  <Button
                    onClick={handleGeneratePdfPreview}
                    disabled={isGeneratingPdf}
                    className="gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <path d="M12 18v-6"></path>
                      <path d="M8 18v-1"></path>
                      <path d="M16 18v-3"></path>
                    </svg>
                    Generate PDF Preview
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="gap-2"
            >
              {isGeneratingPdf ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download PDF
                </>
              )}
            </Button>
          </div>

          {pdfError && (
            <div className="text-red-500 text-sm mt-2">
              Error: {pdfError}
            </div>
          )}
        </TabsContent>

        <TabsContent value="docx" className="mt-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-4 h-80 flex flex-col items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <svg width="64" height="64" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                <defs>
                  <linearGradient id="word-gradient" x1="4.494" y1="-1712.086" x2="13.832" y2="-1695.914" gradientTransform="translate(0 1720)" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#2368c4"/>
                    <stop offset=".5" stopColor="#1a5dbe"/>
                    <stop offset="1" stopColor="#1146ac"/>
                  </linearGradient>
                </defs>
                <path d="M28.806 3H9.705a1.19 1.19 0 0 0-1.193 1.191V9.5l11.069 3.25L30 9.5V4.191A1.19 1.19 0 0 0 28.806 3" fill="#41a5ee"/>
                <path d="M30 9.5H8.512V16l11.069 1.95L30 16Z" fill="#2b7cd3"/>
                <path d="M8.512 16v6.5l10.418 1.3L30 22.5V16Z" fill="#185abd"/>
                <path d="M9.705 29h19.1A1.19 1.19 0 0 0 30 27.809V22.5H8.512v5.309A1.19 1.19 0 0 0 9.705 29" fill="#103f91"/>
                <path d="M16.434 8.2H8.512v16.25h7.922a1.2 1.2 0 0 0 1.194-1.191V9.391A1.2 1.2 0 0 0 16.434 8.2" style={{opacity: 0.1, isolation: 'isolate'}}/>
                <path d="M15.783 8.85H8.512V25.1h7.271a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191" style={{opacity: 0.2, isolation: 'isolate'}}/>
                <path d="M15.783 8.85H8.512V23.8h7.271a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191" style={{opacity: 0.2, isolation: 'isolate'}}/>
                <path d="M15.132 8.85h-6.62V23.8h6.62a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191" style={{opacity: 0.2, isolation: 'isolate'}}/>
                <path d="M3.194 8.85h11.938a1.193 1.193 0 0 1 1.194 1.191v11.918a1.193 1.193 0 0 1-1.194 1.191H3.194A1.19 1.19 0 0 1 2 21.959V10.041A1.19 1.19 0 0 1 3.194 8.85" fill="url(#word-gradient)"/>
                <path d="M6.9 17.988q.035.276.046.481h.028q.015-.195.065-.47c.05-.275.062-.338.089-.465l1.255-5.407h1.624l1.3 5.326a8 8 0 0 1 .162 1h.022a8 8 0 0 1 .135-.975l1.039-5.358h1.477l-1.824 7.748h-1.727l-1.237-5.126q-.054-.222-.122-.578t-.084-.52h-.021q-.021.189-.084.561t-.1.552L7.78 19.871H6.024L4.19 12.127h1.5l1.131 5.418a5 5 0 0 1 .079.443" fill="#fff"/>
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                Download your transcription as a DOCX file compatible with Microsoft Word.
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => handleDownload('docx')}
              disabled={isGeneratingDocx}
              className="gap-2"
            >
              {isGeneratingDocx ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating DOCX...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download as DOCX
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 space-x-4">
        <Button
          onClick={handleDownloadAll}
          size="lg"
          className="px-8 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating ZIP...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download All Formats (ZIP)
            </>
          )}
        </Button>
      </div>
    </div>
  );
}