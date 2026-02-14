const ASSEMBLYAI_API_URL = "https://api.assemblyai.com/v2/transcript"
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY

if (!ASSEMBLYAI_API_KEY) {
  console.error("FATAL: ASSEMBLYAI_API_KEY environment variable is not set.")
}

interface TranscriptionParams {
  audio_url: string
  speaker_labels?: boolean
  language_detection?: boolean
  language_code?: string
}

interface TranscriptionResponse {
  id: string
  status: string
}

export async function startAssemblyAITranscription(
  params: TranscriptionParams,
): Promise<TranscriptionResponse> {
  if (!ASSEMBLYAI_API_KEY) {
    throw new Error("AssemblyAI API key is missing.")
  }

  console.log("Starting AssemblyAI transcription with params:", {
    audio_url: params.audio_url.substring(0, 80) + "...",
    speaker_labels: params.speaker_labels,
    language_detection: params.language_detection,
    language_code: params.language_code,
  })

  const response = await fetch(ASSEMBLYAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: ASSEMBLYAI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    let errorDetails = `Status code: ${response.status}`
    try {
      const errorJson = await response.json()
      errorDetails = JSON.stringify(errorJson.error || errorJson)
    } catch {
      errorDetails = await response.text()
    }
    console.error(`AssemblyAI API error (${response.status}): ${errorDetails}`)
    throw new Error(`AssemblyAI API request failed: ${errorDetails}`)
  }

  const data = await response.json()
  console.log("AssemblyAI transcription started:", data.id)
  return data as TranscriptionResponse
}
