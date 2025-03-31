import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

const require = createRequire(import.meta.url);
import fetch from 'node-fetch';
const fs = require('fs');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FFMPEG_CORE_VERSION = '0.12.2';
const PUBLIC_FFMPEG_DIR = resolve(__dirname, '../public/ffmpeg');

if (!fs.existsSync(PUBLIC_FFMPEG_DIR)) {
  fs.mkdirSync(PUBLIC_FFMPEG_DIR, { recursive: true });
  console.log(`Created directory: ${PUBLIC_FFMPEG_DIR}`);
}

const files = [
  {
    url: `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd/ffmpeg-core.js`,
    dest: join(PUBLIC_FFMPEG_DIR, 'ffmpeg-core.js')
  },
  {
    url: `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd/ffmpeg-core.wasm`,
    dest: join(PUBLIC_FFMPEG_DIR, 'ffmpeg-core.wasm')
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