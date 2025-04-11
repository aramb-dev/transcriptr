
import { toast } from 'sonner';
import { determineServerUrl } from './firebase-proxy';

export const generatePdf = async (templateId: string, data: any): Promise<Blob> => {
  try {
    const serverUrl = determineServerUrl();
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

    const blob = await response.blob();
    toast.success('PDF generated successfully', { id: toastId });
    return blob;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};