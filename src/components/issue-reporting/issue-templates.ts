import { IssueData, IssueTemplate, ConversionErrorData, TranscriptionErrorData, PerformanceIssueData, GeneralIssueData } from './types';

export function getSystemInfo() {
  return {
    userAgent: navigator.userAgent,
    timestamp: new Date(),
    url: window.location.href,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export function generateIssueTemplate(issueData: IssueData): IssueTemplate {
  const systemInfo = getSystemInfo();
  
  switch (issueData.type) {
    case 'conversion-error':
      return generateConversionErrorTemplate(issueData, systemInfo);
    case 'transcription-error':
      return generateTranscriptionErrorTemplate(issueData, systemInfo);
    case 'performance-issue':
      return generatePerformanceIssueTemplate(issueData, systemInfo);
    case 'general-issue':
      return generateGeneralIssueTemplate(issueData, systemInfo);
    default:
      throw new Error(`Unknown issue type: ${(issueData as { type: string }).type}`);
  }
}

function generateConversionErrorTemplate(data: ConversionErrorData, systemInfo: ReturnType<typeof getSystemInfo>): IssueTemplate {
  const title = `🔄 Conversion Error: ${data.originalFormat.toUpperCase()} → ${data.targetFormat.toUpperCase()} failed`;
  
  const body = `## Conversion Error Report

**Error Details:**
- **File Name:** ${data.fileName}
- **Original Format:** ${data.originalFormat.toUpperCase()}
- **Target Format:** ${data.targetFormat.toUpperCase()}
- **File Size:** ${data.fileSize ? formatBytes(data.fileSize) : 'Unknown'}
- **CloudConvert Job ID:** ${data.cloudConvertJobId || 'N/A'}
- **Error Message:** ${data.errorMessage}
- **Error Code:** ${data.errorCode || 'N/A'}

**User Description:**
${data.description}

**System Information:**
- **User Agent:** ${systemInfo.userAgent}
- **Timestamp:** ${data.timestamp.toISOString()}
- **URL:** ${systemInfo.url}
- **Viewport:** ${systemInfo.viewport.width}x${systemInfo.viewport.height}
- **Timezone:** ${systemInfo.timezone}

**Contact Information:**
${data.userEmail ? `- **Email:** ${data.userEmail}` : '- **Email:** Not provided'}
${data.userName ? `- **Name:** ${data.userName}` : '- **Name:** Not provided'}`;

  return {
    title,
    body,
    labels: ['bug', 'conversion-error', 'cloudconvert'],
  };
}

function generateTranscriptionErrorTemplate(data: TranscriptionErrorData, systemInfo: ReturnType<typeof getSystemInfo>): IssueTemplate {
  const title = `🎵 Transcription Error: ${data.audioFormat.toUpperCase()} transcription failed`;
  
  const body = `## Transcription Error Report

**Error Details:**
- **File Name:** ${data.fileName}
- **Audio Format:** ${data.audioFormat.toUpperCase()}
- **File Size:** ${data.fileSize ? formatBytes(data.fileSize) : 'Unknown'}
- **Replicate Job ID:** ${data.replicateJobId || 'N/A'}
- **Processing Time:** ${data.processingTime ? `${data.processingTime}ms` : 'N/A'}
- **Error Message:** ${data.errorMessage}

**User Description:**
${data.description}

**System Information:**
- **User Agent:** ${systemInfo.userAgent}
- **Timestamp:** ${data.timestamp.toISOString()}
- **URL:** ${systemInfo.url}
- **Viewport:** ${systemInfo.viewport.width}x${systemInfo.viewport.height}
- **Timezone:** ${systemInfo.timezone}

**Contact Information:**
${data.userEmail ? `- **Email:** ${data.userEmail}` : '- **Email:** Not provided'}
${data.userName ? `- **Name:** ${data.userName}` : '- **Name:** Not provided'}`;

  return {
    title,
    body,
    labels: ['bug', 'transcription-error', 'replicate'],
  };
}

function generatePerformanceIssueTemplate(data: PerformanceIssueData, systemInfo: ReturnType<typeof getSystemInfo>): IssueTemplate {
  const title = `⚡ Performance Issue: Slow ${data.operation} operation`;
  
  const body = `## Performance Issue Report

**Performance Details:**
- **Operation Type:** ${data.operation}
- **Processing Time:** ${data.processingTime}ms
- **Expected Time:** ${data.expectedTime ? `${data.expectedTime}ms` : 'N/A'}
- **File Size:** ${data.fileSize ? formatBytes(data.fileSize) : 'N/A'}
- **Browser Memory:** ${data.browserMetrics?.memory ? formatBytes(data.browserMetrics.memory) : 'N/A'}

**User Description:**
${data.description}

**System Information:**
- **User Agent:** ${systemInfo.userAgent}
- **Timestamp:** ${data.timestamp.toISOString()}
- **URL:** ${systemInfo.url}
- **Viewport:** ${systemInfo.viewport.width}x${systemInfo.viewport.height}
- **Timezone:** ${systemInfo.timezone}

**Contact Information:**
${data.userEmail ? `- **Email:** ${data.userEmail}` : '- **Email:** Not provided'}
${data.userName ? `- **Name:** ${data.userName}` : '- **Name:** Not provided'}`;

  return {
    title,
    body,
    labels: ['performance', 'enhancement'],
  };
}

function generateGeneralIssueTemplate(data: GeneralIssueData, systemInfo: ReturnType<typeof getSystemInfo>): IssueTemplate {
  const title = `${getSeverityEmoji(data.severity)} ${data.category.replace('-', ' ')}: ${data.title}`;
  
  const body = `## General Issue Report

**Issue Details:**
- **Category:** ${data.category.replace('-', ' ')}
- **Severity:** ${data.severity}
- **Reproducible:** ${data.reproducible ? 'Yes' : 'No'}

**Description:**
${data.description}

${data.stepsToReproduce && data.stepsToReproduce.length > 0 ? `
**Steps to Reproduce:**
${data.stepsToReproduce.map((step, index) => `${index + 1}. ${step}`).join('\n')}
` : ''}

**System Information:**
- **User Agent:** ${systemInfo.userAgent}
- **Timestamp:** ${data.timestamp.toISOString()}
- **URL:** ${systemInfo.url}
- **Viewport:** ${systemInfo.viewport.width}x${systemInfo.viewport.height}
- **Timezone:** ${systemInfo.timezone}

**Contact Information:**
${data.userEmail ? `- **Email:** ${data.userEmail}` : '- **Email:** Not provided'}
${data.userName ? `- **Name:** ${data.userName}` : '- **Name:** Not provided'}`;

  const labels = ['general-issue'];
  
  // Add category-specific labels
  if (data.category === 'ui-bug') labels.push('bug', 'ui');
  else if (data.category === 'feature-request') labels.push('enhancement', 'feature-request');
  else if (data.category === 'accessibility') labels.push('accessibility');
  else if (data.category === 'mobile') labels.push('mobile');
  
  // Add severity labels
  if (data.severity === 'critical') labels.push('critical');
  else if (data.severity === 'high') labels.push('high-priority');

  return {
    title,
    body,
    labels,
  };
}

function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case 'critical': return '🚨';
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '❓';
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}