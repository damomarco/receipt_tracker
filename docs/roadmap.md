# Project Roadmap

This document outlines the planned features and future direction for the Travel Receipt Manager application.

## Short-Term Goals (Next 1-3 Months)

### Recently Completed

-   **AI Location Detection**:
    -   **Status**: ✅ **Done**
    -   **Description**: The AI now analyzes the receipt to automatically identify and extract the location (city, country). This is now enhanced by using the device's GPS location (with user permission) as a hint to the AI, significantly improving accuracy for receipts in globally spoken languages.

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
    -   **Reward (High)**: Transforms the summary from a static overview into a dynamic analysis tool. This is a core feature for any expense tracker, allowing users to budget and analyze specific trips or time periods.
    -   **Risk (Low)**: The implementation is straightforward. The main task is creating an intuitive date-range picker UI. The existing app architecture supports this change easily.

-   **Improved Currency Conversion**:
    -   **Status**: Planned
    -   **Description**: Integrate a free currency exchange rate API. Allow the user to set a "home currency" and automatically display converted totals for all receipts.
    -   **Reward (High)**: A key feature for a travel app. It solves a major user pain point by removing the mental math of converting multiple currencies, providing a clear picture of total trip cost.
    -   **Risk (Medium)**: Introduces an external dependency. Requires careful management of API keys, rate limits (via caching), and graceful handling for when the user is offline or the API service is unavailable.

-   **Production Build Process**:
    -   **Status**: Planned
    -   **Description**: Remove the Tailwind CSS CDN script and integrate Tailwind into a proper PostCSS build process for better performance and production optimization.
    -   **Reward (Very High)**: A foundational step for a production-grade application. It will dramatically improve performance (faster load times), enhance the developer experience, and unlock further optimizations.
    -   **Risk (Low)**: This is a standard, well-documented process. The only "risk" is the initial time investment for setup, which is heavily outweighed by the long-term benefits.

## Medium-Term Goals (3-6 Months)

-   **Cloud Backup & Multi-Device Sync**:
    -   **Description**: Move beyond `localStorage` to a cloud-based solution (e.g., Firebase Firestore) and implement user authentication.
    -   **Reward (Critical)**: Prevents data loss if a device is lost/broken and enables a seamless multi-device experience. This is a prerequisite for long-term user retention.
    -   **Risk (High)**: A significant architectural change. It introduces a backend, authentication, security rules, and complex data synchronization logic (handling offline edits, merge conflicts, etc.).

-   **Advanced Search and Filtering**:
    -   **Description**: Implement a global search bar and add filtering options to the main receipt list.
    -   **Reward (Medium)**: Improves usability significantly as the number of receipts grows, allowing users to find information quickly.
    -   **Risk (Low)**: For client-side search, this is a low-risk feature. The logic involves filtering the existing `receipts` array.

-   **Trip Management**:
    -   **Description**: Allow users to group receipts into distinct "trips," each with its own name, date range, and reporting.
    -   **Reward (High)**: A powerful organizational feature that aligns perfectly with the app's purpose. It allows for trip-specific budgeting and is a major value-add for users.
    -   **Risk (Medium)**: Requires significant data model changes (e.g., adding a `tripId` to receipts) and new UI for managing trips. Care must be taken to migrate existing data for current users.

## Long-Term Goals (6+ Months)

-   **Batch Uploads**:
    -   **Description**: Allow users to select and upload multiple receipt images at once, processing them in a queue.
    -   **Reward (Medium)**: A great quality-of-life improvement, especially for users adding many receipts at the end of a trip. Reduces repetitive actions.
    -   **Risk (Medium)**: Requires building a robust UI queueing system to handle multiple uploads, display progress, and manage potential failures for individual images.

-   **UI Internationalization (i18n)**:
    -   **Description**: Localize the application's user interface into multiple languages.
    -   **Reward (High - for growth)**: Opens the app to a global audience, which is essential for a travel-focused application and can significantly expand the user base.
    -   **Risk (Medium)**: Requires abstracting all UI strings into resource files and implementing a library for translation management. It's a significant upfront effort and requires ongoing maintenance.

-   **Integration with Budgeting Apps**:
    -   **Description**: Provide options to export data in formats compatible with popular budgeting applications (e.g., YNAB, Mint).
    -   **Reward (Medium)**: Increases the app's value by making it part of a user's broader financial ecosystem. Caters to power users.
    -   **Risk (Low)**: This is primarily an extension of the existing CSV export functionality. The main work is researching the specific formats required by other apps.

-   **AI Confidence Scores**:
    -   **Description**: Ask the AI for a confidence score for each extracted field and display it in the UI.
    -   **Reward (Medium)**: Builds user trust in the AI by being transparent about its certainty. Helps guide the user's attention to fields that most likely need review, speeding up the verification process.
    -   **Risk (Low)**: This is dependent on the AI model being able to provide this information. If it can, the implementation is a relatively simple UI change.
