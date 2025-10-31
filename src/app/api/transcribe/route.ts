import { NextResponse } from "next/server";
import { uploadBase64ToFirebase } from "@/lib/firebase-utils";
import { startReplicateTranscription } from "@/lib/replicate-client";

// Default model ID, can be overridden by options
// Using OpenAI's Whisper model which provides better timestamp accuracy and format support
const DEFAULT_MODEL_ID =
  "openai/whisper:8099696689d249cf8b122d833c36ac3f75505c666a395ca40ef26f68e7d3d16e";
const LARGE_FILE_THRESHOLD_MB = 1; // Define threshold for direct base64 vs upload

// Helper to prepare audio input for the transcription service
async function prepareAudioInput(
  audioData: string | undefined,
  audioUrl: string | undefined,
) {
  const inputParams: { audio: string } = {} as { audio: string };
  let firebaseFilePath: string | null = null;

  if (audioUrl) {
    console.log("Using provided audio URL for Replicate input.");
    inputParams.audio = audioUrl;
  } else if (audioData) {
    // Estimate size (base64 is ~4/3 * original size)
    const estimatedSizeInMB = (audioData.length * 0.75) / (1024 * 1024);
    console.log(
      `Estimated audio size from base64: ${estimatedSizeInMB.toFixed(2)}MB`,
    );

    if (estimatedSizeInMB > LARGE_FILE_THRESHOLD_MB) {
      console.log("Audio data is large, uploading to Firebase...");
      const uploadResult = await uploadBase64ToFirebase(audioData);
      inputParams.audio = uploadResult.url;
      firebaseFilePath = uploadResult.path;
      console.log("Using Firebase URL for Replicate input:", inputParams.audio);
    } else {
      console.log("Using base64 data directly for Replicate input.");
      inputParams.audio = audioData;
    }
  }

  return { inputParams, firebaseFilePath };
}

export async function POST(request: Request) {
  console.log("Transcribe function invoked.");

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (parseError: unknown) {
    console.error("Error parsing request body:", parseError);
    const errorMessage =
      parseError instanceof Error ? parseError.message : "Invalid JSON format";
    return NextResponse.json(
      { error: "Invalid JSON", details: errorMessage },
      { status: 400 },
    );
  }

  const { audioData, audioUrl, options = {} } = requestBody;

  console.log("Request received:", {
    hasAudioData: !!audioData,
    hasAudioUrl: !!audioUrl,
    audioDataLength: audioData
      ? `${(audioData.length / 1024 / 1024).toFixed(2)}MB`
      : "N/A",
    options,
  });

  if (!audioData && !audioUrl) {
    console.error("Validation Error: No audio data or URL provided.");
    return NextResponse.json(
      { error: "No audio data or URL provided" },
      { status: 400 },
    );
  }

  try {
    // Set up base parameters
    interface TranscriptionParams {
      task: string;
      batch_size: number;
      return_timestamps: boolean;
      diarize: boolean;
      audio?: string;
      language?: string;
      [key: string]: unknown;
    }

    const transcriptionParams: TranscriptionParams = {
      task: options.task || "transcribe",
      batch_size: options.batch_size || 8,
      return_timestamps:
        options.return_timestamps !== undefined
          ? options.return_timestamps
          : true,
      diarize: options.diarize || false,
    };

    // Process audio input
    const { inputParams, firebaseFilePath } = await prepareAudioInput(
      audioData,
      audioUrl,
    );
    Object.assign(transcriptionParams, inputParams);

    // Add language if specified and not "None"
    if (options.language && options.language !== "None") {
      transcriptionParams.language = options.language;
    }

    // Determine model ID and start prediction
    const modelId = options.modelId || DEFAULT_MODEL_ID;
    console.log(`Starting Replicate prediction with model: ${modelId}`);
    const predictionData = await startReplicateTranscription(
      transcriptionParams,
      modelId,
    );

    // Add firebase path to response if a file was uploaded
    if (firebaseFilePath) {
      (predictionData as Record<string, unknown>).firebaseFilePath =
        firebaseFilePath;
      console.log("Included Firebase path in response:", firebaseFilePath);
    }

    console.log(
      "Successfully initiated Replicate prediction:",
      predictionData.id,
    );
    return NextResponse.json(predictionData, { status: 200 });
  } catch (error: unknown) {
    console.error("Error processing transcription request:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const statusCode =
      errorMessage.includes("Firebase") || errorMessage.includes("Replicate")
        ? 502
        : 500;
    return NextResponse.json(
      {
        error: `Transcription processing failed: ${errorMessage}`,
      },
      { status: statusCode },
    );
  }
}
