# Technical Specification: noted

## 1. System Architecture
`noted` follows a client-server architecture:
- **Backend:** Node.js server using Koa.js.
- **Frontend:** Vue.js 3 Single Page Application (SPA).
- **Communication:** REST API for file operations and WebSockets for real-time synchronization.

## 2. CLI Interface
```bash
noted [path] [options]
```
- `path`: The directory to serve (defaults to current directory).
- `-p, --port [6767]`: Port to use. Auto-increments if occupied.
- `-c, --config [config.env]`: Path to configuration file.
- `-r, --readonly`: Disable all write/delete operations.
- `-h, --help`: Display help information.

## 3. Backend (Koa.js)
- **File System API:** Endpoints to list, read, write, rename, and delete files/folders.
- **Authentication:** Middleware to check for a password defined in `config.env`.
- **WebSocket Server:** Broadcasts file change events to connected clients.
- **Static Serving:** Serves the built Vue.js frontend.

## 4. Frontend (Vue.js 3 + MDUI)
- **State Management:** Pinia for handling file metadata, editor state, and sync status.
- **UI Framework:** MDUI v2 web components for layouts, lists, and forms.
- **Editor:** Plain text editor (initial version) with future extensibility.
- **PWA Integration:** 
  - Service Workers for caching assets and providing offline access.
  - IndexedDB for local storage of pending changes.
- **Sync Module:** 
  - Detects online/offline status.
  - Handles diff-based conflict resolution by prompting the user to select the correct version.

## 5. Security & Configuration
- **config.env:**
  - `PORT`: Server port.
  - `PASSWORD`: Access password.
  - `READ_ONLY`: Boolean flag.

## 6. Conflict Resolution Logic
When a client reconnects after being offline:
1. Pull latest version from server.
2. If local changes exist and the server version has also changed:
   - Perform a diff.
   - Present a UI to the user showing the differences.
   - Allow user to pick specific changes or choose one version over the other.
