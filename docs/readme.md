# Travel Receipt Manager

A Progressive Web App (PWA) to capture, process, and organize cash receipt photos for school trips to Japan using AI-powered OCR and translation. It simplifies expense tracking with offline capabilities.

## Key Features

- **AI-Powered Receipt Scanning**: Utilizes the Google Gemini API to automatically extract merchant names, dates, and total amounts from receipt photos.
- **AI-Powered Itemization & Categorization**: Automatically extracts and categorizes individual line items from the receipt, providing a granular breakdown of expenses.
- **Bilingual Support**: Translates Japanese merchant names and item descriptions into English for clarity.
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

## Tech Stack

- **Frontend**: React.js, TypeScript
- **Styling**: Tailwind CSS (via CDN)
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **Local Storage**: `localStorage` API for offline data persistence.
- **State Management**: React Context API and Hooks (`useState`, `useEffect`, `useContext`, `useMemo`) for centralized and performant state management.

## How to Use

1.  **Add a Receipt**: Click the large `+` button at the bottom right of the screen.
2.  **Capture or Upload**: Take a photo of your receipt or upload an existing image.
3.  **Automatic Processing**: The app will automatically send the image to the Gemini API to extract the relevant details, including an itemized list with a suggested category for each item.
4.  **Review and Save**: The extracted data will appear in editable fields. Review the information, edit line items and their categories as needed, and click "Save Receipt".
5.  **Analyze Your Spending**: View the "Spending Summary" at the top of the main screen to see a percentage-based breakdown of your expenses by category.
6.  **Ask Questions About All Receipts**: Tap the chat bubble icon on the main screen to open the global chat. Ask questions like "How much did I spend in total?" or "List all my food expenses."
7.  **Manage Receipts**: View all your receipts on the main screen, grouped by date. Use the "Show items" toggle to see the itemized list for a specific receipt.
8.  **Edit or Delete**: Use the icons on each receipt card to edit its details or delete it.
9.  **Export Data**: Click the "Export" button for any date to download a CSV file of that day's receipts.