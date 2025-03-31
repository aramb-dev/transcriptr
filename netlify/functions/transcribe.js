import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseConfig } from './firebase-config.js';
dotenv.config();

// Initialize Firebase when needed
let firebaseApp;
let storage;

function initializeFirebase() {
  if (!firebaseApp) {
    firebaseApp = initializeApp(getFirebaseConfig());
    storage = getStorage(firebaseApp);
  }
  return { firebaseApp, storage };
}

// Generate a unique filename with timestamp and random string
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileExtension = originalName?.split('.').pop() || 'audio';
  return `audio_${timestamp}_${randomString}.${fileExtension}`;
};

// Function to upload base64 data to Firebase Storage
async function uploadBase64ToFirebase(base64Data, mimeType = 'audio/mpeg') {
  const { storage } = initializeFirebase();

  // Strip the data URL prefix if present
  const base64WithoutPrefix = base64Data.replace(/^data:.*;base64,/, '');

  // Convert base64 to a Blob
  const byteCharacters = atob(base64WithoutPrefix);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: mimeType });

  // Create a reference with a unique filename
  const filename = generateUniqueFilename('upload');
  const fileRef = ref(storage, `temp_audio/${filename}`);

  // Upload the blob
  const snapshot = await uploadBytes(fileRef, blob);
  console.log('Uploaded a blob to Firebase Storage');

  // Get download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  return { url: downloadURL, ref: `temp_audio/${filename}` };
}

export async function handler(event, context) {
  console.log("Transcribe function called, event size:", event.body.length);

  // Check if body is too large
  if (event.body.length > 5 * 1024 * 1024) {
    console.log("Request body is too large:", (event.body.length / 1024 / 1024).toFixed(2) + "MB");
    return {
      statusCode: 413,
      body: JSON.stringify({
        error: "Request body too large",
        details: "Please upload large files to storage first and provide a URL"
      })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const { audioData, audioUrl, options } = requestBody;

    console.log("Request received:", {
      hasAudioData: !!audioData,
      hasAudioUrl: !!audioUrl,
      audioDataLength: audioData ? `${(audioData.length / 1024 / 1024).toFixed(2)}MB` : "N/A",
      options
    });

    // Format input parameters
    const inputParams = {
      task: options.task || 'transcribe',
      batch_size: options.batch_size || 64,
      return_timestamps: options.return_timestamps || true,
      diarize: options.diarize || false,
    };

    // Check if we received a URL or base64 data
    if (audioUrl) {
      console.log("Using provided audio URL");
      inputParams.audio = audioUrl;
    } else if (audioData) {
      // Check if the base64 data is too large
      const estimatedSizeInMB = (audioData.length * 0.75) / (1024 * 1024);

      console.log(`Estimated audio size: ${estimatedSizeInMB.toFixed(2)}MB`);

      if (estimatedSizeInMB > 1) {
        // Large file, upload to Firebase
        console.log("Base64 data is large, uploading to Firebase");
        const uploadResult = await uploadBase64ToFirebase(audioData);
        inputParams.audio = uploadResult.url;
        console.log("Uploaded to Firebase, using URL");
      } else {
        // Small file, use base64 directly
        console.log("Using base64 data directly");
        inputParams.audio = audioData;
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No audio data or URL provided' })
      };
    }

    // Only include language if it's not "None" (auto-detect)
    if (options.language !== "None") {
      inputParams.language = options.language;
    }

    // Extract version hash from modelId
    const [ownerAndModel, versionHash] = options.modelId.split(':');

    console.log("Calling Replicate API with input:", { ...inputParams, audio: inputParams.audio ? (typeof inputParams.audio === 'string' && inputParams.audio.startsWith('http') ? inputParams.audio : 'base64_data') : 'none' });

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
      console.error("Replicate API error:", response.status, data);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: `Replicate API error: ${response.status}`,
          details: data
        })
      };
    }

    console.log("Replicate API response:", data);

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (parseError) {
    console.error("Error parsing request body:", parseError);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Invalid JSON",
        details: parseError.message
      })
    };
  } catch (error) {
    console.error('Error in transcribe function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Unknown error' })
    };
  }
}