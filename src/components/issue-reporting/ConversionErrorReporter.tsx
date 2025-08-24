import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { getSystemInfo } from './issue-templates';

interface ConversionErrorReporterProps {
  fileName: string;
  originalFormat: string;
  targetFormat?: string;
  fileSize?: number;
  cloudConvertJobId?: string;
  errorMessage: string;
  errorCode?: string;
  onClose?: () => void;
}

export function ConversionErrorReporter({
  fileName,
  originalFormat,
  targetFormat = 'mp3',
  fileSize,
  cloudConvertJobId,
  errorMessage,
  errorCode,
  onClose,
}: ConversionErrorReporterProps) {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const systemInfo = getSystemInfo();
      
      // Submit to Netlify Forms (works without GitHub account)
      const formData = new FormData();
      formData.append('form-name', 'conversion-error-report');
      formData.append('title', `Conversion Error: ${originalFormat.toUpperCase()} → ${targetFormat.toUpperCase()}`);
      formData.append('description', additionalDetails || 'User reported conversion error without additional details.');
      formData.append('file-name', fileName);
      formData.append('original-format', originalFormat);
      formData.append('target-format', targetFormat);
      formData.append('file-size', fileSize?.toString() || '');
      formData.append('cloud-convert-job-id', cloudConvertJobId || '');
      formData.append('error-message', errorMessage);
      formData.append('error-code', errorCode || '');
      formData.append('user-name', userName);
      formData.append('user-email', userEmail);
      formData.append('additional-details', additionalDetails);
      formData.append('timestamp', systemInfo.timestamp.toISOString());
      formData.append('user-agent', systemInfo.userAgent);
      formData.append('url', systemInfo.url);

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString()
      });

      if (response.ok) {
        setSubmitStatus('success');
      } else {
        throw new Error('Failed to submit conversion error report');
      }
    } catch (error) {
      console.error('Error submitting conversion error report:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (submitStatus === 'success') {
    return (
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="flex items-start rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/30">
          <CheckCircle2 className="mt-0.5 mr-3 h-5 w-5 text-green-500 dark:text-green-400" />
          <div>
            <p className="font-medium text-green-700 dark:text-green-300">
              Issue Report Created!
            </p>
            <p className="mt-1 text-sm text-green-600 dark:text-green-400">
              Your conversion error report has been submitted successfully. The development team will investigate this issue.
            </p>
          </div>
        </div>
        {onClose && (
          <Button onClick={onClose} className="mt-4 w-full">
            Close
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <div className="mb-4 flex items-center">
        <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Report Conversion Error
        </h2>
      </div>

      {/* Error Summary */}
      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/30">
        <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Error Details</h3>
        <div className="space-y-1 text-sm text-red-700 dark:text-red-300">
          <p><strong>File:</strong> {fileName}</p>
          <p><strong>Conversion:</strong> {originalFormat.toUpperCase()} → {targetFormat.toUpperCase()}</p>
          <p><strong>Size:</strong> {formatFileSize(fileSize)}</p>
          {cloudConvertJobId && <p><strong>Job ID:</strong> {cloudConvertJobId}</p>}
          {errorCode && <p><strong>Error Code:</strong> {errorCode}</p>}
          <p><strong>Error:</strong> {errorMessage}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="user-name" className="mb-1 block text-sm font-medium">
            Name <span className="text-gray-500 font-normal">(optional)</span>
          </Label>
          <Input
            id="user-name"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your name"
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="user-email" className="mb-1 block text-sm font-medium">
            Email <span className="text-gray-500 font-normal">(optional)</span>
          </Label>
          <Input
            id="user-email"
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            We'll only use this to follow up on your report if needed.
          </p>
        </div>

        <div>
          <Label htmlFor="additional-details" className="mb-1 block text-sm font-medium">
            Additional Details <span className="text-gray-500 font-normal">(optional)</span>
          </Label>
          <Textarea
            id="additional-details"
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            placeholder="Any additional information about what you were trying to do, when the error occurred, or other relevant details..."
            className="min-h-[80px] w-full"
          />
        </div>

        {submitStatus === 'error' && (
          <div className="flex items-start rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/30">
            <AlertCircle className="mt-0.5 mr-3 h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-300">
                Failed to create issue report
              </p>
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Please try again or contact support directly.
              </p>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={onClose ? "flex-1" : "w-full"}
          >
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Report Issue
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Your error report will be submitted directly to the development team.
        </p>
      </div>
    </div>
  );
}