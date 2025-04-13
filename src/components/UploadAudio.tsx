import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input'; // Import Input
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'; // Import Tabs
import { useFileInput } from '@/hooks/use-file-input';
import { TranscriptionOptions } from './transcription/TranscriptionOptions';
import { UploadCloud, Link as LinkIcon, FileCheck2, XCircle, AlertTriangle } from 'lucide-react'; // Import icons

interface UploadAudioProps {
  // Update the prop type to accept FormData or an object with audioUrl
  onUpload: (data: FormData | { audioUrl: string }, options: { language: string; diarize: boolean }) => void;
}

export function UploadAudio({ onUpload }: UploadAudioProps) {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>(''); // State for URL input
  const [activeTab, setActiveTab] = useState<string>('file'); // State for active tab
  const [transcriptionOptions, setTranscriptionOptions] = useState<{
    language: string;
    diarize: boolean
  }>({
    language: "None",
    diarize: false
  });

  const {
    fileName,
    error: fileError, // Rename error to avoid conflict
    fileInputRef,
    handleFileSelect,
    clearFile,
    fileSize
  } = useFileInput({
    // Remove the 'accept' property here to bypass the hook's strict MIME check
    // accept: 'audio/mpeg,audio/wav,audio/flac,audio/ogg', // <-- REMOVE THIS LINE
    maxSize: 100 // Max size in MB
  });

  // --- Enhanced URL Validation ---
  const isValidUrlFormat = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch (e) {
      return false;
    }
  };

  const hasAudioExtension = (url: string) => {
    // Basic check for common audio extensions
    return /\.(mp3|wav|flac|ogg)$/i.test(url);
  };

  const isUrlPotentiallyValid = audioUrl && isValidUrlFormat(audioUrl) && hasAudioExtension(audioUrl);
  let urlError: string | null = null;
  if (audioUrl && !isValidUrlFormat(audioUrl)) {
    urlError = 'Please enter a valid URL (starting with http:// or https://)';
  } else if (audioUrl && !hasAudioExtension(audioUrl)) {
    urlError = 'URL does not seem to point to a supported audio file (.mp3, .wav, .flac, .ogg)';
  }
  // --- End Enhanced URL Validation ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e);
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAudioUrl(''); // Clear URL if a file is selected
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioUrl(e.target.value);
    if (file) {
      clearFile(); // Clear file if URL is being entered
      setFile(null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleOptionsChange = (options: { language: string; diarize: boolean }) => {
    setTranscriptionOptions(options);
  };

  const handleSubmit = async () => {
    if (activeTab === 'file' && file && !fileError) { // Check for fileError too
      const formData = new FormData();
      formData.append('file', file);
      onUpload(formData, transcriptionOptions);
    } else if (activeTab === 'url' && audioUrl && isUrlPotentiallyValid) { // Use the new validation flag
      onUpload({ audioUrl }, transcriptionOptions);
    } else {
      // Should not happen if button is disabled correctly, but good practice
      console.error("Submit called with invalid input.");
    }
  };

  const handleReset = () => {
    clearFile();
    setFile(null);
    setAudioUrl('');
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Determine if the submit button should be enabled
  const canSubmit = (activeTab === 'file' && !!file && !fileError) || (activeTab === 'url' && isUrlPotentiallyValid); // Updated condition

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">
            <UploadCloud className="mr-2 h-4 w-4" /> Upload File
          </TabsTrigger>
          <TabsTrigger value="url">
            <LinkIcon className="mr-2 h-4 w-4" /> Paste URL
          </TabsTrigger>
        </TabsList>

        {/* File Upload Tab */}
        <TabsContent value="file">
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 flex flex-col items-center">
              <label htmlFor="audio-file" className="sr-only">Upload audio file</label>
              <input
                id="audio-file"
                type="file"
                // Keep the accept attribute on the input itself as a hint for the browser's file picker
                accept="audio/mpeg,audio/wav,audio/flac,audio/ogg,.mp3,.wav,.flac,.ogg" // Keep/Add extensions here too for better compatibility
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                aria-label="Upload audio file"
              />

              {!fileName && (
                <div className="flex flex-col items-center space-y-4 py-8">
                  <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-full mb-2">
                    <UploadCloud className="text-primary h-7 w-7" />
                  </div>
                  <Button
                    type="button" // Prevent form submission if nested
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
                    onClick={handleButtonClick}
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
        </TabsContent>

        {/* URL Input Tab */}
        <TabsContent value="url">
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="w-full space-y-2">
              <label htmlFor="audio-url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Audio URL
              </label>
              <Input
                id="audio-url"
                type="url"
                placeholder="https://example.com/audio.mp3"
                value={audioUrl}
                onChange={handleUrlChange}
                className={urlError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                aria-describedby={urlError ? 'url-error' : undefined}
                aria-invalid={!!urlError} // Add aria-invalid
              />
              {urlError && (
                <p id="url-error" className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {urlError}
                </p>
              )}
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Paste a direct link to an MP3, WAV, FLAC, or OGG file. The link must end with the file extension.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Options and Submit Button (shown if file or valid URL is present) */}
      {( (activeTab === 'file' && file && !fileError) || (activeTab === 'url' && isUrlPotentiallyValid) ) && (
        <>
          <TranscriptionOptions onChange={handleOptionsChange} />

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit} // Use the combined check
            className="w-full py-6 h-auto text-base"
            size="lg" // Make button larger
          >
            {activeTab === 'file' ? 'Upload and Transcribe File' : 'Transcribe from URL'}
          </Button>
        </>
      )}
    </div>
  );
}
