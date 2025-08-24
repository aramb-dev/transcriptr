export interface BaseIssueData {
  title: string;
  description: string;
  userEmail?: string;
  userName?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
}

export interface ConversionErrorData extends BaseIssueData {
  type: 'conversion-error';
  originalFormat: string;
  targetFormat: string;
  fileSize?: number;
  fileName: string;
  cloudConvertJobId?: string;
  errorMessage: string;
  errorCode?: string;
}

export interface TranscriptionErrorData extends BaseIssueData {
  type: 'transcription-error';
  audioFormat: string;
  fileSize?: number;
  fileName: string;
  replicateJobId?: string;
  errorMessage: string;
  processingTime?: number;
}

export interface PerformanceIssueData extends BaseIssueData {
  type: 'performance-issue';
  operation: 'conversion' | 'transcription' | 'upload' | 'general';
  processingTime: number;
  fileSize?: number;
  expectedTime?: number;
  browserMetrics?: {
    memory?: number;
    timing?: PerformanceTiming;
  };
}

export interface GeneralIssueData extends BaseIssueData {
  type: 'general-issue';
  category: 'ui-bug' | 'feature-request' | 'accessibility' | 'mobile' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reproducible: boolean;
  stepsToReproduce?: string[];
}

export type IssueData = ConversionErrorData | TranscriptionErrorData | PerformanceIssueData | GeneralIssueData;

export interface IssueReportResult {
  success: boolean;
  issueUrl?: string;
  issueNumber?: number;
  error?: string;
}

export interface IssueTemplate {
  title: string;
  body: string;
  labels: string[];
}