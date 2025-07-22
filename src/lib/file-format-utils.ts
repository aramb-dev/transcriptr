/**
 * File format detection utilities for audio transcription service
 * Handles detection of supported vs. convertible audio formats
 */

// Formats natively supported by Replicate transcription service
export const NATIVELY_SUPPORTED_FORMATS = ['mp3', 'wav', 'flac', 'ogg'] as const;

// Formats that can be converted to MP3 via CloudConvert
export const CONVERTIBLE_FORMATS = [
  'm4a',   // iPhone recordings
  'aac',   // Advanced Audio Coding
  'mp4',   // Video with audio track
  'wma',   // Windows Media Audio
  'aiff',  // Audio Interchange File Format
  'caf',   // Core Audio Format (macOS)
  'opus',  // Opus codec
  '3gp',   // 3GPP multimedia
  'amr',   // Adaptive Multi-Rate
  'ape',   // Monkey's Audio
  'au',    // Sun Microsystems audio
  'gsm',   // GSM 06.10 audio
  'ra',    // RealAudio
  'voc',   // Creative Voice
  'webm'   // WebM audio
] as const;

export type NativelySupportedFormat = typeof NATIVELY_SUPPORTED_FORMATS[number];
export type ConvertibleFormat = typeof CONVERTIBLE_FORMATS[number];
export type SupportedFormat = NativelySupportedFormat | ConvertibleFormat;

/**
 * Extract file extension from filename or File object
 */
export function getFileExtension(file: File | string): string {
  const filename = typeof file === 'string' ? file : file.name;
  const extension = filename.toLowerCase().split('.').pop() || '';
  return extension;
}

/**
 * Check if a file format is natively supported by the transcription service
 */
export function isNativelySupported(file: File | string): boolean {
  const extension = getFileExtension(file);
  return NATIVELY_SUPPORTED_FORMATS.includes(extension as NativelySupportedFormat);
}

/**
 * Check if a file format requires conversion before transcription
 */
export function requiresConversion(file: File | string): boolean {
  const extension = getFileExtension(file);
  return CONVERTIBLE_FORMATS.includes(extension as ConvertibleFormat);
}

/**
 * Check if a file format is supported at all (either natively or via conversion)
 */
export function isSupported(file: File | string): boolean {
  return isNativelySupported(file) || requiresConversion(file);
}

/**
 * Get all natively supported formats
 */
export function getNativelySupportedFormats(): readonly string[] {
  return NATIVELY_SUPPORTED_FORMATS;
}

/**
 * Get all convertible formats
 */
export function getConvertibleFormats(): readonly string[] {
  return CONVERTIBLE_FORMATS;
}

/**
 * Get all supported formats (native + convertible)
 */
export function getAllSupportedFormats(): readonly string[] {
  return [...NATIVELY_SUPPORTED_FORMATS, ...CONVERTIBLE_FORMATS];
}

/**
 * Get a human-readable description of what will happen to a file
 */
export function getProcessingDescription(file: File | string): {
  supported: boolean;
  requiresConversion: boolean;
  action: 'transcribe' | 'convert-then-transcribe' | 'unsupported';
  message: string;
} {
  const extension = getFileExtension(file);
  const filename = typeof file === 'string' ? file : file.name;

  if (isNativelySupported(file)) {
    return {
      supported: true,
      requiresConversion: false,
      action: 'transcribe',
      message: `${filename} will be transcribed directly (${extension.toUpperCase()} is natively supported)`
    };
  }

  if (requiresConversion(file)) {
    return {
      supported: true,
      requiresConversion: true,
      action: 'convert-then-transcribe',
      message: `${filename} will be converted to MP3 and then transcribed (${extension.toUpperCase()} → MP3)`
    };
  }

  return {
    supported: false,
    requiresConversion: false,
    action: 'unsupported',
    message: `${filename} is not supported. Please use one of: ${getAllSupportedFormats().join(', ')}`
  };
}

/**
 * Validate file format and return appropriate error message if invalid
 */
export function validateFileFormat(file: File | string): {
  valid: boolean;
  error?: string;
  requiresConversion?: boolean;
} {
  const extension = getFileExtension(file);
  const filename = typeof file === 'string' ? file : file.name;

  if (!extension) {
    return {
      valid: false,
      error: 'File has no extension. Please ensure your file has a valid audio format extension.'
    };
  }

  if (isNativelySupported(file)) {
    return {
      valid: true,
      requiresConversion: false
    };
  }

  if (requiresConversion(file)) {
    return {
      valid: true,
      requiresConversion: true
    };
  }

  const supportedList = getAllSupportedFormats().join(', ');
  return {
    valid: false,
    error: `${extension.toUpperCase()} files are not supported. Supported formats: ${supportedList}`
  };
}

/**
 * Get MIME type patterns for file input accept attribute
 */
export function getAcceptedMimeTypes(): string {
  const audioTypes = [
    'audio/*',
    'video/mp4',  // For MP4 files with audio
    'video/quicktime', // For MOV files with audio
    '.m4a',
    '.mp3',
    '.wav',
    '.flac',
    '.ogg',
    '.aac',
    '.wma',
    '.aiff',
    '.caf',
    '.opus',
    '.3gp',
    '.amr',
    '.webm'
  ];
  
  return audioTypes.join(',');
}
