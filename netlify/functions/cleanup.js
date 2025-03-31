import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { getFirebaseConfig } from './firebase-config.js';
dotenv.config();

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { filePath } = JSON.parse(event.body);

    if (!filePath) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing file path' })
      };
    }

    // Initialize Firebase
    const app = initializeApp(getFirebaseConfig());
    const storage = getStorage(app);

    // Create a reference to the file
    const fileRef = ref(storage, filePath);

    // Delete the file
    await deleteObject(fileRef);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File deleted successfully' })
    };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Unknown error' })
    };
  }
}