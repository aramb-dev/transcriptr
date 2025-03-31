import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FFMPEG_CORE_VERSION = '0.12.2';
const PUBLIC_FFMPEG_DIR = path.resolve(__dirname, '../public/ffmpeg');

// Create directory if it doesn't exist
if (!fs.existsSync(PUBLIC_FFMPEG_DIR)) {
  fs.mkdirSync(PUBLIC_FFMPEG_DIR, { recursive: true });
  console.log(`Created directory: ${PUBLIC_FFMPEG_DIR}`);
}

const files = [
  {
    url: `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd/ffmpeg-core.js`,
    dest: path.join(PUBLIC_FFMPEG_DIR, 'ffmpeg-core.js')
  },
  {
    url: `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd/ffmpeg-core.wasm`,
    dest: path.join(PUBLIC_FFMPEG_DIR, 'ffmpeg-core.wasm')
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url}...`);
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode} ${response.statusMessage}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded to ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
}

async function downloadAll() {
  try {
    for (const file of files) {
      await downloadFile(file.url, file.dest);
    }
    console.log('All files downloaded successfully!');
  } catch (error) {
    console.error('Failed to download all files:', error);
    process.exit(1);
  }
}

downloadAll();