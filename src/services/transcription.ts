// Constants
export type TranscriptionStatus =
  | "idle"
  | "converting"
  | "starting"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled";

export const statusMessages: Record<TranscriptionStatus, string> = {
  idle: "Ready to transcribe",
  converting: "Converting audio file to MP3 format...",
  starting: "Transcription engine starting. Please wait 4-5 seconds.",
  processing: "Processing audio. This will depend on the length of your audio.",
  succeeded: "Processing complete! Loading result...",
  failed: "The transcription encountered an error during processing.",
  canceled: "This transcription was cancelled, please try again.",
};

export const getApiUrl = (endpoint: string) => {
  return `/api/${endpoint}`;
};

// Convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const formatErrorMessage = (error: string): string => {
  if (
    error.includes("Unsupported file format") ||
    error.includes("File format not supported")
  ) {
    return "Unsupported file format. Please convert to MP3, WAV, or FLAC before uploading.";
  }
  if (error.includes("Soundfile is either not in the correct format")) {
    return "The audio file format is not supported. Please try a different file or format (MP3, WAV, FLAC recommended).";
  }
  return error;
};

export const formatTimestamp = (date: Date) => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};
