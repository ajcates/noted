# TODO: Phase 3 - File Operations & Basic Editing

## Stage 1: File Content API & Editor
- [ ] Implement `PUT /api/files/write` endpoint on backend.
- [ ] Create a `TextEditor` component on frontend.
- [ ] Implement "Edit" mode when a text file is clicked.
- [ ] Add "Save" functionality with UI feedback (snackbars).

## Stage 2: Create, Rename, Delete (Backend)
- [ ] Implement `POST /api/files/create` (handle both files and folders).
- [ ] Implement `PATCH /api/files/rename`.
- [ ] Implement `DELETE /api/files/delete`.

## Stage 3: Create, Rename, Delete (Frontend)
- [ ] Add "Create New" FAB (Floating Action Button) with MDUI menu options.
- [ ] Implement "Rename" and "Delete" actions via MDUI dialogs or menus on list items.
- [ ] Refresh file list after operations.

## Stage 4: Error Handling & Read-only Mode
- [ ] Implement UI indicators for read-only mode (hide edit/delete/create buttons).
- [ ] Add robust error handling for FS operations on both frontend and backend.
