import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { marked } from 'marked';
import { Document as DocxDocument, Paragraph, Packer } from 'docx';
import { jsPDF } from 'jspdf';
// Add these imports for UTF-8 font support
import 'jspdf-autotable';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

interface TranscriptionResultProps {
  transcription: string;
}

export function TranscriptionResult({ transcription }: TranscriptionResultProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [pdfTitle, setPdfTitle] = useState("Transcription");

  useEffect(() => {
    // Initialize pdfMake with default fonts
    // Correctly assign the virtual file system
    pdfMake.vfs = pdfFonts.vfs;

    setFontsLoaded(true);

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const generatePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      // Check if text contains Arabic
      const containsArabic = /[\u0600-\u06FF]/.test(transcription);

      // Define document definition
      const docDefinition = {
        content: [
          {
            text: transcription,
            fontSize: 12
          }
        ],
        // Set RTL direction for Arabic
        rtl: containsArabic,
        // Use default font since custom font loading is complex
        defaultStyle: {
          font: 'Roboto'
        }
      };

      // Generate PDF
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);

      return new Promise<Blob>((resolve, reject) => {
        pdfDocGenerator.getBlob((blob) => {
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setIsGeneratingPdf(false);
          resolve(blob);
        });
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGeneratingPdf(false);
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
        blob = await generatePdf();
        break;
      case 'docx':
        blob = await generateDocx();
        break;
    }

    if (blob) {
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

    const pdfBlob = await generatePdf();
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

  const handlePrinterzExport = () => {
    const printerzData = {
      title: pdfTitle, // Use the custom title from your state
      content: transcription
    };

    console.log("Sending to Printerz:", printerzData);
    // Integration with Printerz API would go here
    // For example: window.open("https://app.printerz.app/generate?template=your-template-id&data=" + encodeURIComponent(JSON.stringify(printerzData)), "_blank");
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
          <div className="bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-4 min-h-80 flex flex-col items-center">
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
                <Button onClick={generatePdf} disabled={!fontsLoaded}>
                  Generate PDF Preview
                </Button>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => handleDownload('pdf')}
              disabled={isGeneratingPdf || !fontsLoaded}
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

      <div className="flex justify-center pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={handleDownloadAll} size="lg" className="px-8 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download All Formats (ZIP)
        </Button>
        <Button
          onClick={() => handlePrinterzExport()}
          className="gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9"></path>
            <path d="M3 6h18"></path>
            <path d="M12 3v9"></path>
          </svg>
          Generate with Printerz
        </Button>
      </div>
    </div>
  );
}
