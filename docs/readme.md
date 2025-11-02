# Travel Receipt Manager

A Progressive Web App (PWA) to capture, process, and organize cash receipt photos for your travels using AI-powered OCR and translation. It simplifies expense tracking with offline capabilities.

## Key Features

- **AI-Powered Receipt Scanning**: Utilizes the Google Gemini API to automatically extract merchant names, dates, and total amounts from receipt photos.
- **AI-Powered Itemization & Categorization**: Automatically extracts and categorizes individual line items from the receipt, providing a granular breakdown of expenses.
- **AI-Powered Location Detection**: The AI automatically identifies the city and country from the receipt's text, enhanced with optional GPS data for greater accuracy. If the AI is uncertain about the country, it will provide a list of suggestions.
- **Trip Management**: Group receipts into distinct "trips," each with a name and date range, for powerful, contextual organization.
- **Trip-Based Filtering**: A clean dropdown menu allows you to filter your view to see "All Receipts" or focus on a single, specific trip.
- **Trip-Specific Spending Summary**: Embedded directly within each trip's view, this summary provides a consolidated breakdown of spending by category and currency, *only for that trip*.
- **Home Currency Conversion**: Set a "home currency" and see the grand total for each trip automatically converted. The app fetches and caches daily exchange rates to provide accurate, offline-capable conversions.
- **Batch Uploads**: Select and process multiple receipt images at once, streamlining data entry.
- **Optimized for Speed**: Client-side image resizing significantly reduces upload times, making the receipt scanning process faster, especially on mobile networks.
- **Bilingual Support**: Translates merchant names and item descriptions from their original language into English for clarity.
- **Global AI Chat**: Ask questions about your entire collection of receipts. Get instant answers for things like total spending, most expensive items, or expenses by category.
- **Custom Category Management**: Add, edit, and delete your own expense categories for personalized tracking.
- **Full Offline Capability**: Add new receipts even without an internet connection. The app automatically syncs them once you're back online.
- **Granular Data Editing**: Easily correct or update any information extracted by the AI, including the category, price, and description of each individual line item.
- **Fullscreen Image Viewer**: Tap any receipt thumbnail to view a high-resolution, zoomable image of the receipt.
- **CSV Export**: Export all receipts for a specific trip or a single day into a CSV file for easy reporting.
- **Responsive Design**: A clean, mobile-first interface that works great on any device.
- **PWA Ready**: Can be installed on a mobile device's home screen for a native-app-like experience.

## How to Use

1.  **Create a Trip**: Go to the settings menu (gear icon) -> "Manage Trips" to create your first trip.
2.  **Set Your Home Currency**: In the settings menu, select your home currency for automatic expense conversion.
3.  **Add a Receipt**: Click the large `+` button.
4.  **Capture or Upload**: Take a photo or upload images. The app will process them and suggest a trip based on the receipt's date.
5.  **Review and Save**: Review the extracted data and click "Save Receipts".
6.  **Filter by Trip**: Use the dropdown at the top of the main screen to filter which receipts are visible.
7.  **Analyze Your Spending**: Expand a trip in the list to view its "Trip Summary," which shows a percentage-based breakdown of expenses by category for that trip.
8.  **Ask Questions About All Receipts**: Tap the chat bubble icon to open the global chat. Ask questions like "How much did I spend in total on my Japan 2024 trip?"
9.  **Manage Receipts**: View all your receipts on the main screen, grouped by trip and then by date.
10. **Edit or Delete**: Use the icons on each receipt card to edit its details or delete it.
11. **Export Data**: Click the "Export" button for any trip or day to download a CSV file.

## Privacy

Your privacy is important. Here's how the app handles your data:

-   **Local-First Storage**: All your receipt data is stored locally on your device using a combination of browser technologies.
    -   **Receipt Images**: Stored in **IndexedDB**, a robust browser database designed for large files.
    -   **Receipt Text Data & Settings**: Stored in your browser's **`localStorage`**.
-   This data does not leave your device unless you explicitly export it. Clearing your browser's site data will permanently delete all your receipts.
-   **AI Processing**: When you add a receipt, the photo is sent to the Google Gemini API for processing. Before sending, images are resized on your device to a smaller, optimal size, which speeds up uploads and minimizes data transfer. The image is used solely to extract receipt information and is not stored by Google for other purposes.
-   **Exchange Rates**: To convert currencies, the app communicates with the free `frankfurter.app` API. This request does not contain any of your personal or receipt data.
-   **Geolocation Data**: The app asks for your location to improve the AI's accuracy. Your GPS coordinates are sent to the Gemini API along with the receipt image for this single request. The coordinates are **not** stored or shared anywhere else. This feature is completely optional.

## Tech Stack

- **Frontend**: React.js, TypeScript
- **Styling**: Tailwind CSS (via CDN)
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **Local Storage**: 
    -   **`IndexedDB`** for storing large image files.
    -   **`localStorage` API** for receipt metadata and settings.
- **State Management**: React Context API and Hooks (`useState`, `useEffect`, `useContext`, `useMemo`).