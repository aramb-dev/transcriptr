import { NextResponse } from 'next/server';

export async function GET(
  { params }: { params: { id: string } }
) {
  const predictionId = params.id;

  if (!predictionId) {
    return NextResponse.json({ error: 'Missing prediction ID' }, { status: 400 });
  }

  try {
    console.log(`Checking prediction status for ID: ${predictionId}`);

    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Error checking prediction status: ${response.status}`, data);
      return NextResponse.json({
        error: `Error checking prediction: ${response.status}`,
        details: data
      }, { status: response.status });
    }

    console.log(`Prediction ${predictionId} status: ${data.status}`);
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error checking prediction:', error);
    return NextResponse.json({
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
