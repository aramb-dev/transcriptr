import { useState, useRef, useCallback } from 'react';

interface UseFileInputOptions {
  maxSize?: number; // in MB
  allowedMimeTypes?: string[];
}

export function useFileInput({
  maxSize = 100, // Default to 100MB
  allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg']
}: UseFileInputOptions = {}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract the validation logic to a separate function
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!allowedMimeTypes.includes(file.type)) {
      return 'Unsupported file format. Please upload MP3, WAV, FLAC, or OGG files.';
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds the ${maxSize}MB limit.`;
    }

    return null; // No error
  }, [allowedMimeTypes, maxSize]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    // Reset states
    setFileName(null);
    setFileSize(0);
    setError(null);

    if (!file) return;

    // Validate the file
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    // If file is valid, set the file name and size
    setFileName(file.name);
    setFileSize(file.size);
  }, [validateFile]);

  const clearFile = useCallback(() => {
    setFileName(null);
    setFileSize(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return {
    fileName,
    fileSize,
    error,
    fileInputRef,
    handleFileSelect,
    clearFile,
    validateFile // Export the validation function
  };
}