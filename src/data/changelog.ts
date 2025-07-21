export interface ChangeItem {
  date: string;
  version: string;
  changes: {
    new?: string[];
    improved?: string[];
    fixed?: string[];
  };
}

export const changelogItems: ChangeItem[] = [
  {
    date: "Mon, 21 Jul 2025",
    version: "2.0.0",
    changes: {
      new: [
        "Added V2 Announcement modal for first-time visitors with celebratory confetti animation",
        "Implemented localStorage-based persistence to show announcement only once per user",
        "Added debug function `seenV2(false)` for developers to re-enable the announcement modal",
        "**Documentation Page**: Created comprehensive documentation at `/documentation` with getting started guide, features overview, troubleshooting, and FAQ",
        "**Mobile-First UI System**: Developed a complete mobile-optimized interface with hamburger navigation, touch-friendly components, and responsive layouts",
        "**Mobile Navigation**: Added slide-out hamburger menu with backdrop overlay and organized navigation sections",
        "**Mobile-Specific Components**: Created `MobileHeader`, `MobileFooter`, `MobileButton`, `MobileInput`, `MobileDialog`, and `MobileTranscriptionResult` components",
        "**Touch-Optimized Interactions**: Implemented 44px minimum touch targets, active state feedback, and gesture-friendly animations",
        "**Responsive Transcription Results**: Added mobile-specific transcription display with task-oriented layout, preview mode, and expandable full text view",
        "**Mobile-Optimized Changelog**: Created accordion-based mobile changelog with version and category sections for better mobile navigation",
        "**Safe Area Support**: Enhanced mobile experience with proper safe area handling for modern smartphones",
        "**Analytics Opt-Out**: You can now opt-out of analytics tracking in the settings.",
        "**Improved Session History**: Added ranged query support for fetching your transcription history.",
      ],
      improved: [
        "Enhanced user onboarding experience with welcoming V2 announcement",
        "Integrated confetti animation with proper z-index layering for visual celebration",
        "**Complete Migration to Next.js**: The entire application has been migrated from Vite to Next.js, including the move from Netlify Functions to Next.js API Routes and the adoption of native Next.js routing.",
        "**Modernized Styling**: Adopted CSS variables for theming and migrated to Tailwind CSS v4 syntax for a more maintainable and modern codebase.",
        "**Mobile-First Responsive Design**: Extended Tailwind configuration with mobile breakpoints, touch detection utilities, and custom spacing for optimal mobile experience",
        "**Conditional Mobile/Desktop Rendering**: Implemented smart device detection to serve optimized interfaces without affecting existing desktop functionality",
        "**Enhanced Touch Feedback**: Added scale animations, haptic-style feedback, and improved button states for better mobile interaction",
        "**Mobile Layout Optimization**: Redesigned headers, footers, and form layouts specifically for mobile devices while preserving desktop experience",
        "**Documentation Organization**: Migrated documentation from component-based routing to proper Next.js App Router structure",
        "**Component Architecture**: Cleaned up legacy Vite routing code and consolidated documentation into `/app/documentation/page.tsx`",
        "**Data Architecture**: Centralized changelog data in dedicated `/data/changelog.ts` module for consistency across components",
        "**TypeScript Improvements**: Fixed ButtonProps export issues and enhanced type safety across UI components",
        "**Simplified PDF Generation**: Removed the external 'printerz' PDF generation service, streamlining the architecture.",
        "**Smoother UI**: Replaced layout transitions with more fluid, spring-based animations.",
        "**Codebase Health**: Performed a major refactoring across the entire application, improving type safety, removing unused code, simplifying components, and enforcing a consistent code style with ESLint and Prettier.",
      ],
      fixed: [
        "Resolved a type error for the `fileInputRef` prop.",
        "Fixed various linting errors across the application and API.",
        "Corrected the environment variable for the Replicate API.",
        "Enabled proper client-side routing within Next.js.",
        "Fixed TypeScript compilation errors in `AnimatedButton` component by properly importing `ButtonProps` interface",
        "Resolved module export issues with UI component type definitions",
        "Updated Footer navigation links to point to correct `/documentation` route instead of `/docs`",
        "Cleaned up old Vite `LazyRoutes.tsx` file that was causing build failures",
        "Fixed mobile component integration compilation errors in `TranscriptionForm.tsx`",
        "Resolved Framer Motion animation type issues in mobile components",
        "Fixed conditional rendering logic for mobile vs desktop component display",
      ],
    },
  },
  {
    date: "Thu, 26 Jun 2025",
    version: "1.4.7",
    changes: {
      new: [],
      improved: [
        "Refactored `generatePdfLocally` function to reduce cognitive complexity.",
      ],
      fixed: ["Addressed cognitive complexity issue in PDF generation logic."],
    },
  },
  {
    date: "Thu, 26 Jun 2025",
    version: "1.4.6",
    changes: {
      new: [
        "Added basic content to the Documentation page.",
        'Added a "Back to Home" button on the Documentation page.',
      ],
      improved: [],
      fixed: [],
    },
  },
  {
    date: "Thu, 26 Jun 2025",
    version: "1.4.4",
    changes: {
      new: [],
      improved: [
        "Removed FFmpeg dependency and all related audio conversion logic.",
      ],
      fixed: ["Fixed build errors caused by FFmpeg dependency issues."],
    },
  },
  {
    date: "Wed, 23 Apr 2025",
    version: "1.4.3",
    changes: {
      new: [],
      improved: [
        "Enhanced transcription reliability with automatic batch size reduction",
        "Added smart retry logic for handling GPU memory limitations",
      ],
      fixed: [
        'Fixed "CUDA out of memory" errors by automatically reducing batch size and retrying',
        "Resolved transcription failures on larger audio files with dynamic resource allocation",
      ],
    },
  },
  {
    date: "Tue, 23 Apr 2025",
    version: "1.4.2",
    changes: {
      new: [
        "Added improved multilingual document generation for better international language support",
        "Implemented true PDF generation with proper multilingual text support",
      ],
      improved: [
        "Enhanced document export to properly handle Arabic, Hebrew, and other non-Latin scripts",
        "Optimized PDF generation with automatic RTL text direction detection",
        "Added automatic fallback to HTML format when PDF generation fails",
        "Implemented proper page layout with headers, footers, and multi-page support",
      ],
      fixed: [
        "Fixed issue with Arabic and other non-Latin text displaying as gibberish in exported documents",
        "Fixed document generation issues when Printerz API is unavailable",
        "Fixed inconsistent file extensions in document downloads",
      ],
    },
  },
  {
    date: "Mon, 21 Apr 2025",
    version: "1.4.1",
    changes: {
      new: [
        "Added dialog component for improved user interactions",
        "Implemented session persistence for transcriptions",
        "Added transcription history feature",
      ],
      improved: [
        "Refactored code to reduce cognitive complexity in transcription processing",
        "Enhanced exception handling in Firebase proxy service",
        "Optimized Replicate client by removing unused variables",
        "Enhanced transcription progress tracking with cleaner percentage ranges",
        "Redesigned layout components for better user experience",
      ],
      fixed: [
        "Fixed ignored exceptions in Firebase proxy service",
        "Removed useless variable assignment in Replicate client",
        "Reduced complexity in transcribe function for better maintainability",
        "Resolved typo where meta tag had placeholder information",
        "Fixed decimal values in progress percentages for a cleaner UI experience",
      ],
    },
  },
  {
    date: "Sun, 13 Apr 2025",
    version: "1.4.0",
    changes: {
      new: [
        "Implemented audio upload and transcription functionality with URL support",
        "Added SEO and social meta tags",
        "Integrated branding assets (favicon, social image)",
        "Introduced LoadingFallback component for lazy-loaded routes.",
        "Created cleanup service for managing temporary files in Firebase.",
      ],
      improved: [
        "Enhanced polling mechanism to fix timing issues",
        "Refactored polling logic into custom hook `useTranscriptionPolling`",
        "Replaced MainApp component with MainLayout for better organization.",
        "Refactored UploadAudio component to utilize new FileUploadInput and UrlInput components.",
        "Added cleanup functionality for temporary files in Firebase after transcription.",
        "Implemented lazy loading for transcription-related components in MainLayout.",
        "Enhanced URL validation logic in UploadAudio component.",
        "Updated Firebase upload utility to handle base64 data uploads.",
        "Improved error handling and logging in Replicate API interactions.",
      ],
      fixed: [
        "Resolved issue where polling stopped prematurely due to state update timing",
      ],
    },
  },
  {
    date: "Sat, 12 Apr 2025",
    version: "1.3.0",
    changes: {
      new: [
        "Added OGG support",
        "Optimized analytics loading",
        "Enhanced chunking strategy for improved performance",
      ],
      improved: ["Performance optimizations across the application"],
      fixed: [],
    },
  },
  {
    date: "Fri, 11 Apr 2025",
    version: "1.0.0",
    changes: {
      new: [
        "Added changelog and feedback components",
        "Added Google site verification HTML file",
        "Implemented dynamic imports for performance optimization",
        "Added Google Analytics integration",
        "Added TranscriptionProcessing and TranscriptionResult components",
        "Added PDF and DOCX generation capabilities",
      ],
      improved: ["Enhanced header and footer for changelog access"],
      fixed: [],
    },
  },
  {
    date: "Wed, 9 Apr 2025",
    version: "0.5.0",
    changes: {
      new: [
        "Integrated cookie consent management with analytics tracking",
        "Added ad blocker detection",
        "Added Terms of Service and Privacy Policy components",
      ],
      improved: ["Analytics initialization to use new Clarity library"],
      fixed: [],
    },
  },
  {
    date: "Tue, 8 Apr 2025",
    version: "0.4.0",
    changes: {
      new: [
        "Added feedback form and modal for user feedback collection",
        "Added Firebase configuration files",
        "Added HTML template and instructions for template generation",
        "Added .hintrc configuration file",
        "Enhanced PDF generation with Firebase upload",
      ],
      improved: [
        "Updated feedback modals to use specific IDs",
        "Enhanced feedback form handling with device info detection",
        "Updated README with environment variables section",
      ],
      fixed: [],
    },
  },
  {
    date: "Mon, 7 Apr 2025",
    version: "0.3.0",
    changes: {
      new: [
        "Added PDF generation support with pdfMake",
        "Integrated Printerz API for PDF generation",
        "Added customizable title input for PDFs",
      ],
      improved: ["Refactored code structure for improved readability"],
      fixed: ["Refactored PDF generation to remove unused code"],
    },
  },
  {
    date: "Mon, 31 Mar 2025",
    version: "0.2.0",
    changes: {
      new: [
        "Added Firebase integration for file storage",
        "Implemented FFmpeg download script",
        "Added audio conversion functionality",
        "Added CloudConvert function for audio conversion",
        "Implemented cookie consent management",
      ],
      improved: [
        "Enhanced dark mode support with improved text colors",
        "Updated audio format support and user guidance",
        "Refactored download-ffmpeg script to use ESM imports",
      ],
      fixed: [
        "Firebase file upload handling and cleanup process",
        "Implemented alternative FFmpeg download script",
        "Updated Netlify configuration",
        "Added debug environment function and enhanced file conversion error handling",
      ],
    },
  },
  {
    date: "Tue, 18 Mar 2025",
    version: "0.1.1",
    changes: {
      new: ["Added Netlify deployment support with API functions"],
      improved: ["Updated .gitignore to include .env and .netlify folders"],
      fixed: [
        "Disabled dark mode by changing Tailwind configuration",
        "Updated Netlify build command and TypeScript configuration",
      ],
    },
  },
  {
    date: "Mon, 17 Mar 2025",
    version: "0.1.0",
    changes: {
      new: [
        "Implemented custom file input hook",
        "Added audio upload component with improved error handling",
        "Enhanced Tailwind CSS configuration with backdrop filter and typography plugin",
        "Added Prettier configuration",
        "Updated README with project overview and setup instructions",
      ],
      improved: [
        "Audio transcription handling with improved error management",
        "Audio upload component layout",
        "TypeScript settings for module interoperability",
      ],
      fixed: [],
    },
  },
  {
    date: "Sun, 16 Mar 2025",
    version: "0.0.1",
    changes: {
      new: [
        "Initial project setup with Vite, React, and TypeScript",
        "Added environment configuration, PostCSS, and ESLint",
      ],
      improved: [],
      fixed: [],
    },
  },
];
