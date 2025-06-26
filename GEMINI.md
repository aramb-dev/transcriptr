# GEMINI.md

This file provides guidance to Gemini when working with code in this repository.

## Build Commands
- Development: `npm run dev` - Runs Vite and Node.js server concurrently
- Build: `npm run build` - Production build (downloads FFmpeg, builds client & server)
- Lint: `npm run lint` - Runs ESLint on the codebase
- Preview: `npm run preview` - Previews Vite build locally

## Code Style Guidelines
- **TypeScript**: Use strict mode with explicit types for props, state, and return values
- **React**: Use functional components with hooks; explicit prop interfaces
- **Imports**: Use absolute imports with `@/` alias; group React/third-party imports first
- **Naming**: 
  - Components: PascalCase (TranscriptionForm.tsx)
  - Hooks: camelCase with `use` prefix (useTranscriptionPolling.ts)
  - Utilities: camelCase (fileToBase64)
- **Styling**: Use Tailwind CSS classes with proper class ordering
- **Error Handling**: Use structured try/catch with detailed error context
- **File Structure**: 
  - Components: `/src/components/` organized by feature
  - Hooks: `/src/hooks/`
  - Utilities: `/src/lib/`
  - Services: `/src/services/`

## Git Guidelines
- Follow conventional commit message standards.
- Match the style of recent commits.
- After editing code (if it is substantial), add a changelog entry and commit.
- **Changelog Entries**: Always add a *new* entry to the `changelogItems` array in `src/components/Changelog.tsx` for every distinct change, even if multiple changes occur on the same day. Do not modify or overwrite existing entries.