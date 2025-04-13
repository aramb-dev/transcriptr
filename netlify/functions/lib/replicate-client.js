import * as dotenv from 'dotenv';
dotenv.config(); // Ensure environment variables are loaded

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
const REPLICATE_API_TOKEN = process.env.VITE_REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.error("FATAL: VITE_REPLICATE_API_TOKEN environment variable is not set.");
  // Optionally throw an error during build/startup if critical
}

/**
 * Starts a transcription prediction job on Replicate.
 * @param {object} inputParams - The input parameters for the Replicate model.
 * @param {string} modelId - The Replicate model ID (e.g., 'owner/model:version').
 * @returns {Promise<object>} - Resolves with the initial prediction response from Replicate.
 */
export async function startReplicateTranscription(inputParams, modelId) {
  if (!REPLICATE_API_TOKEN) {
    throw new Error("Replicate API token is missing.");
  }
  if (!modelId) {
    throw new Error("Replicate model ID is missing.");
  }

  const [ownerAndModel, versionHash] = modelId.split(':');
  if (!versionHash) {
     throw new Error(`Invalid Replicate model ID format: ${modelId}. Expected 'owner/model:version'.`);
  }

  const body = JSON.stringify({
    version: versionHash,
    input: inputParams,
  });

  console.log("Calling Replicate API with input type:",
    inputParams.audio
      ? (typeof inputParams.audio === 'string' && inputParams.audio.startsWith('http') ? 'URL' : 'base64_data')
      : 'none'
  );
   // console.log("Replicate Request Body:", body); // Be cautious logging potentially large base64 data

  try {
    const response = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: body,
    });

    let responseData;
    try {
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
         // Try to get error details from response body
         let errorDetails = `Status code: ${response.status}`;
         try {
            const errorJson = await response.json();
            errorDetails = JSON.stringify(errorJson.detail || errorJson);
         } catch (e) {
            // If parsing error response fails, use text
            errorDetails = await response.text();
         }
         console.error(`Replicate API error (${response.status}): ${errorDetails}`);
         throw new Error(`Replicate API request failed: ${errorDetails}`);
      }
      responseData = await response.json();
    } catch (jsonError) {
      console.error("Error parsing Replicate API response:", jsonError);
      // Throw a more specific error if JSON parsing fails on a successful response (unlikely but possible)
      if (response.ok) {
          throw new Error("Failed to parse successful Replicate API response.");
      }
      // Re-throw the original error if response was not ok
      throw jsonError;
    }

    console.log("Replicate API initial response received:", responseData.id); // Log prediction ID
    return responseData;

  } catch (error) {
    console.error('Error calling Replicate API:', error);
    // Re-throw the error to be caught by the handler
    throw new Error(`Replicate API interaction failed: ${error.message}`);
  }
}
