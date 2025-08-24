import { useState, useCallback } from "react";
import { AnimatedButton } from "./ui/animated-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useFileInput } from "@/hooks/use-file-input";
import { TranscriptionOptions } from "./transcription/TranscriptionOptions";
import { UploadCloud, Link as LinkIcon } from "lucide-react";
import { FileUploadInput } from "./transcription/FileUploadInput";
import { UrlInput } from "./transcription/UrlInput";
import { getAllSupportedFormats } from "@/lib/file-format-utils";
import { uploadLargeFile } from "@/lib/storage-service";

interface UploadAudioProps {
  readonly onUpload: (
    data:
      | FormData
      | { audioUrl: string; originalFile?: { name: string; size: number } },
    options: { language: string; diarize: boolean },
  ) => void;
  readonly onConversionStart?: () => void;
  readonly onConversionComplete?: () => void;
  readonly onConversionError?: (error: string) => void;
  readonly onApiResponse?: (response: { timestamp: Date; data: unknown }) => void;
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
  const supportedFormats = getAllSupportedFormats();
  const regex = new RegExp(`\\.(${supportedFormats.join("|")})$`, "i");
  return regex.test(url);
};
// --- End URL Validation Helpers ---

export function UploadAudio({
  onUpload,
  onConversionStart,
  onConversionComplete,
  onConversionError,
  onApiResponse,
}: UploadAudioProps) {
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
    requiresConversion,
    validateFile, // Add this to extract the validation function from your hook
  } = useFileInput({
    maxSize: 100, // Max size in MB
    allowConversion: true, // Allow files that require conversion
  });

  const isUrlPotentiallyValid =
    audioUrl && isValidUrlFormat(audioUrl) && hasAudioExtension(audioUrl);
  let urlError: string | null = null;
  if (audioUrl && !isValidUrlFormat(audioUrl)) {
    urlError = "Please enter a valid URL (starting with http:// or https://)";
  } else if (audioUrl && !hasAudioExtension(audioUrl)) {
    const supportedFormats = getAllSupportedFormats().join(", ");
    urlError = `URL does not seem to point to a supported audio file (${supportedFormats})`;
  }

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e); // Let the hook handle validation
      if (e.target.files?.[0]) {
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

  // Helper function to upload file to Firebase
  const uploadFileToFirebase = useCallback(async (file: File) => {
    onApiResponse?.({
      timestamp: new Date(),
      data: {
        message: `Uploading ${file.name} to Firebase for conversion...`,
      },
    });

    const uploadResult = await uploadLargeFile(file);

    onApiResponse?.({
      timestamp: new Date(),
      data: {
        message: `File uploaded successfully`,
        firebaseUrl: uploadResult.url,
        firebasePath: uploadResult.path,
      },
    });

    return uploadResult;
  }, [onApiResponse]);

  // Helper function to convert file using CloudConvert
  const convertFileToMp3 = useCallback(async (fileUrl: string, originalFile: File) => {
    const fileExtension = originalFile.name.split(".").pop()?.toLowerCase() || "";

    onApiResponse?.({
      timestamp: new Date(),
      data: {
        message: `Calling CloudConvert API for ${fileExtension.toUpperCase()} → MP3 conversion...`,
      },
    });

    const response = await fetch("/api/convert/cloud", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileUrl,
        originalFormat: fileExtension,
        targetFormat: "mp3",
      }),
    });

    if (!response.ok) {
      throw new Error(`Conversion failed: ${response.statusText}`);
    }

    const conversionResult = await response.json();

    onApiResponse?.({
      timestamp: new Date(),
      data: {
        message: `CloudConvert API response received`,
        success: conversionResult.success,
        jobId: conversionResult.jobId,
        convertedUrl: conversionResult.convertedUrl ? "URL generated" : "No URL",
      },
    });

    if (!conversionResult.success) {
      throw new Error(conversionResult.error || "Conversion failed");
    }

    return conversionResult;
  }, [onApiResponse]);

  // Helper function to handle conversion errors
  const handleConversionError = useCallback((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : "Conversion failed";

    onApiResponse?.({
      timestamp: new Date(),
      data: {
        message: `Conversion failed: ${errorMessage}`,
        error: errorMessage,
        step: "conversion",
      },
    });

    onConversionError?.(errorMessage);
    console.error("Conversion error:", error);
  }, [onApiResponse, onConversionError]);

  // Helper function to handle file conversion workflow
  const handleFileConversion = useCallback(async (file: File) => {
    onConversionStart?.();

    // Log conversion start
    onApiResponse?.({
      timestamp: new Date(),
      data: {
        message: `Starting conversion: ${file.name} (${file.type || "unknown type"}) → MP3`,
        originalFile: file.name,
        originalFormat: file.name.split(".").pop()?.toLowerCase() || "unknown",
        targetFormat: "mp3",
        fileSize: file.size,
      },
    });

    // Add a small delay to ensure state updates are processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Upload file to Firebase
    const uploadResult = await uploadFileToFirebase(file);
    
    // Convert file using CloudConvert
    const conversionResult = await convertFileToMp3(uploadResult.url, file);

    onConversionComplete?.();

    onApiResponse?.({
      timestamp: new Date(),
      data: {
        message: `Conversion completed successfully! Proceeding to transcription...`,
        convertedUrl: conversionResult.convertedUrl,
      },
    });

    // Submit converted file for transcription
    onUpload(
      {
        audioUrl: conversionResult.convertedUrl,
        originalFile: { name: file.name, size: file.size },
      },
      transcriptionOptions,
    );
  }, [onConversionStart, onApiResponse, onConversionComplete, onUpload, transcriptionOptions, uploadFileToFirebase, convertFileToMp3]);

  const handleSubmit = useCallback(async () => {
    if (activeTab === "file" && file && !fileError) {
      if (requiresConversion) {
        try {
          await handleFileConversion(file);
        } catch (error) {
          handleConversionError(error);
        }
      } else {
        // File doesn't need conversion, proceed normally
        const formData = new FormData();
        formData.append("file", file);
        onUpload(formData, transcriptionOptions);
      }
    } else if (activeTab === "url" && audioUrl && isUrlPotentiallyValid) {
      onUpload({ audioUrl }, transcriptionOptions);
    } else {
      console.error("Submit called with invalid input.");
    }
  }, [
    activeTab,
    file,
    fileError,
    requiresConversion,
    audioUrl,
    isUrlPotentiallyValid,
    onUpload,
    transcriptionOptions,
    handleFileConversion,
    handleConversionError,
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
        const validation = validateFile(file);

        if (!validation.error) {
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
          console.log("File validation failed:", validation.error);
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
