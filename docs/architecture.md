# Application Architecture

This document provides a technical overview of the Travel Receipt Manager application's architecture.

## Overview

The application is a client-side, single-page application (SPA) built with **React** and **TypeScript**. It is designed as a **Progressive Web App (PWA)**, emphasizing offline capabilities and a responsive, mobile-first user experience. There is no traditional backend; all data is persisted in the browser's `localStorage` and all AI processing is handled via direct calls to the Google Gemini API.

## Directory Structure

```
/
├── components/      # Reusable React components
├── docs/            # Project documentation
├── hooks/           # Custom React hooks
├── services/        # API communication layer
├── utils/           # Utility functions (e.g., CSV export)
├── App.tsx          # Main application component
├── index.tsx        # Application entry point
├── types.ts         # TypeScript type definitions
└── ...
```

## Component Breakdown

-   **`App.tsx`**: The root component. It manages the primary application state, including the list of all receipts and the visibility of the "Add Receipt" modal. It also orchestrates the offline/online synchronization logic.
-   **`components/`**:
    -   `Header.tsx`: A stateless component that displays the application title and the dynamic sync status indicator (Offline, Syncing, Synced).
    -   `ReceiptList.tsx`: Renders receipts in collapsible sections grouped by date. It handles the logic for grouping and sorting, and manages the expanded/collapsed state of each date group. It also triggers the CSV export utility.
    -   `ReceiptItem.tsx`: Represents a single receipt in the list. It manages its own `isEditing` state to switch between view and edit modes. It displays a thumbnail of the receipt which, when tapped, opens a fullscreen modal to view the full image. It also contains the AI chat functionality for asking questions about an existing receipt.
    -   `AddReceiptModal.tsx`: A complex modal component for adding new receipts. It handles file input, displays a preview of the receipt image, communicates with the `geminiService` to process the image, and allows the user to review/edit the extracted data—including an editable itemized list—before saving.
    -   `ImageModal.tsx`: A reusable modal component that displays a given image source in a fullscreen, dismissible overlay. It provides an accessible way for users to inspect images in detail.
    -   `icons.tsx`: A central repository for all SVG icons used in the application, making them easy to manage and reuse.

## State Management

State management is handled primarily through React's built-in hooks.

-   **`useLocalStorage`**: A custom hook that abstracts the interaction with the browser's `localStorage`. It keeps the `receipts` state synchronized with local storage, ensuring data persistence across sessions and enabling the app's offline functionality.
-   **`useOnlineStatus`**: A custom hook that listens to the browser's `online` and `offline` events. It provides a simple boolean flag that the `App.tsx` component uses to determine the network status and decide when to sync pending receipts.
-   **Component State (`useState`)**: Local component state is used for UI concerns, such as the open/closed state of modals (`isModalOpen` in `App.tsx`), the edit mode for a specific receipt (`isEditing` in `ReceiptItem.tsx`), or the visibility of the itemized list (`isItemsVisible` in `ReceiptItem.tsx`).

## Services Layer

-   **`services/geminiService.ts`**: This file acts as an abstraction layer for all communication with the Google Gemini API.
    -   `processReceiptImage`: Takes a base64 image string, sends it to the Gemini API with a specific prompt and a JSON schema, and returns the structured data (`ExtractedReceiptData`), which now includes an array of `items`.
    -   `askAboutImage`: Takes a base64 image and a freeform text prompt, sends them to the Gemini API, and returns the model's text response.

## Data Flow

### Adding a Receipt (Online)

1.  User clicks the `+` button, setting `isModalOpen` to `true` in `App.tsx`.
2.  `AddReceiptModal` mounts. User uploads an image.
3.  The modal calls `geminiService.processReceiptImage`.
4.  The service returns structured JSON data, including an array of items, which is stored in the modal's local state.
5.  User reviews and edits the data, including the itemized list.
6.  User clicks "Save". The modal calls the `onAddReceipt` prop function passed down from `App.tsx`.
7.  `App.tsx` creates a new receipt object with a status of `'synced'`, adds it to the main `receipts` array, and updates `localStorage` via `setReceipts`.

### Adding a Receipt (Offline)

1.  The flow is identical to the online flow, except for the final step.
2.  When `App.tsx` creates the new receipt object, it checks the `isOnline` status from the `useOnlineStatus` hook.
3.  Because the app is offline, the receipt is saved with a status of `'pending'`.

### Synchronization

1.  When the device reconnects to the internet, the `useOnlineStatus` hook updates its state.
2.  A `useEffect` hook in `App.tsx` is triggered by the change in `isOnline`.
3.  It filters the `receipts` array for any items with a `'pending'` status.
4.  It updates their status to `'syncing'` to provide visual feedback.
5.  After a simulated delay, it updates their status to `'synced'`. (In a real-world scenario, this is where actual API calls to a backend would happen).