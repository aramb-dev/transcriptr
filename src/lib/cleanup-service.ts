/**
 * Service for cleaning up temporary files stored in Firebase or other storage
 */

/**
 * Deletes a file from Firebase Storage via the cleanup serverless function
 *
 * @param filePath The path of the file in Firebase Storage to delete
 * @returns A promise that resolves when the file is deleted
 */
export async function cleanupFirebaseFile(filePath: string): Promise<boolean> {
  if (!filePath) {
    console.warn("No file path provided for cleanup");
    return false;
  }

  try {
    const response = await fetch("/api/cleanup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filePath }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to cleanup file: ${errorText}`);
      return false;
    }

    const result = await response.json();
    console.log("Cleanup successful:", result);
    return true;
  } catch (error) {
    console.error("Error during file cleanup:", error);
    return false;
  }
}
