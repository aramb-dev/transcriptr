import React from 'react';
import { TranscriptionSession } from '@/lib/persistence-service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fadeInUp, springTransition } from '@/lib/animations';

interface SessionRecoveryPromptProps {
  session: TranscriptionSession;
  onRecover: () => void;
  onDiscard: () => void;
}

export function SessionRecoveryPrompt({
  session,
  onRecover,
  onDiscard
}: SessionRecoveryPromptProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressLabel = (progress: number) => {
    if (progress < 20) return 'Starting';
    if (progress < 50) return 'Uploading';
    if (progress < 80) return 'Processing';
    return 'Nearly complete';
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={springTransition}
    >
      <Card className="p-6 mb-6 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-yellow-600 dark:text-yellow-400"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300">
              Unfinished Transcription Found
            </h3>
          </div>
          
          <p className="text-yellow-700 dark:text-yellow-400">
            We found an unfinished transcription from {formatTime(session.createdAt)}.
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded p-3 border border-yellow-200 dark:border-yellow-800/50">
            <div className="mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Source:</span>{' '}
              <span className="font-medium">
                {session.audioSource.type === 'file' 
                  ? (session.audioSource.name || 'Uploaded file') 
                  : 'URL audio'}
              </span>
            </div>
            
            <div className="mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>{' '}
              <span className="font-medium">
                {getProgressLabel(session.progress)} ({session.progress}%)
              </span>
            </div>
            
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <div 
                className="h-full bg-blue-500 dark:bg-blue-600" 
                style={{ width: `${session.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onDiscard} 
              className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            >
              Discard
            </Button>
            <Button 
              onClick={onRecover} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Resume Transcription
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default SessionRecoveryPrompt;