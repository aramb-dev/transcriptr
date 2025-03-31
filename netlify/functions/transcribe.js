import * as dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseConfig } from './firebase-config.js';
dotenv.config();

const firebaseApp = initializeApp(getFirebaseConfig());
const storage = getStorage(firebaseApp);

const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileExtension = originalName?.split('.').pop() || 'audio';
  return `audio_${timestamp}_${randomString}.${fileExtension}`;
};

async function uploadBase64ToFirebase(base64Data, mimeType = 'audio/mpeg') {
  try {
    const base64WithoutPrefix = base64Data.replace(/^data:.*;base64,/, '');

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

    const filename = generateUniqueFilename('upload');
    const filePath = `temp_audio/${filename}`;
    const fileRef = ref(storage, filePath);

    const snapshot = await uploadBytes(fileRef, blob);
    console.log('Uploaded a blob to Firebase Storage');

    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Firebase download URL:', downloadURL);

    return { url: downloadURL, path: filePath };
  } catch (error) {
    console.error("Firebase upload error:", error);
    throw new Error(`Firebase upload error: ${error.message}`);
  }
}

export async function handler(event, context) {
  console.log("Transcribe function called");

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid JSON",
          details: parseError.message
        })
      };
    }

    const { audioData, audioUrl, options } = requestBody;

    console.log("Request received:", {
      hasAudioData: !!audioData,
      hasAudioUrl: !!audioUrl,
      audioDataLength: audioData ? `${(audioData.length / 1024 / 1024).toFixed(2)}MB` : "N/A",
      options
    });

    const inputParams = {
      task: options.task || 'transcribe',
      batch_size: options.batch_size || 64,
      return_timestamps: options.return_timestamps || true,
      diarize: options.diarize || false,
    };

    let firebaseFilePath = null;

    if (audioUrl) {
      console.log("Using provided audio URL");
      inputParams.audio = audioUrl;
    } else if (audioData) {
      const estimatedSizeInMB = (audioData.length * 0.75) / (1024 * 1024);

      console.log(`Estimated audio size: ${estimatedSizeInMB.toFixed(2)}MB`);

      if (estimatedSizeInMB > 1) {
        console.log("Base64 data is large, uploading to Firebase");
        try {
          const uploadResult = await uploadBase64ToFirebase(audioData);
          inputParams.audio = uploadResult.url;
          firebaseFilePath = uploadResult.path;
          console.log("Uploaded to Firebase, using URL:", inputParams.audio);
        } catch (uploadError) {
          console.error("Firebase upload error:", uploadError);
          return {
            statusCode: 500,
            body: JSON.stringify({
              error: "Firebase upload error",
              details: uploadError.message
            })
          };
        }
      } else {
        console.log("Using base64 data directly");
        inputParams.audio = audioData;
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No audio data or URL provided' })
      };
    }

    if (options.language !== "None") {
      inputParams.language = options.language;
    }

    const [ownerAndModel, versionHash] = options.modelId.split(':');

    console.log("Calling Replicate API with input type:",
      inputParams.audio ?
      (typeof inputParams.audio === 'string' && inputParams.audio.startsWith('http') ?
        'URL' : 'base64_data') : 'none');

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

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error("Error parsing API response:", jsonError);
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "Error parsing API response",
          details: jsonError.message
        })
      };
    }

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

    if (firebaseFilePath) {
      data.firebaseFilePath = firebaseFilePath;
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error in transcribe function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Unknown error',
        stack: error.stack
      })
    };
  }
}