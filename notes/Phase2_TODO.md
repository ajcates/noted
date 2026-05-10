# TODO: Phase 2 - Frontend Foundation & UI Shell

## Stage 1: Vue 3 Setup
- [ ] Initialize Vue 3 project using Vite in `frontend/` directory.
- [ ] Install dependencies: `pinia`, `mdui`, `@mdui/icons`, `axios`.
- [ ] Configure Vite:
  - [ ] Set up proxy for `/api` to `http://localhost:6767`.
  - [ ] Configure build output to `../server/dist/public` (or similar).
- [ ] Set up global AMOLED dark theme in MDUI.

## Stage 2: Core State & Services
- [ ] Set up Pinia `useFileStore`:
  - [ ] State for `currentPath`, `files` list, and `recentFiles`.
  - [ ] Actions for `fetchFiles(path)` and `navigate(path)`.
- [ ] Create Axios API wrapper in `frontend/src/api/index.ts`.

## Stage 3: MDUI UI Shell
- [ ] Build the main `App.vue` layout:
  - [ ] `mdui-layout` as the root.
  - [ ] `mdui-top-app-bar` with:
    - [ ] Menu button to toggle drawer.
    - [ ] Breadcrumb navigation component.
  - [ ] `mdui-navigation-drawer` with:
    - [ ] "Recent Files" list.
    - [ ] "Settings" link.
- [ ] Implement breadcrumb logic to handle directory navigation.

## Stage 4: File Browser Component
- [ ] Create `FileBrowser.vue`:
  - [ ] Display list of files and folders using `mdui-list`.
  - [ ] Use Filled icons from `@mdui/icons`.
  - [ ] Handle folder clicks (navigation) and file clicks (placeholder for editing).
  - [ ] Add empty state and loading progress indicators.
