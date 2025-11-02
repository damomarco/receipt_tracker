# Development Guide

This document outlines the development environment and best practices for the Travel Receipt Manager application.

## 1. Architectural Overview

The application is a **client-side Progressive Web App (PWA)** that runs entirely in the browser. It is built using React and TypeScript but **does not use a traditional build step** like Vite or Webpack. This approach is intentionally chosen to enable rapid development and deployment within the AI Studio platform.

-   **Entry Point**: The application starts at `index.html`.
-   **Dependencies**: All major dependencies (React, @google/genai) are loaded from the AI Studio CDN via an `importmap` in `index.html`.
-   **Application Code**: The main application logic resides in `/index.tsx`, which is loaded as a standard ES module (`<script type="module">`).

## 2. Development Environment

There is no local server or build process to run. Development is done by editing the source files directly. You can serve the project folder using any simple static file server to test changes in your browser.

### Adding Dependencies

New dependencies must be available on the AI Studio CDN (`aistudiocdn.com`). To add one:
1.  Find the CDN URL for the desired package and version.
2.  Add it to the `"imports"` object in the `importmap` within `index.html`.

### Styling with Tailwind CSS

Tailwind CSS is loaded and configured directly in `index.html` via its CDN script.
-   **Dark Mode**: The `darkMode: 'class'` strategy is enabled.
-   **No JIT Compilation**: Because there is no build step, Tailwind's Just-In-Time (JIT) compiler does not run. This means you **cannot use dynamic or arbitrary classes** in your code (e.g., `className={`w-[${size}px]`}`).
-   **Solution**: All class names must be complete, static strings present in the source code. The application uses a utility function (`utils/colors.ts`) to map dynamic values (like category names) to static class strings, ensuring Tailwind's CDN build can detect and apply the styles correctly.

## 3. Best Practices for a CDN-Based Environment

Working without a build tool requires a deliberate focus on code quality and runtime performance.

-   **Code Organization**: Even though the code is loaded as a single module tree, it's critical to maintain a clean and logical directory structure (`components/`, `hooks/`, `services/`, etc.). This keeps the codebase manageable and easy to navigate.

-   **Performance is Key**:
    -   **Memoization**: Aggressively use `React.useMemo`, `React.useCallback`, and `React.memo` to prevent unnecessary re-renders. Without code-splitting, the entire app re-evaluates on state changes, so memoization is our primary tool for keeping the UI fast.
    -   **Lean Dependencies**: Every script added to the `importmap` increases the initial load time. Be critical about adding new libraries and favor vanilla JavaScript solutions where possible.
    -   **Data Storage**: Be mindful of expensive operations. The current architecture correctly loads data from `localStorage` into React state once, avoiding repeated access within render loops.

-   **Security**:
    -   All application code is publicly visible in the browser. Never embed sensitive information or business logic that should not be exposed.
    -   The Gemini API key is handled securely by the AI Studio environment via `process.env.API_KEY` and is not exposed in the client-side code. Do not attempt to manage or store other API keys directly in the code.