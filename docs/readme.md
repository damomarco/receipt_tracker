
# Travel Receipt Manager

A Progressive Web App (PWA) to capture, process, and organize cash receipt photos for your travels using AI-powered OCR and translation. It simplifies expense tracking with offline capabilities.

## Key Features

- **AI-Powered Receipt Scanning**: Utilizes the Google Gemini API to automatically extract merchant names, dates, and total amounts from receipt photos.
- **AI-Powered Itemization & Categorization**: Automatically extracts and categorizes individual line items from the receipt, providing a granular breakdown of expenses.
- **AI-Powered Location Detection**: The AI automatically identifies the city and country from the receipt's text, enhanced with optional GPS data for greater accuracy. If the AI is uncertain about the country, it will provide a list of suggestions.
- **Batch Uploads**: Select and process multiple receipt images at once, streamlining data entry.
- **Bilingual Support**: Translates merchant names and item descriptions from their original language into English for clarity.
- **Global AI Chat**: Ask questions about your entire collection of receipts. Get instant answers for things like total spending, most expensive items, or expenses by category.
- **Custom Category Management**: Add, edit, and delete your own expense categories for personalized tracking.
- **Advanced Spending Summary**: Visualize your spending with a consolidated, segmented bar chart that shows the percentage breakdown by category for each currency.
- **Full Offline Capability**: Add new receipts even without an internet connection. The app automatically syncs them once you're back online.
- **Granular Data Editing**: Easily correct or update any information extracted by the AI, including the category, price, and description of each individual line item.
- **Collapsible Day View**: Receipts are grouped by date in collapsible sections for a cleaner, more organized view.
- **Fullscreen Image Viewer**: Tap any receipt thumbnail to view a high-resolution, zoomable image of the receipt.
- **CSV Export**: Export receipts for any given day into a CSV file for easy reporting, now including detailed itemized data.
- **Responsive Design**: A clean, mobile-first interface that works great on any device.
- **PWA Ready**: Can be installed on a mobile device's home screen for a native-app-like experience.

## How to Use

1.  **Add a Receipt**: Click the large `+` button at the bottom right of the screen.
2.  **Capture or Upload**: Take a photo of your receipt or upload one or more existing images. Your browser may ask for location access to improve accuracy.
3.  **Automatic Processing**: The app will automatically process the images in a queue, using the Gemini API to extract details.
4.  **Review and Save**: Review the extracted data for all processed receipts and click "Save Receipts".
5.  **Analyze Your Spending**: View the "Spending Summary" at the top of the main screen to see a percentage-based breakdown of your expenses by category.
6.  **Ask Questions About All Receipts**: Tap the chat bubble icon on the main screen to open the global chat. Ask questions like "How much did I spend in total?" or "List all my food expenses."
7.  **Manage Receipts**: View all your receipts on the main screen, grouped by date.
8.  **Edit or Delete**: Use the icons on each receipt card to edit its details or delete it.
9.  **Export Data**: Click the "Export" button for any date to download a CSV file of that day's receipts.

## Privacy

Your privacy is important. Here's how the app handles your data:

-   **Local-First Storage**: All your receipt data is stored locally on your device using a combination of browser technologies.
    -   **Receipt Images**: Stored in **IndexedDB**, a robust browser database designed for large files.
    -   **Receipt Text Data**: Stored in your browser's **`localStorage`**.
-   This data does not leave your device unless you explicitly export it. Clearing your browser's site data will permanently delete all your receipts.
-   **AI Processing**: When you add a receipt, the photo is sent to the Google Gemini API for processing. The image is used solely to extract receipt information and is not stored by Google for other purposes.
-   **Geolocation Data**: The app asks for your location to improve the AI's accuracy. Your GPS coordinates are sent to the Gemini API along with the receipt image for this single request. The coordinates are **not** stored or shared anywhere else. This feature is completely optional.

## Tech Stack

- **Frontend**: React.js, TypeScript
- **Styling**: Tailwind CSS (via CDN)
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **Local Storage**: 
    -   **`IndexedDB`** for storing large image files.
    -   **`localStorage` API** for receipt metadata.
- **State Management**: React Context API and Hooks (`useState`, `useEffect`, `useContext`, `useMemo`).
