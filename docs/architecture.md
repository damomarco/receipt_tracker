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

-   **`App.tsx`**: The root component. It manages the top-level application state (receipts, custom categories) and modal visibility. It orchestrates the offline/online synchronization logic and wraps the application in the necessary Context Providers.
-   **`components/`**:
    -   `Header.tsx`: Displays the application title, sync status, and a settings menu that now includes a "Home Currency" selector.
    -   `ReceiptList.tsx`: Renders receipts in collapsible sections grouped first by month, then by day.
    -   `ReceiptItem.tsx`: Displays a single receipt. Manages its `isEditing` state, lazy-loads its image from IndexedDB, and shows a converted total in the user's home currency.
    -   `AddReceiptModal.tsx`: A complex modal for adding new receipts. It supports batch uploads, performs client-side image resizing, processes them in a queue, communicates with `geminiService`, and allows users to review/edit AI-extracted data.
    -   `GlobalChatModal.tsx`: Provides an AI-powered chat interface to ask questions about all receipts.
    -   `ManageCategoriesModal.tsx`: Allows users to create, update, and delete their own custom spending categories.
    -   `SpendingSummary.tsx`: Displays aggregate spending data, date filters, a grand total converted to the home currency, and the `CategorySpendingChart`.
    -   `CategorySpendingChart.tsx`: A specialized component used within `SpendingSummary` to render the segmented bar chart.
    -   `ImageModal.tsx`: A modal for displaying a full-screen, zoomable version of a receipt image.
    -   `icons.tsx`: A central repository for all SVG icons.
-   **`contexts/`**:
    -   `ReceiptsContext.tsx`: Provides global access to `receipts` data and core functions (`deleteReceipt`, `updateReceipt`).
    -   `ThemeContext.tsx`: Manages the application's light/dark/system theme.
    -   `CurrencyContext.tsx`: Manages home currency settings, fetches and caches exchange rates, and provides conversion logic to the app.

## State Management

-   **React Context API**: Provides global access to shared state like receipts, theme, and currency settings, avoiding "prop drilling".
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
-   **UI Memoization**: In components that render lists of data, like `ReceiptList.tsx`, expensive computations (such as grouping all receipts by month and day) are wrapped in `React.useMemo` hooks. This ensures these calculations only re-run when the underlying data changes, not on every render, keeping the UI snappy and responsive even with hundreds of receipts.

## External Services

-   **Google Gemini API**: Used for all AI-powered receipt processing, including OCR, translation, itemization, and categorization.
-   **Frankfurter.app API**: A free, open-source API used to fetch historical daily exchange rates for the currency conversion feature.

## Styling

The application uses **Tailwind CSS**. The current prototype architecture loads Tailwind via a CDN script. This approach will be replaced by a proper PostCSS build process as part of the migration to a Vite-based foundation. To ensure a smooth transition, the application already avoids generating dynamic class names; a utility function (`utils/colors.ts`) maps category names to full, static class strings.
