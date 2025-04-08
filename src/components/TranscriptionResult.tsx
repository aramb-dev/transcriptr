import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { marked } from 'marked';
import { Document as DocxDocument, Paragraph, Packer } from 'docx';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface TranscriptionResultProps {
  transcription: string;
}

export function TranscriptionResult({ transcription }: TranscriptionResultProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);

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
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const generatePrinterzPdf = async (preview = true) => {
    try {
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

      if (preview) {
        // Create a URL for preview
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } else {
        // Save the file directly
        saveAs(blob, `${pdfTitle.replace(/[/\\?%*:|"<>]/g, '-')}.pdf`);
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
        blob = await generatePrinterzPdf(false);
        break;
      case 'docx':
        blob = await generateDocx();
        break;
    }

    if (blob && format !== 'pdf') { // Skip for PDF as it's already handled by saveAs in generatePrinterzPdf
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcription.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();

    zip.file("transcription.txt", transcription);
    zip.file("transcription.md", transcription);

    const pdfBlob = await generatePrinterzPdf(false);
    if (pdfBlob) {
      zip.file("transcription.pdf", pdfBlob);
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
            <div className="mb-4">
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
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? 'Generating...' : 'Download as PDF'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="docx" className="mt-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-4 h-80 flex flex-col items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-blue-600">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2h12a2 2 0 0 0-2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M8 13h8"/>
                <path d="M8 17h8"/>
                <path d="M8 9h1"/>
              </svg>
              <h3 className="font-medium text-lg">Microsoft Word Document</h3>
              <p className="text-gray-500 text-sm">
                Your transcription will be formatted as a Microsoft Word document (.docx) which can be edited in Microsoft Word, Google Docs, or other word processors.
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