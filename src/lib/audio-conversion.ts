import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

/**
 * Initializes the FFmpeg instance if it hasn't been initialized yet
 */
export const initFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpeg) {
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();

  // Configure the wasm binary location
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  console.log('FFmpeg loaded');
  return ffmpeg;
};

/**
 * Converts an audio file to MP3 format
 *
 * @param file The audio file to convert
 * @returns A Promise that resolves to the converted MP3 file
 */
export const convertToMp3 = async (file: File): Promise<File> => {
  try {
    // Check if the file is already an MP3
    if (file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')) {
      console.log('File is already in MP3 format, skipping conversion');
      return file;
    }

    console.log(`Converting ${file.name} (${file.type}) to MP3...`);

    const ffmpegInstance = await initFFmpeg();

    // Get the file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const inputFileName = `input.${fileExtension}`;
    const outputFileName = 'output.mp3';

    // Write the input file to the FFmpeg file system
    const fileData = await fetchFile(file);
    ffmpegInstance.writeFile(inputFileName, fileData);

    // Convert to MP3
    await ffmpegInstance.exec([
      '-i', inputFileName,
      '-vn', // No video
      '-ar', '44100', // Audio sample rate
      '-ac', '2', // Stereo
      '-b:a', '192k', // Bitrate
      outputFileName
    ]);

    // Read the converted file from the FFmpeg file system
    const outputData = await ffmpegInstance.readFile(outputFileName);

    // Create a new file object with the MP3 data
    const mp3File = new File(
      [outputData],
      `${file.name.split('.')[0]}.mp3`,
      { type: 'audio/mpeg' }
    );

    console.log(`Conversion complete: ${mp3File.size} bytes`);
    return mp3File;
  } catch (error) {
    console.error('Error converting audio to MP3:', error);
    throw new Error(`Failed to convert audio format: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Checks if an audio file format is supported by Replicate
 *
 * @param file The audio file to check
 * @returns true if the format is supported, false otherwise
 */
export const isFormatSupportedByReplicate = (file: File): boolean => {
  // List of formats that Replicate's Whisper model supports
  const supportedFormats = [
    'audio/mpeg', // .mp3
    'audio/wav', // .wav
    'audio/x-wav', // Also .wav
    'audio/flac', // .flac
    'audio/x-flac', // Also .flac
    'audio/ogg', // .ogg
  ];

  // Also check by extension for cases where MIME type might not be accurate
  const supportedExtensions = ['.mp3', '.wav', '.flac', '.ogg'];

  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

  return supportedFormats.includes(file.type) ||
         supportedExtensions.includes(fileExtension);
};