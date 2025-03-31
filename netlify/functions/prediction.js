import * as dotenv from 'dotenv';

dotenv.config();

export async function handler(event, context) {
  const predictionId = event.path.split('/').pop();

  if (!predictionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing prediction ID' })
    };
  }

  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${process.env.VITE_REPLICATE_API_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: `Error checking prediction: ${response.status}`,
          details: data
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Unknown error' })
    };
  }
}