import * as dotenv from 'dotenv';
// Firebase imports are now handled in firebase-utils.js
// Replicate fetch logic is now handled in replicate-client.js
import { uploadBase64ToFirebase } from './lib/firebase-utils.js';
import { startReplicateTranscription } from './lib/replicate-client.js';

dotenv.config();

// Default model ID, can be overridden by options
const DEFAULT_MODEL_ID = 'vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c';
const LARGE_FILE_THRESHOLD_MB = 1; // Define threshold for direct base64 vs upload

// Helper to prepare audio input for the transcription service
async function prepareAudioInput(audioData, audioUrl) {
  const inputParams = {};
  let firebaseFilePath = null;

  if (audioUrl) {
    console.log("Using provided audio URL for Replicate input.");
    inputParams.audio = audioUrl;
  } else if (audioData) {
    // Estimate size (base64 is ~4/3 * original size)
    const estimatedSizeInMB = (audioData.length * 0.75) / (1024 * 1024);
    console.log(`Estimated audio size from base64: ${estimatedSizeInMB.toFixed(2)}MB`);

    if (estimatedSizeInMB > LARGE_FILE_THRESHOLD_MB) {
      console.log("Audio data is large, uploading to Firebase...");
      const uploadResult = await uploadBase64ToFirebase(audioData);
      inputParams.audio = uploadResult.url;
      firebaseFilePath = uploadResult.path;
      console.log("Using Firebase URL for Replicate input:", inputParams.audio);
    } else {
      console.log("Using base64 data directly for Replicate input.");
      inputParams.audio = audioData;
    }
  }

  return { inputParams, firebaseFilePath };
}

export async function handler(event, context) {
  console.log("Transcribe function invoked.");

  if (event.httpMethod !== 'POST') {
    console.warn("Method not allowed:", event.httpMethod);
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
  } catch (parseError) {
    console.error("Error parsing request body:", parseError);
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON", details: parseError.message }) };
  }

  const { audioData, audioUrl, options = {} } = requestBody;

  console.log("Request received:", {
    hasAudioData: !!audioData,
    hasAudioUrl: !!audioUrl,
    audioDataLength: audioData ? `${(audioData.length / 1024 / 1024).toFixed(2)}MB` : "N/A",
    options
  });

  if (!audioData && !audioUrl) {
    console.error("Validation Error: No audio data or URL provided.");
    return { statusCode: 400, body: JSON.stringify({ error: 'No audio data or URL provided' }) };
  }

  try {
    // Set up base parameters
    const transcriptionParams = {
      task: options.task || 'transcribe',
      batch_size: options.batch_size || 8,
      return_timestamps: options.return_timestamps !== undefined ? options.return_timestamps : true,
      diarize: options.diarize || false,
    };

    // Process audio input
    const { inputParams, firebaseFilePath } = await prepareAudioInput(audioData, audioUrl);
    Object.assign(transcriptionParams, inputParams);

    // Add language if specified and not "None"
    if (options.language && options.language !== "None") {
      transcriptionParams.language = options.language;
    }

    // Determine model ID and start prediction
    const modelId = options.modelId || DEFAULT_MODEL_ID;
    console.log(`Starting Replicate prediction with model: ${modelId}`);
    const predictionData = await startReplicateTranscription(transcriptionParams, modelId);

    // Add firebase path to response if a file was uploaded
    if (firebaseFilePath) {
      predictionData.firebaseFilePath = firebaseFilePath;
      console.log("Included Firebase path in response:", firebaseFilePath);
    }

    console.log("Successfully initiated Replicate prediction:", predictionData.id);
    return {
      statusCode: 200,
      body: JSON.stringify(predictionData)
    };

  } catch (error) {
    console.error('Error processing transcription request:', error);
    const statusCode = error.message.includes("Firebase") || error.message.includes("Replicate") ? 502 : 500;
    return {
      statusCode: statusCode,
      body: JSON.stringify({
        error: `Transcription processing failed: ${error.message}`
      })
    };
  }
}