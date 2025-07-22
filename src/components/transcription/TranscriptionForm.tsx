import { useState, useEffect } from "react";
import { useTranscriptionPolling } from "@/hooks/useTranscriptionPolling";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import { UploadAudio } from "../UploadAudio";
import { TranscriptionProcessing } from "./TranscriptionProcessing";
import { TranscriptionError } from "./TranscriptionError";
import { MobileTranscriptionResult } from "./MobileTranscriptionResult";
import { TranscriptionStudio } from "./TranscriptionStudio";
import SessionRecoveryPrompt from "./SessionRecoveryPrompt";
import {
  TranscriptionStatus,
  statusMessages,
  getApiUrl,
  fileToBase64,
  formatTimestamp,
} from "../../services/transcription";
import { trackEvent } from "../../lib/analytics";
import { isLargeFile, uploadLargeFile } from "../../lib/storage-service";

import { cleanupFirebaseFile } from "../../lib/cleanup-service";
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
  const [firebaseFilePath, setFirebaseFilePath] = useState<string | null>(null);

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
      setFirebaseFilePath(session.firebaseFilePath);
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
      setFirebaseFilePath(initialSession.firebaseFilePath);
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

      // Parse the output to extract the transcription text
      let finalTranscription = "Error: Could not parse transcription.";
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

      // Cleanup Firebase file if exists when transcription is complete
      if (firebaseFilePath) {
        cleanupFirebaseFile(firebaseFilePath).then((success) => {
          if (success) {
            console.log("Temporary file cleaned up successfully");
            setFirebaseFilePath(null);

            // Update session to clear firebase path
            if (activeSession) {
              updateSessionData({ firebaseFilePath: null });
            }
          }
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

  const isLoading = transStatus === "converting" || transStatus === "starting" || transStatus === "processing";

  const handleUpload = async (
    data: FormData | { audioUrl: string; originalFile?: { name: string; size: number } },
    options: { language: string; diarize: boolean },
  ) => {
    // --- Reset State ---
    setError(null);
    setApiResponses([]);
    setTranscription(null); // Ensure previous result is cleared
    stopPolling(); // Stop any existing polling
    setCurrentPredictionId(null); // Clear previous prediction ID
    setTransStatus("starting"); // <--- SET STATUS TO STARTING HERE
    setProgress(5);
    setFirebaseFilePath(null); // Reset Firebase file path

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
      // Check if this is a converted file (has originalFile metadata)
      if (data.originalFile) {
        audioSource = {
          type: "file", // Treat converted files as file uploads in history
          name: data.originalFile.name,
          size: data.originalFile.size,
        };
      } else {
        // Regular URL input
        audioSource = {
          type: "url",
          url: data.audioUrl,
        };
      }
    }

    // Create new session and store in state
    createNewSession(options, audioSource);

    const requestBody: {
      options: {
        modelId: string;
        task?: string;
        batch_size?: number;
        return_timestamps?: boolean;
        language?: string;
        diarize?: boolean;
      } | null;
      audioData?: string; // Base64 data
      audioUrl?: string; // URL from input or Firebase
    } = { options: null };

    trackEvent("Transcription", "Start", options.language);

    try {
      let file: File | null = null;
      let sourceDescription = "";
      const firebaseFilePath: string | null = null; // Track Firebase path for potential cleanup

      // Check if data is FormData (file upload) or object (URL input)
      if (data instanceof FormData) {
        file = data.get("file") as File;
        if (!file) {
          throw new Error("No file found in FormData");
        }
        sourceDescription = `file: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)} MB, Type: ${file.type}`;

        if (isLargeFile(file)) {
          setProgress(10);
          setApiResponses((prev) => [
            ...prev,
            {
              timestamp: new Date(),
              data: {
                message: `Large file detected. Uploading to temporary storage...`,
              },
            },
          ]);
          try {
            const uploadResult = await uploadLargeFile(file);
            requestBody.audioUrl = uploadResult.url; // Use Firebase URL
            setFirebaseFilePath(uploadResult.path); // Store the path for cleanup later
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
              `Failed to upload large file: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`,
            );
          }
        } else {
          // Convert smaller files to base64
          try {
            const base64Audio = await fileToBase64(file);
            setProgress(15);
            requestBody.audioData = base64Audio;
          } catch (base64Error) {
            throw new Error(
              `Failed to prepare file: ${base64Error instanceof Error ? base64Error.message : String(base64Error)}`,
            );
          }
        }
        // --- End File processing logic ---
      } else {
        // Handle URL input
        requestBody.audioUrl = data.audioUrl; // Use the provided URL directly
        sourceDescription = `URL: ${data.audioUrl}`;
        setProgress(15); // Set progress for URL case
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
        modelId:
          process.env.NEXT_PUBLIC_REPLICATE_MODEL_ID ||
          "vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c",
        task: "transcribe",
        batch_size: 64,
        return_timestamps: true,
        language: options.language === "None" ? undefined : options.language, // Send undefined if "None"
        diarize: options.diarize,
      };
      requestBody.options = apiOptions;

      // Ensure only one audio source is sent
      if (requestBody.audioUrl && requestBody.audioData) {
        console.warn(
          "Both audioUrl and audioData present, preferring audioUrl.",
        );
        delete requestBody.audioData;
      }

      console.log(
        "Sending request to server with options:",
        requestBody.options,
      );
      console.log(
        "Using method:",
        requestBody.audioUrl ? "URL" : "base64 data",
      );
      setProgress(25);

      // --- API Call Logic (remains largely the same) ---
      const response = await fetch(getApiUrl("transcribe"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      setProgress(40);

      if (!response.ok) {
        let errorBody = "Unknown server error";
        try {
          const errorJson = await response.json();
          errorBody =
            errorJson.error || errorJson.message || JSON.stringify(errorJson);
        } catch {
          errorBody = await response.text();
        }
        setApiResponses((prev) => [
          ...prev,
          {
            timestamp: new Date(),
            data: { error: `Server error: ${response.status} - ${errorBody}` },
          },
        ]);
        throw new Error(
          `Server responded with ${response.status}: ${errorBody}`,
        );
      }

      const resultData = await response.json();
      console.log("API response data:", resultData);

      // Add Firebase path to result if it exists, for potential cleanup later
      if (firebaseFilePath) {
        resultData.firebaseFilePath = firebaseFilePath;
      }

      setApiResponses((prev) => [
        ...prev,
        { timestamp: new Date(), data: resultData },
      ]);

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

          // Cleanup Firebase file if exists when transcription is complete
          if (firebaseFilePath) {
            cleanupFirebaseFile(firebaseFilePath).then((success) => {
              if (success) {
                console.log("Temporary file cleaned up successfully");
                setFirebaseFilePath(null);

                // Update session to clear firebase path
                if (activeSession) {
                  updateSessionData({ firebaseFilePath: null });
                }
              }
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
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage); // Set error state
      setTransStatus("failed"); // Set status to failed
      setApiResponses((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          data: { error: `Transcription failed: ${errorMessage}` },
        },
      ]);
      setProgress(0);
      trackEvent("Transcription", "Error", errorMessage);
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

    // Cleanup Firebase file if exists when resetting
    if (firebaseFilePath) {
      cleanupFirebaseFile(firebaseFilePath).then((success) => {
        if (success) {
          console.log("Temporary file cleaned up on reset");
          setFirebaseFilePath(null);
        }
      });
    }
  };

  // Use effect to ensure we cleanup files when component unmounts
  useEffect(() => {
    return () => {
      // Don't cleanup Firebase file automatically on unmount if we have an active session
      if (
        firebaseFilePath &&
        (!activeSession ||
          activeSession.status === "succeeded" ||
          activeSession.status === "failed")
      ) {
        cleanupFirebaseFile(firebaseFilePath).then((success) => {
          if (success) {
            console.log("Temporary file cleaned up on component unmount");
          }
        });
      }
    };
  }, [firebaseFilePath, activeSession]);

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
            transStatus={transStatus as "converting" | "starting" | "processing"}
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
            // Desktop Studio view - Enhanced transcription workspace
            <TranscriptionStudio
              transcription={transcription}
              audioSource={activeSession?.audioSource}
              onNewTranscription={handleReset}
            />
          )
        ) : (
          // Default: show upload form when idle or if something unexpected happened
          <div className="mobile:p-6 p-8">
            <UploadAudio
              onUpload={handleUpload}
              onConversionStart={() => setTransStatus("converting")}
              onConversionComplete={() => console.log("Conversion completed, starting transcription...")}
              onConversionError={(error) => {
                console.error("Conversion failed:", error);
                setError(`Audio conversion failed: ${error}`);
                setTransStatus("failed");
              }}
              onApiResponse={(response) => {
                console.log("API Response:", response.data);
                setApiResponses(prev => [...prev, response as { timestamp: Date; data: Record<string, unknown> }]);
              }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
