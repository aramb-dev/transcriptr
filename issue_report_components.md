# Issue Report Components

## Overview
This document outlines the implementation of specialized issue reporting components for the Transcriptr application to improve user experience when reporting problems.

## Current State
- Generic feedback form handles all feedback types including issues
- UnsupportedFormatHelp component has basic GitHub issue reporting
- Footer has "Report an Issue" link that opens generic feedback modal

## Proposed Components

### 1. ConversionErrorReporter
**Purpose**: Specialized component for reporting audio conversion failures
**Location**: `src/components/issue-reporting/ConversionErrorReporter.tsx`
**Features**:
- Pre-populated with conversion error details
- Includes file format information
- CloudConvert job ID (if available)
- Automatic browser/OS detection
- Direct integration with GitHub Issues API

### 2. TranscriptionErrorReporter  
**Purpose**: Component for reporting transcription failures
**Location**: `src/components/issue-reporting/TranscriptionErrorReporter.tsx`
**Features**:
- Pre-populated with transcription error details
- Replicate job information
- Audio file metadata
- Error logs and stack traces

### 3. PerformanceIssueReporter
**Purpose**: Component for reporting performance problems
**Location**: `src/components/issue-reporting/PerformanceIssueReporter.tsx`
**Features**:
- Performance metrics collection
- Browser performance data
- File size and processing time information
- Memory usage statistics

### 4. GeneralIssueReporter
**Purpose**: Enhanced general issue reporting with better categorization
**Location**: `src/components/issue-reporting/GeneralIssueReporter.tsx`
**Features**:
- Issue categorization dropdown
- Template-based issue descriptions
- Automatic environment information
- Screenshot capture capability

### 5. IssueReportManager
**Purpose**: Central component to route different types of issues to appropriate reporters
**Location**: `src/components/issue-reporting/IssueReportManager.tsx`
**Features**:
- Issue type detection and routing
- Common issue templates
- Progress tracking for issue submission
- Follow-up communication handling

## Integration Points
- Replace UnsupportedFormatHelp issue reporting with ConversionErrorReporter
- Enhance TranscriptionError component with TranscriptionErrorReporter
- Update Footer issue reporting to use IssueReportManager
- Add performance issue reporting to slow operations

## Technical Requirements
- TypeScript interfaces for issue data structures
- Integration with GitHub Issues API
- Error boundary integration
- Analytics tracking for issue types
- Rate limiting and spam prevention