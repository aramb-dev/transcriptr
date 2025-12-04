import { useState, useRef, useCallback } from "react";
import { validateFileFormat } from "@/lib/file-format-utils";

interface UseFileInputOptions {
  maxSize?: number; // in MB
  allowConversion?: boolean; // Whether to allow files that require conversion
}

export function useFileInput({
  maxSize = 100, // Default to 100MB
  allowConversion = true, // Allow files that require conversion by default
}: UseFileInputOptions = {}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [requiresConversion, setRequiresConversion] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract the validation logic to a separate function
  const validateFile = useCallback(
    (file: File): { error: string | null; requiresConversion: boolean } => {
      // Check file size first
      if (file.size > maxSize * 1024 * 1024) {
        return {
          error: `File size exceeds the ${maxSize}MB limit.`,
          requiresConversion: false,
        };
      }

      // Check file format support
      const formatValidation = validateFileFormat(file);

      if (!formatValidation.valid) {
        return {
          error: formatValidation.error || "Unsupported file format",
          requiresConversion: false,
        };
      }

      // If conversion is required but not allowed
      if (formatValidation.requiresConversion && !allowConversion) {
        return {
          error:
            "This file format requires conversion, but conversion is not enabled.",
          requiresConversion: false,
        };
      }

      return {
        error: null,
        requiresConversion: formatValidation.requiresConversion || false,
      };
    },
    [maxSize, allowConversion],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      // Reset states
      setFileName(null);
      setFileSize(0);
      setError(null);
      setRequiresConversion(false);

      if (!file) return;

      // Validate the file
      const validation = validateFile(file);

      if (validation.error) {
        setError(validation.error);
        return;
      }

      // If file is valid, set the file name and size
      setFileName(file.name);
      setFileSize(file.size);
      setRequiresConversion(validation.requiresConversion);
    },
    [validateFile],
  );

  const clearFile = useCallback(() => {
    setFileName(null);
    setFileSize(0);
    setError(null);
    setRequiresConversion(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return {
    fileName,
    fileSize,
    error,
    requiresConversion,
    fileInputRef,
    handleFileSelect,
    clearFile,
    validateFile,
  };
}
