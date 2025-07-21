import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  FirebaseStorage,
} from "firebase/storage";
import { getFirebaseConfig } from "@/lib/firebase";

let storage: FirebaseStorage; // Cache storage instance

const initializeFirebase = (): FirebaseStorage => {
  if (!storage) {
    const firebaseApp: FirebaseApp = initializeApp(getFirebaseConfig());
    storage = getStorage(firebaseApp);
    console.log("Firebase initialized for utils.");
  }
  return storage;
};

const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileExtension = originalName?.split(".").pop() || "audio";
  return `audio_${timestamp}_${randomString}.${fileExtension}`;
};

/**
 * Uploads base64 encoded data to Firebase Storage.
 * @param {string} base64Data - The base64 encoded data string (with or without prefix).
 * @param {string} [mimeType='audio/mpeg'] - The MIME type of the data.
 * @returns {Promise<{url: string, path: string}>} - Resolves with the download URL and storage path.
 */
export async function uploadBase64ToFirebase(
  base64Data: string,
  mimeType: string = "audio/mpeg",
): Promise<{ url: string; path: string }> {
  const storageInstance = initializeFirebase();
  try {
    const base64WithoutPrefix = base64Data.replace(/^data:.*;base64,/, "");

    // Decode base64 string to Uint8Array
    const byteCharacters = atob(base64WithoutPrefix);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { type: mimeType });

    const filename = generateUniqueFilename("upload");
    const filePath = `temp_audio/${filename}`; // Consider making the folder configurable
    const fileRef = ref(storageInstance, filePath);

    console.log(
      `Uploading blob (${(blob.size / 1024 / 1024).toFixed(2)} MB) to Firebase path: ${filePath}`,
    );
    const snapshot = await uploadBytes(fileRef, blob);
    console.log("Upload successful:", snapshot.metadata.fullPath);

    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Firebase download URL obtained:", downloadURL);

    return { url: downloadURL, path: filePath };
  } catch (error: unknown) {
    console.error("Firebase upload error:", error);
    // Enhance error reporting
    const errorMessage = error instanceof Error ? error.message : "Unknown Firebase upload error";
    const errorCode = (error as { code?: string }).code || "N/A";
    throw new Error(
      `Firebase upload failed (Code: ${errorCode}): ${errorMessage}`,
    );
  }
}
