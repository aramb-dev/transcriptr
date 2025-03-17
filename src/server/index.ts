import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for your frontend
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-production-domain.com']
    : ['http://localhost:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON requests (limit size for audio files)
app.use(express.json({ limit: '50mb' }));

// Update the /api/transcribe endpoint to properly handle the language option:

app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioData, options } = req.body;

    console.log('Request received with options:', {
      ...options,
      audioData: audioData ? `${audioData.substring(0, 50)}... (truncated)` : 'missing'
    });

    // Extract owner/model and version from modelId
    const [ownerAndModel, versionHash] = options.modelId.split(':');

    // Format language parameter correctly
    // If "None" is selected, omit the language parameter entirely
    const inputParams: any = {
      task: options.task || 'transcribe',
      audio: audioData,
      batch_size: options.batch_size || 64,
      return_timestamps: options.return_timestamps || true,
      diarize: options.diarize || false,
    };

    // Only include language if it's not "None" (auto-detect)
    if (options.language !== "None") {
      inputParams.language = options.language;
    }

    // Call Replicate API
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.VITE_REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: versionHash,  // Use only the version hash here
        input: inputParams
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate API error:', response.status, errorText);
      return res.status(response.status).json({
        error: `Replicate API error: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('Replicate API response:', data);
    res.json(data);
  } catch (error) {
    console.error('Error proxying to Replicate:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to communicate with Replicate API'
    });
  }
});

// Update the /api/prediction/:id endpoint:

app.get('/api/prediction/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Checking prediction status for ID: ${id}`);

    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        'Authorization': `Token ${process.env.VITE_REPLICATE_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error checking prediction status: ${response.status}`, errorText);
      return res.status(response.status).json({
        error: `Error checking prediction: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('Prediction status data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error checking prediction status:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to check prediction status'
    });
  }
});

// Serve the static files in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.resolve(__dirname, '../../dist');
  app.use(express.static(buildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});