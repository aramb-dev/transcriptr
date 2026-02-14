import { NextResponse } from "next/server"
import { uploadBase64ToFirebase } from "@/lib/firebase-utils"
import { startAssemblyAITranscription, TranscriptionParams } from "@/lib/assemblyai-client"

// Helper to prepare audio input for the transcription service
// Always uploads to Firebase to ensure Studio can access the audio
async function prepareAudioInput(
  audioData: string | undefined,
  audioUrl: string | undefined,
) {
  let audioFileUrl: string | undefined
  let firebaseFilePath: string | null = null
  let firebaseUrl: string | null = null

  if (audioUrl) {
    console.log("Using provided audio URL for transcription input.")
    audioFileUrl = audioUrl
    firebaseUrl = audioUrl
  } else if (audioData) {
    console.log("Uploading audio to Firebase for Studio access...")
    const uploadResult = await uploadBase64ToFirebase(audioData)
    audioFileUrl = uploadResult.url
    firebaseFilePath = uploadResult.path
    firebaseUrl = uploadResult.url
    console.log("Using Firebase URL for transcription input:", audioFileUrl)
  }

  return { audioFileUrl, firebaseFilePath, firebaseUrl }
}

export async function POST(request: Request) {
  console.log("Transcribe function invoked.")

  let requestBody
  try {
    requestBody = await request.json()
  } catch (parseError: unknown) {
    console.error("Error parsing request body:", parseError)
    const errorMessage =
      parseError instanceof Error ? parseError.message : "Invalid JSON format"
    return NextResponse.json(
      { error: "Invalid JSON", details: errorMessage },
      { status: 400 },
    )
  }

  const { audioData, audioUrl, options = {} } = requestBody

  console.log("Request received:", {
    hasAudioData: !!audioData,
    hasAudioUrl: !!audioUrl,
    audioDataLength: audioData
      ? `${(audioData.length / 1024 / 1024).toFixed(2)}MB`
      : "N/A",
    options,
  })

  if (!audioData && !audioUrl) {
    console.error("Validation Error: No audio data or URL provided.")
    return NextResponse.json(
      { error: "No audio data or URL provided" },
      { status: 400 },
    )
  }

  try {
    // Process audio input
    const { audioFileUrl, firebaseFilePath, firebaseUrl } = await prepareAudioInput(
      audioData,
      audioUrl,
    )

    if (!audioFileUrl) {
      throw new Error("No audio URL available for transcription.")
    }

    // Build AssemblyAI params
    const transcriptionParams: TranscriptionParams = {
      audio_url: audioFileUrl,
      speech_models: ["universal-3-pro", "universal-2"],
    }

    // Diarization is native in AssemblyAI — no HuggingFace token needed
    if (options.diarize) {
      transcriptionParams.speaker_labels = true
    }

    // Language: auto-detect or specific code
    if (options.language && options.language !== "auto") {
      transcriptionParams.language_code = options.language
    } else {
      transcriptionParams.language_detection = true
    }

    // AI Intelligence features — opt-in per user selection
    const aiFeatures = options.aiFeatures || {}

    if (aiFeatures.autoChapters) {
      transcriptionParams.auto_chapters = true
    }
    if (aiFeatures.summarization) {
      transcriptionParams.summarization = true
      transcriptionParams.summary_model = "informative"
      transcriptionParams.summary_type = "bullets"
    }
    if (aiFeatures.sentimentAnalysis) {
      transcriptionParams.sentiment_analysis = true
    }
    if (aiFeatures.entityDetection) {
      transcriptionParams.entity_detection = true
    }
    if (aiFeatures.keyPhrases) {
      transcriptionParams.auto_highlights = true
    }
    if (aiFeatures.contentModeration) {
      transcriptionParams.content_safety = true
    }
    if (aiFeatures.topicDetection) {
      transcriptionParams.iab_categories = true
    }

    console.log("Starting AssemblyAI transcription...")
    console.log("Transcription params:", JSON.stringify(transcriptionParams, null, 2))

    const transcriptionData = await startAssemblyAITranscription(transcriptionParams)

    // Build response matching shape client expects: { id, status, ... }
    const responseData: Record<string, unknown> = {
      id: transcriptionData.id,
      status: transcriptionData.status,
    }

    if (firebaseFilePath) {
      responseData.firebaseFilePath = firebaseFilePath
      console.log("Included Firebase path in response:", firebaseFilePath)
    }

    if (firebaseUrl) {
      responseData.audioUrl = firebaseUrl
      console.log("Included audio URL in response:", firebaseUrl)
    }

    console.log("Successfully initiated AssemblyAI transcription:", transcriptionData.id)
    return NextResponse.json(responseData, { status: 200 })
  } catch (error: unknown) {
    console.error("Error processing transcription request:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    const statusCode =
      errorMessage.includes("Firebase") || errorMessage.includes("AssemblyAI")
        ? 502
        : 500
    return NextResponse.json(
      {
        error: `Transcription processing failed: ${errorMessage}`,
      },
      { status: statusCode },
    )
  }
}
