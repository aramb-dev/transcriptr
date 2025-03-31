import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Size threshold for using Firebase Storage (in MB)
const LARGE_FILE_THRESHOLD = parseInt(import.meta.env.VITE_LARGE_FILE_THRESHOLD || '1', 10);

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

export const uploadLargeFile = async (file: File): Promise<{ url: string, path: string }> => {
  try {
    // Create a unique filename to avoid collisions
    const filename = generateUniqueFilename(file.name);
    const filePath = `temp_audio/${filename}`;
    const storageRef = ref(storage, filePath);

    // Upload file to Firebase Storage
    const snapshot = await uploadBytes(storageRef, file);
    console.log('File uploaded successfully:', snapshot.metadata.name);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { url: downloadURL, path: filePath };
  } catch (error) {
    console.error('Error uploading file to Firebase:', error);
    throw new Error('Failed to upload large audio file');
  }
};

export const deleteFile = async (path: string): Promise<void> => {
  try {
    // Check if we got a full URL or just a path
    let filePath = path;

    // If it's a URL, try to extract the path
    if (path.startsWith('http')) {
      // Try to convert URL to storage path - this is tricky and implementation depends on URL format
      // For simplicity, if path contains 'temp_audio/', extract that part and everything after
      const match = path.match(/temp_audio\/.+/);
      if (match) {
        filePath = match[0];
      } else {
        console.warn('Could not extract file path from URL, using as-is:', path);
      }
    }

    // Create a reference to the file
    const fileRef = ref(storage, filePath);

    // Delete the file
    await deleteObject(fileRef);
    console.log('File deleted successfully:', filePath);
  } catch (error) {
    console.error('Error deleting file from Firebase:', error);
    // Continue even if deletion fails (we'll rely on Firebase lifecycle rules as backup)
  }
};