# TODO: Phase 1 - Project Scaffolding & Basic Backend

## Stage 1: Project Initialization
- [x] Initialize root `package.json`.
- [x] Set up directory structure: `server/` and `frontend/`.
- [x] Configure TypeScript for the backend:
  - [x] Initialize `tsconfig.json` in `server/`.
  - [x] Install dev dependencies: `typescript`, `tsx`, `@types/node`, `@types/koa`, `@types/koa__router`, `@types/fs-extra`.
- [x] Install core backend dependencies: `koa`, `@koa/router`, `commander`, `dotenv`, `fs-extra`.
- [x] Set up `.gitignore` (ignore `node_modules`, `dist`, `.env`, `frontend/dist`).
- [x] Initialize git repository and create initial commit.

## Stage 2: CLI Interface Development (TypeScript)
- [x] Create `server/src/index.ts` as the main entry point.
- [x] Implement CLI argument parsing using `commander`.
  - [x] Support `[path]` argument (default to `.`).
  - [x] Support `--port` / `-p` option.
  - [x] Support `--config` / `-c` option.
  - [x] Support `--readonly` / `-r` option.
  - [x] Support `--increment-port` option (boolean flag).
- [x] Implement port validation logic:
  - [x] Check if port is in use.
  - [x] If in use: warn and exit *unless* `--increment-port` is set or enabled in config.
## Stage 3: Koa Server Foundation (TypeScript)
- [x] Set up basic Koa app structure in `server/src/app.ts`.
- [x] Implement configuration utility to merge `.env`, CLI flags, and defaults.
- [x] Add basic middleware:
  - [x] Request logging.
  - [x] Error handling (JSON responses).
- [x] Set up placeholder for static file serving (`frontend/dist`).

## Stage 4: File System API (Read-only)
## Stage 4: File System API (Read-only)
- [x] Implement `GET /api/files/list` endpoint:
  - [x] Recursively read directory (with depth limit).
  - [x] **Hardcoded Ignore List:** `.git`, `node_modules`, `.DS_Store`.
  - [x] Return metadata: `name`, `path`, `type` (file/dir), `size`, `mtime`.
- [x] Implement `GET /api/files/read` endpoint:
  - [x] Accept relative path.
  - [x] Security: Prevent path traversal using `path.resolve` and checking against root.
  - [x] Return text content.
- [x] Basic unit tests for API endpoints.

