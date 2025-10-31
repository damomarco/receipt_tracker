# Travel Receipt Manager

A Progressive Web App (PWA) to capture, process, and organize cash receipt photos for school trips to Japan using AI-powered OCR and translation. It simplifies expense tracking with offline capabilities.

## Key Features

- **AI-Powered Receipt Scanning**: Utilizes the Google Gemini API to automatically extract merchant names, dates, and total amounts from receipt photos.
- **Bilingual Support**: Translates Japanese merchant names into English for clarity.
- **Interactive AI Chat**: Ask follow-up questions about any receipt image to get more details, such as a list of itemized purchases.
- **Full Offline Capability**: Add new receipts even without an internet connection. The app automatically syncs them once you're back online.
- **Data Editing**: Easily correct or update any information extracted by the AI.
- **CSV Export**: Export receipts for any given day into a CSV file for easy reporting.
- **Responsive Design**: A clean, mobile-first interface that works great on any device.
- **PWA Ready**: Can be installed on a mobile device's home screen for a native-app-like experience.

## Tech Stack

- **Frontend**: React.js, TypeScript
- **Styling**: Tailwind CSS (via CDN)
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **Local Storage**: `localStorage` API for offline data persistence.
- **State Management**: React Hooks (`useState`, `useEffect`) and custom hooks.

## How to Use

1.  **Add a Receipt**: Click the large `+` button at the bottom right of the screen.
2.  **Capture or Upload**: Take a photo of your receipt or upload an existing image.
3.  **Automatic Processing**: The app will automatically send the image to the Gemini API to extract the relevant details.
4.  **Review and Save**: The extracted data will appear in editable fields. Review the information, make any necessary corrections, and click "Save Receipt".
5.  **Ask Questions**: Use the chat interface in the add/edit modal to ask specific questions about the receipt, like "What items are listed?".
6.  **Manage Receipts**: View all your receipts on the main screen, grouped by date.
7.  **Edit or Delete**: Use the icons on each receipt card to edit its details or delete it.
8.  **Export Data**: Click the "Export" button for any date to download a CSV file of that day's receipts.