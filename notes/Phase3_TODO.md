# TODO: Phase 3 - File Operations & Basic Editing

## Stage 1: File Content API & Editor (Frontend)
- [ ] Implement `PUT /api/files/write` endpoint on backend.
- [ ] Install CodeMirror dependencies in frontend: `codemirror`, `@codemirror/view`, `@codemirror/state`, `@codemirror/language`.
- [ ] Create `Editor.vue` component:
  - [ ] Integrate CodeMirror.
  - [ ] Implement auto-save logic (debounced save to API).
- [ ] Implement navigation from `FileBrowser.vue` to `Editor.vue` when a file is clicked.

## Stage 2: Create & Rename (Backend & Frontend)
- [ ] Implement backend endpoints:
  - [ ] `POST /api/files/create` (handle file vs folder).
  - [ ] `PATCH /api/files/rename`.
- [ ] Implement Material 3 FAB menu in `App.vue` or `FileBrowser.vue`:
  - [ ] Options for "New File" and "New Folder".
  - [ ] MDUI Dialogs for naming new entries.
- [ ] Implement rename functionality in file list item menus.

## Stage 3: Delete & Undo logic
- [ ] Implement `DELETE /api/files/delete` endpoint on backend.
- [ ] Implement deletion in frontend:
  - [ ] Immediate deletion with a "Deleted" snackbar.
  - [ ] "Undo" button in snackbar that triggers a restore (may require temporary server-side trash or frontend-stored content).
- [ ] Refine "Undo" strategy (e.g., delay actual server-side deletion until snackbar disappears).

## Stage 4: Read-only Mode & Polish
- [ ] Ensure all modification UI (FAB, Edit mode, Rename/Delete menus) is hidden when `config.readonly` is true.
- [ ] Add loading indicators and error handling for all file operations.
