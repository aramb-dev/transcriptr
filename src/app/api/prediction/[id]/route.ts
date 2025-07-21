import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const predictionId = id;

  if (!predictionId) {
    return NextResponse.json(
      { error: "Missing prediction ID" },
      { status: 400 },
    );
  }

  try {
    console.log(`Checking prediction status for ID: ${predictionId}`);

    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        `Error checking prediction status: ${response.status}`,
        data,
      );
      return NextResponse.json(
        {
          error: `Error checking prediction: ${response.status}`,
          details: data,
        },
        { status: response.status },
      );
    }

    console.log(`Prediction ${predictionId} status: ${data.status}`);
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error("Error checking prediction:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
