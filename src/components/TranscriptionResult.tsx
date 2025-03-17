import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { marked } from 'marked';
import { Document as DocxDocument, Paragraph, Packer } from 'docx';
import { jsPDF } from 'jspdf';

interface TranscriptionResultProps {
  transcription: string;
}

export function TranscriptionResult({ transcription }: TranscriptionResultProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Generate PDF from transcription text
  const generatePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();

      // Split text to fit page width (180mm is a good width for A4)
      const splitText = doc.splitTextToSize(transcription, 180);

      // Add text to document
      doc.setFontSize(12);
      doc.text(splitText, 15, 20);

      // Create blob URL for preview
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      setIsGeneratingPdf(false);
      return pdfBlob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGeneratingPdf(false);
      return null;
    }
  };

  // Generate DOCX from transcription text
  const generateDocx = async () => {
    setIsGeneratingDocx(true);
    try {
      // Create paragraphs from transcription lines
      const paragraphs = transcription
        .split('\n')
        .map(line => new Paragraph({
          text: line.trim() || ' ', // Ensure empty lines have at least a space
          spacing: {
            after: 200
          }
        }));

      // Create document
      const doc = new DocxDocument({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });

      // Generate blob
      const blob = await Packer.toBlob(doc);
      setIsGeneratingDocx(false);
      return blob;
    } catch (error) {
      console.error('Error generating DOCX:', error);
      setIsGeneratingDocx(false);
      return null;
    }
  };

  // Handle individual format downloads
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

  // Handle downloading all formats as a zip file
  const handleDownloadAll = async () => {
    const zip = new JSZip();

    // Add text file
    zip.file("transcription.txt", transcription);

    // Add markdown file
    zip.file("transcription.md", transcription);

    // Add PDF file
    const pdfBlob = await generatePdf();
    if (pdfBlob) {
      zip.file("transcription.pdf", pdfBlob);
    }

    // Add DOCX file
    const docxBlob = await generateDocx();
    if (docxBlob) {
      zip.file("transcription.docx", docxBlob);
    }

    // Generate and download zip
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "transcription-files.zip");
  };

  // Render HTML from markdown
  const renderMarkdown = () => {
    return { __html: marked(transcription) };
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="txt" className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger value="txt" className="text-sm py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">TXT</TabsTrigger>
          <TabsTrigger value="md" className="text-sm py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">MD</TabsTrigger>
          <TabsTrigger value="pdf" className="text-sm py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">PDF</TabsTrigger>
          <TabsTrigger value="docx" className="text-sm py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">DOCX</TabsTrigger>
        </TabsList>

        {/* TXT Tab Content */}
        <TabsContent value="txt" className="mt-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 h-80 overflow-auto shadow-inner">
            <pre className="text-sm font-mono whitespace-pre-wrap">{transcription}</pre>
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

        {/* MD Tab Content */}
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

        {/* PDF Tab Content */}
        <TabsContent value="pdf" className="mt-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-4 min-h-80 flex flex-col items-center">
            {isGeneratingPdf ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : pdfUrl ? (
              <div className="w-full h-80 overflow-auto">
                {/* Replace react-pdf with iframe for improved compatibility */}
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title="PDF Preview"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 space-y-4">
                <p className="text-gray-500">Preview your PDF before downloading</p>
                <Button onClick={generatePdf}>
                  Generate PDF Preview
                </Button>
              </div>
            )}
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

        {/* DOCX Tab Content */}
        <TabsContent value="docx" className="mt-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-4 h-80 flex flex-col items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-blue-600">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
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
      </div>
    </div>
  );
}
