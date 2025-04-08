[![Netlify Status](https://api.netlify.com/api/v1/badges/2a08872b-ce65-4b82-be7f-3a7a4fd6b0ad/deploy-status)](https://app.netlify.com/sites/transcriptr/deploys)

# Transcriptr - AI-Powered Audio Transcription

Transcriptr is a modern web application that converts audio files to text using artificial intelligence. It provides a clean, intuitive interface for uploading audio files and receiving high-quality transcriptions powered by Replicate's Incredibly Fast Whisper model.

![Transcriptr Screenshot](https://hc-cdn.hel1.your-objectstorage.com/s/v3/adb3df4b145f7080f7275b56e56d7269daaad0f2_image.png)

## Features

- **Audio Transcription**: Convert audio to text with high accuracy
- **Multiple Format Support**: Download transcriptions in TXT, MD, PDF, and DOCX formats
- **Language Selection**: Choose from multiple languages for better accuracy
- **Speaker Diarization**: Optionally identify different speakers in the transcription
- **Batch Processing**: Handle large files efficiently with optimized processing
- **Export Options**: Download individual formats or all formats as a ZIP

## Technology Stack

- **Frontend**: React with TypeScript, powered by Vite for fast development
- **UI**: Tailwind CSS with shadcn/ui components for a modern interface
- **Backend**: Express.js server for handling API requests
- **AI Integration**: Replicate API for accessing the Incredibly Fast Whisper model
- **Document Handling**:
  - Printerz for high-quality PDF template rendering
  - Libraries for generating DOCX, and ZIP files
- **Storage**: Firebase Storage for saving generated documents

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Replicate API token (for AI transcription)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/transcriptr.git
   cd transcriptr
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a .env file in the root directory with your Replicate API token:

   ```
   VITE_REPLICATE_API_TOKEN=your_replicate_api_token_here
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173` to see the application.

Collecting workspace information# Adding Environment Variables Section to README.md

Based on your .env file and existing documentation, I'll create an environment variables section for your README.md that explains all the required environment variables for Transcriptr:

## Environment Variables

Transcriptr requires several environment variables to function properly. Create a `.env` file in the project root with the following variables:

### Required Environment Variables

| Variable                            | Description                                                              |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `VITE_REPLICATE_API_TOKEN`          | Your Replicate API token for accessing the Incredibly Fast Whisper model |
| `VITE_FIREBASE_API_KEY`             | Firebase API key for storage services                                    |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain                                                     |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID                                                      |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket for storing transcriptions and PDFs              |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID                                             |
| `VITE_FIREBASE_APP_ID`              | Firebase application ID                                                  |
| `VITE_PRINTERZ_API_KEY`             | API key for Printerz PDF generation services                             |
| `VITE_LARGE_FILE_THRESHOLD`         | Threshold in MB for large file warnings                                  |

### Optional Environment Variables

| Variable                    | Description                                                            | Default       |
| --------------------------- | ---------------------------------------------------------------------- | ------------- |
| `VITE_CLOUDCONVERT_API_KEY` | API key for CloudConvert services (for additional file format support) | None          |
| `PORT`                      | Port for the server to listen on                                       | `3001`        |
| `NODE_ENV`                  | Environment mode (`development` or `production`)                       | `development` |

### Example .env file

```
VITE_REPLICATE_API_TOKEN=your_replicate_token_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_PRINTERZ_API_KEY=your_printerz_api_key
VITE_LARGE_FILE_THRESHOLD=1
VITE_CLOUDCONVERT_API_KEY=your_cloudconvert_api_key
```

### Getting API Keys

- **Replicate API Token**: Sign up at [Replicate](https://replicate.com/) and create an API token
- **Firebase**: Set up a project in [Firebase Console](https://console.firebase.google.com/) and get your credentials
- **Printerz**: Create an account at [Printerz](https://printerz.dev/) and get your API key
- **CloudConvert** (optional): Register at [CloudConvert](https://cloudconvert.com/) for additional file format conversion capabilities

````

This section provides clear documentation on all the environment variables needed for your application, where to get them, and which ones are optional versus required. The table format makes it easy to understand what each variable is for.

You can place this section in your README.md after the "Getting Started" section and before the "Build and Deployment" section to maintain a logical flow of information.

## Build and Deployment

### Building for Production

To build the application for production:

```bash
npm run build
````

This command creates optimized production builds for both client and server:

- Client files are generated in `dist/client`
- Server files are generated in server

### Deploying to Production

1. Build the application as described above
2. Set the environment variable `NODE_ENV` to `production`
3. Start the server:
   ```bash
   npm run start
   ```

The server will run on port 3001 by default, but you can override this by setting the `PORT` environment variable.

### Docker Deployment (Optional)

Create a Dockerfile in the root directory:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "run", "start"]
```

Build and run the Docker container:

```bash
docker build -t transcriptr .
docker run -p 3001:3001 -e VITE_REPLICATE_API_TOKEN=your_token_here transcriptr
```

## Deployment Options

### Local Development

For local development, the app uses an Express.js server to handle API requests:

```bash
npm run dev
```

## Project Structure

```
transcriptr/
├── public/                # Static assets
├── src/                   # Source code
│   ├── assets/            # Images and other assets
│   ├── components/        # React components
│   │   ├── ui/            # UI components based on shadcn/ui
│   │   ├── TranscriptionOptions.tsx  # Language and diarization options
│   │   ├── TranscriptionResult.tsx   # Display and download results
│   │   └── UploadAudio.tsx           # File upload component
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── server/            # Express server for API handling
│   ├── App.tsx            # Main application component
│   ├── index.css          # Global CSS
│   └── main.tsx           # Entry point
├── index.html             # HTML template
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── package.json           # Dependencies and scripts
```

## API Documentation

### `/api/transcribe`

**Method**: POST

**Description**: Upload an audio file for transcription

**Request Body**:

```json
{
  "audioData": "base64-encoded-audio-data",
  "options": {
    "modelId": "vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c",
    "task": "transcribe",
    "batch_size": 64,
    "return_timestamps": true,
    "language": "english",
    "diarize": false
  }
}
```

**Response**: JSON object with prediction ID or immediate transcription

### `/api/prediction/:id`

**Method**: GET

**Description**: Check the status of a transcription in progress

**Parameters**:

- `id`: The prediction ID returned from the transcribe endpoint

**Response**: JSON object with prediction status and results (if complete)

### `/api/printerz/render`

**Method**: POST

**Description**: Proxy endpoint for rendering PDFs with Printerz

**Request Body**:

```json
{
  "templateId": "your-printerz-template-id",
  "printerzData": {
    "variables": {
      "title": "Document Title",
      "content": "Document Content",
      "timestamp": "Formatted Date"
    },
    "options": {
      "printBackground": true
    }
  }
}
```

## Audio Format Support

Transcriptr currently supports the following audio formats:

- MP3 (.mp3)
- WAV (.wav)
- FLAC (.flac)
- OGG (.ogg)

For other formats like M4A, AAC, or WMA, please convert your files to one of the supported formats before uploading. You can use online tools like [CloudConvert](https://cloudconvert.com/m4a-to-mp3) for this purpose.

We're working on adding native support for more audio formats. Contributions are welcome!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Replicate](https://replicate.com/) for providing the Incredibly Fast Whisper model
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React](https://reactjs.org/) for the UI framework
- [Vite](https://vitejs.dev/) for the build tool
- [Printerz](https://printerz.dev/) for PDF template rendering and generation

---

Developed by [Abdur-Rahman Bilal (aramb-dev)](https://github.com/aramb-dev)
