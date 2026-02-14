import { useState, useEffect } from "react";
import { useTranscriptionPolling } from "@/hooks/useTranscriptionPolling";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import { UploadAudio } from "../UploadAudio";
import { TranscriptionProcessing } from "./TranscriptionProcessing";
import type { AIFeatures } from "./TranscriptionOptions";
import { TranscriptionError } from "./TranscriptionError";
import { MobileTranscriptionResult } from "./MobileTranscriptionResult";
import TranscriptionResult from "./TranscriptionResult";
import SessionRecoveryPrompt from "./SessionRecoveryPrompt";
import {
  TranscriptionStatus,
  statusMessages,
  getApiUrl,
  formatTimestamp,
} from "../../services/transcription";
import { trackEvent } from "../../lib/analytics";
import { uploadLargeFile } from "../../lib/storage-service";
import { getUserFriendlyErrorMessage } from "../../lib/error-utils";

import { motion } from "framer-motion";
import { fadeInUp, springTransition } from "../../lib/animations";
import { TranscriptionSession } from "@/lib/persistence-service";

interface TranscriptionFormProps {
  initialSession?: TranscriptionSession | null;
}

export function TranscriptionForm({ initialSession }: TranscriptionFormProps) {
  const [transcription, setTranscription] = useState<string | null>(null);
  const [transStatus, setTransStatus] = useState<TranscriptionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [apiResponses, setApiResponses] = useState<
    Array<{ timestamp: Date; data: Record<string, unknown> }>
  >([]);
  const [showApiDetails, setShowApiDetails] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPredictionId, setCurrentPredictionId] = useState<string | null>(
    null,
  );
  // Preserve last options + audio URL for retry-without-feature
  const [lastAudioUrl, setLastAudioUrl] = useState<string | null>(null);
  const [lastOptions, setLastOptions] = useState<{
    language: string;
    diarize: boolean;
    aiFeatures: AIFeatures;
  } | null>(null);
  // Mobile detection hook
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      return (
        window.innerWidth <= 767 ||
        window.matchMedia("(pointer: coarse)").matches
      );
    };

    setIsMobile(checkIsMobile());

    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add session persistence hook
  const {
    activeSession,
    hasRecoverableSession,
    isLoading: isLoadingSession,
    createNewSession,
    updateSessionData,
    recoverSession,
    discardSession,
  } = useSessionPersistence({
    onSessionRecovered: (session) => {
      console.log("Recovering session:", session);
      // Restore state from recovered session
      setTransStatus(session.status);
      setProgress(session.progress);
      setCurrentPredictionId(session.predictionId);

      if (session.apiResponses) {
        setApiResponses(session.apiResponses);
      }

      // If the session has a result already
      if (session.result) {
        setTranscription(session.result);
      }
    },
  });

  // Handle initialSession from props (from history)
  useEffect(() => {
    if (initialSession) {
      console.log("Loading session from history:", initialSession);

      // Set the correct state based on the session
      setTransStatus(initialSession.status);
      setProgress(initialSession.progress);
      setCurrentPredictionId(initialSession.predictionId);

      if (initialSession.apiResponses) {
        setApiResponses(initialSession.apiResponses);
      }

      // If the session has a completed result
      if (initialSession.result) {
        setTranscription(initialSession.result);
      }

      // If the transcription is still in progress, resume polling
      if (
        initialSession.status === "processing" &&
        initialSession.predictionId
      ) {
        // The polling hook will automatically start since we set currentPredictionId
      }
    }
  }, [initialSession]);

  // Use the polling hook with callbacks
  const { stopPolling } = useTranscriptionPolling({
    predictionId: currentPredictionId,
    onSuccess: (output) => {
      // Handle successful transcription
      setTransStatus("succeeded");
      setProgress(100);

      // Parse the output to extract the transcription text and segments
      // WhisperX returns: { segments: [{ start, end, text, words? }], detected_language: string }
      let finalTranscription = "Error: Could not parse transcription.";
      let segments = undefined;
      let intelligence = undefined;

      if (typeof output === "string") {
        finalTranscription = output;
      } else if (output && typeof output === "object") {
        // AssemblyAI returns { segments, detected_language, intelligence? }
        if ("segments" in output && Array.isArray(output.segments)) {
          segments = output.segments.map((seg: { start: number; end: number; text: string; speaker?: string; words?: unknown[] }, idx: number) => ({
            id: idx,
            start: seg.start,
            end: seg.end,
            text: seg.text,
            speaker: seg.speaker,
            words: seg.words,
          }));
          // Combine all segment text into full transcription
          finalTranscription = output.segments
            .map((seg: { text: string }) => seg.text)
            .join(" ")
            .trim();

          // Extract intelligence data if available
          if ("intelligence" in output && output.intelligence) {
            intelligence = output.intelligence;
          }

          console.log("AssemblyAI output parsed:", {
            segmentCount: segments ? segments.length : 0,
            detectedLanguage: (output as { detected_language?: string }).detected_language,
            hasIntelligence: !!intelligence,
          });
        }
        // Fallback for OpenAI Whisper model format
        else if ("transcription" in output && typeof output.transcription === "string") {
          finalTranscription = output.transcription;
          if ("segments" in output && Array.isArray(output.segments)) {
            segments = output.segments;
          }
        } else if ("text" in output && typeof output.text === "string") {
          finalTranscription = output.text;
        } else if (
          Array.isArray(output) &&
          output.length > 0 &&
          typeof output[0] === "string"
        ) {
          finalTranscription = output.join("\n");
        } else {
          console.error("Unexpected output format:", output);
          finalTranscription = JSON.stringify(output, null, 2);
        }
      }
      setTranscription(finalTranscription);

      // Update session with completed result, segments, and intelligence
      if (activeSession) {
        updateSessionData({
          status: "succeeded",
          progress: 100,
          result: finalTranscription,
          segments: segments,
          intelligence: intelligence,
        });
      }
    },
    onError: (errorMsg) => {
      setError(errorMsg);

      // Update session with error state
      if (activeSession) {
        updateSessionData({
          status: "failed",
        });
      }
    },
    onProgress: (value) => {
      setProgress(value);

      // Update session progress
      if (activeSession) {
        updateSessionData({ progress: value });
      }
    },
    onStatusChange: (status) => {
      setTransStatus(status);

      // Update session status
      if (activeSession) {
        updateSessionData({ status });
      }
    },
    onApiResponse: (response) => {
      setApiResponses((prev) => [...prev, response]);

      // Update session API responses
      if (activeSession) {
        const updatedResponses = [
          ...(activeSession.apiResponses || []),
          response,
        ];
        updateSessionData({ apiResponses: updatedResponses });
      }
    },
  });

  const getProgressColor = () => {
    switch (transStatus) {
      case "starting":
        return "bg-blue-500";
      case "processing":
        return "bg-indigo-500";
      case "succeeded":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "canceled":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const isLoading =
    transStatus === "starting" ||
    transStatus === "processing";

  const handleUpload = async (
    data:
      | FormData
      | { audioUrl: string },
    options: {
      language: string;
      diarize: boolean;
      aiFeatures: AIFeatures;
    },
  ) => {
    // --- Reset State ---
    setError(null);
    setApiResponses([]);
    setTranscription(null); // Ensure previous result is cleared
    stopPolling(); // Stop any existing polling
    setCurrentPredictionId(null); // Clear previous prediction ID
    setTransStatus("starting"); // <--- SET STATUS TO STARTING HERE
    setProgress(5);

    // Preserve options for retry-without-feature (audio URL stored after upload)
    setLastOptions(options);

    // Create new session
    let audioSource: {
      type: "file" | "url";
      name?: string;
      size?: number;
      url?: string;
    } = {
      type: "url",
      url: "",
    };

    // Determine audio source type
    if (data instanceof FormData) {
      const file = data.get("file") as File;
      if (file) {
        audioSource = {
          type: "file",
          name: file.name,
          size: file.size,
        };
      }
    } else if ("audioUrl" in data) {
      audioSource = {
        type: "url",
        url: data.audioUrl,
      };
    }

    // Create new session and store in state
    createNewSession(options, audioSource);

    const requestBody: {
      options: {
        language?: string;
        diarize?: boolean;
        aiFeatures?: AIFeatures;
      } | null;
      audioUrl?: string;
    } = { options: null };

    trackEvent("Transcription", "Start", options.language);

    try {
      let file: File | null = null;
      let sourceDescription = "";

      // Check if data is FormData (file upload) or object (URL input)
      if (data instanceof FormData) {
        file = data.get("file") as File;
        if (!file) {
          throw new Error("No file found in FormData");
        }
        sourceDescription = `file: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)} MB, Type: ${file.type}`;

        // Always upload to Firebase (no more base64)
        setProgress(10);
        setApiResponses((prev) => [
          ...prev,
          {
            timestamp: new Date(),
            data: {
              message: `Uploading to temporary storage...`,
            },
          },
        ]);

        try {
          const uploadResult = await uploadLargeFile(file);
          requestBody.audioUrl = uploadResult.url; // Use Firebase URL
          setLastAudioUrl(uploadResult.url); // Preserve for retry

          // Save URL to localStorage for Studio access
          localStorage.setItem("studioAudioUrl", uploadResult.url);
          console.log("Saved audio URL to localStorage:", uploadResult.url);

          // Update session with audio URL for Studio playback
          updateSessionData({
            audioSource: {
              type: "file",
              name: file.name,
              size: file.size,
              url: uploadResult.url,
            },
          });
          console.log("Updated session with upload URL:", uploadResult.url);

          setProgress(20);
          setApiResponses((prev) => [
            ...prev,
            {
              timestamp: new Date(),
              data: {
                message: "File uploaded to temporary storage.",
                url: uploadResult.url,
              },
            },
          ]);
        } catch (uploadError) {
          setApiResponses((prev) => [
            ...prev,
            {
              timestamp: new Date(),
              data: {
                error: `Firebase upload error: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`,
              },
            },
          ]);
          throw new Error(
            `Failed to upload file: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`,
          );
        }
        // --- End File processing logic ---
      } else {
        requestBody.audioUrl = data.audioUrl;
        setLastAudioUrl(data.audioUrl); // Preserve for retry
        sourceDescription = `URL: ${data.audioUrl}`;
        setProgress(15);

        localStorage.setItem("studioAudioUrl", data.audioUrl);
      }

      console.log(`Processing ${sourceDescription}`);
      setApiResponses((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          data: { message: `Processing ${sourceDescription}` },
        },
      ]);

      // Set common API options
      const apiOptions = {
        language: options.language,
        diarize: options.diarize || false,
        aiFeatures: options.aiFeatures,
      };
      requestBody.options = apiOptions;

      console.log(
        "Sending request to server with options:",
        requestBody.options,
      );
      console.log("Using Firebase URL for audio:", requestBody.audioUrl);
      setProgress(25);

      // --- API Call Logic with network error handling ---
      let response: Response;
      try {
        response = await fetch(getApiUrl("transcribe"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
      } catch {
        // Network error during fetch
        throw new Error(
          "Lost internet connection. Please check your network and try again.",
        );
      }

      setProgress(40);

      if (!response.ok) {
        let errorBody = "Unknown server error";
        try {
          const errorJson = await response.json();
          errorBody =
            errorJson.error || errorJson.message || JSON.stringify(errorJson);
        } catch {
          try {
            errorBody = await response.text();
          } catch {
            errorBody = `Server error (${response.status})`;
          }
        }

        setApiResponses((prev) => [
          ...prev,
          {
            timestamp: new Date(),
            data: { error: `Server error: ${response.status} - ${errorBody}` },
          },
        ]);

        // Create a more specific error for server errors
        const error = new Error(errorBody) as Error & { status?: number };
        error.status = response.status;
        throw error;
      }

      const resultData = await response.json();
      console.log("API response data:", resultData);

      setApiResponses((prev) => [
        ...prev,
        { timestamp: new Date(), data: resultData },
      ]);

      // Save audio URL to session if provided (for Studio playback)
      if (resultData.audioUrl && activeSession) {
        updateSessionData({
          audioSource: {
            ...activeSession.audioSource,
            url: resultData.audioUrl,
          },
        });
      }

      // --- Check for Prediction ID and Start Polling ---
      if (resultData && resultData.id) {
        setCurrentPredictionId(resultData.id); // This will trigger the polling hook
        setProgress(50); // Indicate request sent, waiting for prediction
      } else {
        // Handle cases where the API might return the result directly (if applicable)
        // Or if the ID is missing for some reason
        if (resultData && resultData.output) {
          // If result is immediate (unlikely for long audio but handle just in case)
          // Handle successful transcription - same logic as in onSuccess callback
          setTransStatus("succeeded");
          setProgress(100);

          // Parse the output to extract the transcription text
          let finalTranscription = "Error: Could not parse transcription.";
          const output = resultData.output;
          if (typeof output === "string") {
            finalTranscription = output;
          } else if (output && typeof output === "object") {
            if ("text" in output && typeof output.text === "string") {
              finalTranscription = output.text;
            } else if (
              Array.isArray(output) &&
              output.length > 0 &&
              typeof output[0] === "string"
            ) {
              finalTranscription = output.join("\n");
            } else {
              console.error("Unexpected output format:", output);
              finalTranscription = JSON.stringify(output, null, 2);
            }
          }
          setTranscription(finalTranscription);

          // Update session with completed result
          if (activeSession) {
            updateSessionData({
              status: "succeeded",
              progress: 100,
              result: finalTranscription,
            });
          }
        } else {
          throw new Error(
            "Invalid API response: Missing prediction ID or result.",
          );
        }
      }
      // --- End Initial API Call & Polling Start ---
    } catch (err) {
      console.error("Transcription process failed:", err);

      // Get user-friendly error message
      const errorInfo = getUserFriendlyErrorMessage(err);
      const userMessage = errorInfo.userMessage;

      setError(userMessage); // Set user-friendly error message
      setTransStatus("failed"); // Set status to failed
      setApiResponses((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          data: {
            error: `Transcription failed: ${userMessage}`,
            isNetworkError: errorInfo.isNetworkError,
          },
        },
      ]);
      setProgress(0);
      trackEvent("Transcription", "Error", userMessage);
    }
  };

  const handleReset = () => {
    stopPolling();
    setCurrentPredictionId(null); // Clear prediction ID on reset
    setTranscription(null);
    setTransStatus("idle");
    setError(null);
    setProgress(0);
    setApiResponses([]);
    setShowApiDetails(false);

    // Clear any active session
    if (activeSession) {
      discardSession();
    }
  };

  const handleRetryWithoutFeature = (featureKey: keyof AIFeatures) => {
    if (!lastOptions || !lastAudioUrl) {
      console.warn("Cannot retry: missing options or audio URL");
      handleReset();
      return;
    }

    const updatedFeatures = { ...lastOptions.aiFeatures, [featureKey]: false };
    const updatedOptions = { ...lastOptions, aiFeatures: updatedFeatures };

    console.log(`Retrying without ${featureKey}, using URL: ${lastAudioUrl}`);
    handleUpload({ audioUrl: lastAudioUrl }, updatedOptions);
  };

  // Run cleanup of expired sessions once on component mount
  useEffect(() => {
    const cleanupExpired = async () => {
      try {
        // Import dynamically to prevent circular dependencies
        const { cleanupExpiredSessions } = await import(
          "@/lib/persistence-service"
        );
        const count = await cleanupExpiredSessions();
        if (count > 0) {
          console.log(`Cleaned up ${count} expired sessions`);
        }
      } catch (error) {
        console.error("Failed to clean up expired sessions:", error);
      }
    };

    cleanupExpired();
  }, []);

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={springTransition}
    >
      <div className="mobile:p-4 p-6">
        {isLoadingSession ? (
          <div className="flex h-40 items-center justify-center">
            <div className="animate-pulse text-gray-500 dark:text-gray-400">
              Checking for saved progress...
            </div>
          </div>
        ) : hasRecoverableSession && activeSession ? (
          <SessionRecoveryPrompt
            session={activeSession}
            onRecover={recoverSession}
            onDiscard={discardSession}
          />
        ) : isLoading ? (
          <TranscriptionProcessing
            progress={progress}
            transStatus={
              transStatus as "starting" | "processing"
            }
            getProgressColor={getProgressColor}
            statusMessages={statusMessages}
            showApiDetails={showApiDetails}
            setShowApiDetails={setShowApiDetails}
            apiResponses={apiResponses}
            formatTimestamp={formatTimestamp}
            onCancel={handleReset}
          />
        ) : transStatus === "failed" || transStatus === "canceled" ? (
          <TranscriptionError
            status={transStatus as "failed" | "canceled"}
            error={error}
            onReset={handleReset}
            onRetryWithoutFeature={handleRetryWithoutFeature}
            apiResponses={apiResponses}
            showApiDetails={showApiDetails}
            setShowApiDetails={setShowApiDetails}
            formatTimestamp={formatTimestamp}
          />
        ) : transcription !== null && transStatus === "succeeded" ? ( // Check for transcription text and succeeded status
          isMobile ? (
            // Mobile-optimized result view
            <MobileTranscriptionResult
              transcription={transcription}
              onNewTranscription={handleReset}
            />
          ) : (
            // Desktop result view - links to standalone studio page
            <TranscriptionResult
              transcription={transcription}
              summary={activeSession?.intelligence?.summary}
              options={lastOptions}
              onNewTranscription={handleReset}
              onOpenStudio={() => {
                // Navigate to standalone studio page with session ID
                const sessionId = activeSession?.id;
                if (sessionId) {
                  window.location.href = `/studio?session=${sessionId}`;
                } else {
                  window.location.href = "/studio";
                }
              }}
            />
          )
        ) : (
          // Default: show upload form when idle or if something unexpected happened
          <div className="mobile:p-6 p-8">
            <UploadAudio onUpload={handleUpload} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
