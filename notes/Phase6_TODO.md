# TODO: Phase 6 - Real-time Sync & Conflict Resolution

## Stage 1: WebSocket Integration
- [ ] Add `socket.io` (or native WebSockets) to the backend.
- [ ] Implement a watcher (using `chokidar`) to broadcast server-side file changes.
- [ ] Connect the frontend to the WebSocket server.

## Stage 2: Live Sync Logic
- [ ] Update frontend state immediately when receiving WebSocket events.
- [ ] Handle concurrent edits from multiple clients (basic "last write wins" for now).

## Stage 3: Conflict Resolution Implementation
- [ ] Implement a "Conflict Detected" state when syncing offline changes.
- [ ] Integrate a diffing library (e.g., `diff` or `jsdiff`).
- [ ] Build a MDUI-based Diff Viewer to let users pick changes.

## Stage 4: Sync Status Monitoring
- [ ] Add "Synced" / "Syncing..." status indicators.
- [ ] Implement retry logic for failed sync attempts.
