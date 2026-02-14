import { NextRequest, NextResponse } from "next/server"

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY

interface RouteParams {
  params: Promise<{ id: string }>
}

// Map AssemblyAI statuses to the statuses the client expects
function mapStatus(assemblyStatus: string): string {
  switch (assemblyStatus) {
    case "queued":
      return "starting"
    case "processing":
      return "processing"
    case "completed":
      return "succeeded"
    case "error":
      return "failed"
    default:
      return assemblyStatus
  }
}

interface AssemblyAIWord {
  text: string
  start: number
  end: number
  confidence: number
  speaker?: string
}

interface AssemblyAIUtterance {
  text: string
  start: number
  end: number
  confidence: number
  speaker: string
  words: AssemblyAIWord[]
}

interface AssemblyAISentence {
  text: string
  start: number
  end: number
  confidence: number
  words: AssemblyAIWord[]
}

// Convert ms timestamps to seconds for a word array
function convertWords(words: AssemblyAIWord[]) {
  return words.map((w) => ({
    word: w.text,
    start: w.start / 1000,
    end: w.end / 1000,
  }))
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const transcriptId = id

  if (!transcriptId) {
    return NextResponse.json(
      { error: "Missing prediction ID" },
      { status: 400 },
    )
  }

  if (!ASSEMBLYAI_API_KEY) {
    return NextResponse.json(
      { error: "AssemblyAI API key not configured" },
      { status: 500 },
    )
  }

  try {
    console.log(`Checking transcription status for ID: ${transcriptId}`)

    const response = await fetch(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      {
        headers: {
          Authorization: ASSEMBLYAI_API_KEY,
        },
      },
    )

    const data = await response.json()

    if (!response.ok) {
      console.error(
        `Error checking transcription status: ${response.status}`,
        data,
      )
      return NextResponse.json(
        {
          error: `Error checking transcription: ${response.status}`,
          details: data,
        },
        { status: response.status },
      )
    }

    const mappedStatus = mapStatus(data.status)
    console.log(`Transcription ${transcriptId} status: ${data.status} -> ${mappedStatus}`)

    // Build normalized response
    const result: Record<string, unknown> = {
      id: transcriptId,
      status: mappedStatus,
    }

    if (mappedStatus === "failed") {
      result.error = data.error || "Unknown transcription error"
    }

    if (mappedStatus === "succeeded") {
      // Normalize output to match WhisperX format: { segments, detected_language }
      let segments: { start: number, end: number, text: string, speaker?: string, words?: { word: string, start: number, end: number }[] }[]

      if (data.utterances && data.utterances.length > 0) {
        // Diarization was enabled — use utterances for speaker-labeled segments
        segments = data.utterances.map((u: AssemblyAIUtterance) => ({
          start: u.start / 1000,
          end: u.end / 1000,
          text: u.text,
          speaker: u.speaker,
          words: convertWords(u.words),
        }))
      } else {
        // No diarization — fetch sentences for segment-level output
        try {
          const sentencesRes = await fetch(
            `https://api.assemblyai.com/v2/transcript/${transcriptId}/sentences`,
            {
              headers: {
                Authorization: ASSEMBLYAI_API_KEY,
              },
            },
          )

          if (sentencesRes.ok) {
            const sentencesData = await sentencesRes.json()
            segments = sentencesData.sentences.map((s: AssemblyAISentence) => ({
              start: s.start / 1000,
              end: s.end / 1000,
              text: s.text,
              words: convertWords(s.words),
            }))
          } else {
            // Fallback: single segment from full text
            segments = [{
              start: 0,
              end: (data.audio_duration || 0) / 1000,
              text: data.text || "",
            }]
          }
        } catch (sentenceError) {
          console.error("Error fetching sentences:", sentenceError)
          segments = [{
            start: 0,
            end: (data.audio_duration || 0) / 1000,
            text: data.text || "",
          }]
        }
      }

      result.output = {
        segments,
        detected_language: data.language_code || null,
      }
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: unknown) {
    console.error("Error checking transcription:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
