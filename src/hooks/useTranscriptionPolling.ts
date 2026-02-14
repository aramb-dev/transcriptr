import { useRef, useEffect } from "react"
import { TranscriptionStatus, getApiUrl } from "../services/transcription"
import { getUserFriendlyErrorMessage } from "../lib/error-utils"

interface UseTranscriptionPollingProps {
  predictionId: string | null
  onSuccess: (output: unknown) => void
  onError: (error: string) => void
  onProgress: (value: number) => void
  onStatusChange: (status: TranscriptionStatus) => void
  onApiResponse: (response: {
    timestamp: Date
    data: Record<string, unknown>
  }) => void
}

export function useTranscriptionPolling({
  predictionId,
  onSuccess,
  onError,
  onProgress,
  onStatusChange,
  onApiResponse,
}: UseTranscriptionPollingProps) {
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  // Start polling when predictionId changes
  useEffect(() => {
    if (predictionId) {
      startPolling(predictionId)
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predictionId])

  const startPolling = (id: string) => {
    // Clear any existing polling interval
    if (pollIntervalRef.current) {
      console.log("Polling: Clearing previous interval.")
      clearInterval(pollIntervalRef.current)
    }

    let attempts = 0
    let consecutiveErrors = 0
    const maxAttempts = 120 // 10 minutes at 5s interval
    const maxConsecutiveErrors = 5
    const pollIntervalMs = 5000

    console.log(`Polling: Starting for prediction ID: ${id}`)

    // Create poll function that uses the closure over id
    const poll = async () => {
      attempts++
      console.log(`Polling: Attempt #${attempts} for ${id}`)

      try {
        const response = await fetch(getApiUrl(`prediction/${id}`))

        if (!response.ok) {
          let errorBody = `${response.status} ${response.statusText}`
          try {
            const errorJson = await response.json()
            errorBody = errorJson.error || JSON.stringify(errorJson)
          } catch {
            // response body not readable
          }
          throw new Error(`Failed to check prediction status: ${errorBody}`)
        }

        const data = await response.json()
        consecutiveErrors = 0 // reset on success
        console.log(`Prediction status (attempt ${attempts}):`, data)
        onApiResponse({ timestamp: new Date(), data })

        // Update progress based on status
        let newProgress = 50 // Default starting point for polling

        if (data.status === "starting") {
          // 25%-50% range for starting status
          onStatusChange("starting")
          const startingProgressMax = 25
          const startingProgress =
            (Math.min(attempts, 20) / 20) * startingProgressMax
          newProgress = 25 + Math.floor(startingProgress)
          onProgress(newProgress)
        } else if (data.status === "processing") {
          // 50%-98% range for processing status (estimate-based)
          onStatusChange("processing")
          const processingProgressMax = 48
          const processingProgress =
            (Math.min(attempts, 30) / 30) * processingProgressMax
          newProgress = 50 + Math.floor(processingProgress)
          onProgress(newProgress)
        } else if (data.status === "succeeded") {
          onProgress(100)
          console.log(
            "Transcription succeeded, handling output:",
            data.output,
          )
          stopPolling()
          onSuccess(data.output)
        } else if (data.status === "failed") {
          console.error("Transcription failed:", data.error)
          stopPolling()
          onStatusChange("failed")
          onProgress(0)
          const transcriptionError = data.error || "Unknown transcription error"
          onError(`Transcription failed: ${transcriptionError}`)
          onApiResponse({
            timestamp: new Date(),
            data: { error: `Transcription Error: ${transcriptionError}` },
          })
        } else if (data.status === "canceled") {
          console.warn("Transcription canceled")
          stopPolling()
          onStatusChange("canceled")
          onProgress(0)
          onError("Transcription was canceled")
          onApiResponse({
            timestamp: new Date(),
            data: { message: "Transcription canceled" },
          })
        }

        // Timeout check
        if (
          attempts >= maxAttempts &&
          (data.status === "starting" || data.status === "processing")
        ) {
          console.error(`Polling timeout after ${attempts} attempts`)
          stopPolling()
          onError("Transcription timed out after several minutes.")
          onStatusChange("failed")
          onProgress(0)
          onApiResponse({
            timestamp: new Date(),
            data: { error: "Polling timed out" },
          })
        }
      } catch (error) {
        consecutiveErrors++
        console.error(`Polling error (${consecutiveErrors}/${maxConsecutiveErrors}):`, error)

        if (consecutiveErrors >= maxConsecutiveErrors) {
          const errorInfo = getUserFriendlyErrorMessage(error)
          stopPolling()
          onError(errorInfo.userMessage)
          onStatusChange("failed")
          onProgress(0)
          onApiResponse({
            timestamp: new Date(),
            data: {
              error: `Polling Error: ${errorInfo.userMessage}`,
              isNetworkError: errorInfo.isNetworkError,
            },
          })
        } else {
          console.log(`Polling: Retrying... (${consecutiveErrors}/${maxConsecutiveErrors})`)
          onApiResponse({
            timestamp: new Date(),
            data: {
              error: `Polling retry ${consecutiveErrors}/${maxConsecutiveErrors}: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          })
        }
      }
    }

    // Set up the interval
    pollIntervalRef.current = setInterval(poll, pollIntervalMs)

    // First poll after a short delay to let React settle
    setTimeout(() => {
      console.log(`Executing first poll for ${id}`)
      poll()
    }, 500)
  }

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  return { stopPolling }
}
