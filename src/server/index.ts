import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-production-domain.com']
    : ['http://localhost:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));

app.post('/api/transcribe', (async (req: Request, res: Response) => {
  try {
    const { audioData, audioUrl, options } = req.body;

    console.log('Request received with options:', {
      ...options,
      audioData: audioData ? `${audioData.substring(0, 50)}... (truncated)` : 'using URL',
      audioUrl: audioUrl ? 'URL provided' : 'not provided'
    });

    const [, versionHash] = options.modelId.split(':');

    interface InputParams {
      task: string;
      batch_size: number;
      return_timestamps: boolean;
      diarize: boolean;
      audio: string;
      language?: string;
    }

    const inputParams: InputParams = {
      task: options.task || 'transcribe',
      batch_size: options.batch_size || 64,
      return_timestamps: options.return_timestamps || true,
      diarize: options.diarize || false,
      audio: '',
    };

    if (audioUrl) {
      inputParams.audio = audioUrl;
    } else {
      inputParams.audio = audioData;
    }

    if (options.language !== "None") {
      inputParams.language = options.language;
    }

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.VITE_REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: versionHash,
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
}) as RequestHandler);

app.get('/api/prediction/:id', (async (req: Request, res: Response) => {
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
}) as RequestHandler);

app.post('/api/printerz/render', (async (req: Request, res: Response) => {
  try {
    const { templateId, printerzData } = req.body;

    if (!templateId || !printerzData) {
      return res.status(400).json({
        error: 'Missing required parameters: templateId and printerzData'
      });
    }

    // Get API key from environment variables
    const apiKey = process.env.VITE_PRINTERZ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Printerz API key not configured' });
    }

    console.log(`Proxying request to Printerz template: ${templateId}`);

    const response = await fetch(`https://api.printerz.dev/templates/${templateId}/render`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(printerzData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Printerz API error:', response.status, errorText);
      return res.status(response.status).json({
        error: `Printerz API error: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }

    // Get the PDF data directly
    const pdfBuffer = await response.arrayBuffer();

    // Set appropriate headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="transcription.pdf"');

    // Send the PDF data
    res.status(200).send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('Error proxying to Printerz:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to communicate with Printerz API'
    });
  }
}) as RequestHandler);

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.resolve(__dirname, '../../dist');
  app.use(express.static(buildPath));

  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});