# Done: Stage 1

- Initialized root project.
- Created `server/` and `frontend/` directories.
- Initialized server with Koa, Commander, and TypeScript.
- Configured `tsconfig.json` for ESM and path resolution.
- Set up `.gitignore`.
- Initialized git repository.
- Implemented CLI interface with Commander.ts in `server/src/index.ts`.\n- Added port availability check and incrementing logic.\n- Support for [path], --port, --config, --readonly, and --increment-port flags.
- Created configuration utility in `server/src/config.ts` to merge CLI, ENV, and defaults.\n- Implemented Koa application in `server/src/app.ts` with logging and error handling.\n- Updated `server/src/index.ts` to launch the Koa server.\n- Verified status API endpoint.
- Implemented File System utilities in `server/src/utils/fs.ts` with path traversal protection.\n- Added `GET /api/files/list` and `GET /api/files/read` endpoints in `server/src/routes/files.ts`.\n- Configured hardcoded ignore list (.git, node_modules, etc.).\n- Verified API with curl tests.
- Scaffolded Vue 3 + TypeScript + Pinia frontend.\n- Integrated MDUI v2 with AMOLED dark theme.\n- Built UI shell with Top Bar (Breadcrumbs) and Navigation Drawer (Recents/Settings).\n- Implemented File Browser component with directory navigation.\n- Configured integrated build and static serving.
- Implemented `PUT /api/files/write`, `POST /api/files/create`, `PATCH /api/files/rename`, and `DELETE /api/files/delete` on backend.\n- Integrated CodeMirror in frontend with auto-save (debounced).\n- Added file opening logic and navigation between browser and editor.\n- Supported basic syntax highlighting for Markdown and JavaScript.
- Implemented full CRUD operations on backend.\n- Integrated CodeMirror 6 with debounced auto-save.\n- Added Material 3 style FAB for file/folder creation.\n- Implemented Rename and Deletion with Snackbar Undo (optimistic UI).\n- Hidden modification UI in Read-only mode and set editor to read-only.
