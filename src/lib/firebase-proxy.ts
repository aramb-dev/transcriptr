import { toast } from 'sonner';

/**
 * Utility functions for Firebase Storage and PDF generation
 */

/**
 * Proxy a Firebase Storage URL through our server to avoid CORS issues
 */
export async function proxyFirebaseDownload(url: string): Promise<Blob> {
  try {
    // Determine server URL based on environment
    const serverUrl = determineServerUrl();

    const response = await fetch(`${serverUrl}/api/firebase-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error(`Proxy failed with status: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error("Error proxying Firebase download:", error);
    throw error;
  }
}

/**
 * Generate PDF using Printerz service
 */
export async function generatePdf(templateId: string, data: any): Promise<Blob> {
  try {
    // Determine server URL based on environment
    const serverUrl = determineServerUrl();

    console.log(`Generating PDF with template ${templateId} via ${serverUrl}/api/printerz/render`);

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
      toast.error("Failed to generate PDF");
      throw new Error(`PDF generation failed with status: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

/**
 * Helper function to determine the correct server URL based on environment
 */
export function determineServerUrl(): string {
  // Check if we're running in development or production
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isLocalDev) {
    // In development, the server is likely running on port 3001
    return 'http://localhost:3001';
  } else {
    // In production, the API endpoints are on the same domain
    return '';
  }
}

/**
 * Create a downloadable data URL from a blob
 */
export async function createDownloadableDataUrl(blob: Blob, filename: string): Promise<void> {
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
}