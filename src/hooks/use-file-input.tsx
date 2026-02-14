import { useState, useRef, useCallback } from "react"
import { validateFileFormat } from "@/lib/file-format-utils"

interface UseFileInputOptions {
  maxSize?: number // in MB
}

export function useFileInput({
  maxSize = 100,
}: UseFileInputOptions = {}) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File): { error: string | null } => {
      if (file.size > maxSize * 1024 * 1024) {
        return { error: `File size exceeds the ${maxSize}MB limit.` }
      }

      const formatValidation = validateFileFormat(file)
      if (!formatValidation.valid) {
        return { error: formatValidation.error || "Unsupported file format" }
      }

      return { error: null }
    },
    [maxSize],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]

      setFileName(null)
      setFileSize(0)
      setError(null)

      if (!file) return

      const validation = validateFile(file)
      if (validation.error) {
        setError(validation.error)
        return
      }

      setFileName(file.name)
      setFileSize(file.size)
    },
    [validateFile],
  )

  const clearFile = useCallback(() => {
    setFileName(null)
    setFileSize(0)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  return {
    fileName,
    fileSize,
    error,
    fileInputRef,
    handleFileSelect,
    clearFile,
    validateFile,
  }
}
