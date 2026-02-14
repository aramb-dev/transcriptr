import { NextRequest, NextResponse } from "next/server"
import { assemblyai } from "@/lib/assemblyai-client"

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

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!id) {
    return NextResponse.json(
      { error: "Missing prediction ID" },
      { status: 400 },
    )
  }

  try {
    console.log(`Checking transcription status for ID: ${id}`)

    const transcript = await assemblyai.transcripts.get(id)
    const mappedStatus = mapStatus(transcript.status)
    console.log(`Transcription ${id} status: ${transcript.status} -> ${mappedStatus}`)

    const result: Record<string, unknown> = {
      id,
      status: mappedStatus,
    }

    if (mappedStatus === "failed") {
      result.error = transcript.error || "Unknown transcription error"
    }

    if (mappedStatus === "succeeded") {
      // Build segments from utterances (diarization) or sentences
      let segments: {
        start: number
        end: number
        text: string
        speaker?: string
        words?: { word: string; start: number; end: number }[]
      }[]

      if (transcript.utterances && transcript.utterances.length > 0) {
        // Diarization was enabled — use utterances for speaker-labeled segments
        segments = transcript.utterances.map((u) => ({
          start: u.start / 1000,
          end: u.end / 1000,
          text: u.text,
          speaker: u.speaker,
          words: u.words?.map((w) => ({
            word: w.text,
            start: w.start / 1000,
            end: w.end / 1000,
          })) || [],
        }))
      } else {
        // No diarization — fetch sentences via SDK
        try {
          const sentencesResponse = await assemblyai.transcripts.sentences(id)
          segments = sentencesResponse.sentences.map((s) => ({
            start: s.start / 1000,
            end: s.end / 1000,
            text: s.text,
            words: s.words?.map((w) => ({
              word: w.text,
              start: w.start / 1000,
              end: w.end / 1000,
            })) || [],
          }))
        } catch (sentenceError) {
          console.error("Error fetching sentences:", sentenceError)
          segments = [{
            start: 0,
            end: (transcript.audio_duration || 0),
            text: transcript.text || "",
          }]
        }
      }

      // Extract AI intelligence data
      const intelligence: Record<string, unknown> = {}

      if (transcript.chapters && Array.isArray(transcript.chapters)) {
        intelligence.chapters = transcript.chapters.map((ch) => ({
          gist: ch.gist,
          headline: ch.headline,
          summary: ch.summary,
          start: ch.start / 1000,
          end: ch.end / 1000,
        }))
      }

      if (transcript.summary) {
        intelligence.summary = transcript.summary
      }

      if (transcript.sentiment_analysis_results && Array.isArray(transcript.sentiment_analysis_results)) {
        intelligence.sentimentAnalysis = transcript.sentiment_analysis_results.map((s) => ({
          text: s.text,
          start: s.start / 1000,
          end: s.end / 1000,
          sentiment: s.sentiment,
          confidence: s.confidence,
          speaker: s.speaker || null,
        }))
      }

      if (transcript.entities && Array.isArray(transcript.entities)) {
        intelligence.entities = transcript.entities.map((e) => ({
          entityType: e.entity_type,
          text: e.text,
          start: e.start / 1000,
          end: e.end / 1000,
        }))
      }

      if (transcript.auto_highlights_result?.results && Array.isArray(transcript.auto_highlights_result.results)) {
        intelligence.keyPhrases = transcript.auto_highlights_result.results.map((h) => ({
          text: h.text,
          count: h.count,
          rank: h.rank,
          timestamps: (h.timestamps || []).map((t) => ({
            start: t.start / 1000,
            end: t.end / 1000,
          })),
        }))
      }

      if (transcript.content_safety_labels) {
        intelligence.contentSafety = {
          results: transcript.content_safety_labels.results || [],
          summary: transcript.content_safety_labels.summary || {},
        }
      }

      if (transcript.iab_categories_result) {
        intelligence.topics = {
          results: transcript.iab_categories_result.results || [],
          summary: transcript.iab_categories_result.summary || {},
        }
      }

      result.output = {
        segments,
        detected_language: transcript.language_code || null,
        intelligence: Object.keys(intelligence).length > 0 ? intelligence : undefined,
      }
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: unknown) {
    console.error("Error checking transcription:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    )
  }
}
