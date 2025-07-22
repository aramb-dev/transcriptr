import { NextRequest, NextResponse } from "next/server";
import CloudConvert from "cloudconvert";

// Initialize CloudConvert client
const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY!);

interface ConversionRequest {
  fileUrl: string;
  originalFormat: string;
  targetFormat?: string;
}

interface ConversionResponse {
  success: boolean;
  convertedUrl?: string;
  error?: string;
  jobId?: string;
  originalFormat?: string;
  targetFormat?: string;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ConversionResponse>> {
  try {
    console.log("CloudConvert conversion request received");

    // Validate API key
    if (!process.env.CLOUDCONVERT_API_KEY) {
      console.error("CLOUDCONVERT_API_KEY not found in environment variables");
      return NextResponse.json(
        {
          success: false,
          error: "CloudConvert API key not configured",
        },
        { status: 500 },
      );
    }

    // Parse request body
    const body: ConversionRequest = await request.json();
    const { fileUrl, originalFormat, targetFormat = "mp3" } = body;

    // Validate required fields
    if (!fileUrl || !originalFormat) {
      console.error("Missing required fields:", {
        fileUrl: !!fileUrl,
        originalFormat: !!originalFormat,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: fileUrl and originalFormat",
        },
        { status: 400 },
      );
    }

    console.log(`Starting conversion: ${originalFormat} → ${targetFormat}`, {
      fileUrl,
    });

    // Create CloudConvert job with import, convert, and export tasks
    const job = await cloudConvert.jobs.create({
      tasks: {
        "import-file": {
          operation: "import/url",
          url: fileUrl,
          filename: `input.${originalFormat}`,
        },
        "convert-file": {
          operation: "convert",
          input: "import-file",
          output_format: targetFormat,
          audio_codec: "mp3",
          audio_bitrate: 128,
        },
        "export-file": {
          operation: "export/url",
          input: "convert-file",
          inline: false,
          archive_multiple_files: false,
        },
      },
      tag: "transcriptr-audio-conversion",
    });

    console.log(`CloudConvert job created: ${job.id}`);

    // Wait for job completion
    const completedJob = await cloudConvert.jobs.wait(job.id);

    if (completedJob.status === "finished") {
      // Get the export task to retrieve the converted file URL
      const exportTask = completedJob.tasks?.find(
        (task) => task.name === "export-file",
      );

      if (exportTask?.result?.files?.[0]?.url) {
        const convertedUrl = exportTask.result.files[0].url;
        console.log(`Conversion successful: ${convertedUrl}`);

        return NextResponse.json({
          success: true,
          convertedUrl,
          jobId: job.id,
          originalFormat,
          targetFormat,
        });
      } else {
        console.error("Export task did not produce a valid file URL", {
          exportTask,
        });
        return NextResponse.json(
          {
            success: false,
            error: "Conversion completed but no output file was generated",
            jobId: job.id,
          },
          { status: 500 },
        );
      }
    } else {
      console.error(
        `CloudConvert job failed with status: ${completedJob.status}`,
        {
          jobId: job.id,
          tasks: completedJob.tasks?.map((task) => ({
            name: task.name,
            status: task.status,
            message: task.message,
          })),
        },
      );

      return NextResponse.json(
        {
          success: false,
          error: `Conversion failed: ${completedJob.status}`,
          jobId: job.id,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("CloudConvert conversion error:", error);

    // Handle specific CloudConvert errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: `Conversion service error: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unknown conversion error occurred",
      },
      { status: 500 },
    );
  }
}

// GET endpoint to check CloudConvert service health
export async function GET(): Promise<NextResponse> {
  try {
    if (!process.env.CLOUDCONVERT_API_KEY) {
      return NextResponse.json(
        {
          status: "error",
          message: "CloudConvert API key not configured",
        },
        { status: 500 },
      );
    }

    // Simple health check - verify we can authenticate
    const user = await cloudConvert.users.me();

    return NextResponse.json({
      status: "healthy",
      service: "CloudConvert",
      user: user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("CloudConvert health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "CloudConvert service unavailable",
      },
      { status: 500 },
    );
  }
}
