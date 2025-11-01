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

-   **`App.tsx`**: The root component. It manages the primary application state, including the list of all receipts and modal visibility. It orchestrates the offline/online synchronization logic and contains a crucial `useEffect` hook for performing a one-time data migration to transition older receipt data to the new item-level category structure.
-   **`components/`**:
    -   `Header.tsx`: Displays the application title and the dynamic sync status indicator.
    -   `ReceiptList.tsx`: Renders receipts in collapsible sections grouped by date and triggers the CSV export utility.
    -   `ReceiptItem.tsx`: Represents a single receipt. It manages its `isEditing` state, allowing users to edit receipt details down to the individual item's category and price. In view mode, it displays multiple category tags based on the items within.
    -   `AddReceiptModal.tsx`: A complex modal for adding new receipts. It communicates with `geminiService` and allows the user to review/edit the AI-extracted data, including an editable itemized list where each item has its own category selector.
    -   `GlobalChatModal.tsx`: A modal for interacting with the Gemini API about the entire collection of receipts.
    -   `SpendingSummary.tsx`: Displays high-level statistics like total receipts and spending. It contains the `CategorySpendingChart`.
    -   `CategorySpendingChart.tsx`: Aggregates spending data from *individual items* across all receipts. It visualizes this data as a segmented bar chart showing the percentage breakdown of spending by category, complete with a detailed legend. It also handles grouping by currency.
    -   `ImageModal.tsx`: A reusable modal for displaying a fullscreen, zoomable image of a receipt.
    -   `icons.tsx`: A central repository for all SVG icons.

## State Management

State management is handled primarily through React's built-in hooks.

-   **`useLocalStorage`**: A custom hook abstracting interaction with `localStorage` to ensure data persistence and enable offline functionality.
-   **`useOnlineStatus`**: A custom hook that provides a boolean flag indicating the network status, used to manage receipt syncing.
-   **Component State (`useState`)**: Used for local UI concerns, such as modal visibility, edit modes, and the expanded/collapsed state of UI elements.

## Services Layer

-   **`services/geminiService.ts`**: This file acts as an abstraction layer for all communication with the Google Gemini API.
    -   `processReceiptImage`: Takes a base64 image string and sends it to the Gemini API with a JSON schema that now requires a `category` for *each item* in the `items` array.
    -   `askAboutAllReceipts`: Takes the list of receipts and a user's prompt to provide a conversational query interface.

## Data Flow & Migration

### Adding a Receipt

1.  User uploads an image in the `AddReceiptModal`.
2.  The modal calls `geminiService.processReceiptImage`. The service returns structured JSON where each item has its own AI-suggested category.
3.  The user can review and edit each item's category, price, or description individually.
4.  On save, the `onAddReceipt` function in `App.tsx` is called.
5.  `App.tsx` creates a new receipt object, now with categorized items, and sets its status (`'synced'` or `'pending'`) based on the current online status.

### Data Migration

To handle the architectural shift from receipt-level to item-level categorization, a one-time migration script runs inside a `useEffect` hook in `App.tsx`.
1.  On app load, it checks if any receipts in `localStorage` follow the old data structure (a `category` property on the receipt itself).
2.  If found, it migrates them by assigning the parent receipt's category to each of its items and then removing the now-obsolete top-level `category` property.
3.  This ensures a seamless, non-destructive update for existing users without data loss.

### Synchronization

1.  When the device reconnects to the internet, `useOnlineStatus` triggers a `useEffect` in `App.tsx`.
2.  The effect finds all receipts with a `'pending'` status, updates them to `'syncing'`, and then to `'synced'`. (This simulates a backend sync).