# Application Architecture

This document provides a technical overview of the Travel Receipt Manager application's architecture.

## Overview

The application is a client-side, single-page application (SPA) built with **React** and **TypeScript**. It is designed as a **Progressive Web App (PWA)**, emphasizing offline capabilities and a responsive, mobile-first user experience. There is no traditional backend; all data is persisted in the browser and all AI processing is handled via direct calls to the Google Gemini API.

## Directory Structure

```
/
├── components/      # Reusable React components
├── config/          # App-wide configuration (e.g., currencies)
├── contexts/        # React Context providers
├── docs/            # Project documentation
├── hooks/           # Custom React hooks
├── services/        # API communication & local DB layer
├── utils/           # Utility functions (e.g., CSV export, color generation)
├── App.tsx          # Main application component
├── index.tsx        # Application entry point
├── types.ts         # TypeScript type definitions
└── ...
```

## Component Breakdown

-   **`App.tsx`**: The root component. It manages the top-level application state (receipts, trips, custom categories) and modal visibility. It orchestrates the offline/online synchronization logic and wraps the application in the necessary Context Providers.
-   **`components/`**:
    -   `Header.tsx`: Displays the application title, sync status, and a settings menu. Now also shows the name of the currently selected trip.
    -   `ReceiptList.tsx`: Renders receipts in collapsible sections grouped by trip, then by day. It now embeds the `TripSpendingSummary` component within each trip's view.
    -   `ReceiptItem.tsx`: Displays a single receipt. Manages its `isEditing` state, lazy-loads its image from IndexedDB, and shows a converted total in the user's home currency.
    -   `AddReceiptModal.tsx`: A complex modal for adding new receipts. It supports batch uploads, performs client-side image resizing, processes them in a queue, communicates with `geminiService`, and allows users to review/edit AI-extracted data.
    -   `GlobalChatModal.tsx`: Provides an AI-powered chat interface to ask questions about all receipts.
    -   `ManageCategoriesModal.tsx`: Allows users to create, update, and delete their own custom spending categories.
    -   `ManageTripsModal.tsx`: A modal for creating, updating, and deleting trips.
    -   `TripFilter.tsx`: A dropdown component allowing users to filter the main receipt list by a specific trip or view all receipts.
    -   `TripSpendingSummary.tsx`: Displays aggregate spending data (totals, category chart) for a specific set of receipts belonging to a single trip. Embedded within the `ReceiptList`.
    -   `CategorySpendingChart.tsx`: A specialized component used within `TripSpendingSummary` to render the segmented bar chart.
    -   `ImageModal.tsx`: A modal for displaying a full-screen, zoomable version of a receipt image.
    -   `icons.tsx`: A central repository for all SVG icons.
-   **`contexts/`**:
    -   `ReceiptsContext.tsx`: Provides global access to `receipts` data and core functions (`deleteReceipt`, `updateReceipt`).
    -   `TripsContext.tsx`: Provides global access to the list of all `trips`.
    -   `ThemeContext.tsx`: Manages the application's light/dark/system theme.
    -   `CurrencyContext.tsx`: Manages home currency settings, fetches and caches exchange rates, and provides conversion logic to the app.

## State Management

-   **React Context API**: Provides global access to shared state like receipts, trips, theme, and currency settings, avoiding "prop drilling".
-   **`useLocalStorage` Hook**: Persists small, critical data (receipts array, custom categories, settings, rate cache) across sessions.
-   **Component State (`useState`)**: Used for local UI concerns like modal visibility and edit modes.

## Data Persistence & Offline-First Strategy

The application uses a robust, multi-layered storage strategy to ensure full offline functionality.

1.  **`localStorage` for Metadata & Settings**: The `receipts` array (containing text data), `customCategories`, user settings (like `homeCurrency`), and the `ratesCache` are stored in `localStorage`. This provides fast, synchronous access for critical UI data.

2.  **`IndexedDB` for Image Data**: To overcome the 5-10MB size limitation of `localStorage` and avoid performance bottlenecks, all large receipt images (as base64 strings) are stored in **IndexedDB**. The `services/imageStore.ts` module provides a simple API to abstract away IndexedDB's complexity.

-   **Offline Data Flow**: When offline, new receipts are saved locally with a `'pending'` status. Images go to IndexedDB, metadata to `localStorage`. The app remains fully functional. When a connection is restored, a `useEffect` in `App.tsx` handles syncing.
-   **Exchange Rate Caching**: Fetched exchange rates are stored in `localStorage`. This minimizes API calls and ensures that currency conversions work offline using the most recently available data.

## Performance Optimizations

To ensure a smooth user experience, especially on mobile devices, several optimizations have been implemented:

-   **Client-Side Image Resizing**: Before being uploaded to the Gemini API, all receipt images are resized on the client's device using the `utils/image.ts` module. Images are scaled down to a maximum dimension of 1024px, which drastically reduces file size. This results in faster upload times, quicker AI processing, and reduced mobile data consumption.
-   **UI Memoization**: In components that render lists of data, like `ReceiptList.tsx`, expensive computations (such as grouping all receipts by trip and day) are wrapped in `React.useMemo` hooks. This ensures these calculations only re-run when the underlying data changes, not on every render, keeping the UI snappy and responsive even with hundreds of receipts.

## External Services

-   **Google Gemini API**: Used for all AI-powered receipt processing, including OCR, translation, itemization, and categorization.
-   **Frankfurter.app API**: A free, open-source API used to fetch historical daily exchange rates for the currency conversion feature.

## Styling

The application uses **Tailwind CSS**, loaded directly via a CDN script in `index.html`. This serverless, build-free approach is a core part of the architecture, enabling rapid prototyping and deployment within the AI Studio environment. To ensure Tailwind can find all necessary classes without a build-time JIT compiler, the application avoids generating dynamic class names at runtime; a utility function (`utils/colors.ts`) maps category names to full, static class strings.

## Future Architectural Considerations: Backend-as-a-Service (BaaS) Integration

Integrating a cloud backend like Google Firebase or Supabase is the next logical step for enabling multi-device sync and collaboration. However, this introduces specific challenges within the current build-less architecture that go beyond simply adding a new dependency.

### 1. SDK Integration
This is the most straightforward part. The client SDK for the chosen BaaS would be added to the `importmap` in `index.html`, just like any other dependency.

### 2. Configuration and Secrets Management
This is the primary hurdle.
-   **The Problem**: BaaS platforms require a client-side configuration object containing multiple public keys (`apiKey`, `authDomain`, `projectId`, etc.). The current environment is only set up to securely inject a single secret (`process.env.API_KEY`).
-   **The Constraint**: Hardcoding this configuration object in the client-side code is a major security risk and should be avoided. A solution would need to be found to securely provide this configuration at runtime without exposing it in the publicly accessible source files.

### 3. Security Rules
The shift from a local-only data model to a shared cloud database makes security a critical new responsibility.
-   **The Requirement**: Once data is centralized, we **must** define server-side security rules to control data access. For example, rules must be written to ensure "a user can only read and write receipts that belong to their own account or team."
-   **The Challenge**: This is not configured in the React application code. It requires learning and implementing the BaaS platform's specific security rule language (e.g., Firestore Security Rules). This is a form of server-side work that is essential for preventing data breaches.

### 4. Data Migration for Existing Users
A seamless transition plan is required for users who already have data stored locally.
-   **The Requirement**: When an existing user logs in for the first time, their data from the browser's `localStorage` and `IndexedDB` must be reliably and securely migrated to the new cloud database.
-   **The Challenge**: This involves writing a robust, one-time migration script within the application. It must handle potential failures gracefully to ensure no user data is lost during the upgrade process.