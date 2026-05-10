# TODO: Phase 4 - Security & Configuration

## Stage 1: Configuration Management
- [ ] Implement a configuration utility to merge defaults, `.env`, and CLI flags.
- [ ] Ensure the password and other secrets are never logged.

## Stage 2: Backend Authentication
- [ ] Implement password-based authentication middleware.
- [ ] Create an `/api/auth/login` endpoint.
- [ ] Use a simple JWT or session-based token for subsequent API calls.

## Stage 3: Frontend Authentication UI
- [ ] Build a "Login" screen using MDUI text fields and buttons.
- [ ] Implement auth state management in Pinia.
- [ ] Add a global navigation guard to redirect unauthenticated users to Login.

## Stage 4: Deployment Preparation
- [ ] Add a script to build the frontend and serve it from the backend.
- [ ] Test the production build flow.
