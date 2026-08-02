# TODO: Phase 2 - Frontend Foundation & UI Shell

## Stage 1: Vue 3 Setup
- [x] Initialize Vue 3 project using Vite in `frontend/` directory.
- [x] Install dependencies: `pinia`, `mdui`, `@mdui/icons`, `axios`.
- [x] Configure Vite:
  - [x] Set up proxy for `/api` to `http://localhost:6767`.
  - [x] Configure build output to `../server/dist/public` (or similar).
- [x] Set up global AMOLED dark theme in MDUI.

## Stage 2: Core State & Services
- [x] Set up Pinia `useFileStore`:
  - [x] State for `currentPath`, `files` list, and `recentFiles`.
  - [x] Actions for `fetchFiles(path)` and `navigate(path)`.
- [x] Create Axios API wrapper in `frontend/src/api/index.ts`.

## Stage 3: MDUI UI Shell
- [x] Build the main `App.vue` layout:
  - [x] `mdui-layout` as the root.
  - [x] `mdui-top-app-bar` with:
    - [x] Menu button to toggle drawer.
    - [x] Breadcrumb navigation component.
  - [x] `mdui-navigation-drawer` with:
    - [x] "Recent Files" list.
    - [x] "Settings" link.
- [x] Implement breadcrumb logic to handle directory navigation.

## Stage 4: File Browser Component
- [x] Create `FileBrowser.vue`:
  - [x] Display list of files and folders using `mdui-list`.
  - [x] Use Filled icons from `@mdui/icons`.
  - [x] Handle folder clicks (navigation) and file clicks (placeholder for editing).
  - [x] Add empty state and loading progress indicators.
