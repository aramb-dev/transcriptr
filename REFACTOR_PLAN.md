# Next.js App Router Refactoring Plan

This document outlines the plan to refactor the existing Next.js application to use the App Router architecture for improved organization, performance, and developer experience.

## 1. Current Architecture Analysis

- **Frontend Routing:** The application currently uses a catch-all route (`src/app/[[...slug]]/page.tsx`) that renders a single client-side React application. Routing is handled by `react-router-dom`, which is not idiomatic for Next.js and prevents leveraging server-side rendering and other Next.js features effectively.
- **Backend API:** API endpoints are implemented as individual serverless functions in the `netlify/functions` directory. While functional, this separates the API logic from the frontend components that use them, making the codebase harder to maintain.

## 2. Proposed Architecture

The refactoring will adopt the Next.js App Router for both page routing and API routes.

### 2.1. Page Route Structure

The catch-all route will be replaced with a clear, file-based routing structure. Based on the existing components, the following page structure is proposed:

- `src/app/page.tsx`: The main landing page, likely containing the core transcription functionality.
- `src/app/terms/page.tsx`: The Terms of Service page.
- `src/app/privacy/page.tsx`: The Privacy Policy page.
- `src/app/changelog/page.tsx`: The Changelog page.

Additional pages can be created as needed by adding new directories and `page.tsx` files.

### 2.2. API Route Structure

The logic from the `netlify/functions` will be migrated to API routes within the `src/app/api/` directory. This co-locates the API code with the rest of the application.

| Current Netlify Function | Proposed API Route                    | Description                                         |
| ------------------------ | ------------------------------------- | --------------------------------------------------- |
| `cleanup.js`             | `src/app/api/cleanup/route.ts`        | Handles cleanup of old or temporary data.           |
| `cloud-convert.js`       | `src/app/api/convert/cloud/route.ts`  | Integrates with CloudConvert for file conversions.  |
| `convert-audio.js`       | `src/app/api/convert/audio/route.ts`  | Handles audio file conversion.                      |
| `firebase-config.js`     | (To be integrated into a lib file)    | Provides Firebase configuration.                    |
| `firebase-proxy.js`      | `src/app/api/firebase-proxy/route.ts` | Proxies requests to Firebase services.              |
| `prediction.js`          | `src/app/api/predict/route.ts`        | Handles machine learning model predictions.         |
| `printerz-proxy.js`      | `src/app/api/printerz-proxy/route.ts` | Proxies requests to an external "Printerz" service. |
| `transcribe.js`          | `src/app/api/transcribe/route.ts`     | The main transcription endpoint.                    |

## 3. Migration Steps

The migration will be performed in the following steps:

1.  **Create New Page Routes:**
    - Create the new page files (`src/app/page.tsx`, `src/app/terms/page.tsx`, etc.).
    - Migrate the relevant UI components from the existing `src/components` directory into these new pages.
    - Remove the dependency on `react-router-dom`.

2.  **Create New API Routes:**
    - Create the new API route files in `src/app/api/`.
    - Migrate the logic from the corresponding Netlify functions into these new route handlers.
    - Update the frontend code to call the new API endpoints.

3.  **Remove Old Code:**
    - Once all pages and API routes have been migrated, delete the `src/app/[[...slug]]` directory.
    - Delete the `netlify/functions` directory.
    - Update `netlify.toml` to remove any configuration related to the old functions directory.

4.  **Testing:**
    - Thoroughly test all pages and API endpoints to ensure they function correctly after the refactoring.
