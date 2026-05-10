# TODO: Phase 1 - Project Scaffolding & Basic Backend

## Stage 1: Project Initialization
- [ ] Initialize root `package.json`.
- [ ] Set up directory structure: `server/` and `frontend/`.
- [ ] Configure TypeScript for the backend:
  - [ ] Initialize `tsconfig.json` in `server/`.
  - [ ] Install dev dependencies: `typescript`, `tsx`, `@types/node`, `@types/koa`, `@types/koa__router`, `@types/fs-extra`.
- [ ] Install core backend dependencies: `koa`, `@koa/router`, `commander`, `dotenv`, `fs-extra`.
- [ ] Set up `.gitignore` (ignore `node_modules`, `dist`, `.env`, `frontend/dist`).
- [ ] Initialize git repository and create initial commit.

## Stage 2: CLI Interface Development (TypeScript)
- [ ] Create `server/src/index.ts` as the main entry point.
- [ ] Implement CLI argument parsing using `commander`.
  - [ ] Support `[path]` argument (default to `.`).
  - [ ] Support `--port` / `-p` option.
  - [ ] Support `--config` / `-c` option.
  - [ ] Support `--readonly` / `-r` option.
  - [ ] Support `--increment-port` option (boolean flag).
- [ ] Implement port validation logic:
  - [ ] Check if port is in use.
  - [ ] If in use: warn and exit *unless* `--increment-port` is set or enabled in config.

## Stage 3: Koa Server Foundation (TypeScript)
- [ ] Set up basic Koa app structure in `server/src/app.ts`.
- [ ] Implement configuration utility to merge `.env`, CLI flags, and defaults.
- [ ] Add basic middleware:
  - [ ] Request logging.
  - [ ] Error handling (JSON responses).
- [ ] Set up placeholder for static file serving (`frontend/dist`).

## Stage 4: File System API (Read-only)
- [ ] Implement `GET /api/files/list` endpoint:
  - [ ] Recursively read directory (with depth limit).
  - [ ] **Hardcoded Ignore List:** `.git`, `node_modules`, `.DS_Store`.
  - [ ] Return metadata: `name`, `path`, `type` (file/dir), `size`, `mtime`.
- [ ] Implement `GET /api/files/read` endpoint:
  - [ ] Accept relative path.
  - [ ] Security: Prevent path traversal using `path.resolve` and checking against root.
  - [ ] Return text content.
- [ ] Basic unit tests for API endpoints.
