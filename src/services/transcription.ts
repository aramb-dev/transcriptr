import { isLargeFile, uploadLargeFile, deleteFile } from '../lib/storage-service';
import { isFormatSupportedByReplicate } from '../lib/audio-conversion';
import { trackEvent } from '../lib/analytics';

// Constants
const MODEL_ID = 'vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c';
const isNetlify = typeof window !== 'undefined' &&
                 (window.location.hostname.includes('netlify.app') ||
                  process.env.DEPLOY_ENV === 'netlify');

export type TranscriptionStatus = 'idle' | 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';

export const statusMessages: Record<TranscriptionStatus, string> = {
  idle: 'Ready to transcribe',
  starting: 'Transcription engine starting. Please wait 4-5 seconds.',
  processing: 'Processing audio. This will depend on the length of your audio.',
  succeeded: 'Processing complete! Loading result...',
  failed: 'The transcription encountered an error during processing.',
  canceled: 'This transcription was cancelled, please try again.'
};

export const getApiUrl = (endpoint: string) => {
  return isNetlify
    ? `/.netlify/functions/${endpoint}`
    : `/api/${endpoint}`;
};

// Convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const formatErrorMessage = (error: string): string => {
  if (error.includes('Unsupported file format') || error.includes('File format not supported')) {
    return 'Unsupported file format. Please convert to MP3, WAV, or FLAC before uploading.';
  }
  if (error.includes('Soundfile is either not in the correct format')) {
    return 'The audio file format is not supported. Please try a different file or format (MP3, WAV, FLAC recommended).';
  }
  return error;
};

export const formatTimestamp = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};