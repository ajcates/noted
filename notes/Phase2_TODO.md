# TODO: Phase 2 - Frontend Foundation & UI Shell

## Stage 1: Vue 3 Setup
- [ ] Initialize Vue 3 project using Vite (`npm create vite@latest frontend -- --template vue-ts`).
- [ ] Install dependencies: `pinia`, `mdui`, `axios`.
- [ ] Configure Vite proxy to route `/api` to the backend.

## Stage 2: Core State & Services
- [ ] Set up Pinia store for file management (metadata, current file).
- [ ] Create API service wrapper using Axios.

## Stage 3: MDUI Integration & Layout
- [ ] Set up MDUI theme and global styles.
- [ ] Build the main app layout using MDUI layout components:
  - [ ] Top App Bar with title and menu icon.
  - [ ] Navigation Drawer for future features.
  - [ ] Main content area.

## Stage 4: File Browser Implementation
- [ ] Create a `FileBrowser` component.
- [ ] Implement directory navigation logic (handling clicks on folders).
- [ ] Render file/folder list using MDUI list items.
- [ ] Add loading and empty states.
