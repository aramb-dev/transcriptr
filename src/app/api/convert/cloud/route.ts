import { NextResponse } from "next/server";

// Replace the function with a simpler version that returns an informative message
export async function POST() {
  return NextResponse.json(
    {
      error: "Feature not available",
      message:
        "Audio format conversion is currently under development. Please convert your file to MP3, WAV, or FLAC format before uploading.",
      supportedFormats: ["mp3", "wav", "flac", "ogg"],
    },
    { status: 501 },
  );
}
