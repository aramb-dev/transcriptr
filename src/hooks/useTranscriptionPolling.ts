import { useState, useRef, useEffect } from 'react';
import { TranscriptionStatus, getApiUrl } from '../services/transcription';

interface UseTranscriptionPollingProps {
  predictionId: string | null;
  onSuccess: (output: any) => void;
  onError: (error: string) => void;
  onProgress: (value: number) => void;
  onStatusChange: (status: TranscriptionStatus) => void;
  onApiResponse: (response: { timestamp: Date; data: Record<string, unknown> }) => void;
}

export function useTranscriptionPolling({
  predictionId,
  onSuccess,
  onError,
  onProgress,
  onStatusChange,
  onApiResponse
}: UseTranscriptionPollingProps) {
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Start polling when predictionId changes
  useEffect(() => {
    if (predictionId) {
      startPolling(predictionId);
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [predictionId]);

  const startPolling = (id: string) => {
    // Clear any existing polling interval
    if (pollIntervalRef.current) {
      console.log("Polling: Clearing previous interval.");
      clearInterval(pollIntervalRef.current);
    }

    let attempts = 0;
    const maxAttempts = 335; // About 5 minutes with a 900ms interval
    const pollIntervalMs = 900;
    const progressIncrement = (100 - 50) / maxAttempts;

    console.log(`Polling: Starting for prediction ID: ${id}`);

    // Create poll function that uses the closure over id
    const poll = () => {
      attempts++;
      console.log(`Polling: Attempt #${attempts} for ${id}`);

      fetch(getApiUrl(`prediction/${id}`))
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to check prediction status: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log(`Prediction status (attempt ${attempts}):`, data);
          onApiResponse({ timestamp: new Date(), data });

          // Update progress more gradually
          onProgress(Math.min(50 + (attempts * progressIncrement), 98));

          if (data.status === 'starting') {
            onStatusChange('starting');
          } else if (data.status === 'processing') {
            onStatusChange('processing');
          } else if (data.status === 'succeeded') {
            console.log('Transcription succeeded, handling output:', data.output);
            stopPolling();
            onSuccess(data.output);
          } else if (data.status === 'failed') {
            console.error('Transcription failed:', data.error);
            stopPolling();
            onStatusChange('failed');
            onProgress(0);
            const replicateError = data.error || 'Unknown Replicate error';
            onError(`Transcription failed: ${replicateError}`);
            onApiResponse({
              timestamp: new Date(),
              data: { error: `Replicate Error: ${replicateError}` }
            });
          } else if (data.status === 'canceled') {
            console.warn('Transcription canceled by Replicate');
            stopPolling();
            onStatusChange('canceled');
            onProgress(0);
            onError('Transcription was canceled');
            onApiResponse({
              timestamp: new Date(),
              data: { message: 'Transcription canceled by Replicate' }
            });
          }

          // Timeout check
          if (attempts >= maxAttempts && (data.status === 'starting' || data.status === 'processing')) {
            console.error(`Polling timeout after ${attempts} attempts`);
            stopPolling();
            onError('Transcription timed out after several minutes.');
            onStatusChange('failed');
            onProgress(0);
            onApiResponse({
              timestamp: new Date(),
              data: { error: 'Polling timed out' }
            });
          }
        })
        .catch(error => {
          console.error('Error during polling:', error);
          stopPolling();
          onError(error instanceof Error ? error.message : String(error));
          onStatusChange('failed');
          onProgress(0);
          onApiResponse({
            timestamp: new Date(),
            data: { error: `Polling Error: ${error instanceof Error ? error.message : String(error)}` }
          });
        });
    };

    // Set up the interval first
    pollIntervalRef.current = setInterval(poll, pollIntervalMs);

    // Use setTimeout to delay the first poll execution slightly
    // This gives React time to update state
    setTimeout(() => {
      console.log(`Executing first poll for ${id}`);
      poll();
    }, 100);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  return { stopPolling };
}