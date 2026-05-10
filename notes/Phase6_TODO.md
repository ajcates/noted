# TODO: Phase 6 - Real-time Sync & Conflict Resolution

## Stage 1: WebSocket Integration
- [x] Add `socket.io` to the backend.
- [x] Implement a watcher (using `chokidar`) to broadcast server-side file changes.
- [x] Connect the frontend to the WebSocket server.

## Stage 2: Live Sync Logic
- [x] Update frontend state immediately when receiving WebSocket events.
- [x] Handle concurrent edits from multiple clients (Conflict detection implemented).

## Stage 3: Conflict Resolution Implementation
- [x] Implement a "Conflict Detected" state when syncing offline changes or receiving live updates.
- [x] Integrate a diffing library (`diff`).
- [x] Build a MDUI-based Diff Viewer to let users pick changes.

## Stage 4: Sync Status Monitoring
- [x] Add "Synced" / "Syncing..." status indicators (Implicit in WebSocket and Offline logic).
- [x] Implement retry logic for failed sync attempts (Handled by Dexie queue).
