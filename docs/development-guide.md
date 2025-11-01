# Development & Production Guide

This document outlines the standard procedures for setting up the development environment, building the application for production, and deploying it. This guide represents the target architecture we are migrating towards, away from the initial CDN-based prototype setup.

## 1. Project Setup and Structure

The project will be built using **Vite** with the **React + TypeScript** template.

-   **Command**: `npm create vite@latest app -- --template react-ts`
-   **/src**: Contains all application source code (components, hooks, services, etc.).
-   **/public**: Contains static assets like favicons and logos that are copied to the build output as-is.

**Rule**: All application scripts must be bundled. Avoid loading any scripts from external origins in the final build.

## 2. Dependencies

### Core
-   `react`, `react-dom`
-   `@google/genai`
-   `tailwindcss`, `postcss`, `autoprefixer`
-   `monaco-editor` (if an advanced editor is needed)
-   `@monaco-editor/react` (optional wrapper for React integration)

### Optional (for Roadmap Features)
-   **Firebase**: `firebase`
-   **Internationalization (i18n)**: `react-i18next`, `i18next`

### Development
-   `@types/node` for TypeScript projects.

**Installation**:
```bash
# Core build tools and styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Application dependencies
npm install react react-dom @google/genai
npm install firebase react-i18next i18next # As needed
```

## 3. Monaco Editor Integration (Vite)

When integrating Monaco Editor, the Vite setup ensures workers are bundled correctly without complex configuration.

### Vite Configuration (`vite.config.ts`)
This is a safe, proven default configuration for using Monaco Editor's ESM build with Vite.

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // If deploying under a sub-path, set base: '/your-subpath/'
  // base: '/app/', 
  build: { 
    sourcemap: true 
  },
  worker: { 
    format: 'es' 
  },
  optimizeDeps: { 
    include: ['monaco-editor'] 
  }
});
```

### Usage (`@monaco-editor/react` wrapper - Recommended)

This wrapper simplifies editor lifecycle management. Ensure the editor's container has a defined height (e.g., `height: 100vh`).

```tsx
// src/components/MonacoEditor.tsx
import Editor from '@monaco-editor/react';

export default function MonacoEditor() {
  return (
    <Editor
      height="100vh"
      defaultLanguage="javascript"
      defaultValue="// Monaco ready"
      options={{ automaticLayout: true }}
      onMount={(editor, monaco) => {
        const model = monaco.editor.createModel(
          "console.log('Monaco workers OK')",
          "javascript",
          monaco.Uri.parse('inmemory://model/1')
        );
        editor.setModel(model);
      }}
    />
  );
}
```

## 4. Build, Test, and Deploy Pipeline

### Local Workflow
-   `npm run dev`: Starts the Vite development server with Hot Module Replacement (HMR).
-   `npm run build`: Compiles and bundles the application into the `/dist` directory.
-   `npm run preview`: **Crucial Step.** Serves the production build from `/dist` locally to verify its behavior and catch production-only issues before deploying.

### Continuous Integration (CI)
A typical CI pipeline should execute:
1.  `npm ci` (clean install with pinned versions from `package-lock.json`)
2.  `npm run build`
3.  (Optional) `npm run preview` followed by smoke tests against the local server.

### Deployment
1.  Copy the contents of the `/dist` directory to the hosting provider.
2.  **Configure SPA Routing**: Ensure the host rewrites all non-asset requests to `index.html` to support deep links and page refreshes.
3.  **Caching**: Set long `Cache-Control` headers for fingerprinted assets (e.g., `/assets/index-*.js`) and short or `no-cache` headers for `index.html`.

## 5. Migration Strategy & Team Process

To ensure a smooth transition from the legacy setup to the new Vite foundation:

-   **Timebox the Migration**: Focus on moving the core app shell and Monaco first. Stub out complex features if necessary to establish a clean, working baseline quickly.
-   **Achieve Feature Parity Second**: Re-introduce features one by one, keeping the console clean at each step.
-   **Create a Rollback Plan**: Keep the legacy branch. Deploy the new Vite build under a staging subdomain first for thorough testing before promoting to production.

---

## 6. Common Pitfalls and How to Avoid Them

### Environment & Build Process
-   **Pitfall: Mixing Origins**: Loading some scripts from your origin and others from a CDN.
    -   **Symptom**: CORS errors, Monaco workers fail to start.
    -   **Fix**: Serve ALL application code and assets from the same origin. A complete migration means removing all app-related CDN `<script>` tags from `index.html`. Use `npm run preview` to detect cross-origin leaks.
-   **Pitfall: Loading TS/TSX in the Browser**: Using `<script type="module" src="/src/index.tsx">`.
    -   **Symptom**: "Unexpected token <" or MIME type errors.
    -   **Fix**: The browser should only ever receive compiled JavaScript. Vite handles this automatically. Your `index.html` should only contain a `<script type="module" src="/src/main.tsx">`.
-   **Pitfall: Inconsistent Environment Variables & Base Paths**: Assets work in dev but give 404s in prod when deployed to a sub-directory (e.g., `https://example.com/app/`).
    -   **Symptom**: 404 errors for assets and workers in production.
    -   **Fix**: Set the `base` property in `vite.config.ts` to your sub-path (e.g., `base: '/app/'`).
-   **Pitfall: Not Pinning Versions**: `npm install` pulling a new, breaking version of a dependency.
    -   **Symptom**: Surprise breakages after a clean install.
    -   **Fix**: Use `package-lock.json` and run `npm ci` in automated environments (like CI/CD) for reproducible builds.

### Monaco Editor Specifics
-   **Pitfall: Misconfigured Workers**: Using the wrong build or loader for Vite.
    -   **Symptom**: "Could not create web worker(s)" error; language features like autocomplete are missing.
    -   **Fix**: Use the `monaco-editor` ESM build from `npm` and let Vite handle the bundling. Avoid legacy `loader.js` setups.
-   **Pitfall: Editor Container Sizing**: The editor's container `div` has no defined height.
    -   **Symptom**: A blank or tiny editor appears with no console errors.
    -   **Fix**: Ensure the container has a real height (e.g., `height: 100vh` or `height: 500px`). Use `options={{ automaticLayout: true }}`.
-   **Pitfall: Excessive Bundle Size**: Including all Monaco languages by default.
    -   **Symptom**: Large JS payloads and slow initial load time.
    -   **Fix**: For production apps, consider dynamically importing only the languages you need or use a plugin to prune unused features.

### Security & Browser Issues
-   **Pitfall: Over-permissive CORS**: Using `Access-Control-Allow-Origin: *` as a crutch in development.
    -   **Symptom**: Works in dev, breaks in production.
    -   **Fix**: Keep everything first-party. If you must fetch from a remote API, proxy it through your own backend if possible so the browser sees it as same-origin.
-   **Pitfall: Restrictive CSP or Sandboxed iframes**: Blocking worker creation.
    -   **Symptom**: Workers blocked, silent failures, console CSP errors.
    -   **Fix**: If you require a Content Security Policy (CSP), ensure it includes `worker-src 'self' blob:`. Start without a strict CSP, get the editor working, then re-introduce it.
-   **Pitfall: Browser Extensions**: Extensions injecting scripts that cause console noise.
    -   **Symptom**: Confusing `runtime/sendMessage` errors in the console.
    -   **Fix**: Always validate in a clean browser profile or Incognito mode with extensions disabled before debugging.

---

## 7. Verification Checklist

The following must be true for a successful build and deployment:

-   ✅ **No Console Errors**: The browser console is free of errors.
-   ✅ **Same-Origin Workers**: Network tab shows Monaco worker requests are same-origin (`/assets/...`) or `blob:` and return `200 OK`.
-   ✅ **No External Scripts**: No application logic is loaded from external CDNs.
-   ✅ **HMR Works**: In dev (`npm run dev`), the app updates instantly on code changes.
-   ✅ **Preview Matches Production**: `npm run preview` behaves identically to the deployed app.
-   ✅ **SPA Routing Works**: Refreshing the page on a deep link (e.g., `/trips/japan`) correctly loads the app and not a 404.

### Manual Sanity Test
You can run this in the browser's DevTools console to quickly check if the Monaco environment is alive:
```javascript
// Await the global monaco object if using the loader,
// or access it directly if imported in your app.
await monaco.languages.getLanguages() 
// Should resolve to an array with many languages, confirming the service is running.
```