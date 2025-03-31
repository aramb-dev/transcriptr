import * as dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseConfig } from './firebase-config.js';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import fetch from 'node-fetch';

dotenv.config();

// Initialize Firebase for storage
const firebaseApp = initializeApp(getFirebaseConfig());
const storage = getStorage(firebaseApp);

// Generate a unique filename with timestamp and random string
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileExtension = originalName?.split('.').pop() || 'audio';
  return `audio_${timestamp}_${randomString}`;
};

// Function to download file from URL
async function downloadFile(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(buffer));
  return outputPath;
}

// Convert audio file to MP3 using ffmpeg (requires ffmpeg to be installed)
async function convertToMp3(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    // Check if we're running on Netlify Functions (which has ffmpeg installed)
    const ffmpegProcess = spawn('ffmpeg', [
      '-i', inputPath,
      '-vn',
      '-ar', '44100',
      '-ac', '2',
      '-b:a', '192k',
      '-f', 'mp3',
      outputPath
    ]);

    let errorOutput = '';
    ffmpegProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}: ${errorOutput}`));
      }
    });
  });
}

// Upload a file to Firebase Storage
async function uploadToFirebase(filePath, fileName, contentType) {
  const fileData = await fs.readFile(filePath);
  const storageFileName = `${fileName}.mp3`;
  const storagePath = `temp_audio/${storageFileName}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, fileData, {
    contentType: 'audio/mpeg'
  });

  const downloadURL = await getDownloadURL(storageRef);
  return {
    url: downloadURL,
    path: storagePath
  };
}

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let tempDir = null;

  try {
    const { audioUrl, fileName, fileType } = JSON.parse(event.body);

    if (!audioUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No audio URL provided' })
      };
    }

    // Create a temporary directory for processing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'audio-conversion-'));
    const originalFileName = fileName || 'audio';
    const fileBaseName = generateUniqueFilename(originalFileName);

    // Setup file paths
    const inputExtension = path.extname(originalFileName) || '.m4a';
    const inputPath = path.join(tempDir, `input${inputExtension}`);
    const outputPath = path.join(tempDir, 'output.mp3');

    console.log(`Downloading file from ${audioUrl} to ${inputPath}`);
    await downloadFile(audioUrl, inputPath);

    console.log(`Converting ${inputPath} to MP3 format`);
    await convertToMp3(inputPath, outputPath);

    console.log(`Uploading converted file to Firebase`);
    const uploadResult = await uploadToFirebase(outputPath, fileBaseName, 'audio/mpeg');

    console.log(`Conversion complete, URL: ${uploadResult.url}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: uploadResult.url,
        path: uploadResult.path,
        message: 'Audio converted successfully'
      })
    };
  } catch (error) {
    console.error('Error converting audio:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to convert audio',
        details: error.message,
        stack: error.stack
      })
    };
  } finally {
    // Clean up temporary files
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Error cleaning up temporary files:', cleanupError);
      }
    }
  }
}