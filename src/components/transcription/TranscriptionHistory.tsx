import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TranscriptionSession } from '@/lib/persistence-service';
import { fadeInUp, springTransition } from '@/lib/animations';
import { motion } from 'framer-motion';

interface TranscriptionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSession: (session: TranscriptionSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function TranscriptionHistory({
  open,
  onOpenChange,
  onSelectSession,
  onDeleteSession
}: TranscriptionHistoryProps) {
  const [sessions, setSessions] = useState<TranscriptionSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load sessions when modal opens
  useEffect(() => {
    if (open) {
      loadSessions();
    }
  }, [open]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      
      // Import here to avoid circular dependencies
      const { getAllSessions } = await import('@/lib/persistence-service');
      const allSessions = await getAllSessions();
      
      // Sort by created date (newest first)
      allSessions.sort((a, b) => b.createdAt - a.createdAt);
      
      setSessions(allSessions);
    } catch (error) {
      console.error('Failed to load transcription history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Prevent row click
    onDeleteSession(sessionId);
    
    // Remove from local state
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (session: TranscriptionSession) => {
    const durationMs = session.lastUpdatedAt - session.createdAt;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'succeeded': return 'Completed';
      case 'failed': return 'Failed';
      case 'processing': return 'In Progress';
      case 'starting': return 'Starting';
      case 'canceled': return 'Canceled';
      default: return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'starting': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'canceled': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transcription History</DialogTitle>
          <DialogDescription>
            View and manage your recent transcriptions
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-pulse text-gray-500 dark:text-gray-400">
              Loading history...
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <p>No transcription history found</p>
            <p className="text-sm mt-2">Your recent transcriptions will appear here</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
            <div className="bg-white dark:bg-gray-950">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...springTransition, delay: index * 0.05 }}
                  onClick={() => onSelectSession(session)}
                  className={`flex flex-col p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ${
                    index !== sessions.length - 1 ? 'border-b border-gray-200 dark:border-gray-800' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <div className="font-medium">
                        {session.audioSource.name || (session.audioSource.type === 'url' ? 'URL Audio' : 'Audio File')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(session.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(session.status)}`}>
                        {getStatusLabel(session.status)}
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(e, session.id)}
                        className="h-8 w-8 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className=""
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                    <div className="text-gray-500 dark:text-gray-400">
                      <span className="inline-block w-4 mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      {formatDuration(session)}
                    </div>
                    
                    <div className="text-gray-500 dark:text-gray-400">
                      <span className="inline-block w-4 mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                        </svg>
                      </span>
                      {session.audioSource.type === 'file' 
                        ? `${((session.audioSource.size || 0) / (1024 * 1024)).toFixed(1)} MB` 
                        : 'URL Audio'}
                    </div>
                    
                    <div className="text-gray-500 dark:text-gray-400">
                      <span className="inline-block w-4 mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                        </svg>
                      </span>
                      {session.options.language === "None" ? "Auto" : session.options.language}
                    </div>
                  </div>
                  
                  {session.result && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 italic">
                      {session.result.substring(0, 150)}...
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TranscriptionHistory;