import { NextResponse } from "next/server"
import { uploadBase64ToFirebase } from "@/lib/firebase-utils"
import { assemblyai } from "@/lib/assemblyai-client"
import type { TranscriptParams } from "assemblyai"

// Helper to prepare audio input for the transcription service
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
    const { audioFileUrl, firebaseFilePath, firebaseUrl } = await prepareAudioInput(
      audioData,
      audioUrl,
    )

    if (!audioFileUrl) {
      throw new Error("No audio URL available for transcription.")
    }

    // Build AssemblyAI params using the SDK types
    const params: TranscriptParams = {
      audio_url: audioFileUrl,
      speech_models: ["universal-3-pro", "universal-2"],
    }

    if (options.diarize) {
      params.speaker_labels = true
    }

    if (options.language && options.language !== "auto") {
      params.language_code = options.language
    } else {
      params.language_detection = true
    }

    // AI Intelligence features — opt-in, mutually exclusive where noted
    const aiFeatures = options.aiFeatures || {}

    // auto_chapters and summarization are mutually exclusive in AssemblyAI
    if (aiFeatures.autoChapters) {
      params.auto_chapters = true
    } else if (aiFeatures.summarization) {
      params.summarization = true
      params.summary_model = "informative"
      params.summary_type = "bullets"
    }
    if (aiFeatures.sentimentAnalysis) {
      params.sentiment_analysis = true
    }
    if (aiFeatures.entityDetection) {
      params.entity_detection = true
    }
    if (aiFeatures.keyPhrases) {
      params.auto_highlights = true
    }
    if (aiFeatures.contentModeration) {
      params.content_safety = true
    }
    if (aiFeatures.topicDetection) {
      params.iab_categories = true
    }

    console.log("Starting AssemblyAI transcription via SDK...")
    console.log("Params:", JSON.stringify(params, null, 2))

    // submit() returns immediately with queued transcript (no polling)
    const transcript = await assemblyai.transcripts.submit(params)

    const responseData: Record<string, unknown> = {
      id: transcript.id,
      status: transcript.status,
    }

    if (firebaseFilePath) {
      responseData.firebaseFilePath = firebaseFilePath
    }
    if (firebaseUrl) {
      responseData.audioUrl = firebaseUrl
    }

    console.log("AssemblyAI transcription submitted:", transcript.id)
    return NextResponse.json(responseData, { status: 200 })
  } catch (error: unknown) {
    console.error("Error processing transcription request:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Transcription failed: ${errorMessage}` },
      { status: 502 },
    )
  }
}
