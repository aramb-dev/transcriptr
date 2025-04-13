import { useState, useCallback } from 'react';
import { Button } from './ui/button';
// import { Input } from './ui/input'; // No longer needed directly here
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useFileInput } from '@/hooks/use-file-input';
import { TranscriptionOptions } from './transcription/TranscriptionOptions';
import { UploadCloud, Link as LinkIcon } from 'lucide-react';
import { FileUploadInput } from './transcription/FileUploadInput'; // Import new component
import { UrlInput } from './transcription/UrlInput'; // Import new component

interface UploadAudioProps {
  onUpload: (data: FormData | { audioUrl: string }, options: { language: string; diarize: boolean }) => void;
}

// --- URL Validation Helpers (can be moved to a util file if needed elsewhere) ---
const isValidUrlFormat = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch (e) {
    return false;
  }
};

const hasAudioExtension = (url: string) => {
  return /\.(mp3|wav|flac|ogg)$/i.test(url);
};
// --- End URL Validation Helpers ---


export function UploadAudio({ onUpload }: UploadAudioProps) {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('file');
  const [transcriptionOptions, setTranscriptionOptions] = useState<{
    language: string;
    diarize: boolean
  }>({
    language: "None",
    diarize: false
  });

  const {
    fileName,
    error: fileError,
    fileInputRef,
    handleFileSelect,
    clearFile,
    fileSize
  } = useFileInput({
    maxSize: 100 // Max size in MB
  });

  const isUrlPotentiallyValid = audioUrl && isValidUrlFormat(audioUrl) && hasAudioExtension(audioUrl);
  let urlError: string | null = null;
  if (audioUrl && !isValidUrlFormat(audioUrl)) {
    urlError = 'Please enter a valid URL (starting with http:// or https://)';
  } else if (audioUrl && !hasAudioExtension(audioUrl)) {
    urlError = 'URL does not seem to point to a supported audio file (.mp3, .wav, .flac, .ogg)';
  }

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e); // Let the hook handle validation
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAudioUrl(''); // Clear URL if a file is selected
    } else {
       // If file selection is cancelled or fails in hook, ensure file state is null
       setFile(null);
    }
  }, [handleFileSelect]);


  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setAudioUrl(newUrl);
    if (file || fileName) { // Clear file if URL is being entered
      clearFile();
      setFile(null);
    }
  }, [file, fileName, clearFile]);


  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, [fileInputRef]);

  const handleOptionsChange = useCallback((options: { language: string; diarize: boolean }) => {
    setTranscriptionOptions(options);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (activeTab === 'file' && file && !fileError) {
      const formData = new FormData();
      formData.append('file', file);
      onUpload(formData, transcriptionOptions);
    } else if (activeTab === 'url' && audioUrl && isUrlPotentiallyValid) {
      onUpload({ audioUrl }, transcriptionOptions);
    } else {
      console.error("Submit called with invalid input.");
    }
  }, [activeTab, file, fileError, audioUrl, isUrlPotentiallyValid, onUpload, transcriptionOptions]);

  const handleResetFile = useCallback(() => {
    clearFile();
    setFile(null);
    // Optionally switch back to file tab or clear URL depending on desired UX
    // setAudioUrl('');
  }, [clearFile]);

  // Determine if the submit button should be enabled
  const canSubmit = (activeTab === 'file' && !!file && !fileError) || (activeTab === 'url' && isUrlPotentiallyValid);

  // Determine if options and submit should be shown
  const showOptionsAndSubmit = (activeTab === 'file' && !!file && !fileError) || (activeTab === 'url' && isUrlPotentiallyValid);


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
          <FileUploadInput
            fileName={fileName}
            fileSize={fileSize}
            fileError={fileError}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
            onButtonClick={handleButtonClick}
            onReset={handleResetFile}
          />
        </TabsContent>

        {/* URL Input Tab */}
        <TabsContent value="url">
          <UrlInput
            audioUrl={audioUrl}
            urlError={urlError}
            onUrlChange={handleUrlChange}
          />
        </TabsContent>
      </Tabs>

      {/* Options and Submit Button */}
      {showOptionsAndSubmit && (
        <>
          <TranscriptionOptions onChange={handleOptionsChange} />

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-6 h-auto text-base"
            size="lg"
          >
            {activeTab === 'file' ? 'Upload and Transcribe File' : 'Transcribe from URL'}
          </Button>
        </>
      )}
    </div>
  );
}
