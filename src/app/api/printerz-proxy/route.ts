import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const requestBody = await request.json();
    const { templateId, printerzData } = requestBody;

    // Validate required fields
    if (!templateId || !printerzData) {
      return NextResponse.json(
        { error: "Missing required fields: templateId and printerzData" },
        { status: 400 },
      );
    }

    // Get API key from environment variables
    const apiKey = process.env.PRINTERZ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    console.log(`Making request to Printerz API for template: ${templateId}`);
    console.log(
      `Data size being sent: ${JSON.stringify(printerzData).length} characters`,
    );

    // Make the request to Printerz API
    const response = await fetch(
      `https://api.printerz.dev/templates/${templateId}/render`,
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(printerzData),
      },
    );

    console.log(`Printerz API response received, status: ${response.status}`);
    console.log(
      `Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`,
    );

    // If the API call failed, return the error
    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(errorText, { status: response.status });
    }

    // Get the PDF data as an ArrayBuffer
    const pdfBuffer = await response.arrayBuffer();

    // Add logging for debugging
    console.log(
      `PDF buffer received from Printerz API. Buffer length: ${pdfBuffer.byteLength}`,
    );

    if (pdfBuffer.byteLength === 0) {
      console.error("Error: Received empty PDF from Printerz API");
      return NextResponse.json(
        {
          error: "Empty PDF received from Printerz API",
          responseStatus: response.status,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          bufferSize: pdfBuffer.byteLength,
        },
        { status: 500 },
      );
    }

    // Return the PDF as binary data
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="transcription.pdf"',
      },
    });
  } catch (error: unknown) {
    console.error("Error in printerz-proxy function:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Internal Server Error", message: errorMessage },
      { status: 500 },
    );
  }
}
