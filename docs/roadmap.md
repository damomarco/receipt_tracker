# Project Roadmap

This document outlines the planned features and future direction for the Travel Receipt Manager application.

## Short-Term Goals (Next 1-3 Months)

### Recently Completed

-   **Custom Categories**:
    -   **Status**: ✅ **Done**
    -   **Description**: Implemented a settings modal allowing users to add, edit, and delete their own custom expense categories. These categories are now used by the Gemini AI and throughout the app's UI.

-   **Performance Optimization & Code Refactor**:
    -   **Status**: ✅ **Done**
    -   **Description**: Conducted a full code audit. Refactored state management to use React Context, eliminating prop drilling. Memoized expensive calculations for a more responsive UI and implemented dynamic coloring for custom categories.

-   **Expense Categorization**:
    -   **Status**: ✅ **Done**
    -   **Description**: The Gemini API now suggests a category for each individual item on a receipt. The UI has been updated to support item-level category editing.
-   **Enhanced Reporting Dashboard**:
    -   **Status**: ✅ **Done**
    -   **Description**: Implemented a "Spending Summary" view that shows total expenses and a segmented bar chart that visualizes spending by category.

### Planned

-   **Enhanced Reporting Filtering**:
    -   **Status**: Planned
    -   **Description**: Add date-range filters to the "Spending Summary" to allow users to visualize their spending over specific periods (e.g., last 7 days, specific trip dates).

-   **Improved Currency Conversion**:
    -   **Status**: Planned
    -   **Description**: Integrate a free currency exchange rate API. Allow the user to set a "home currency" and automatically display converted totals for all receipts.

-   **Production Build Process**:
    -   **Status**: Planned
    -   **Description**: Remove the Tailwind CSS CDN script and integrate Tailwind into a proper PostCSS build process for better performance and production optimization.

## Medium-Term Goals (3-6 Months)

-   **Cloud Backup & Multi-Device Sync**:
    -   Move beyond `localStorage` to a cloud-based database solution (e.g., Firebase Firestore).
    -   Implement user authentication (e.g., Google Sign-In).
    -   This will allow users to securely back up their data and access their receipts from multiple devices.

-   **Advanced Search and Filtering**:
    -   Implement a global search bar to find receipts by merchant name, item, or date range.
    -   Add filtering options to the main receipt list to view receipts only from specific categories.

-   **Trip Management**:
    -   Allow users to group receipts into distinct "trips".
    -   Each trip would have a name, date range, and its own budget/reporting.

## Long-Term Goals (6+ Months)

-   **Batch Uploads**:
    -   Allow users to select and upload multiple receipt images at once, processing them in a queue.

-   **UI Internationalization (i18n)**:
    -   Localize the application's user interface into multiple languages, starting with Japanese and English.

-   **Integration with Budgeting Apps**:
    -   Provide options to export data in formats compatible with popular budgeting applications (e.g., YNAB, Mint).

-   **AI Confidence Scores**:
    -   For each piece of data extracted by the AI, display a confidence score to help the user quickly identify fields that may need manual review.