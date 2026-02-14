import { useState, useCallback } from "react"
import { AnimatedButton } from "./ui/animated-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { useFileInput } from "@/hooks/use-file-input"
import { TranscriptionOptions } from "./transcription/TranscriptionOptions"
import { UploadCloud, Link as LinkIcon } from "lucide-react"
import { FileUploadInput } from "./transcription/FileUploadInput"
import { UrlInput } from "./transcription/UrlInput"
import { getAllSupportedFormats } from "@/lib/file-format-utils"
import type { AIFeatures } from "./transcription/TranscriptionOptions"

interface UploadAudioProps {
  onUpload: (
    data:
      | FormData
      | { audioUrl: string },
    options: { language: string; diarize: boolean; aiFeatures: AIFeatures },
  ) => void
  disabled?: boolean
  maxFileSize?: number
}

const isValidUrlFormat = (url: string) => {
  try {
    const parsedUrl = new URL(url)
    return ["http:", "https:"].includes(parsedUrl.protocol)
  } catch {
    return false
  }
}

const hasAudioExtension = (url: string) => {
  const supportedFormats = getAllSupportedFormats()
  const regex = new RegExp(`\\.(${supportedFormats.join("|")})$`, "i")
  return regex.test(url)
}

export function UploadAudio({ onUpload }: UploadAudioProps) {
  const [file, setFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("file")
  const [transcriptionOptions, setTranscriptionOptions] = useState<{
    language: string
    diarize: boolean
    aiFeatures: AIFeatures
  }>({
    language: "auto",
    diarize: false,
    aiFeatures: {
      autoChapters: false,
      summarization: false,
      sentimentAnalysis: false,
      entityDetection: false,
      keyPhrases: false,
      contentModeration: false,
      topicDetection: false,
    },
  })

  const {
    fileName,
    error: fileError,
    fileInputRef,
    handleFileSelect,
    clearFile,
    fileSize,
    validateFile,
  } = useFileInput({ maxSize: 100 })

  const isUrlPotentiallyValid =
    audioUrl && isValidUrlFormat(audioUrl) && hasAudioExtension(audioUrl)
  let urlError: string | null = null
  if (audioUrl && !isValidUrlFormat(audioUrl)) {
    urlError = "Please enter a valid URL (starting with http:// or https://)"
  } else if (audioUrl && !hasAudioExtension(audioUrl)) {
    const supportedFormats = getAllSupportedFormats().join(", ")
    urlError = `URL does not seem to point to a supported audio file (${supportedFormats})`
  }

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e)
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0])
        setAudioUrl("")
      } else {
        setFile(null)
      }
    },
    [handleFileSelect],
  )

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newUrl = e.target.value
      setAudioUrl(newUrl)
      if (file || fileName) {
        clearFile()
        setFile(null)
      }
    },
    [file, fileName, clearFile],
  )

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [fileInputRef])

  const handleOptionsChange = useCallback(
    (options: { language: string; diarize: boolean; aiFeatures: AIFeatures }) => {
      setTranscriptionOptions(options)
    },
    [],
  )

  const handleSubmit = useCallback(async () => {
    if (activeTab === "file" && file && !fileError) {
      const formData = new FormData()
      formData.append("file", file)
      onUpload(formData, transcriptionOptions)
    } else if (activeTab === "url" && audioUrl && isUrlPotentiallyValid) {
      onUpload({ audioUrl }, transcriptionOptions)
    } else {
      console.error("Submit called with invalid input.")
    }
  }, [
    activeTab,
    file,
    fileError,
    audioUrl,
    isUrlPotentiallyValid,
    onUpload,
    transcriptionOptions,
  ])

  const handleResetFile = useCallback(() => {
    clearFile()
    setFile(null)
  }, [clearFile])

  const handleDirectFileSet = useCallback(
    (file: File) => {
      if (file) {
        const validation = validateFile(file)
        if (!validation.error) {
          setFile(file)
          handleFileSelect({
            target: { files: [file] },
          } as unknown as React.ChangeEvent<HTMLInputElement>)
          setActiveTab("file")
          setAudioUrl("")
        }
      }
    },
    [validateFile, handleFileSelect, setActiveTab, setAudioUrl],
  )

  const canSubmit =
    (activeTab === "file" && !!file && !fileError) ||
    (activeTab === "url" && isUrlPotentiallyValid)

  const showOptionsAndSubmit =
    (activeTab === "file" && !!file && !fileError) ||
    (activeTab === "url" && isUrlPotentiallyValid)

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

        <TabsContent value="url" className="mobile:mt-4">
          <UrlInput
            audioUrl={audioUrl}
            urlError={urlError}
            onUrlChange={handleUrlChange}
          />
        </TabsContent>
      </Tabs>

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
  )
}
