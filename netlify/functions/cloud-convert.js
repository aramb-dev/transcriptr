import * as dotenv from 'dotenv';
import CloudConvert from 'cloudconvert';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseConfig } from './firebase-config.js';
import fetch from 'node-fetch';

dotenv.config();

// Initialize Firebase
const firebaseApp = initializeApp(getFirebaseConfig());
const storage = getStorage(firebaseApp);

// Initialize CloudConvert
const cloudConvert = new CloudConvert(process.env.VITE_CLOUDCONVERT_API_KEY);

// Generate a unique filename
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `audio_${timestamp}_${randomString}`;
};

// Upload a file to Firebase
const uploadToFirebase = async (fileUrl, fileName) => {
  try {
    console.log('Downloading file from', fileUrl);
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const fileData = Buffer.from(buffer);

    // Create a storage reference
    const storageFileName = `${fileName}.mp3`;
    const storagePath = `temp_audio/${storageFileName}`;
    const storageRef = ref(storage, storagePath);

    // Upload to Firebase
    await uploadBytes(storageRef, fileData, {
      contentType: 'audio/mpeg'
    });

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    return {
      url: downloadURL,
      path: storagePath
    };
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    throw error;
  }
};

export async function handler(event, context) {
  console.log("CloudConvert function called");

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { audioUrl, fileName, fileType } = JSON.parse(event.body);

    if (!audioUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No audio URL provided' })
      };
    }

    console.log(`Starting CloudConvert job for ${fileName}`);

    // Determine input format from file name or file type
    let inputFormat = 'm4a';
    if (fileName) {
      const extension = fileName.split('.').pop().toLowerCase();
      if (extension) {
        inputFormat = extension;
      }
    } else if (fileType) {
      // Extract format from MIME type (e.g., 'audio/x-m4a' -> 'm4a')
      const match = fileType.match(/audio\/(?:x-)?(.+)/);
      if (match && match[1]) {
        inputFormat = match[1];
      }
    }

    console.log(`Detected input format: ${inputFormat}`);

    // Create a CloudConvert job
    const job = await cloudConvert.jobs.create({
      tasks: {
        "import-file": {
          operation: "import/url",
          url: audioUrl
        },
        "convert-file": {
          operation: "convert",
          input: "import-file",
          input_format: inputFormat,
          output_format: "mp3",
          engine: "ffmpeg",
          audio_codec: "mp3",
          audio_qscale: 0
        },
        "export-file": {
          operation: "export/url",
          input: "convert-file",
          inline: true,
          archive_multiple_files: false
        }
      }
    });

    console.log('CloudConvert job created:', job.id);

    // Wait for the job to complete
    const completedJob = await cloudConvert.jobs.wait(job.id);
    console.log('CloudConvert job completed');

    // Get the export URL from the completed job
    const exportTask = completedJob.tasks.find(task => task.operation === 'export/url');

    if (!exportTask || !exportTask.result || !exportTask.result.files || exportTask.result.files.length === 0) {
      throw new Error('No export files found in the completed job');
    }

    const exportUrl = exportTask.result.files[0].url;
    const outputFileName = generateUniqueFilename(fileName);

    console.log('Exporting file from CloudConvert:', exportUrl);

    // Upload the converted file to Firebase
    const uploadResult = await uploadToFirebase(exportUrl, outputFileName);

    console.log('Conversion complete, final URL:', uploadResult.url);

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: uploadResult.url,
        path: uploadResult.path,
        message: 'Audio converted successfully via CloudConvert'
      })
    };

  } catch (error) {
    console.error('Error in CloudConvert function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to convert audio',
        details: error.message,
        stack: error.stack
      })
    };
  }
}