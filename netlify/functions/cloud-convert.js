import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseConfig } from './firebase-config.js';

dotenv.config();

// Initialize Firebase
const firebaseApp = initializeApp(getFirebaseConfig());
const storage = getStorage(firebaseApp);

// Generate a unique filename
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `audio_${timestamp}_${randomString}`;
};

// CloudConvert API direct implementation without SDK
async function convertWithCloudConvert(inputUrl, inputFormat, outputFormat = 'mp3') {
  console.log(`Creating CloudConvert job for ${inputUrl} (${inputFormat} to ${outputFormat})`);

  // Step 1: Create a new job
  const createJobResponse = await fetch('https://api.cloudconvert.com/v2/jobs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VITE_CLOUDCONVERT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tasks: {
        'import-1': {
          operation: 'import/url',
          url: inputUrl
        },
        'convert-1': {
          operation: 'convert',
          input: 'import-1',
          output_format: outputFormat,
          input_format: inputFormat,
          engine: 'ffmpeg',
          audio_codec: 'mp3',
          audio_bitrate: '192'
        },
        'export-1': {
          operation: 'export/url',
          input: 'convert-1',
          inline: true,
          archive_multiple_files: false
        }
      }
    })
  });

  if (!createJobResponse.ok) {
    const errorData = await createJobResponse.json();
    console.error('Error creating CloudConvert job:', errorData);
    throw new Error(`Failed to create conversion job: ${errorData.message || createJobResponse.statusText}`);
  }

  const job = await createJobResponse.json();
  const jobId = job.data.id;
  console.log(`CloudConvert job created with ID: ${jobId}`);

  // Step 2: Wait for the job to complete (poll status)
  let jobStatus = 'waiting';
  let resultData = null;
  let retries = 0;
  const maxRetries = 30; // Maximum 5 minutes (10s * 30)

  while (jobStatus !== 'finished' && jobStatus !== 'error' && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds between checks

    console.log(`Checking job status (attempt ${retries + 1})...`);
    const statusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.VITE_CLOUDCONVERT_API_KEY}`
      }
    });

    if (!statusResponse.ok) {
      const errorData = await statusResponse.json();
      console.error('Error checking job status:', errorData);
      throw new Error(`Failed to check job status: ${errorData.message || statusResponse.statusText}`);
    }

    const statusData = await statusResponse.json();
    jobStatus = statusData.data.status;
    console.log(`Job status: ${jobStatus}`);

    // Check if tasks are complete
    if (jobStatus === 'finished') {
      // Find the export task
      const exportTask = statusData.data.tasks.find(task => task.name.startsWith('export'));
      if (exportTask && exportTask.status === 'finished' && exportTask.result && exportTask.result.files) {
        resultData = exportTask.result.files[0];
        console.log(`Conversion successful, download URL: ${resultData.url}`);
      } else {
        throw new Error('Export task did not complete successfully');
      }
    } else if (jobStatus === 'error') {
      const failedTask = statusData.data.tasks.find(task => task.status === 'error');
      throw new Error(`Conversion failed: ${failedTask ? failedTask.message : 'Unknown error'}`);
    }

    retries++;
  }

  if (retries >= maxRetries) {
    throw new Error('Job timed out - took too long to complete');
  }

  if (!resultData || !resultData.url) {
    throw new Error('No result file URL found in job response');
  }

  return resultData.url;
}

// Upload a file to Firebase
async function uploadToFirebase(fileUrl, fileName) {
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
    console.log(`Uploading to Firebase Storage at path: ${storagePath}`);
    await uploadBytes(storageRef, fileData, {
      contentType: 'audio/mpeg'
    });

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log(`Firebase upload complete: ${downloadURL}`);

    return {
      url: downloadURL,
      path: storagePath
    };
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    throw error;
  }
}

export async function handler(event, context) {
  console.log("CloudConvert function called");
  console.log("API Key present:", !!process.env.VITE_CLOUDCONVERT_API_KEY);

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

    console.log(`Starting conversion process for: ${fileName || 'unnamed file'} (${fileType || 'unknown type'})`);

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

    console.log(`Using input format: ${inputFormat}`);

    // Use the CloudConvert API directly
    const convertedFileUrl = await convertWithCloudConvert(audioUrl, inputFormat);

    // Generate a unique name for the final file
    const outputFileName = generateUniqueFilename(fileName || 'converted-audio');

    // Upload the converted file to Firebase
    const uploadResult = await uploadToFirebase(convertedFileUrl, outputFileName);

    console.log('Conversion workflow complete, returning file URL:', uploadResult.url);

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