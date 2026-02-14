/**
 * File format utilities for audio transcription service
 * AssemblyAI natively supports all these formats — no conversion needed
 */

export const SUPPORTED_FORMATS = [
  // Audio
  "mp3", "wav", "flac", "ogg", "m4a", "aac", "wma", "aiff",
  "opus", "amr", "webm", "caf", "3gp", "ape", "au", "gsm", "ra", "voc",
  // Video (AssemblyAI extracts audio automatically)
  "mp4", "mov", "avi", "mkv", "wmv", "flv", "ts", "m4v",
] as const

export type SupportedFormat = (typeof SUPPORTED_FORMATS)[number]

export function getFileExtension(file: File | string): string {
  const filename = typeof file === "string" ? file : file.name
  return filename.toLowerCase().split(".").pop() || ""
}

export function isSupported(file: File | string): boolean {
  const extension = getFileExtension(file)
  return SUPPORTED_FORMATS.includes(extension as SupportedFormat)
}

export function getAllSupportedFormats(): readonly string[] {
  return SUPPORTED_FORMATS
}

export function validateFileFormat(file: File | string): {
  valid: boolean
  error?: string
} {
  const extension = getFileExtension(file)

  if (!extension) {
    return {
      valid: false,
      error: "File has no extension. Please ensure your file has a valid audio format extension.",
    }
  }

  if (isSupported(file)) {
    return { valid: true }
  }

  const supportedList = SUPPORTED_FORMATS.join(", ")
  return {
    valid: false,
    error: `${extension.toUpperCase()} files are not supported. Supported formats: ${supportedList}`,
  }
}

export function getAcceptedMimeTypes(): string {
  const types = [
    "audio/*",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    "video/webm",
    ...SUPPORTED_FORMATS.map((f) => `.${f}`),
  ]
  return types.join(",")
}
