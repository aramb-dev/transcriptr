import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { marked } from 'marked';
import { Document as DocxDocument, Paragraph, Packer } from 'docx';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface TranscriptionResultProps {
  transcription: string;
}

export function TranscriptionResult({ transcription }: TranscriptionResultProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [firebasePdfUrl, setFirebasePdfUrl] = useState<string | null>(null);
  const [pdfFirebasePath, setPdfFirebasePath] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const initialPdfTitleRef = useRef<string>('');

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

  useEffect(() => {
    // When title is set initially or reset
    initialPdfTitleRef.current = pdfTitle;

    return () => {
      if (pdfUrl && !pdfUrl.startsWith('https://firebasestorage')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfTitle, pdfUrl]);

  // Format date for the filename
  const getFormattedDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  // Generate a safe filename from title
  const getSafeFilename = (title: string) => {
    return title.replace(/[/\\?%*:|"<>]/g, '-').substring(0, 100);
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

  const generatePrinterzPdf = async (preview = true) => {
    try {
      // If PDF has already been generated and the title hasn't changed
      if (pdfGenerated && firebasePdfUrl && pdfTitle === initialPdfTitleRef.current && !preview) {
        console.log('Using already generated PDF URL:', firebasePdfUrl);

        // Instead of directly using saveAs with the URL, fetch the blob first
        try {
          const response = await fetch(firebasePdfUrl);
          if (response.ok) {
            const blob = await response.blob();
            saveAs(blob, `${getSafeFilename(pdfTitle)}.pdf`);
            return blob;
          } else {
            throw new Error('Failed to fetch PDF from Firebase');
          }
        } catch (error) {
          console.error('Error downloading PDF from Firebase:', error);
          // Continue with regeneration as fallback
        }
      }

      setIsGeneratingPdf(true);

      // Get current date and time in a readable format
      const now = new Date();
      const formattedDate = now.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      // Prepare data for Printerz
      const printerzData = {
        variables: {
          title: pdfTitle,
          content: transcription,
          timestamp: formattedDate
        },
        options: {
          printBackground: true
        }
      };

      const templateId = '9fa3ff8e-c6dc-49b5-93ba-3532638cfe47';

      // Use our proxy server instead of calling Printerz directly
      const isNetlify = typeof window !== 'undefined' &&
                        (window.location.hostname.includes('netlify.app') ||
                         process.env.DEPLOY_ENV === 'netlify');

      const apiUrl = isNetlify
        ? '/.netlify/functions/printerz-proxy'
        : '/api/printerz/render';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId,
          printerzData
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status} ${response.statusText}`);
      }

      // Get PDF as blob
      const pdfBuffer = await response.arrayBuffer();
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });

      // Upload to Firebase and get the URL
      const { url: fbUrl, path: fbPath } = await uploadPdfToFirebase(blob);
      setFirebasePdfUrl(fbUrl);
      setPdfFirebasePath(fbPath);

      // Store the current title as the initial title
      initialPdfTitleRef.current = pdfTitle;

      // If preview, set the URL for the iframe
      if (preview) {
        setPdfUrl(fbUrl);
        setPdfGenerated(true);
      } else {
        // For direct download - Fetch the blob from Firebase URL instead of using URL directly
        try {
          const response = await fetch(fbUrl);
          if (response.ok) {
            const downloadBlob = await response.blob();
            saveAs(downloadBlob, `${getSafeFilename(pdfTitle)}.pdf`);
          } else {
            // If Firebase fetch fails, use the blob we already have
            saveAs(blob, `${getSafeFilename(pdfTitle)}.pdf`);
          }
        } catch (error) {
          console.error('Error fetching for download:', error);
          // Fallback to direct blob
          saveAs(blob, `${getSafeFilename(pdfTitle)}.pdf`);
        }
      }

      setIsGeneratingPdf(false);
      return blob;
    } catch (error) {
      console.error('Error generating PDF with Printerz:', error);
      setIsGeneratingPdf(false);
      alert('Error generating PDF. Please try again later.');
      return null;
    }
  };

  const regeneratePdf = async () => {
    // If there was a previously generated PDF, delete it
    if (pdfFirebasePath) {
      try {
        const oldFileRef = ref(storage, pdfFirebasePath);
        await deleteObject(oldFileRef).catch(err => {
          console.warn('Failed to delete old PDF, might already be deleted:', err);
        });
      } catch (error) {
        console.warn('Error handling old PDF deletion:', error);
      }
    }

    // Reset PDF state
    setPdfUrl(null);
    setFirebasePdfUrl(null);
    setPdfFirebasePath(null);
    setPdfGenerated(false);

    // Generate new PDF
    await generatePrinterzPdf(true);
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
    let blob: Blob | null = null;

    switch (format) {
      case 'txt':
        blob = new Blob([transcription], { type: 'text/plain' });
        break;
      case 'md':
        blob = new Blob([transcription], { type: 'text/markdown' });
        break;
      case 'pdf':
        // If we already have a generated PDF with the same title, download it directly
        if (firebasePdfUrl && pdfGenerated && pdfTitle === initialPdfTitleRef.current) {
          try {
            console.log('Downloading existing PDF from Firebase:', firebasePdfUrl);
            const response = await fetch(firebasePdfUrl);
            if (response.ok) {
              const pdfBlob = await response.blob();
              saveAs(pdfBlob, `${getSafeFilename(pdfTitle)}.pdf`);
            } else {
              throw new Error('Failed to fetch PDF from Firebase');
            }
          } catch (error) {
            console.error('Error fetching PDF from Firebase:', error);
            // Only regenerate if fetching fails
            await generatePrinterzPdf(false);
          }
        } else if (pdfUrl) {
          // If PDF is displayed in preview but not yet downloaded, use that
          try {
            console.log('Using displayed PDF for download');
            const response = await fetch(pdfUrl);
            if (response.ok) {
              const pdfBlob = await response.blob();
              saveAs(pdfBlob, `${getSafeFilename(pdfTitle)}.pdf`);
            } else {
              throw new Error('Failed to fetch displayed PDF');
            }
          } catch (error) {
            console.error('Error fetching displayed PDF:', error);
            // Generate if fetch fails
            await generatePrinterzPdf(false);
          }
        } else {
          // If no PDF exists yet, generate a new one
          console.log('Generating new PDF for download');
          await generatePrinterzPdf(false);
        }
        return; // Skip the rest since saveAs is called in all branches
      case 'docx':
        blob = await generateDocx();
        break;
    }

    if (blob) {
      // Use saveAs for all formats to ensure consistent download behavior
      saveAs(blob, `${format === 'docx' ? getSafeFilename(pdfTitle) : 'transcription'}.${format}`);
    }
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();

    zip.file("transcription.txt", transcription);
    zip.file("transcription.md", transcription);

    // For PDF, use the Firebase URL if already generated
    if (firebasePdfUrl && pdfGenerated && pdfTitle === initialPdfTitleRef.current) {
      // Download the PDF from Firebase URL and add to ZIP
      try {
        const response = await fetch(firebasePdfUrl);
        const pdfBlob = await response.blob();
        zip.file("transcription.pdf", pdfBlob);
      } catch (error) {
        console.error('Error fetching PDF from Firebase for ZIP:', error);
        // Try generating a new PDF as fallback
        const pdfBlob = await generatePrinterzPdf(false);
        if (pdfBlob) {
          zip.file("transcription.pdf", pdfBlob);
        }
      }
    } else {
      // Generate a new PDF
      const pdfBlob = await generatePrinterzPdf(false);
      if (pdfBlob) {
        zip.file("transcription.pdf", pdfBlob);
      }
    }

    const docxBlob = await generateDocx();
    if (docxBlob) {
      zip.file("transcription.docx", docxBlob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "transcription-files.zip");
  };

  const renderMarkdown = () => {
    return { __html: marked(transcription) };
  };

  // Check if the title has changed since PDF generation
  const hasNameChanged = pdfGenerated && pdfTitle !== initialPdfTitleRef.current;

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
            <Button onClick={() => handleDownload('md')}>
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
              ) : pdfUrl ? (
                <div className="w-full h-80 overflow-auto">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full border-0"
                    title="PDF Preview"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 space-y-4">
                  <p className="text-gray-500">Preview your PDF before downloading</p>
                  <Button onClick={() => generatePrinterzPdf(true)} disabled={isGeneratingPdf}>
                    Generate PDF Preview
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => handleDownload('pdf')}
              disabled={isGeneratingPdf || (!pdfGenerated && !pdfUrl)}
            >
              {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
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
            >
              {isGeneratingDocx ? 'Generating...' : 'Download as DOCX'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 space-x-4">
        <Button onClick={handleDownloadAll} size="lg" className="px-8 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download All Formats (ZIP)
        </Button>
      </div>
    </div>
  );
}