export interface TranscriptionWord {
  word: string
  start: number
  end: number
  confidence?: number
  speaker?: string
}

export interface TranscriptionSegment {
  id: number
  start: number
  end: number
  text: string
  speaker?: string
  words?: TranscriptionWord[]
  tokens?: number[]
  avg_logprob?: number
  temperature?: number
  no_speech_prob?: number
  compression_ratio?: number
}

export interface Chapter {
  gist: string
  headline: string
  summary: string
  start: number
  end: number
}

export interface SentimentResult {
  text: string
  start: number
  end: number
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE"
  confidence: number
  speaker: string | null
}

export interface Entity {
  entityType: string
  text: string
  start: number
  end: number
}

export interface KeyPhrase {
  text: string
  count: number
  rank: number
  timestamps: { start: number, end: number }[]
}

export interface ContentSafety {
  results: unknown[]
  summary: Record<string, unknown>
}

export interface Topics {
  results: unknown[]
  summary: Record<string, unknown>
}

export interface TranscriptionIntelligence {
  chapters?: Chapter[]
  summary?: string
  sentimentAnalysis?: SentimentResult[]
  entities?: Entity[]
  keyPhrases?: KeyPhrase[]
  contentSafety?: ContentSafety
  topics?: Topics
}

export interface TranscriptionOutput {
  segments: TranscriptionSegment[]
  detected_language: string | null
  intelligence?: TranscriptionIntelligence
}
