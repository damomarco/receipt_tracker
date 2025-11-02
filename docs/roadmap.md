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
    -   **Status**: **Next Up**
    -   **Description**: Allow users to group receipts into distinct "trips," each with its own name and date range. This will be implemented on the current local-first architecture and will define the data model for the future cloud sync feature.
    -   **Reward (High)**: A powerful organizational feature that aligns perfectly with the app's purpose. It allows for trip-specific budgeting and is a major value-add for users.
    -   **Risk (Medium)**: Requires data model changes (e.g., adding a `tripId` to receipts) and new UI for managing trips.

-   **Advanced Search and Filtering**:
    -   **Status**: Planned
    -   **Description**: Implement a global search bar and add filtering options to the main receipt list.
    -   **Reward (Medium)**: Improves usability significantly as the number of receipts grows, allowing users to find information quickly.
    -   **Risk (Low)**: For client-side search, this is a low-risk feature. The logic involves filtering the existing `receipts` array.

-   **Manual Data Portability (Import/Export)**:
    -   **Status**: Planned
    -   **Description**: Implement JSON export/import for all user data (receipts, categories, trips). This gives users a way to move their data between devices or for personal archival. It is a data portability tool, while the future BaaS will serve as the primary backup mechanism.
    -   **Reward (Medium)**: Important for giving users control over their data in a local-first application.
    -   **Risk (Low)**: A straightforward feature to implement using standard browser APIs.

## Medium-Term Goals (3-6 Months)

-   **Cloud Sync & Collaboration (via BaaS)**:
    -   **Status**: **High Priority**
    -   **Description**: Integrate a Backend-as-a-Service (BaaS) to enable real-time data synchronization between multiple devices and users (e.g., a receipt collector and a finance manager). This feature will introduce user authentication and will become the primary mechanism for automatic cloud backup. This is the next major architectural evolution after Trip Management is complete.
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
