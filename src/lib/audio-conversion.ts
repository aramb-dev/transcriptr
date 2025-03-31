import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

/**
 * Initializes the FFmpeg instance if it hasn't been initialized yet
 */
export const initFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpeg) {
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();

  try {
    console.log('Loading FFmpeg...');

    // Use local files from the public directory instead of unpkg
    await ffmpeg.load({
      // Using window.location.origin to ensure it works in both local and production
      coreURL: `${window.location.origin}/ffmpeg/ffmpeg-core.js`,
      wasmURL: `${window.location.origin}/ffmpeg/ffmpeg-core.wasm`,
    });

    console.log('FFmpeg loaded successfully');
    return ffmpeg;
  } catch (error) {
    console.error('Error loading FFmpeg:', error);

    // If local loading fails, try using CDN as fallback
    console.log('Trying CDN fallback...');

    try {
      await ffmpeg.load({
        // Using jsdelivr instead of unpkg as an alternative CDN
        coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.2/dist/umd/ffmpeg-core.js',
        wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.2/dist/umd/ffmpeg-core.wasm',
      });

      console.log('FFmpeg loaded successfully from CDN fallback');
      return ffmpeg;
    } catch (fallbackError) {
      console.error('Error loading FFmpeg from fallback:', fallbackError);
      throw new Error('Failed to load FFmpeg after multiple attempts');
    }
  }
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

    try {
      const ffmpegInstance = await initFFmpeg();

      // Get the file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const inputFileName = `input.${fileExtension}`;
      const outputFileName = 'output.mp3';

      console.log('Writing file to FFmpeg filesystem...');
      // Write the input file to the FFmpeg file system
      const fileData = await fetchFile(file);
      ffmpegInstance.writeFile(inputFileName, fileData);

      console.log('Starting conversion process...');
      // Convert to MP3
      await ffmpegInstance.exec([
        '-i', inputFileName,
        '-vn', // No video
        '-ar', '44100', // Audio sample rate
        '-ac', '2', // Stereo
        '-b:a', '192k', // Bitrate
        outputFileName
      ]);

      console.log('Reading converted file...');
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
    } catch (ffmpegError) {
      console.error('FFmpeg processing error:', ffmpegError);

      // If conversion fails, return the original file as a fallback
      console.warn('Conversion failed, using original file');
      return file;
    }
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
  // List of formats that Replicate's Whisper model directly supports
  const supportedMimeTypes = [
    'audio/mpeg', // .mp3
    'audio/wav', // .wav
    'audio/x-wav', // Also .wav
    'audio/flac', // .flac
    'audio/x-flac', // Also .flac
    'audio/ogg', // .ogg
  ];

  // Check by extension for cases where MIME type might not be accurate
  const supportedExtensions = ['.mp3', '.wav', '.flac', '.ogg'];

  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

  return supportedMimeTypes.includes(file.type) ||
         supportedExtensions.includes(fileExtension);
};