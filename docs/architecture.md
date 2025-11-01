# Application Architecture

This document provides a technical overview of the Travel Receipt Manager application's architecture.

## Overview

The application is a client-side, single-page application (SPA) built with **React** and **TypeScript**. It is designed as a **Progressive Web App (PWA)**, emphasizing offline capabilities and a responsive, mobile-first user experience. There is no traditional backend; all data is persisted in the browser and all AI processing is handled via direct calls to the Google Gemini API.

## Directory Structure

```
/
├── components/      # Reusable React components
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

-   **`App.tsx`**: The root component. It manages the top-level application state (receipts, custom categories) and modal visibility. It orchestrates the offline/online synchronization logic and wraps the application in the `ReceiptsProvider`.
-   **`components/`**:
    -   `Header.tsx`: Displays the application title, sync status, and a settings menu.
    -   `ReceiptList.tsx`: Renders receipts in collapsible sections grouped by date.
    -   `ReceiptItem.tsx`: Manages its `isEditing` state. It now lazy-loads its corresponding image from IndexedDB for improved performance.
    -   `AddReceiptModal.tsx`: A complex modal for adding new receipts. It supports batch uploads, processes them in a queue, communicates with `geminiService`, and allows users to review/edit AI-extracted data.
    -   `GlobalChatModal.tsx`: Provides an AI-powered chat interface to ask questions about all receipts.
    -   `ManageCategoriesModal.tsx`: Allows users to create, update, and delete their own custom spending categories.
    -   `SpendingSummary.tsx`: Displays aggregate spending data, date filters, and the `CategorySpendingChart`. The entire component is collapsible to save vertical screen space.
    -   `CategorySpendingChart.tsx`: A specialized component used within `SpendingSummary` to render the segmented bar chart.
    -   `ImageModal.tsx`: A modal for displaying a full-screen, zoomable version of a receipt image.
    -   `icons.tsx`: A central repository for all SVG icons.

## State Management

-   **React Context API (`ReceiptsContext.tsx`)**: Provides global access to `receipts` data and core functions (`deleteReceipt`, `updateReceipt`), avoiding "prop drilling".
-   **`useLocalStorage` Hook**: Persists small, critical metadata (receipts array, custom categories) across sessions.
-   **Component State (`useState`)**: Used for local UI concerns like modal visibility and edit modes.

## Data Persistence & Offline-First Strategy

The application uses a robust, dual-storage strategy to ensure full offline functionality while handling large data efficiently.

1.  **`localStorage` for Metadata**: The `receipts` array (containing text data like merchant, date, items, etc.) and `customCategories` are stored in `localStorage` via the `useLocalStorage` hook. This data is small, and `localStorage` provides fast, synchronous access, making the UI feel snappy.

2.  **`IndexedDB` for Image Data**: To overcome the 5-10MB size limitation of `localStorage` and avoid performance bottlenecks, all large receipt images (as base64 strings) are stored in **IndexedDB**. This is a proper, asynchronous browser database designed for significant amounts of structured data. The `services/imageStore.ts` module provides a simple `(saveImage, getImage, deleteImage)` API to abstract away IndexedDB's complexity.

-   **Linking Data**: Each receipt's unique `id` is used as the key for both its metadata entry in the `localStorage` array and its image entry in the IndexedDB object store, ensuring a clear link between the two.

### Offline Data Flow

1.  A user adds a new receipt while offline.
2.  The `useOnlineStatus` hook reports `isOnline: false`.
3.  The `addReceipt` function in `App.tsx` saves the image to IndexedDB and the metadata (with `status: 'pending'`) to `localStorage`.
4.  The receipt immediately appears in the UI, tagged with a "Pending sync" status. The image is loaded directly from the local IndexedDB.
5.  When the user reconnects, a `useEffect` in `App.tsx` detects the change and simulates a sync process, updating the status from `'pending'` to `'syncing'` and finally to `'synced'`.

This architecture ensures that the application is always responsive and functional, regardless of network connectivity, and can scale to handle a large number of high-resolution receipt images without crashing the browser.

## Services & Utilities

-   **`services/geminiService.ts`**: An abstraction layer for all communication with the Google Gemini API.
-   **`services/imageStore.ts`**: An abstraction layer for all interactions with the browser's IndexedDB, managing the storage of large image files.
-   **`utils/colors.ts`**: A utility for generating consistent colors for categories.
-   **`utils/csv.ts`**: Handles the logic for exporting receipt data to CSV.