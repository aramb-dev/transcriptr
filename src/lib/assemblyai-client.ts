import { AssemblyAI } from "assemblyai"

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY

if (!ASSEMBLYAI_API_KEY) {
  console.error("FATAL: ASSEMBLYAI_API_KEY environment variable is not set.")
}

export const assemblyai = new AssemblyAI({
  apiKey: ASSEMBLYAI_API_KEY || "",
})
