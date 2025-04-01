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

// Similar to cloud-convert.js, replace with a simpler version
export async function handler(event, context) {
  return {
    statusCode: 501,
    body: JSON.stringify({
      error: 'Feature not available',
      message: 'Audio format conversion is currently under development. Please convert your file to MP3, WAV, or FLAC format before uploading.',
      supportedFormats: ['mp3', 'wav', 'flac', 'ogg']
    })
  };
}