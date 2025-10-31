# Project Roadmap

This document outlines the planned features and future direction for the Travel Receipt Manager application.

## Short-Term Goals (Next 1-3 Months)

-   **Expense Categorization**:
    -   Use the Gemini API to automatically suggest an expense category (e.g., "Food & Drink", "Transportation", "Accommodation") based on the merchant name or items on the receipt.
    -   Allow users to create custom categories and manually assign them.

-   **Enhanced Reporting**:
    -   Create a simple dashboard view to visualize spending.
    -   Display total spending for the current trip and charts showing spending by category.

-   **Improved Currency Conversion**:
    -   Integrate a free currency exchange rate API.
    -   Allow the user to set a "home currency" and automatically display converted totals for all receipts.

-   **Production Build Process**:
    -   Remove the Tailwind CSS CDN script.
    -   Integrate Tailwind CSS into a proper PostCSS build process for better performance and production optimization.

## Medium-Term Goals (3-6 Months)

-   **Cloud Backup & Multi-Device Sync**:
    -   Move beyond `localStorage` to a cloud-based database solution (e.g., Firebase Firestore).
    -   Implement user authentication (e.g., Google Sign-In).
    -   This will allow users to securely back up their data and access their receipts from multiple devices.

-   **Advanced Search and Filtering**:
    -   Implement a search bar to find receipts by merchant name, item, or date range.
    -   Add filtering options to view receipts only from specific categories.

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