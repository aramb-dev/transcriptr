import { toast } from 'sonner';
import { determineServerUrl } from './firebase-proxy';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generatePdf = async (templateId: string, data: any): Promise<Blob> => {
  // Skip Printerz entirely since it's generating blank documents
  console.log("Using local PDF generation (Printerz disabled)");
  return await generatePdfLocally(data);
};

// Original Printerz API implementation
const generatePdfWithPrinterz = async (templateId: string, data: any): Promise<Blob> => {
  try {
    const serverUrl = determineServerUrl();
    const toastId = toast.loading('Generating PDF with Printerz...');

    console.log(`Sending PDF generation request to ${serverUrl}/api/printerz/render`);
    console.log('PDF data:', { templateId, dataSize: JSON.stringify(data).length });

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

    console.log(`PDF response status: ${response.status}`);
    
    if (!response.ok) {
      // Try to get more details from the error response
      let errorMessage = `PDF generation failed with status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = `PDF generation failed: ${errorData.error || errorData.message || errorMessage}`;
        console.error('PDF generation error details:', errorData);
      } catch (e) {
        // If we can't parse the error as JSON, try text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = `PDF generation failed: ${errorText}`;
          }
        } catch {
          // If both fail, just use the status code message
        }
      }
      
      toast.error(errorMessage, { id: toastId });
      throw new Error(errorMessage);
    }

    // Get the blob and verify it's not empty
    const blob = await response.blob();
    console.log(`PDF blob received, size: ${blob.size} bytes`);
    
    if (blob.size === 0) {
      const errorMsg = 'PDF generation failed: Received empty PDF file';
      toast.error(errorMsg, { id: toastId });
      throw new Error(errorMsg);
    }
    
    toast.success('PDF generated successfully', { id: toastId });
    return blob;
  } catch (error) {
    console.error("Error generating PDF with Printerz:", error);
    throw error;
  }
};

// Client-side PDF generation using jsPDF
const generatePdfLocally = async (data: any): Promise<Blob> => {
  const toastId = toast.loading('Generating PDF...');
  
  try {
    console.log("Generating PDF using text-based approach");
    
    // For multilingual support, we'll use a simpler approach
    // that doesn't rely on complicated font embedding
    
    // 1. Create a HTML template with the content
    const title = data.title || "Transcription";
    const contentText = data.content || "";
    
    // Check for RTL languages
    const containsArabic = /[\u0600-\u06FF]/.test(contentText);
    const containsHebrew = /[\u0590-\u05FF]/.test(contentText);
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
        <div class="content">${contentText}</div>
        <div class="footer">
          Generated with Transcriptr (https://transcriptr.aramb.dev)
        </div>
      </body>
      </html>
    `;
    
    // Convert HTML to Blob
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    toast.success('HTML document generated successfully', { id: toastId });
    toast.info('Please note: For multilingual documents, we\'re providing an HTML file that preserves all characters correctly', { duration: 5000 });
    
    console.log(`HTML document generated, size: ${blob.size} bytes`);
    return blob;
  } catch (error) {
    console.error("Error generating document:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate document";
    toast.error(errorMessage, { id: toastId });
    throw error;
  }
};