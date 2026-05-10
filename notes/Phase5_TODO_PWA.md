# TODO: Phase 5 - PWA & Offline Support

## Stage 1: Service Worker Integration
- [x] Configure `vite-plugin-pwa` for the frontend.
- [x] Define caching strategies for MDUI assets, fonts, and core UI.
- [x] Implement "Update available" prompt (Auto-update enabled).

## Stage 2: Offline Data Persistence
- [x] Set up IndexedDB (Dexie.js) for local file content caching.
- [x] Implement a "Pending Changes" queue in IndexedDB for offline edits.

## Stage 3: Offline UI States
- [x] Add "Offline" indicator to the UI.
- [x] Implement optimistic updates in the file browser.
- [x] Handle UI feedback when trying to perform online-only actions while offline.

## Stage 4: Manifest & Assets
- [x] Create app icons and manifest.json.
- [x] Configure theme colors for mobile status bars. (Blue theme applied)
