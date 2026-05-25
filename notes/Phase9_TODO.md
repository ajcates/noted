# TODO: Phase 9 - Search, Multi-Level Settings & Organization

## Stage 1: Local IndexedDB Search
- [ ] Implement **Full-Text Search (FTS)** using Dexie.js hooks or `FlexSearch`.
  - [ ] Index file contents stored in the local cache.
  - [ ] Add a search bar to `FileBrowser.vue`.
  - [ ] Display search results with snippets of matching content.
- [ ] Implement **Filename Filtering**: Instant real-time filtering of the current directory view.

## Stage 2: Multi-Level Settings System
- [ ] Design the **Settings Data Model**:
  - `browser`: Stored in `localStorage`.
  - `folder`: Stored in `.noted/config.json` within the current notes directory.
  - `system`: Stored in the user's home directory (e.g., `~/.notedrc`).
- [ ] Create **Settings UI**:
  - [ ] Dedicated view accessible from the navigation drawer.
  - [ ] Support toggling between storage locations for each setting.
- [ ] Implement **"Unsaved" Indicators**:
  - [ ] Track "dirty" state for each configuration item.
  - [ ] Visual marker (e.g., a dot or asterisk) next to modified settings.
  - [ ] "Save to [Location]" button that clears the dirty state.

## Stage 3: Multi-Selection & Long Press
- [ ] Implement **Long-Press Detection** directive for Vue list items.
- [ ] Build **Selection Mode UI**:
  - [ ] Contextual top bar showing the number of selected items.
  - [ ] Checkboxes or visual highlighting for selected files/folders.
- [ ] Implement **Bulk Actions**:
  - [ ] Multi-delete with single undo snackbar.
  - [ ] Multi-move (choose destination folder).
  - [ ] Multi-archive (move to hidden `.archive` folder).

## Stage 4: Gemini 1.5 Flash Integration
- [ ] Install `@google/generative-ai` SDK on the backend.
- [ ] Update `server/src/routes/ai.ts` to use the actual Gemini API.
- [ ] Implement secure API Key management (System/Folder/Local storage supported).
- [ ] Support **Gemini 1.5 Flash** for low-latency text transformations.
