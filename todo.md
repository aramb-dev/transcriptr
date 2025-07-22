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

## Phase 2: Backend Integration 🔄
- [ ] Create new API endpoint `/src/app/api/convert/cloud/route.ts`
- [ ] Implement CloudConvert job creation logic:
  - [ ] Import file from URL
  - [ ] Convert to MP3 format
  - [ ] Export temporary URL
- [ ] Add error handling for conversion failures
- [ ] Add logging for debugging conversion process
- [ ] Test CloudConvert integration with sample files

---

## Phase 3: Frontend Integration 🔄
- [ ] Update file type detection logic in `src/components/transcription/FileUploadInput.tsx`
- [ ] Modify upload workflow to check file extensions:
  - [ ] Supported formats: MP3, WAV, FLAC, OGG → direct transcription
  - [ ] Unsupported formats: M4A, AAC, MP4, etc. → conversion first
- [ ] Update `src/components/UploadAudio.tsx` to handle conversion flow
- [ ] Add explicit conversion status messaging to UI:
  - [ ] "Converting audio file..." state for unsupported formats
  - [ ] Progress indicators during conversion phase
  - [ ] Clear transition to "Transcribing..." after conversion
  - [ ] Estimated time indicators if possible
- [ ] Update progress indicators to show conversion step
- [ ] Modify `src/components/transcription/TranscriptionProcessing.tsx` for conversion feedback

---

## Phase 4: File Format Detection 🔄
- [ ] Create utility functions for file format detection:
  - [ ] `isNativelySupported(file: File): boolean`
  - [ ] `requiresConversion(file: File): boolean`
  - [ ] `getSupportedFormats(): string[]`
  - [ ] `getConvertibleFormats(): string[]`
- [ ] Update existing validation logic to use new functions
- [ ] Add file extension and MIME type checking

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
- **Phase 2**: 🔄 In Progress
- **Overall Progress**: 10%

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
