import { NextResponse } from "next/server";
import { uploadBase64ToFirebase } from "@/lib/firebase-utils";
import { startReplicateTranscription } from "@/lib/replicate-client";

// Default model ID - WhisperX for word-level timestamps and speaker diarization
// victor-upmeet/whisperx provides 70x realtime transcription with accurate word timestamps
const DEFAULT_MODEL_ID =
  "victor-upmeet/whisperx:826801120720e563620006b99e412f7ed7b991dd4477e9160473d44a405ef9d9";

// Helper to prepare audio input for the transcription service
// Always uploads to Firebase to ensure Studio can access the audio
async function prepareAudioInput(
  audioData: string | undefined,
  audioUrl: string | undefined,
) {
  const inputParams: { audio_file: string } = {} as { audio_file: string };
  let firebaseFilePath: string | null = null;
  let firebaseUrl: string | null = null;

  if (audioUrl) {
    console.log("Using provided audio URL for Replicate input.");
    inputParams.audio_file = audioUrl;
    firebaseUrl = audioUrl; // Save the URL for Studio
  } else if (audioData) {
    // Always upload to Firebase for Studio access
    console.log("Uploading audio to Firebase for Studio access...");
    const uploadResult = await uploadBase64ToFirebase(audioData);
    inputParams.audio_file = uploadResult.url;
    firebaseFilePath = uploadResult.path;
    firebaseUrl = uploadResult.url;
    console.log("Using Firebase URL for Replicate input:", inputParams.audio_file);
  }

  return { inputParams, firebaseFilePath, firebaseUrl };
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
    // Set up base parameters for WhisperX model
    interface TranscriptionParams {
      audio_file?: string;
      language?: string;
      temperature?: number;
      batch_size?: number;
      align_output?: boolean;
      diarization?: boolean;
      huggingface_access_token?: string;
      min_speakers?: number;
      max_speakers?: number;
      vad_onset?: number;
      vad_offset?: number;
      [key: string]: unknown;
    }

    const transcriptionParams: TranscriptionParams = {
      temperature: options.temperature || 0,
      batch_size: options.batch_size || 32,
      align_output: true, // Enable word-level timestamps
      vad_onset: 0.5,
      vad_offset: 0.363,
    };

    // Enable diarization if requested and HuggingFace token is available
    if (options.diarize && process.env.HUGGINGFACE_ACCESS_TOKEN) {
      transcriptionParams.diarization = true;
      transcriptionParams.huggingface_access_token = process.env.HUGGINGFACE_ACCESS_TOKEN;
      if (options.min_speakers) transcriptionParams.min_speakers = options.min_speakers;
      if (options.max_speakers) transcriptionParams.max_speakers = options.max_speakers;
    }

    // Process audio input
    const { inputParams, firebaseFilePath, firebaseUrl } = await prepareAudioInput(
      audioData,
      audioUrl,
    );
    // WhisperX uses audio_file parameter
    if (inputParams.audio_file) {
      transcriptionParams.audio_file = inputParams.audio_file;
    }

    // Add language if specified (undefined = auto-detect)
    if (options.language && options.language !== "auto") {
      transcriptionParams.language = options.language;
    }

    // Determine model ID and start prediction
    const modelId = options.modelId || DEFAULT_MODEL_ID;
    console.log(`Starting Replicate prediction with model: ${modelId}`);
    console.log("Transcription params being sent:", JSON.stringify(transcriptionParams, null, 2));
    const predictionData = await startReplicateTranscription(
      transcriptionParams,
      modelId,
    );

    // Add firebase path and URL to response
    if (firebaseFilePath) {
      (predictionData as Record<string, unknown>).firebaseFilePath =
        firebaseFilePath;
      console.log("Included Firebase path in response:", firebaseFilePath);
    }

    if (firebaseUrl) {
      (predictionData as Record<string, unknown>).audioUrl = firebaseUrl;
      console.log("Included audio URL in response:", firebaseUrl);
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
