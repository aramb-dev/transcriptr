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
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { audioData, audioUrl, options } = JSON.parse(event.body);

    // Format input parameters
    const inputParams = {
      task: options.task || 'transcribe',
      batch_size: options.batch_size || 64,
      return_timestamps: options.return_timestamps || true,
      diarize: options.diarize || false,
    };

    // Set audio source - check file size by base64 length
    let finalAudioUrl = audioUrl;

    // If no URL is provided but we have base64 data, check if it's large
    if (!audioUrl && audioData) {
      // Estimate size of base64 (rough estimate: base64 size * 0.75 = binary size)
      const estimatedSizeInMB = (audioData.length * 0.75) / (1024 * 1024);

      if (estimatedSizeInMB > 1) {
        // Large file detected, upload to Firebase
        console.log(`Large audio file detected (${estimatedSizeInMB.toFixed(2)}MB), uploading to Firebase`);
        const uploadResult = await uploadBase64ToFirebase(audioData);
        finalAudioUrl = uploadResult.url;
        console.log('Uploaded to Firebase, URL:', finalAudioUrl);
      } else {
        // Small file, use base64 directly
        inputParams.audio = audioData;
      }
    }

    // If we have a URL (either provided or from Firebase upload), use it
    if (finalAudioUrl) {
      inputParams.audio = finalAudioUrl;
    }

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

    // If we used Firebase, include the reference in the response for later cleanup
    if (finalAudioUrl && finalAudioUrl !== audioUrl) {
      data.firebaseRef = `Used Firebase Storage for large file`;
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error in transcribe function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Unknown error' })
    };
  }
}