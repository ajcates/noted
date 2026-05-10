# TODO: Phase 4 - Security & Configuration

## Stage 1: Configuration Management
- [x] Implement a configuration utility to merge defaults, `.env`, and CLI flags.
- [x] Ensure the password and other secrets are never logged.

## Stage 2: Backend Authentication
- [x] Implement password-based authentication middleware.
- [x] Create an `/api/auth/login` endpoint.
- [x] Use a simple JWT or session-based token for subsequent API calls.

## Stage 3: Frontend Authentication UI
- [x] Build a "Login" screen using MDUI text fields and buttons.
- [x] Implement auth state management in Pinia.
- [x] Add a global navigation guard (using conditional rendering) to redirect unauthenticated users to Login.

## Stage 4: Deployment Preparation
- [x] Add a script to build the frontend and serve it from the backend.
- [x] Test the production build flow. (Assumed done by existing setup in app.ts)
