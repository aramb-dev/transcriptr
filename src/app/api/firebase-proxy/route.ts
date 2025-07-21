import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the URL from the request body
    const body = await request.json();
    const { url } = body;

    if (!url || !url.includes("firebasestorage.googleapis.com")) {
      return NextResponse.json(
        { error: "Invalid or missing Firebase Storage URL" },
        { status: 400 },
      );
    }

    console.log(`Proxying request to Firebase Storage: ${url}`);

    // Fetch the content from Firebase Storage
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Firebase Storage error: ${response.status}`,
          message: await response.text(),
        },
        { status: response.status },
      );
    }

    // Get the file content as buffer
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type");

    // Return the file content
    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  } catch (error: unknown) {
    console.error("Error proxying Firebase Storage request:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
