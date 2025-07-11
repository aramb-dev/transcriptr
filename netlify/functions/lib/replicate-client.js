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

  const [, versionHash] = modelId.split(':');
  if (!versionHash) {
     throw new Error(`Invalid Replicate model ID format: ${modelId}. Expected 'owner/model:version'.`);
  }

  // Start with the provided batch size or default to 8 if not specified
  const initialBatchSize = inputParams.batch_size || 8;
  let currentBatchSize = initialBatchSize;
  let maxRetries = 3; // Maximum number of retries with reduced batch size
  let retryCount = 0;
  let lastError = null;

  // Try multiple times with decreasing batch sizes
  while (retryCount <= maxRetries) {
    try {
      // Update the batch size for this attempt
      const currentParams = { ...inputParams, batch_size: currentBatchSize };

      const body = JSON.stringify({
        version: versionHash,
        input: currentParams,
      });

      console.log(`Replicate API attempt ${retryCount + 1}/${maxRetries + 1} with batch_size: ${currentBatchSize}`);
      console.log("Input type:",
        currentParams.audio
          ? (typeof currentParams.audio === 'string' && currentParams.audio.startsWith('http') ? 'URL' : 'base64_data')
          : 'none'
      );

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

          // Check if this is a CUDA out of memory error
          if (errorDetails.includes('CUDA out of memory') || errorDetails.includes('GPU memory')) {
            lastError = new Error(`Replicate API request failed: ${errorDetails}`);

            // Reduce batch size for the next attempt
            currentBatchSize = Math.max(1, Math.floor(currentBatchSize * 0.5));
            retryCount++;

            console.log(`CUDA out of memory detected. Reducing batch_size to ${currentBatchSize} and retrying...`);

            // If we still have retries left, continue to the next iteration
            if (retryCount <= maxRetries) {
              continue;
            }
          }

          throw new Error(`Replicate API request failed: ${errorDetails}`);
        }

        responseData = await response.json();
      } catch (jsonError) {
        if (jsonError.message && jsonError.message.includes('CUDA out of memory')) {
          lastError = jsonError;

          // Reduce batch size for the next attempt
          currentBatchSize = Math.max(1, Math.floor(currentBatchSize * 0.5));
          retryCount++;

          console.log(`CUDA out of memory detected. Reducing batch_size to ${currentBatchSize} and retrying...`);

          // If we still have retries left, continue to the next iteration
          if (retryCount <= maxRetries) {
            continue;
          }
        }

        console.error("Error parsing Replicate API response:", jsonError);
        // Throw a more specific error if JSON parsing fails on a successful response
        if (response.ok) {
          throw new Error("Failed to parse successful Replicate API response.");
        }
        // Re-throw the original error if response was not ok
        throw jsonError;
      }

      console.log("Replicate API initial response received:", responseData.id,
                 `(successful with batch_size=${currentBatchSize})`);
      return responseData;

    } catch (error) {
      lastError = error;

      // If this wasn't a CUDA error or we're out of retries, break the loop
      if (!error.message ||
          (!error.message.includes('CUDA out of memory') &&
           !error.message.includes('GPU memory')) ||
          retryCount >= maxRetries) {
        break;
      }

      // Otherwise the loop will continue with the next retry
    }
  }

  // If we've exhausted all retries, throw the last error
  console.error('Error calling Replicate API after all retries:', lastError);
  throw new Error(`Replicate API interaction failed after ${retryCount} retries: ${lastError.message}`);
}
