
import dotenv from 'dotenv';
dotenv.config();

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { audioData, options } = JSON.parse(event.body);

    // Format input parameters like in your server
    const inputParams = {
      task: options.task || 'transcribe',
      audio: audioData,
      batch_size: options.batch_size || 64,
      return_timestamps: options.return_timestamps || true,
      diarize: options.diarize || false,
    };

    // Only include language if it's not "None" (auto-detect)
    if (options.language !== "None") {
      inputParams.language = options.language;
    }

    // Extract version hash from modelId
    const [ownerAndModel, versionHash] = options.modelId.split(':');

    // Call Replicate API
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.VITE_REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: versionHash,
        input: inputParams
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: `Replicate API error: ${response.status}`,
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