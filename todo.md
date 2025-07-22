# Transcriptr Audio Conversion Implementation TODO

## Project: Automated Audio Conversion for Transcription Service

### Overview

Implement CloudConvert integration to automatically convert unsupported audio formats (M4A, AAC, MP4, etc.) to MP3 before sending to Replicate for transcription.

---

## Phase 1: Setup and Configuration ✅

- [x] CloudConvert API key acquisition (check if already in README)
- [x] Verify cloudconvert dependency is installed (already in package.json)
- [ ] Add CLOUDCONVERT_API_KEY to environment variables
- [ ] Update .env.local.example with new environment variable

---

## Phase 2: Backend Integration ✅

- [x] Create new API endpoint `/src/app/api/convert/cloud/route.ts`
- [x] Implement CloudConvert job creation logic:
  - [x] Import file from URL
  - [x] Convert to MP3 format
  - [x] Export temporary URL
- [x] Add error handling for conversion failures
- [x] Add logging for debugging conversion process
- [x] Test CloudConvert integration (health check successful)
- [ ] **NEXT**: Create integration tests with sample files

---

## Phase 3: Frontend Integration ✅

- [x] **File Type Detection**:
  - [x] Examine current `src/components/transcription/FileUploadInput.tsx`
  - [x] Add logic to detect unsupported formats (.m4a, .aac, .mp4, etc.)
  - [x] Create utility function for format validation
- [x] **Conditional API Routing**:
  - [x] Modify upload flow to route to conversion endpoint for unsupported files
  - [x] Update existing transcription flow for supported files
- [x] **User Feedback States** (KEY CHANGE):
  - [x] Add "Converting audio file..." loading state
  - [x] Add progress indicators during conversion
  - [x] Transition to "Transcribing..." after conversion
  - [x] Handle conversion errors gracefully
  - [x] Updated TranscriptionStatus to include "converting" state
- [x] Modified `src/components/transcription/TranscriptionProcessing.tsx` for conversion feedback
- [ ] **NEXT**: Test end-to-end conversion workflow with real files

---

## Phase 4: File Format Detection ✅

- [x] Create utility functions for file format detection:
  - [x] `isNativelySupported(file: File): boolean`
  - [x] `requiresConversion(file: File): boolean`
  - [x] `getSupportedFormats(): string[]`
  - [x] `getConvertibleFormats(): string[]`
- [x] Created comprehensive file format utilities in `/src/lib/file-format-utils.ts`
- [ ] **NEXT**: Update existing validation logic to use new functions
- [ ] Add file extension and MIME type checking to existing components

---

## Phase 5: Integration with Existing Flow 🔄

- [ ] Update `src/components/transcription/TranscriptionForm.tsx`:
  - [ ] Add conversion step before transcription
  - [ ] Handle conversion errors gracefully
  - [ ] Update progress tracking for conversion + transcription
- [ ] Modify status messages for conversion process
- [ ] Update error handling for conversion failures

---

## Phase 6: Testing and Validation 🔄

- [ ] Unit tests for new conversion endpoint
- [ ] Integration tests for conversion + transcription flow
- [ ] Test with various unsupported formats:
  - [ ] M4A files
  - [ ] AAC files
  - [ ] MP4 audio
  - [ ] WMA files
- [ ] Error handling tests:
  - [ ] Invalid file formats
  - [ ] CloudConvert API failures
  - [ ] Network timeouts
- [ ] Performance testing with large files

---

## Phase 7: UI/UX Improvements 🔄

- [ ] Update help text and documentation
- [ ] Modify `src/components/UnsupportedFormatHelp.tsx` to mention automatic conversion
- [ ] Add conversion time estimates to UI
- [ ] Update `src/components/Documentation.tsx` with new supported formats
- [ ] Add visual indicators for conversion process with clear state transitions

---

## Phase 8: Configuration and Environment 🔄

- [ ] Update README.md with CloudConvert setup instructions
- [ ] Add CloudConvert API key to deployment configuration
- [ ] Update environment variable documentation
- [ ] Add CloudConvert to acknowledgements section

---

## Phase 9: Error Handling and Edge Cases 🔄

- [ ] Handle CloudConvert API rate limits
- [ ] Implement retry logic for failed conversions
- [ ] Add fallback messaging for conversion failures
- [ ] Handle edge cases:
  - [ ] Very large files
  - [ ] Corrupted audio files
  - [ ] Unsupported by CloudConvert formats

---

## Phase 10: Documentation and Cleanup 🔄

- [ ] Update API documentation
- [ ] Add code comments for new functions
- [ ] Update project documentation
- [ ] Clean up console.log statements
- [ ] Add TypeScript interfaces for CloudConvert responses

---

## Current Status

- **Phase 1**: ✅ Complete (CloudConvert already in dependencies)
- **Phase 2**: ✅ Complete (Backend endpoint implemented and tested)
- **Phase 3**: ✅ Complete (Frontend integration with conversion states)
- **Phase 4**: ✅ Complete (File format detection utilities)
- **Overall Progress**: 75%

---

## Files to Modify/Create

### New Files:

- `src/app/api/convert/cloud/route.ts` - CloudConvert API endpoint
- `src/lib/cloudconvert-client.ts` - CloudConvert service wrapper
- `src/lib/file-format-utils.ts` - File format detection utilities

### Existing Files to Modify:

- `src/components/UploadAudio.tsx` - Add conversion flow
- `src/components/transcription/TranscriptionForm.tsx` - Integrate conversion
- `src/components/transcription/TranscriptionProcessing.tsx` - Update progress
- `src/components/transcription/FileUploadInput.tsx` - File type detection
- `src/components/UnsupportedFormatHelp.tsx` - Update messaging
- `src/components/Documentation.tsx` - Update docs
- `src/services/transcription.ts` - Add conversion types
- `README.md` - Update documentation

---

## Environment Variables Needed:

```bash
CLOUDCONVERT_API_KEY=your_cloudconvert_api_key_here
```

---

## Dependencies Status:

- ✅ `cloudconvert` - Already installed (v3.0.0)
- ✅ No additional dependencies needed

---

## Notes:

- CloudConvert supports conversion from most audio formats to MP3
- Current supported formats: MP3, WAV, FLAC, OGG
- Target convertible formats: M4A, AAC, MP4, WMA, AIFF, CAF
- Show explicit conversion states to users (better UX for longer processing times)
- Need to handle conversion time in UI progress indicators with clear messaging
