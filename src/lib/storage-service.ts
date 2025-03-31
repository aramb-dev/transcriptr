import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Size threshold for using Firebase Storage (in MB)
const LARGE_FILE_THRESHOLD = parseInt(import.meta.env.VITE_LARGE_FILE_THRESHOLD || '5', 10);

// Generate a unique filename with timestamp and random string
const generateUniqueFilename = (originalName: string) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileExtension = originalName.split('.').pop();
  return `audio_${timestamp}_${randomString}.${fileExtension}`;
};

export const isLargeFile = (file: File): boolean => {
  // Convert file size from bytes to MB
  const fileSizeInMB = file.size / (1024 * 1024);
  const threshold = parseInt(import.meta.env.VITE_LARGE_FILE_THRESHOLD || '1', 10);

  console.log(`File size: ${fileSizeInMB.toFixed(2)}MB, Threshold: ${threshold}MB`);
  return fileSizeInMB > threshold;
};

export const uploadLargeFile = async (file: File): Promise<string> => {
  try {
    // Create a unique filename to avoid collisions
    const filename = generateUniqueFilename(file.name);
    const storageRef = ref(storage, `temp_audio/${filename}`);

    // Upload file to Firebase Storage
    const snapshot = await uploadBytes(storageRef, file);
    console.log('File uploaded successfully:', snapshot.metadata.name);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file to Firebase:', error);
    throw new Error('Failed to upload large audio file');
  }
};

export const deleteFile = async (url: string): Promise<void> => {
  try {
    // Extract the file path from the URL
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file from Firebase:', error);
    // Continue even if deletion fails (we'll rely on Firebase lifecycle rules as backup)
  }
};