# TODO: Phase 3 - File Operations & Basic Editing

## Stage 1: File Content API & Editor (Frontend)
- [x] Implement `PUT /api/files/write` endpoint on backend.
- [x] Install CodeMirror dependencies in frontend: `codemirror`, `@codemirror/view`, `@codemirror/state`, `@codemirror/language`.
- [x] Create `Editor.vue` component:
  - [x] Integrate CodeMirror.
  - [x] Implement auto-save logic (debounced save to API).
- [x] Implement navigation from `FileBrowser.vue` to `Editor.vue` when a file is clicked.

## Stage 2: Create & Rename (Backend & Frontend)
- [x] Implement backend endpoints:
  - [x] `POST /api/files/create` (handle file vs folder).
  - [x] `PATCH /api/files/rename`.
- [x] Implement Material 3 FAB menu in `App.vue` or `FileBrowser.vue`:
  - [x] Options for "New File" and "New Folder".
  - [x] MDUI Dialogs for naming new entries.
- [x] Implement rename functionality in file list item menus.

## Stage 3: Delete & Undo logic
- [x] Implement `DELETE /api/files/delete` endpoint on backend.
- [x] Implement deletion in frontend:
  - [x] Immediate deletion with a "Deleted" snackbar.
  - [x] "Undo" button in snackbar that triggers a restore (may require temporary server-side trash or frontend-stored content).
- [x] Refine "Undo" strategy (e.g., delay actual server-side deletion until snackbar disappears).

## Stage 4: Read-only Mode & Polish
- [x] Ensure all modification UI (FAB, Edit mode, Rename/Delete menus) is hidden when `config.readonly` is true.
- [x] Add loading indicators and error handling for all file operations.
