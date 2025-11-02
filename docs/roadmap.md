# Project Roadmap

This document outlines the planned features and future direction for the Travel Receipt Manager application.

## Short-Term Goals (Next 1-3 Months)

### Recently Completed

-   **Advanced Search and Filtering**:
    -   **Status**: ✅ **Done**
    -   **Description**: Implemented a comprehensive search and filter system. Includes a real-time search bar for merchants and items, a dynamic advanced filter modal (date range, amount, and context-aware categories that only show options currently in use), a dedicated flat-list view for search results, and highlighting of matched terms within receipts.

-   **Trip Management & Filtering**:
    -   **Status**: ✅ **Done**
    -   **Description**: Implemented a core trip management system. Users can create, update, and delete trips. The main UI is now trip-centric, allowing users to filter their receipts by a selected trip for a more focused view.

-   **Trip-Specific Spending Summary**:
    -   **Status**: ✅ **Done**
    -   **Description**: Replaced the global dashboard with a more contextual "Trip Summary." This summary, which includes total spending and a category breakdown chart, is now embedded directly within each trip's collapsible view in the main list.

-   **Improved Currency Conversion**:
    -   **Status**: ✅ **Done**
    -   **Description**: Integrated the Frankfurter.app API to fetch historical exchange rates. Users can now set a "home currency" and see a grand total converted to that currency, with rates cached for offline use. The correct rate for the date of each receipt is used.

-   **Locale-Aware Date Formatting**:
    -   **Status**: ✅ **Done**
    -   **Description**: Implemented automatic date formatting based on the selected home currency. Dates are now displayed in a familiar, regional format (e.g., MM/DD/YYYY for USD), enhancing the international user experience.

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

-   **Manual Data Portability (Import/Export)**:
    -   **Status**: ✅ **Done**
    -   **Description**: Implemented JSON export/import for all user data (receipts, categories, trips, and images). This gives users a way to move their data between devices or for personal archival. It is a data portability tool, while the future BaaS will serve as the primary backup mechanism.
    -   **Reward (Medium)**: Important for giving users control over their data in a local-first application.
    -   **Risk (Low)**: A straightforward feature to implement using standard browser APIs.

## Medium-Term Goals (3-6 Months)

-   **Cloud Sync & Collaboration (via BaaS)**:
    -   **Status**: **Next Up**
    -   **Description**: Integrate a Backend-as-a-Service (BaaS) to enable real-time data synchronization between multiple devices and users (e.g., a receipt collector and a finance manager). This feature will introduce user authentication and will become the primary mechanism for automatic cloud backup. This is the next major architectural evolution.
    -   **Reward (Critical)**: Transforms the app from a personal utility into a collaborative tool, enabling powerful new use cases and ensuring data safety.
    -   **Risk (High)**: A significant architectural change that requires careful implementation of authentication, data migration for existing users, and refactoring of data access logic.

-   **AI-Driven Budgeting Insights**:
    -   **Status**: Planned
    -   **Description**: Create a new "Insights" section where users can ask the Gemini API to analyze spending patterns for a trip or date range and provide helpful summaries or identify anomalies.
    -   **Reward (High)**: Moves the app from a passive data store to a proactive financial assistant, providing unique value.
    -   **Risk (Low)**: A natural extension of the existing "Global Chat" functionality.

-   **AI Confidence Scores**:
    -   **Status**: Planned
    -   **Description**: Ask the AI model for a confidence score for each extracted field (e.g., merchant, total) and display it in the UI, highlighting fields that may need user review.
    -   **Reward (Medium)**: Builds user trust in the AI by being transparent about its certainty. Helps guide the user's attention, speeding up the verification process.
    -   **Risk (Low)**: Dependent on the AI model being able to provide this information. If available, the implementation is a relatively simple UI change.

## Long-Term Goals (6+ Months)

-   **UI Internationalization (i18n)**:
    -   **Description**: Localize the application's user interface into multiple languages.
    -   **Reward (High - for growth)**: Opens the app to a global audience, which is essential for a travel-focused application and can significantly expand the user base.
    -   **Risk (Medium)**: Requires abstracting all UI strings into resource files and implementing a library for translation management. It's a significant upfront effort and requires ongoing maintenance.

-   **Integration with Budgeting Apps**:
    -   **Description**: Provide options to export data in formats compatible with popular budgeting applications (e.g., YNAB).
    -   **Reward (Medium)**: Increases the app's value by making it part of a user's broader financial ecosystem. Caters to power users.
    -   **Risk (Low)**: This is primarily an extension of the existing CSV/JSON export functionality. The main work is researching the specific formats required by other apps.