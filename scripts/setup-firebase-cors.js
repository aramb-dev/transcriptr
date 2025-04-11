import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Ensure the Firebase Storage bucket is defined
const bucket = process.env.VITE_FIREBASE_STORAGE_BUCKET;
if (!bucket) {
  console.error('Error: VITE_FIREBASE_STORAGE_BUCKET is not defined in your .env file');
  process.exit(1);
}

// Create CORS configuration file
const corsConfig = {
  cors: [
    {
      origin: ["*"],
      method: ["GET", "HEAD", "PUT", "POST", "DELETE"],
      responseHeader: [
        "Content-Type",
        "Content-Length",
        "Content-Range",
        "Access-Control-Allow-Origin"
      ],
      maxAgeSeconds: 3600
    }
  ]
};

// Save the configuration to a file
fs.writeFileSync('cors.json', JSON.stringify(corsConfig, null, 2));

console.log('CORS configuration file created: cors.json');
console.log(`\nTo apply this configuration to your Firebase Storage bucket, run:`);
console.log(`\ngcloud storage buckets update gs://${bucket} --cors-file=cors.json\n`);
console.log(`Or if you're using Firebase CLI:`);
console.log(`\nfirebase storage:cors set cors.json\n`);
console.log('After applying CORS settings, you can delete the cors.json file.');