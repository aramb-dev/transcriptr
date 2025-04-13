import React from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileCheck2, XCircle } from 'lucide-react';

interface FileUploadInputProps {
  fileName: string | null;
  fileSize: number;
  fileError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onButtonClick: () => void;
  onReset: () => void;
}

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export function FileUploadInput({
  fileName,
  fileSize,
  fileError,
  fileInputRef,
  onFileChange,
  onButtonClick,
  onReset
}: FileUploadInputProps) {
  return (
    <div className="mt-6 flex flex-col items-center gap-4">
      <div className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 flex flex-col items-center">
        <label htmlFor="audio-file" className="sr-only">Upload audio file</label>
        <input
          id="audio-file"
          type="file"
          accept="audio/mpeg,audio/wav,audio/flac,audio/ogg,.mp3,.wav,.flac,.ogg"
          onChange={onFileChange}
          ref={fileInputRef}
          className="hidden"
          aria-label="Upload audio file"
        />

        {!fileName && !fileError && (
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-full mb-2">
              <UploadCloud className="text-primary h-7 w-7" />
            </div>
            <Button
              type="button"
              onClick={onButtonClick}
              size="lg"
              className="px-6 py-2 h-auto text-base rounded-full"
            >
              Select Audio File
            </Button>
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
              <p className="mb-1">
                Upload MP3, WAV, FLAC, or OGG files up to 100MB
              </p>
              <p className="text-xs opacity-80 mt-1">
                Other formats like M4A need to be converted first.
              </p>
            </div>
          </div>
        )}

        {fileError && (
          <div className="mt-4 text-center text-red-600 dark:text-red-400 flex flex-col items-center gap-2">
            <XCircle className="h-10 w-10" />
            <p className="text-sm font-medium">
              {fileError}
            </p>
            <Button
              type="button"
              onClick={onButtonClick} // Allow trying again
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {fileName && !fileError && (
          <div className="mt-2 text-center space-y-2 w-full">
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 flex flex-col items-center border border-green-200 dark:border-green-700">
              <FileCheck2 className="text-green-600 dark:text-green-400 mb-2 h-8 w-8" />
              <p className="font-medium text-base truncate max-w-full">{fileName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(fileSize)}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="mt-2"
              size="sm"
            >
              Change File
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
