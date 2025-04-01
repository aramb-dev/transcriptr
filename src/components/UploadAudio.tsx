import { useState } from 'react';
import { Button } from './ui/button';
import { useFileInput } from '@/hooks/use-file-input';
import { TranscriptionOptions } from './TranscriptionOptions';

interface UploadAudioProps {
  onUpload: (formData: FormData, options: { language: string; diarize: boolean }) => void;
}

export function UploadAudio({ onUpload }: UploadAudioProps) {
  const [file, setFile] = useState<File | null>(null);
  const [transcriptionOptions, setTranscriptionOptions] = useState<{
    language: string;
    diarize: boolean
  }>({
    language: "None",
    diarize: false
  });

  const {
    fileName,
    error,
    fileInputRef,
    handleFileSelect,
    clearFile,
    fileSize
  } = useFileInput({
    accept: 'audio/*',
    maxSize: 100
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e);
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleOptionsChange = (options: { language: string; diarize: boolean }) => {
    setTranscriptionOptions(options);
  };

  const handleSubmit = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      onUpload(formData, transcriptionOptions);
    }
  };

  const handleReset = () => {
    clearFile();
    setFile(null);
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 flex flex-col items-center">
          <label htmlFor="audio-file" className="sr-only">Upload audio file</label>
          <input
            id="audio-file"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
            aria-label="Upload audio file"
          />

          {!fileName && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-full mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 5v14M18 11l-6-6M6 11l6-6"/>
                </svg>
              </div>
              <Button
                onClick={handleButtonClick}
                size="lg"
                className="px-6 py-2 h-auto text-base rounded-full"
              >
                Select Audio File
              </Button>
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                <p className="mb-1">
                  Upload MP3, WAV, FLAC, or OGG files up to 100MB
                </p>
                <p className="text-xs opacity-80">
                  <strong>Supported formats:</strong> MP3, WAV, FLAC, OGG
                </p>
                <p className="text-xs opacity-80 mt-1">
                  Other formats like M4A need to be converted first.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 text-center">
              <p className="text-sm text-red-500 font-medium">
                {error}
              </p>
              <Button
                onClick={handleButtonClick}
                variant="outline"
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}

          {fileName && !error && (
            <div className="mt-2 text-center space-y-2 w-full">
              <div className="bg-primary/5 rounded-lg p-4 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mb-2">
                  <path d="M17.5 22h.5c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4V7.5L14.5 2H6c-.5 0-1 .2-1.4.6C4.2 3 4 3.5 4 4v3"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="M10 20v-1a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0z"/>
                  <path d="M6 20v-1a2 2 0 1 0-4 0v1a2 2 0 1 0 4 0z"/>
                  <path d="M2 19v-3a6 6 0 0 1 12 0v3"/>
                </svg>
                <p className="font-medium text-base truncate max-w-full">{fileName}</p>
                <p className="text-sm text-gray-500">{formatFileSize(fileSize)}</p>
              </div>

              <Button
                variant="outline"
                onClick={handleReset}
                className="mt-2"
                size="sm"
              >
                Change File
              </Button>
            </div>
          )}
        </div>
      </div>

      {fileName && !error && (
        <>
          <TranscriptionOptions onChange={handleOptionsChange} />

          <Button
            onClick={handleSubmit}
            disabled={!file || !!error}
            className="w-full py-6 h-auto text-base"
            size="sm"
          >
            Upload and Transcribe
          </Button>
        </>
      )}
    </div>
  );
}
