// Create a new file: netlify/functions/debug-env.js
export async function handler(event, context) {
  const envVars = {
    VITE_CLOUDCONVERT_API_KEY: process.env.VITE_CLOUDCONVERT_API_KEY ? "Present (masked)" : "Missing",
    VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY ? "Present (masked)" : "Missing",
    VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN ? "Present" : "Missing",
    VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID ? "Present" : "Missing",
    VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET ? "Present" : "Missing",
    VITE_REPLICATE_API_TOKEN: process.env.VITE_REPLICATE_API_TOKEN ? "Present (masked)" : "Missing",
    VITE_PRINTERZ_API_KEY: process.env.VITE_PRINTERZ_API_KEY ? "Present (masked)" : "Missing",
    VITE_PRINTERZ_TEMPLATE_ID: process.env.VITE_PRINTERZ_TEMPLATE_ID || "Not set",
    NODE_ENV: process.env.NODE_ENV || "Not set",
  };

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Environment variables status",
      env: envVars
    })
  };
}