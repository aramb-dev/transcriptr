import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const FFMPEG_CORE_VERSION = '0.12.2';
const PUBLIC_FFMPEG_DIR = path.resolve('./public/ffmpeg');

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

const downloadFile = async (url, dest) => {
  try {
    console.log(`Downloading ${url}...`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
    console.log(`Successfully downloaded to ${dest}`);
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
    throw error;
  }
};

const downloadAll = async () => {
  try {
    for (const file of files) {
      await downloadFile(file.url, file.dest);
    }
    console.log('All files downloaded successfully!');
  } catch (error) {
    console.error('Failed to download all files:', error);
    process.exit(1);
  }
};

downloadAll();