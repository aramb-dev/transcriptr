import { toast } from "sonner";
import { determineServerUrl } from "./firebase-proxy";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const generatePdf = async (
  templateId: string,
  data: any,
): Promise<Blob> => {
  // Use true PDF generation with jsPDF
  console.log("Using local PDF generation");
  return await generatePdfLocally(data);
};

// Original Printerz API implementation
const generatePdfWithPrinterz = async (
  templateId: string,
  data: any,
): Promise<Blob> => {
  try {
    const serverUrl = determineServerUrl();
    const toastId = toast.loading("Generating PDF with Printerz...");

    console.log(
      `Sending PDF generation request to ${serverUrl}/api/printerz/render`,
    );
    console.log("PDF data:", {
      templateId,
      dataSize: JSON.stringify(data).length,
    });

    const response = await fetch(`${serverUrl}/api/printerz/render`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateId,
        printerzData: data,
      }),
    });

    console.log(`PDF response status: ${response.status}`);

    if (!response.ok) {
      // Try to get more details from the error response
      let errorMessage = `PDF generation failed with status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = `PDF generation failed: ${errorData.error || errorData.message || errorMessage}`;
        console.error("PDF generation error details:", errorData);
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
      const errorMsg = "PDF generation failed: Received empty PDF file";
      toast.error(errorMsg, { id: toastId });
      throw new Error(errorMsg);
    }

    toast.success("PDF generated successfully", { id: toastId });
    return blob;
  } catch (error) {
    console.error("Error generating PDF with Printerz:", error);
    throw error;
  }
};

// Helper to add header and date
const addHeaderAndDate = (
  doc: jsPDF,
  title: string,
  formattedDate: string,
  margin: number,
  pageWidth: number,
) => {
  doc.setFontSize(24);
  doc.setTextColor(0, 102, 204); // #0066cc
  doc.text(title, margin, margin + 10);

  doc.setFontSize(10);
  doc.setTextColor(119, 119, 119); // #777777
  const dateWidth = doc.getTextWidth(formattedDate);
  doc.text(formattedDate, pageWidth - margin - dateWidth, margin + 10);

  doc.setDrawColor(0, 102, 204); // #0066cc
  doc.setLineWidth(1);
  doc.line(margin, margin + 20, pageWidth - margin, margin + 20);
};

// Helper to add footer
const addFooter = (
  doc: jsPDF,
  pageHeight: number,
  margin: number,
  pageWidth: number,
  footerText: string,
) => {
  doc.setFontSize(8);
  doc.setTextColor(119, 119, 119); // #777777

  doc.setDrawColor(221, 221, 221); // #dddddd
  doc.setLineWidth(0.5);
  doc.line(
    margin,
    pageHeight - margin - 20,
    pageWidth - margin,
    pageHeight - margin - 20,
  );

  const footerWidth = doc.getTextWidth(footerText);
  const footerX = (pageWidth - footerWidth) / 2;

  doc.text(footerText, footerX, pageHeight - margin - 5);
};

// Helper to render content with page breaks
const renderContent = (
  doc: jsPDF,
  contentText: string,
  isRTL: boolean,
  margin: number,
  usableWidth: number,
  pageHeight: number,
  lineHeight: number,
) => {
  let verticalPosition = margin + 40;
  let currentPage = 1;

  const lines = doc.splitTextToSize(contentText, usableWidth);

  for (let i = 0; i < lines.length; i++) {
    if (verticalPosition > pageHeight - margin) {
      doc.addPage();
      currentPage++;
      verticalPosition = margin + 40;
    }

    let xPosition = margin;
    if (isRTL) {
      const lineWidth = doc.getTextWidth(lines[i]);
      xPosition = doc.internal.pageSize.getWidth() - margin - lineWidth;
    }

    doc.text(lines[i], xPosition, verticalPosition);
    verticalPosition += lineHeight;
  }
  return currentPage; // Return the total number of pages
};

// Client-side PDF generation using jsPDF with proper font handling
const generatePdfLocally = async (data: any): Promise<Blob> => {
  const toastId = toast.loading("Generating PDF...");

  try {
    console.log("Generating PDF using jsPDF");

    const title = data.title || "Transcription";
    const contentText = data.content || "";

    // Check for RTL languages
    const containsArabic = /[\u0600-\u06FF]/.test(contentText);
    const containsHebrew = /[\u0590-\u05FF]/.test(contentText);
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

    // Create a PDF document with jsPDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
      putOnlyUsedFonts: true,
      compress: true,
    });

    // Define page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const usableWidth = pageWidth - 2 * margin;

    // Add initial header and date
    addHeaderAndDate(doc, title, formattedDate, margin, pageWidth);

    // Add content (with proper line breaks and page handling)
    doc.setTextColor(51, 51, 51); // #333333
    doc.setFontSize(12);
    const lineHeight = 14;

    const totalPages = renderContent(
      doc,
      contentText,
      isRTL,
      margin,
      usableWidth,
      pageHeight,
      lineHeight,
    );

    // Add footer to each page
    const footerText =
      "Generated with Transcriptr (https://transcriptr.aramb.dev)";
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(doc, pageHeight, margin, pageWidth, footerText);
    }

    // Convert jsPDF document to blob
    const pdfBlob = doc.output("blob");

    toast.success("PDF generated successfully", { id: toastId });
    console.log(`PDF document generated, size: ${pdfBlob.size} bytes`);

    return pdfBlob;
  } catch (error) {
    console.error("Error generating PDF document:", error);

    // Fallback to HTML if PDF generation fails
    try {
      console.log("Falling back to HTML document generation");

      const title = data.title || "Transcription";
      const contentText = data.content || "";

      // Check for RTL languages
      const containsArabic = /[\u0600-\u06FF]/.test(contentText);
      const containsHebrew = /[\u0590-\u05FF]/.test(contentText);
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
          <div class="content">${contentText}</div>
          <div class="footer">
            Generated with Transcriptr (https://transcriptr.aramb.dev)
          </div>
        </body>
        </html>
      `;

      // Convert HTML to Blob
      const blob = new Blob([htmlContent], { type: "text/html" });

      toast.warning("PDF generation failed, providing HTML document instead", {
        id: toastId,
      });
      toast.info(
        "HTML document preserves all characters correctly for multilingual support",
        { duration: 5000 },
      );

      console.log(`Fallback HTML document generated, size: ${blob.size} bytes`);
      return blob;
    } catch (fallbackError) {
      console.error("Fallback HTML generation also failed:", fallbackError);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate document";
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  }
};
