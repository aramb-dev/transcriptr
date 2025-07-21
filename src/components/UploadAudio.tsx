import { useState, useCallback } from "react";
import { AnimatedButton } from "./ui/animated-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useFileInput } from "@/hooks/use-file-input";
import { TranscriptionOptions } from "./transcription/TranscriptionOptions";
import { UploadCloud, Link as LinkIcon } from "lucide-react";
import { FileUploadInput } from "./transcription/FileUploadInput";
import { UrlInput } from "./transcription/UrlInput";

interface UploadAudioProps {
  onUpload: (
    data: FormData | { audioUrl: string },
    options: { language: string; diarize: boolean },
  ) => void;
}

// --- URL Validation Helpers (can be moved to a util file if needed elsewhere) ---
const isValidUrlFormat = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

const hasAudioExtension = (url: string) => {
  return /\.(mp3|wav|flac|ogg)$/i.test(url);
};
// --- End URL Validation Helpers ---

export function UploadAudio({ onUpload }: UploadAudioProps) {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("file");
  const [transcriptionOptions, setTranscriptionOptions] = useState<{
    language: string;
    diarize: boolean;
  }>({
    language: "None",
    diarize: false,
  });

  const {
    fileName,
    error: fileError,
    fileInputRef,
    handleFileSelect,
    clearFile,
    fileSize,
    validateFile, // Add this to extract the validation function from your hook
  } = useFileInput({
    maxSize: 100, // Max size in MB
  });

  const isUrlPotentiallyValid =
    audioUrl && isValidUrlFormat(audioUrl) && hasAudioExtension(audioUrl);
  let urlError: string | null = null;
  if (audioUrl && !isValidUrlFormat(audioUrl)) {
    urlError = "Please enter a valid URL (starting with http:// or https://)";
  } else if (audioUrl && !hasAudioExtension(audioUrl)) {
    urlError =
      "URL does not seem to point to a supported audio file (.mp3, .wav, .flac, .ogg)";
  }

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e); // Let the hook handle validation
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
        setAudioUrl(""); // Clear URL if a file is selected
      } else {
        // If file selection is cancelled or fails in hook, ensure file state is null
        setFile(null);
      }
    },
    [handleFileSelect],
  );

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newUrl = e.target.value;
      setAudioUrl(newUrl);
      if (file || fileName) {
        // Clear file if URL is being entered
        clearFile();
        setFile(null);
      }
    },
    [file, fileName, clearFile],
  );

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, [fileInputRef]);

  const handleOptionsChange = useCallback(
    (options: { language: string; diarize: boolean }) => {
      setTranscriptionOptions(options);
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if (activeTab === "file" && file && !fileError) {
      const formData = new FormData();
      formData.append("file", file);
      onUpload(formData, transcriptionOptions);
    } else if (activeTab === "url" && audioUrl && isUrlPotentiallyValid) {
      onUpload({ audioUrl }, transcriptionOptions);
    } else {
      console.error("Submit called with invalid input.");
    }
  }, [
    activeTab,
    file,
    fileError,
    audioUrl,
    isUrlPotentiallyValid,
    onUpload,
    transcriptionOptions,
  ]);

  const handleResetFile = useCallback(() => {
    clearFile();
    setFile(null);
    // Optionally switch back to file tab or clear URL depending on desired UX
    // setAudioUrl('');
  }, [clearFile]);

  // Fix the handleDirectFileSet function
  const handleDirectFileSet = useCallback(
    (file: File) => {
      console.log("Handling dropped file:", file.name);

      if (file) {
        // First, validate the file
        const validationError = validateFile(file);

        if (!validationError) {
          // If validation passes:
          // 1. Set the file state
          setFile(file);

          // 2. Update the file input hook state directly
          handleFileSelect({
            target: {
              files: [file],
            },
          } as unknown as React.ChangeEvent<HTMLInputElement>);

          // 3. Switch to the file tab if not already there
          setActiveTab("file");

          // 4. Clear URL if a file is selected
          setAudioUrl("");

          console.log("File set successfully:", file.name);
        } else {
          // If validation fails, log the error
          console.log("File validation failed:", validationError);
          // You also might want to handle showing the error to the user here
        }
      }
    },
    [validateFile, handleFileSelect, setActiveTab, setAudioUrl],
  );

  // Determine if the submit button should be enabled
  const canSubmit =
    (activeTab === "file" && !!file && !fileError) ||
    (activeTab === "url" && isUrlPotentiallyValid);

  // Determine if options and submit should be shown
  const showOptionsAndSubmit =
    (activeTab === "file" && !!file && !fileError) ||
    (activeTab === "url" && isUrlPotentiallyValid);

  return (
    <div className="mobile:space-y-4 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mobile:h-12 mobile:rounded-lg grid w-full grid-cols-2">
          <TabsTrigger
            value="file"
            className="mobile:text-sm mobile:font-medium"
          >
            <UploadCloud className="mobile:h-3 mobile:w-3 mr-2 h-4 w-4" />
            <span className="mobile:hidden">Upload File</span>
            <span className="mobile:inline hidden">Upload</span>
          </TabsTrigger>
          <TabsTrigger
            value="url"
            className="mobile:text-sm mobile:font-medium"
          >
            <LinkIcon className="mobile:h-3 mobile:w-3 mr-2 h-4 w-4" />
            <span className="mobile:hidden">Paste URL</span>
            <span className="mobile:inline hidden">URL</span>
          </TabsTrigger>
        </TabsList>

        {/* File Upload Tab */}
        <TabsContent value="file" className="mobile:mt-4">
          <FileUploadInput
            fileName={fileName}
            fileSize={fileSize}
            fileError={fileError}
            fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
            onFileChange={handleFileChange}
            onButtonClick={handleButtonClick}
            onReset={handleResetFile}
            validateAndSetFile={handleDirectFileSet}
          />
        </TabsContent>

        {/* URL Input Tab */}
        <TabsContent value="url" className="mobile:mt-4">
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

          <AnimatedButton
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="mobile:py-4 mobile:text-lg mobile:font-semibold mobile:rounded-xl mobile:shadow-lg touch-feedback h-auto w-full py-6 text-base"
            size="lg"
          >
            {activeTab === "file"
              ? "Upload and Transcribe File"
              : "Transcribe from URL"}
          </AnimatedButton>
        </>
      )}
    </div>
  );
}
