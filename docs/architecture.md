# Application Architecture

This document provides a technical overview of the Travel Receipt Manager application's architecture.

## Overview

The application is a client-side, single-page application (SPA) built with **React** and **TypeScript**. It is designed as a **Progressive Web App (PWA)**, emphasizing offline capabilities and a responsive, mobile-first user experience. There is no traditional backend; all data is persisted in the browser's `localStorage` and all AI processing is handled via direct calls to the Google Gemini API.

## Directory Structure

```
/
├── components/      # Reusable React components
├── contexts/        # React Context providers
├── docs/            # Project documentation
├── hooks/           # Custom React hooks
├── services/        # API communication layer
├── utils/           # Utility functions (e.g., CSV export, color generation)
├── App.tsx          # Main application component
├── index.tsx        # Application entry point
├── types.ts         # TypeScript type definitions
└── ...
```

## Component Breakdown

-   **`App.tsx`**: The root component. It manages the top-level application state (receipts, custom categories) and modal visibility. It orchestrates the offline/online synchronization logic and wraps the application in the `ReceiptsProvider` to make state available globally.
-   **`components/`**:
    -   `Header.tsx`: Displays the application title, sync status, and a settings menu for managing categories and themes.
    -   `ReceiptList.tsx`: Consumes data from `ReceiptsContext`. Renders receipts in collapsible sections grouped by date.
    -   `ReceiptItem.tsx`: Consumes data and functions from `ReceiptsContext`. Manages its `isEditing` state, allowing users to edit receipt details.
    -   `AddReceiptModal.tsx`: A complex modal for adding new receipts. It requests GPS location and communicates with `geminiService`. It allows users to review/edit the AI-extracted data and displays clickable suggestions if the AI is uncertain about the location.
    -   `GlobalChatModal.tsx`: Consumes `receipts` data from `ReceiptsContext` for interacting with the Gemini API about the entire receipt collection.
    -   `ManageCategoriesModal.tsx`: Provides the UI for users to add, edit, and delete their custom expense categories.
    -   `SpendingSummary.tsx`: Consumes data from `ReceiptsContext`. Displays high-level statistics and contains the `CategorySpendingChart`.
    -   `CategorySpendingChart.tsx`: Consumes data from `ReceiptsContext`. Aggregates and visualizes spending data as a segmented bar chart. Uses `React.useMemo` for performance optimization.
    -   `ImageModal.tsx`: A reusable modal for displaying a fullscreen, zoomable image of a receipt.
    -   `icons.tsx`: A central repository for all SVG icons.

## State Management

State management has been refactored to use **React Context API** to avoid "prop drilling" and create a more scalable architecture.

-   **`ReceiptsContext.tsx`**: Defines a `ReceiptsContext` and a `useReceipts` custom hook. This context provides the `receipts` array, `allCategories`, and functions like `deleteReceipt` and `updateReceipt` to any component in the tree that needs them, without passing them down through props.
-   **`App.tsx`**: Acts as the single source of truth. It uses the `useLocalStorage` hook to persist receipts and custom categories. It then provides this state and its modifier functions to the entire application via the `ReceiptsProvider`.
-   **`useLocalStorage`**: A custom hook abstracting interaction with `localStorage` to ensure data persistence across sessions.
-   **`useOnlineStatus`**: A custom hook that provides a boolean flag indicating the network status, used to manage receipt syncing.
-   **Component State (`useState`)**: Used for local UI concerns, such as modal visibility and edit modes.

## Services & Utilities

-   **`services/geminiService.ts`**: An abstraction layer for all communication with the Google Gemini API. It accepts a dynamic list of categories to improve AI suggestions and can use optional GPS coordinates. It returns a structured location object that includes a list of possible countries if the AI is uncertain, enhancing the user's ability to correct data.
-   **`utils/colors.ts`**: A utility module that dynamically generates consistent, unique colors for custom categories using a simple hashing function, enhancing the UI's visual clarity.

## Data Flow & Migration

### Adding a Receipt

1.  User opens the `AddReceiptModal`, which triggers a browser request for geolocation.
2.  User uploads an image.
3.  The modal calls `geminiService.processReceiptImage`, passing the image, all categories, and the (optional) GPS coordinates.
4.  The service returns structured JSON. If the location is ambiguous, it includes a `determined` location and a list of `suggestions`.
5.  The `AddReceiptModal` displays the extracted data and any location suggestions as clickable buttons.
6.  On save, the `addReceipt` function in `App.tsx` is called with the final, user-verified data.
7.  `App.tsx` updates its state, which is automatically propagated through the `ReceiptsContext` to all consuming components, triggering a re-render.

### Data Migration

To handle the architectural shift from receipt-level to item-level categorization, a one-time migration script runs inside a `useEffect` hook in `App.tsx`. This ensures a seamless, non-destructive update for existing users without data loss.