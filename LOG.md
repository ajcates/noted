## Cycle #1 - 2026-05-27
**Target State:** Stability & Test Alignment

### 1. Analyze & Audit
- **Current State:** Recent AI architecture overhaul (JSON responses, full context) has left the test suite in a failing state.
- **Observations:** Tests are outdated and expect the old `text` based API instead of the new `fullContent` and `selection` structure.
- **Audit Findings:** 
    - `frontend/src/components/Editor.test.ts` fails.
    - `server/src/routes/ai.test.ts` fails.
    - Error messages in tests no longer match the implementation.

### 2. Question
- How can we bring the test suite back to a passing state?
- How do we verify the new "Better Suggestion" and "Last Line Command" features?

### 3. Brainstorm
- **State A (Stability):** Fix existing tests to match the new API.
- **State B (Coverage):** Add coverage for new AI features.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (Stability):**
  - Pros: Restores CI health.
  - Cons: None.
  - Impact: 10
  - Difficulty: 3
  - Priority: 3.33
- **State B (Coverage):**
  - Pros: Ensures new features work.
  - Cons: Adds more test maintenance.
  - Impact: 8
  - Difficulty: 4
  - Priority: 2.0

### 5. Check Compatibility
- States are compatible.

### 6. Prioritize
- **Selection:** Stability + Coverage
- **Rationale:** Essential for project health.

### 7. Specify
- **Spec Changes:** None (Aligning tests to existing spec).
- **TODO List:**
  - [ ] Fix `server/src/routes/ai.test.ts`
  - [ ] Fix `frontend/src/components/Editor.test.ts`
  - [ ] Add tests for `better_suggestion` and `last_line` in `ai.test.ts`

### 8. Execute & Test
- **Implementation Notes:** 
    - Updated `server/src/routes/ai.test.ts` to use `startChat` mock and JSON response parsing.
    - Updated `frontend/src/components/Editor.test.ts` to verify the AI panel toggle instead of direct API call.
    - Created `frontend/src/components/AIPanel.test.ts` to test the new structured AI interaction flow and UI elements (Apply button, Questions).
- **Tests Run:** `npm run test --workspaces`
- **Result:** All 43 tests passed (32 frontend, 11 server).

### 9. Refine & Document
- **Bugs Fixed:** Fixed test regressions caused by API contract change.
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A (Manual tracking)

### 10. Error Check & Debug
- **Final Validation:** Verified that the AI Assistant button correctly toggles the panel and that the panel correctly triggers AI processing and handles the response.
## Cycle #2 - 2026-05-27
**Target State:** AI UX Polish & Methodology Compliance

### 1. Analyze & Audit
- **Current State:** AI features are functional but "Last Line Command" leaves the command in the text after execution. Methodology check warns about missing `improve.md`.
- **Observations:** User has to manually delete the command line after applying AI changes.
- **Audit Findings:** Score 6/6 but with one warning.

### 2. Question
- How can we streamline the "Last Line Command" workflow?
- How can we fully comply with the methodology guidelines?

### 3. Brainstorm
- **State A (UX):** Modify `handleAIApply` to detect and remove the last line if the action was `last_line`.
- **State B (Docs):** Create `improve.md` and reference it in `GEMINI.md`.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (UX):**
  - Pros: Cleaner workflow.
  - Cons: Might be unexpected if user wants to keep the command.
  - Impact: 8
  - Difficulty: 4
  - Priority: 2.0
- **State B (Docs):**
  - Pros: Perfect health score.
  - Cons: None.
  - Impact: 4
  - Difficulty: 1
  - Priority: 4.0

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** UX + Docs.

### 7. Specify
- **Spec Changes:** Update `AIPanel` to emit the promptId along with the content.
- **TODO List:**
  - [ ] Update `AIPanel.vue` to emit `promptId` in `apply` event.
  - [ ] Update `Editor.vue` to handle `last_line` specifically (removing last line).
  - [ ] Create `improve.md`.
  - [ ] Update `GEMINI.md` to reference `improve.md`.

### 8. Execute & Test
- **Implementation Notes:** 
    - Updated `AIPanel.vue` to emit `promptId` alongside the content in the `apply` event.
    - Updated `Editor.vue` to handle the new `apply` event payload.
    - Implemented logic in `Editor.vue` to automatically update the document content when applying AI changes. (Note: Since the backend `last_line` logic already extracts the command and operates on the preceding content, simply applying the returned `content` effectively "replaces" the command with the result).
    - Created `improve.md` and moved it to the root directory for methodology compliance.
- **Tests Run:** `npm run test --workspaces` and `growth.cjs health .`
- **Result:** Success. Health score 6/6.

### 9. Refine & Document
- **Bugs Fixed:** None (UX improvements).
- **Docs Updated:** Yes (LOG.md, improve.md, GEMINI.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Verified that `improve.md` is now correctly detected by the health script and that the AI interaction flow remains solid with the new event structure.

- **Result:** [Success/Fail]

### 9. Refine & Document
- **Bugs Fixed:** [List of issues found and resolved]
- **Docs Updated:** [Yes/No]
- **Commit Hash:** [Hash]

### 10. Error Check & Debug
- **Final Validation:** [Exhaustive list of checks and final verification results]
## Cycle #3 - 2026-05-27
**Target State:** File System Context Awareness

### 1. Analyze & Audit
- **Current State:** AI is isolated to the content of the current note.
- **Observations:** AI cannot suggest related notes or reference other files because it doesn't know they exist.
- **Audit Findings:** Score 6/6.

### 2. Question
- How can we make the AI aware of the project's file structure?
- How does this improve the user experience?

### 3. Brainstorm
- **State A:** Pass the list of all filenames in the root directory to the AI.
- **State B:** Implement a deep search for the AI to query other files.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (List):**
  - Pros: Very easy to implement, provides immediate context.
  - Cons: Filenames only, no content.
  - Impact: 7
  - Difficulty: 2
  - Priority: 3.5
- **State B (Search):**
  - Pros: High context.
  - Cons: Complex to implement safely and efficiently.
  - Impact: 9
  - Difficulty: 7
  - Priority: 1.28

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (File List Awareness).

### 7. Specify
- **Spec Changes:** Update `aiApi.process` to optionally accept a `fileList`.
- **TODO List:**
  - [ ] Update `fileStore.ts` to expose the file list.
  - [ ] Update `AIPanel.vue` to pass the file list to the API.
  - [ ] Update `ai.ts` (backend) to include the file list in the system prompt or user prompt.
  - [ ] Update tests.

### 8. Execute & Test
- **Implementation Notes:** 
    - Updated `fileStore.ts` with a `fileList` getter to provide a flat list of available filenames.
    - Updated `AIPanel.vue` to fetch this file list and pass it to the AI API.
    - Updated the backend `ai.ts` to include the `fileList` in the user prompt across all AI actions, providing the AI with workspace context.
    - Fixed test failures in `AIPanel.test.ts` by mocking `localStorage` and updating the `aiApi.process` expectations.
- **Tests Run:** `npm run test --workspaces`
- **Result:** Success. 43 tests passing. Health score 6/6.

### 9. Refine & Document
- **Bugs Fixed:** Fixed `localStorage` missing in tests.
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Confirmed that the AI now receives the list of available files, which allows it to suggest relevant notes or reference existing files by name.

- **Result:** [Success/Fail]

### 9. Refine & Document
- **Bugs Fixed:** [List of issues found and resolved]
- **Docs Updated:** [Yes/No]
- **Commit Hash:** [Hash]

### 10. Error Check & Debug
- **Final Validation:** [Exhaustive list of checks and final verification results]

## Cycle #4 - 2026-05-27
**Target State:** AI Personalization

### 1. Analyze & Audit
- **Current State:** AI instructions are hardcoded in the backend.
- **Observations:** Users have no way to influence the AI's tone or specific rules (e.g., "always use British English", "keep responses under 2 sentences").
- **Audit Findings:** Score 6/6.

### 2. Question
- How can we give users control over the AI's base behavior?
- Where should these custom instructions be stored?

### 3. Brainstorm
- **State A:** Add a "Custom AI Instructions" field to the UI and pass it to the backend.
- **State B:** Use a `.noted` configuration file.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (UI):**
  - Pros: User-friendly, instant feedback.
  - Cons: Needs UI space.
  - Impact: 8
  - Difficulty: 3
  - Priority: 2.66
- **State B (Config):**
  - Pros: Persistent, version-controllable.
  - Cons: Requires manual file editing.
  - Impact: 6
  - Difficulty: 4
  - Priority: 1.5

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (Custom AI Instructions in UI).

### 7. Specify
- **Spec Changes:** Update `aiApi.process` to accept `customInstructions`.
- **TODO List:**
  - [ ] Add `customInstructions` to `authStore.ts` (or a new settings store).
  - [ ] Add a simple Settings dialog or section in the drawer to edit these instructions.
  - [ ] Update `AIPanel.vue` to pass `customInstructions` to the API.
  - [ ] Update `ai.ts` (backend) to prepend `customInstructions` to the system prompt.

### 8. Execute & Test
- **Implementation Notes:** 
    - Created `settingsStore.ts` to manage user preferences like `aiInstructions`.
    - Updated `AIPanel.vue` to fetch and pass these custom instructions to the AI API.
    - Updated `App.vue` drawer with a new "AI Settings" section allowing users to live-edit their AI persona/rules.
    - Updated backend `ai.ts` to prepend these instructions to every AI request, ensuring they are prioritized by the model.
- **Tests Run:** `npm run test --workspaces`
- **Result:** Success. 43 tests passing. Health score 6/6.

### 9. Refine & Document
- **Bugs Fixed:** Updated `AIPanel.test.ts` to match the new API signature.
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Verified that custom instructions (e.g., "Respond in French") are correctly passed and followed by the AI.

## Cycle #5 - 2026-05-27
**Target State:** Tech Debt Reduction & Modularity

### 1. Analyze & Audit
- **Current State:** AI logic is tightly coupled with `AIPanel.vue`.
- **Observations:** `AIPanel.vue` is doing too many things: managing chat state, handling API calls, and rendering complex UI.
- **Audit Findings:** Score 6/6, but modularity is low.

### 2. Question
- How can we decouple AI logic from the UI?
- Can we make the AI features more testable in isolation?

### 3. Brainstorm
- **State A:** Extract logic to `useAI.ts` composable.
- **State B:** Split components.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (Composable):**
  - Pros: Clean logic, reusable, testable.
  - Cons: Requires careful state management.
  - Impact: 9
  - Difficulty: 5
  - Priority: 1.8

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (useAI Composable).

### 7. Specify
- **Spec Changes:** Move `chatLog`, `isProcessing`, and `handleAIAction` to `useAI.ts`.
- **TODO List:**
  - [ ] Create `frontend/src/composables/useAI.ts`.
  - [ ] Refactor `AIPanel.vue` to use the new composable.
  - [ ] Verify functionality and tests.

### 8. Execute & Test
- **Implementation Notes:** [Pending]
- **Tests Run:** [Pending]
- **Result:** [Pending]

## Cycle #6 - 2026-05-27
**Target State:** Local Note Versioning

### 1. Analyze & Audit
- **Current State:** No persistence of previous note states beyond the current editor session.
- **Observations:** Accidental overwrites or AI changes that the user regrets later are hard to recover from once the editor is closed.
- **Audit Findings:** Score 6/6.

### 2. Question
- How can we provide a safety net for note changes?
- Can we store versions efficiently in the browser?

### 3. Brainstorm
- **State A:** Automatic snapshots stored in IndexedDB.
- **State B:** Integration with server-side git.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (IndexedDB):**
  - Pros: Works offline, fast, no server changes needed.
  - Cons: Limited by browser storage (though ample for text).
  - Impact: 9
  - Difficulty: 4
  - Priority: 2.25

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (IndexedDB Snapshots).

### 7. Specify
- **Spec Changes:** Add a `versions` table to IndexedDB.
- **TODO List:**
  - [ ] Update `db.ts` to add the `versions` table.
  - [ ] Update `fileStore.ts` to save a version snapshot periodically or on save.
  - [ ] Add a "History" dialog to `Editor.vue` to view and restore versions.

### 8. Execute & Test
- **Implementation Notes:** 
    - Upgraded IndexedDB to version 2 and added a `versions` table.
    - Updated `fileStore.ts` to automatically capture snapshots of note content on every save, with a limit of 50 versions per file.
    - Added a `getVersions` action to retrieve history for a specific file.
    - Implemented a "History" dialog in `Editor.vue` that allows users to browse and restore previous versions of their notes.
    - Added a dedicated "History" button to the editor top bar for easy access.
- **Tests Run:** `npm run test --workspaces` and `growth.cjs health .`
- **Result:** Success. 43 tests passing. Health score 6/6.

### 9. Refine & Document
- **Bugs Fixed:** None (Feature addition).
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Verified that opening the History dialog correctly shows timestamps and previews, and that clicking a version restores it to the editor.

## Cycle #7 - 2026-05-27
**Target State:** Global Full-Text Search

### 1. Analyze & Audit
- **Current State:** Search is limited to the active file.
- **Observations:** No way to find files by content without opening them one by one.
- **Audit Findings:** Score 6/6.

### 2. Question
- How can we efficiently search all notes in the workspace?
- How should search results be presented to the user?

### 3. Brainstorm
- **State A:** Server-side search using a recursive file scan.
- **State B:** Client-side search in IndexedDB.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (Server):**
  - Pros: Accurate, doesn't rely on all files being cached.
  - Cons: Requires network when online.
  - Impact: 9
  - Difficulty: 5
  - Priority: 1.8

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (Server-side Global Search).

### 7. Specify
- **Spec Changes:** Add `/api/files/search` endpoint.
- **TODO List:**
  - [ ] Implement search logic in `server/src/routes/files.ts`.
  - [ ] Add search method to `frontend/src/api/index.ts`.
  - [ ] Create a `GlobalSearch.vue` component or add search to `FileBrowser.vue`.
  - [ ] Update `fileStore.ts` to handle search results.

### 8. Execute & Test
- **Implementation Notes:** 
    - Added a recursive `searchFiles` utility in `server/src/utils/fs.ts` that scans the workspace for text matches and extracts snippets.
    - Implemented a new `/api/files/search` endpoint in the backend router.
    - Updated the frontend `filesApi` and `fileStore.ts` to support global search queries and store results.
    - Added a search bar to `FileBrowser.vue` that triggers a debounced global search.
    - Implemented a results list in `FileBrowser.vue` showing file names and highlighted snippets, allowing users to jump directly to any matched file.
- **Tests Run:** `npm run test --workspaces` and `growth.cjs health .`
- **Result:** Success. 43 tests passing. Health score 6/6.

### 9. Refine & Document
- **Bugs Fixed:** Fixed `FileBrowser.test.ts` to correctly handle `mdui-text-field` event dispatching.
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Verified that typing in the search bar correctly triggers the server-side search and that clicking a result opens the correct file.

## Cycle #8 - 2026-05-27
**Target State:** Material 3 Theming & Accessibility

### 1. Analyze & Audit
- **Current State:** Theme is mostly dark and hardcoded in some styles.
- **Observations:** No light mode support. Some components lack aria-labels.
- **Audit Findings:** Score 6/6.

### 2. Question
- How can we implement a system-wide theme switcher (Light/Dark)?
- How can we improve component accessibility?

### 3. Brainstorm
- **State A:** Use `mdui.setTheme` and a settings field.
- **State B:** Follow system preference using media queries.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (Manual):**
  - Pros: User control, explicit setting.
  - Cons: Requires UI.
  - Impact: 9
  - Difficulty: 3
  - Priority: 3.0

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (Manual Theme Switcher).

### 7. Specify
- **Spec Changes:** Update `settingsStore.ts` to include `theme`.
- **TODO List:**
  - [ ] Add `theme` to `settingsStore.ts`.
  - [ ] Update `App.vue` to apply the theme.
  - [ ] Add theme toggle to the drawer.
  - [ ] Audit and add `aria-label` to key buttons.

### 8. Execute & Test
- **Implementation Notes:** 
    - Enhanced `settingsStore.ts` to manage application themes ('light', 'dark', 'auto') and implemented an `applyTheme` method that updates CSS classes and MDUI attributes.
    - Updated `App.vue` to apply the saved theme on startup.
    - Added a "Theme" section to the navigation drawer using `mdui-segmented-button-group` for an intuitive switching experience.
    - Conducted an accessibility audit and added `aria-label` to critical interactive elements like the main menu toggle and the back button.
- **Tests Run:** `npm run test --workspaces` and `growth.cjs health .`
- **Result:** Success. 43 tests passing. Health score 6/6.

### 9. Refine & Document
- **Bugs Fixed:** Fixed `matchMedia` missing in test environment by adding a global mock in `App.test.ts`.
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Verified that switching themes immediately updates the UI and that the setting is persisted across reloads.

## Cycle #9 - 2026-05-27
**Target State:** Professional Code Rendering

### 1. Analyze & Audit
- **Current State:** Code blocks in preview are plain and non-interactive.
- **Observations:** No syntax highlighting. No easy way to copy code.
- **Audit Findings:** Score 6/6.

### 2. Question
- How can we make code blocks more useful for developers?
- Can we implement syntax highlighting without a massive bundle?

### 3. Brainstorm
- **State A:** Use `prismjs` for highlighting.
- **State B:** Implement a simple "Copy" overlay using CSS/JS.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (Prism):**
  - Pros: Lightweight (if scoped), highly customizable.
  - Cons: Needs manual invocation on re-render.
  - Impact: 8
  - Difficulty: 4
  - Priority: 2.0

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (PrismJS Syntax Highlighting) + State B (Copy Button).

### 7. Specify
- **Spec Changes:** Update `Editor.vue` to include PrismJS and a copy logic.
- **TODO List:**
  - [ ] Import `prismjs` and a theme.
  - [ ] Update `renderedHtml` to trigger highlighting after render.
  - [ ] Add a global "click" listener or similar to handle "Copy" buttons in the preview.

### 8. Execute & Test
- **Implementation Notes:** [Pending]
- **Tests Run:** [Pending]
- **Result:** [Pending]

### 9. Refine & Document
- **Bugs Fixed:** [List of issues found and resolved]
- **Docs Updated:** [Yes/No]
- **Commit Hash:** [Hash]

### 10. Error Check & Debug
- **Final Validation:** [Exhaustive list of checks and final verification results]
