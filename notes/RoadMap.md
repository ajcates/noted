# Project Roadmap: noted

This roadmap outlines the phased development of the `noted` project. Each phase has specific goals and deliverables.

## Phase 1: Project Scaffolding & Basic Backend
**Goal:** Establish the foundation of the server and CLI.
- Initialize project and git repository.
- Build basic CLI interface using `commander` or `yargs`.
- Set up Koa.js server.
- Implement API endpoints for listing directory contents and reading file text.

## Phase 2: Frontend Foundation & UI Shell
**Goal:** Create the visual framework and basic navigation.
- Scaffold Vue.js 3 project with Pinia.
- Integrate MDUI v2 web components.
- Build the main layout (navigation drawer, top bar).
- Implement the file/folder browser view using MDUI list components.

## Phase 3: File Operations & Basic Editing
**Goal:** Enable core editing and file management capabilities.
- Implement API and UI for creating, renaming, and deleting files/folders.
- Build a basic plain text editor component.
- Add "Save" functionality and handle write operations on the backend.

## Phase 4: Security & Configuration
**Goal:** Add access control and environment configuration.
- Implement `config.env` parsing.
- Add password protection middleware to the Koa server.
- Build a simple login/lock screen on the frontend.

## Phase 5: PWA & Offline Support
**Goal:** Transform the app into a functional offline tool.
- Configure Service Workers for asset caching.
- Implement IndexedDB (using `idb` or `dexie`) to store local file changes when offline.
- Add offline/online status indicators to the UI.

## Phase 6: Real-time Sync & Conflict Resolution
**Goal:** Ensure data consistency across devices.
- Integrate WebSockets for real-time file change notifications.
- Implement bidirectional sync logic.
- Build the "Conflict Resolution" UI to handle diffs when merging offline changes.

## Phase 7: Refinement, Testing & Final Polish
**Goal:** Ensure stability and high-quality user experience.
- Conduct comprehensive testing of sync and edge cases.
- Optimize performance and PWA manifest.
- Final UI/UX polish and bug fixes.
