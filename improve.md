# Improvement Ideas & Technical Debt

## UX / UI
- [ ] Add loading skeletons for file browser.
- [ ] Implement a more robust "Undo" system that persists across sessions (IndexedDB).
- [ ] Add "Word Count" and "Reading Time" to the bottom bar.
- [ ] Improve mobile responsiveness of the AI panel (swipe to close).

## AI Features
- [ ] Add support for "Context Injection" (e.g., @filename to include other notes in the prompt).
- [ ] Implement "Streaming" responses for better perceived performance.
- [ ] Add a "History" view for AI conversations.

## Technical Debt
- [ ] Refactor `Editor.vue` - it's becoming quite large. Move logic to composables.
- [ ] Add E2E tests with Playwright or Cypress.
- [ ] Improve error handling in the backend (more specific status codes).
- [ ] Optimize build size (MDUI icons are heavy).
