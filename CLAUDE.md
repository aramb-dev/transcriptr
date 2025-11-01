# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Install dependencies:**
```bash
bun install
```

**Start development server:**
```bash
bun run dev
```
Server runs on http://localhost:3000

**Build for production:**
```bash
bun run build
```

**Start production server:**
```bash
bun run start
```

**Linting:**
```bash
bun run lint
```

**Format code:**
```bash
bun run format
```

**Check formatting without changes:**
```bash
bun run format:check
```

**Setup Firebase CORS (if deploying to Firebase):**
```bash
bun run setup-firebase-cors
```

**Setup Firebase Storage Lifecycle (automatic deletion of old files):**
```bash
bun run setup-firebase-lifecycle
```

Note: This requires [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) to be installed. The lifecycle configuration automatically deletes files older than 1 day in `temp_audio/` and `test/` directories.

## Development Workflow

**When working on tasks with multiple todos:**
- Commit after every todo is completed
- Write clear, concise commit messages that describe the changes
- This keeps changes atomic and makes it easy to track progress

**Command usage guidelines:**
- Avoid using `head` or `tail` commands when running bash commands
- Use dedicated tools instead (Read tool for viewing file contents with offset/limit)
- This ensures better handling of output and avoids truncation issues

## High-Level Architecture

### Overview
Transcriptr is a Next.js 15 web application that transcribes audio files using the Replicate API (Incredibly Fast Whisper model). The app provides a clean interface for uploading audio, monitoring transcription progress, and exporting results in multiple formats (TXT, MD, PDF, DOCX, ZIP).

### Directory Structure

**`src/app/`** - Next.js App Router pages and API routes
- `page.tsx` - Main landing page with transcription interface
- `layout.tsx` - Root layout with theme provider and analytics
- `api/` - API routes (see API Routes section below)
- `changelog/`, `documentation/`, `privacy/`, `terms/` - Static pages

**`src/components/`** - React components organized by feature
- `ui/` - Base UI components (shadcn/ui-based: Button, Card, Dialog, etc.)
- `layout/` - Layout components (Header, Footer)
- `transcription/` - Transcription feature components (Form, Result, History, Error)
- `feedback/` - Feedback modal system
- Other feature-specific components

**`src/lib/`** - Utility functions and services
- `persistence-service.ts` - LocalStorage-based session management for transcription history
- `replicate-client.ts` - Replicate API integration
- `firebase-utils.ts`, `firebase-proxy.ts` - Firebase Storage integration
- `pdf-generation.ts` - PDF export functionality using Printerz API
- `file-format-utils.ts` - Audio format detection and validation
- `analytics.ts` - Google Analytics wrapper
- `animations.ts` - Reusable animation configurations (Framer Motion)
- `storage-service.ts` - File upload/download helpers
- `cleanup-service.ts` - Cleanup utilities for temporary files

**`src/hooks/`** - Custom React hooks
- `useTranscriptionPolling.ts` - Polls Replicate API for transcription status
- `useSessionPersistence.ts` - Manages local transcription history
- `use-file-input.tsx` - File input handling
- `useScrollAnimation.tsx` - Scroll-triggered animations
- `useV2Announcement.ts` - V2 announcement modal control

**`src/server/`** - Server-side utilities
- `index.ts` - Server configuration

**`src/styles/`** - Tailwind CSS custom configurations
**`src/data/`** - Static data (changelog entries, etc.)

### Data Flow

1. **User uploads audio** → `TranscriptionForm` component
2. **File validation** → Check format, size, language selection
3. **POST to `/api/transcribe`** → Sends file to backend
4. **Backend processing:**
   - Optional audio format conversion via `/api/convert` (CloudConvert API)
   - Prediction creation via `/api/predict` (calls Replicate API)
   - Files uploaded to Firebase Storage
5. **Client polling** → `useTranscriptionPolling` hook polls `/api/prediction/[id]` for status
6. **Result handling:**
   - Store in localStorage via `persistence-service`
   - Display in `TranscriptionResult` component
   - Export options (TXT, PDF, DOCX, ZIP) generate via `pdf-generation.ts`

### API Routes

Located in `src/app/api/`:

- **`/api/transcribe` (POST)** - Main transcription endpoint
  - Receives audio file and settings
  - Uploads to Firebase, initiates Replicate prediction

- **`/api/predict` (POST)** - Creates Replicate prediction
  - Sends media to Replicate API for transcription

- **`/api/prediction/[id]` (GET)** - Polls transcription status
  - Checks prediction status on Replicate

- **`/api/convert/audio` (POST)** - Local audio format conversion
  - Uses ffmpeg-wasm for client-side conversion

- **`/api/convert/cloud` (POST)** - CloudConvert API integration
  - Converts unsupported formats (M4A, AAC, WMA) to MP3

- **`/api/firebase-proxy` (POST)** - Firebase Storage upload proxy
  - Handles CORS for Firebase uploads
  - Returns signed URLs for downloading transcriptions

- **`/api/printerz-proxy` (POST)** - PDF generation via Printerz API
  - Generates formatted PDF from transcription

- **`/api/cleanup` (POST)** - Cleanup temporary files

### Key Technologies & Patterns

**Frontend:**
- React 19 with TypeScript
- Next.js 15 App Router (client and server components)
- shadcn/ui component library for consistent UI
- Tailwind CSS v4 with custom theme (CSS variables)
- Framer Motion for animations
- React Dropzone for file uploads

**Styling:**
- Tailwind CSS with custom breakpoints (xs, touch, tablet, desktop, mobile)
- CSS variables for dynamic theming
- Mobile-first responsive design with safe-area support

**State Management:**
- React hooks (useState, useEffect)
- localStorage for session persistence via custom `persistence-service`
- No centralized state manager (simple local state)

**External APIs:**
- Replicate API - AI transcription (Incredibly Fast Whisper)
- Firebase Storage - File storage and retrieval
- Printerz API - PDF generation
- CloudConvert API - Audio format conversion (optional)
- Google Analytics 4

### Environment Variables

Required `.env.local` variables:
```
NEXT_PUBLIC_REPLICATE_API_TOKEN
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_PRINTERZ_API_KEY
NEXT_PUBLIC_LARGE_FILE_THRESHOLD
```

Optional:
```
NEXT_PUBLIC_CLOUDCONVERT_API_KEY
PORT (default: 3000)
NODE_ENV
```

See README.md for detailed descriptions and sign-up links.

### Code Quality

**Linting:** ESLint with TypeScript support and React hooks rules
- Configured in `eslint.config.js`
- Ignores: `dist`, `.next`, `node_modules`, `pdf-template`
- Rules: Unused vars must start with `_`, no unused imports

**Formatting:** Prettier with Tailwind CSS plugin
- Config: `.prettierrc`
- Automatically sorts Tailwind classes

**TypeScript:** Strict mode enabled
- Path alias: `@/*` maps to `src/*`
- JSX preservation for Next.js

### Common Development Tasks

**Adding a new UI component:**
1. Create in `src/components/ui/` using shadcn/ui pattern
2. Export from component file
3. Import in feature components as needed

**Adding a new feature:**
1. Create feature-specific components in `src/components/[feature-name]/`
2. Add custom hooks in `src/hooks/` if needed
3. Add utilities in `src/lib/` as needed
4. Create API routes in `src/app/api/` for backend logic

**Working with transcription data:**
- Session persistence handled by `persistence-service.ts`
- Polling managed by `useTranscriptionPolling.ts` hook
- Results stored in component state and localStorage

**Deployment:**
- Built with `bun run build`
- Deployed on Netlify (with @netlify/plugin-nextjs)
- Firebase CORS must be configured for storage access
- All environment variables required in deployment platform

### Performance Considerations

- Components lazy-loaded: `TranscriptionResult`, `TranscriptionError`
- Animations use Framer Motion with optimized GPU acceleration
- Tailwind CSS configured for tree-shaking (`content: "./src/**/*.{js,ts,jsx,tsx}"`)
- Image optimization via Next.js Image component
- Consider mobile optimization (see MOBILE_OPTIMIZATION_SUMMARY.md)
- Next.js optimizations: code splitting, server components where possible
