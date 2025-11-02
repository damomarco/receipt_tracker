# Project Roadmap

This document outlines the planned features and future direction for the Travel Receipt Manager application.

## Short-Term Goals (Next 1-3 Months)

### Recently Completed

-   **Improved Currency Conversion**:
    -   **Status**: ✅ **Done**
    -   **Description**: Integrated the Frankfurter.app API to fetch historical exchange rates. Users can now set a "home currency" and see a grand total converted to that currency, with rates cached for offline use. The correct rate for the date of each receipt is used.

-   **Monthly Grouping**:
    -   **Status**: ✅ **Done**
    -   **Description**: Implemented monthly collapsible sections in the main receipt list to better organize receipts from longer trips. Each month contains the existing collapsible daily lists.

-   **Migrate Image Storage to IndexedDB**:
    -   **Status**: ✅ **Done**
    -   **Description**: Re-architected data persistence to move image storage from `localStorage` to IndexedDB. This solves the 5-10MB storage limit, significantly improves performance, and makes the app scalable for users with many receipts.

-   **Batch Uploads**:
    -   **Status**: ✅ **Done**
    -   **Description**: Implemented the ability for users to select and upload multiple receipt images at once. The UI now includes a processing queue, making data entry for multiple receipts much more efficient.

-   **AI Location Detection**:
    -   **Status**: ✅ **Done**
    -   **Description**: The AI now analyzes the receipt to automatically identify and extract the location (city, country). This is now enhanced by using the device's GPS location (with user permission) as a hint to the AI, significantly improving accuracy for receipts in globally spoken languages.

-   **Custom Categories**:
    -   **Status**: ✅ **Done**
    -   **Description**: Implemented a settings modal allowing users to add, edit, and delete their own custom expense categories. These categories are now used by the Gemini AI and throughout the app's UI.

-   **Expense Categorization**:
    -   **Status**: ✅ **Done**
    -   **Description**: The Gemini API now suggests a category for each individual item on a receipt. The UI has been updated to support item-level category editing.
-   **Enhanced Reporting Dashboard**:
    -   **Status**: ✅ **Done**
    -   **Description**: Implemented a "Spending Summary" view that shows total expenses and a segmented bar chart that visualizes spending by category.

-   **Enhanced Reporting Filtering**:
    -   **Status**: ✅ **Done**
    -   **Description**: Integrated date-range filters into the "Spending Summary" section. Users can now select start and end dates to filter the summary stats and category charts, allowing for analysis of specific trips or time periods.

### Planned

-   **Trip Management**:
    -   **Status**: Planned
    -   **Description**: Allow users to group receipts into distinct "trips," each with its own name, date range, and reporting.
    -   **Reward (High)**: A powerful organizational feature that aligns perfectly with the app's purpose. It allows for trip-specific budgeting and is a major value-add for users.
    -   **Risk (Medium)**: Requires data model changes (e.g., adding a `tripId` to receipts) and new UI for managing trips. Care must be taken to migrate existing data for current users.

-   **Advanced Search and Filtering**:
    -   **Status**: Planned
    -   **Description**: Implement a global search bar and add filtering options to the main receipt list.
    -   **Reward (Medium)**: Improves usability significantly as the number of receipts grows, allowing users to find information quickly.
    -   **Risk (Low)**: For client-side search, this is a low-risk feature. The logic involves filtering the existing `receipts` array.

-   **Manual Data Backup (Import/Export)**:
    -   **Status**: Planned
    -   **Description**: Implement JSON export/import for all user data (receipts, categories). This gives users a manual way to back up their data and migrate it between devices.
    -   **Reward (High)**: Critically important for a local-only application. It mitigates the risk of data loss and serves as the primary backup mechanism.
    -   **Risk (Low)**: A straightforward feature to implement using standard browser APIs.

## Medium-Term Goals (3-6 Months)

-   **AI-Driven Budgeting Insights**:
    -   **Description**: Create a new "Insights" section where users can ask the Gemini API to analyze spending patterns for a trip or date range and provide helpful summaries or identify anomalies.
    -   **Reward (High)**: Moves the app from a passive data store to a proactive financial assistant, providing unique value.
    -   **Risk (Low)**: A natural extension of the existing "Global Chat" functionality.

-   **AI Confidence Scores**:
    -   **Description**: Ask the AI model for a confidence score for each extracted field (e.g., merchant, total) and display it in the UI, highlighting fields that may need user review.
    -   **Reward (Medium)**: Builds user trust in the AI by being transparent about its certainty. Helps guide the user's attention, speeding up the verification process.
    -   **Risk (Low)**: Dependent on the AI model being able to provide this information. If available, the implementation is a relatively simple UI change.

-   **Cloud Backup & Multi-Device Sync**:
    -   **Description**: *This feature is currently de-prioritized.* Due to the security and complexity challenges of implementing a backend within the current CDN-based platform, this is a high-risk endeavor. The short-term focus is on providing a robust manual data backup feature via JSON import/export, which serves as a safer, more practical alternative for users.

## Long-Term Goals (6+ Months)

-   **UI Internationalization (i18n)**:
    -   **Description**: Localize the application's user interface into multiple languages.
    -   **Reward (High - for growth)**: Opens the app to a global audience, which is essential for a travel-focused application and can significantly expand the user base.
    -   **Risk (Medium)**: Requires abstracting all UI strings into resource files and implementing a library for translation management. It's a significant upfront effort and requires ongoing maintenance.

-   **Integration with Budgeting Apps**:
    -   **Description**: Provide options to export data in formats compatible with popular budgeting applications (e.g., YNAB, Mint).
    -   **Reward (Medium)**: Increases the app's value by making it part of a user's broader financial ecosystem. Caters to power users.
    -   **Risk (Low)**: This is primarily an extension of the existing CSV export functionality. The main work is researching the specific formats required by other apps.