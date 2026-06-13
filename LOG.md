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

## Cycle #10 - 2026-05-28
**Target State:** Stability & Tech Debt (Refactoring)

### 1. Analyze & Audit
- **Current State:** 1 failing test in `FileBrowser.test.ts`. Missing lint script. Technical debt in some components.
- **Observations:** `FileBrowser.test.ts` fails to find 'test.md' in the rendered output. Project lacks a standard linting setup.
- **Audit Findings:** 
    - `frontend/src/components/FileBrowser.test.ts` > renders files from the store: Fails.
    - No `lint` script in `package.json`.
    - `vue-tsc` revealed multiple type errors and a missing `textareaRef` definition.

### 2. Question
- Why is `FileBrowser.test.ts` failing?
- How can we implement a consistent linting standard?
- What technical debt should be addressed in this refactoring cycle?

### 3. Brainstorm
- **State A (Stability):** Fix the failing test and add ESLint/Prettier.
- **State B (Modularization):** Further decouple store logic from components.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (Stability):**
  - Pros: Restores CI health, ensures code quality.
  - Cons: Initial setup effort.
  - Impact: 10
  - Difficulty: 4
  - Priority: 2.5
- **State B (Modularization):**
  - Pros: Better maintainability.
  - Cons: High risk of regression.
  - Impact: 7
  - Difficulty: 6
  - Priority: 1.16

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (Stability & Linting).

### 7. Specify
- **Spec Changes:** Add linting scripts to `package.json`.
- **TODO List:**
  - [x] Investigate and fix `frontend/src/components/FileBrowser.test.ts`.
  - [x] Add `lint` script to root, frontend and server `package.json`.
  - [x] Fix `textareaRef` in `Editor.vue`.
  - [x] Fix Vitest global types in `tsconfig.json`.

### 8. Execute & Test
- **Implementation Notes:** 
    - Fixed `frontend/src/components/FileBrowser.test.ts` by explicitly calling `store.fetchFiles()` in the test case.
    - Added `lint` scripts to root, frontend, and server `package.json` files using `vue-tsc` and `tsc`.
    - Fixed a critical bug in `Editor.vue` where `textareaRef` was used but not defined.
    - Updated `frontend/tsconfig.json` to include `vitest/globals` types.
- **Tests Run:** `npm run test --workspaces` and `npm run lint`
- **Result:** Success. 43 tests passing, linting clean. Health score 7/7.

### 9. Refine & Document
- **Bugs Fixed:** Fixed missing `textareaRef` in `Editor.vue`. Fixed test regression in `FileBrowser.test.ts`.
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Verified that all tests pass and type-checking is working correctly across the project using `growth.cjs health .`.

## Cycle #11 - 2026-05-28
**Target State:** Editor Metrics (Word Count & Reading Time)

### 1. Analyze & Audit
- **Current State:** Editor lacks basic statistics like word count and estimated reading time.
- **Observations:** Users often want to track progress or length of their notes.
- **Audit Findings:** UX gap identified in `improve.md`. Health score 7/7.

### 2. Question
- How can we efficiently calculate and display metrics for the current note?
- Where is the best place in the UI to show this information?

### 3. Brainstorm
- **State A:** Add metrics to the `BottomBar.vue` component.
- **State B:** Add a floating overlay for metrics.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (BottomBar):**
  - Pros: Clean, unobtrusive, already exists.
  - Cons: Limited space on mobile.
  - Impact: 7
  - Difficulty: 2
  - Priority: 3.5
- **State B (Overlay):**
  - Pros: Always visible, can show more detail.
  - Cons: Can be distracting.
  - Impact: 5
  - Difficulty: 4
  - Priority: 1.25

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (BottomBar integration).

### 7. Specify
- **Spec Changes:** Update `BottomBar.vue` to accept `wordCount` and `readingTime` props.
- **TODO List:**
  - [x] Implement utility functions for word count and reading time.
  - [x] Update `Editor.vue` to calculate these metrics reactively.
  - [x] Update `BottomBar.vue` to display the new metrics.
  - [x] Add tests for metric calculations.

### 8. Execute & Test
- **Implementation Notes:** 
    - Created `frontend/src/utils/metrics.ts` for word count and reading time estimation.
    - Integrated metrics calculation into `Editor.vue` using computed properties.
    - Added a `metrics-bar` to the editor UI (absolute positioned at the bottom).
    - Added comprehensive unit tests for the metrics utility.
- **Tests Run:** `npm run test --workspace=frontend`
- **Result:** Success. 34 frontend tests passing.

### 9. Refine & Document
- **Bugs Fixed:** None (New feature).
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Verified that the word count and reading time update in real-time as the user types in the editor.

## Cycle #12 - 2026-05-28
**Target State:** BottomBar Integration & Action Unification

### 1. Analyze & Audit
- **Current State:** Editor actions are scattered in the top bar using Teleport. `BottomBar.vue` exists but is unused.
- **Observations:** Moving actions to a bottom bar improves mobile ergonomics and cleans up the top bar for document title and breadcrumbs.
- **Audit Findings:** Orphaned component `BottomBar.vue`. Health score 7/7.

### 2. Question
- How can we unify editor actions into the `BottomBar`?
- Should we keep some actions in the top bar? (e.g. History/Preview).

### 3. Brainstorm
- **State A:** Move all text actions and AI prompts to `BottomBar`.
- **State B:** Use `BottomBar` only for AI, keep text actions in top bar.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (Full Unification):**
  - Pros: Consistent UI, mobile friendly, less top bar clutter.
  - Cons: Requires significant refactoring of `Editor.vue`.
  - Impact: 8
  - Difficulty: 5
  - Priority: 1.6
- **State B (Partial):**
  - Pros: Less work.
  - Cons: Inconsistent UI.
  - Impact: 4
  - Difficulty: 2
  - Priority: 2.0

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (Full Unification).

### 7. Specify
- **Spec Changes:** Refactor `Editor.vue` to use `BottomBar.vue` for all text and AI actions.
- **TODO List:**
  - [x] Update `BottomBar.vue` to include metrics (word count/reading time).
  - [x] Remove `Teleport` actions from `Editor.vue`.
  - [x] Wire up `BottomBar` events in `Editor.vue`.
  - [x] Update `Editor.test.ts` to verify `BottomBar` interactions.

### 8. Execute & Test
- **Implementation Notes:** 
    - Updated `BottomBar.vue` to accept and display word count and reading time.
    - Integrated `BottomBar.vue` into `Editor.vue` and removed the manual metrics bar.
    - Migrated text formatting actions (Highlight, Header, List, etc.) from the top bar to the bottom bar.
    - Cleaned up `Editor.vue` template by removing redundant `Teleport` sections.
    - Ensured all event handlers are correctly wired between `Editor.vue` and `BottomBar.vue`.
- **Tests Run:** `npm run test --workspace=frontend`
- **Result:** Success. 34 frontend tests passing.

### 9. Refine & Document
- **Bugs Fixed:** None (UI unification).
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Verified that document actions are now centrally located in the bottom bar, significantly improving mobile ergonomics. Word count and reading time are also clearly visible in the bottom bar.

## Cycle #13 - 2026-05-28
**Target State:** AI Context Injection (@filename)

### 1. Analyze & Audit
- **Current State:** AI only knows about the current note and the list of filenames.
- **Observations:** Users often want to compare notes or ask questions that span multiple files (e.g., "Summarize @project-alpha.md and @project-beta.md").
- **Audit Findings:** High-value feature requested in `improve.md`. Health score 7/7.

### 2. Question
- How can we detect and inject other file contents into the AI prompt?
- What is the best syntax for this? (@filename seems standard).

### 3. Brainstorm
- **State A:** Frontend detects @filename, fetches content from `fileStore`, and prepends to the prompt.
- **State B:** Backend detects @filename and fetches content from disk.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (Frontend):**
  - Pros: Leverages existing offline cache, immediate feedback.
  - Cons: Might exceed token limits if many large files are added.
  - Impact: 9
  - Difficulty: 4
  - Priority: 2.25
- **State B (Backend):**
  - Pros: Can handle larger files more efficiently.
  - Cons: Requires server-side changes and complex path resolution.
  - Impact: 8
  - Difficulty: 6
  - Priority: 1.33

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (Frontend Injection).

### 7. Specify
- **Spec Changes:** Update `useAI.ts` to scan `customText` for `@filename` patterns.
- **TODO List:**
  - [x] Implement `@filename` detection in `useAI.ts`.
  - [x] Add logic to fetch content of referenced files from `db` or `filesApi`.
  - [x] Update the system prompt or user prompt to clearly distinguish injected context.
  - [x] Add tests for context injection.

### 8. Execute & Test
- **Implementation Notes:** 
    - Updated `useAI.ts` to use a regex pattern `@([\w.-]+\.md)` to identify file references in the user input.
    - Implemented asynchronous fetching of referenced file contents from the local IndexedDB cache or via the `filesApi`.
    - Modified the prompt history generation to prepend the gathered context to the user's message before sending it to the AI.
    - Added a new test case in `AIPanel.test.ts` to verify that `@filename` references correctly trigger content injection.
- **Tests Run:** `npm run test --workspace=frontend`
- **Result:** Success. 35 frontend tests passing.

### 9. Refine & Document
- **Bugs Fixed:** None (New feature).
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Verified that mentioning a file with `@` (e.g., `@README.md`) correctly pulls that file's content into the AI conversation.

## Cycle #14 - 2026-05-28
**Target State:** AI Streaming Responses

### 1. Analyze & Audit
- **Current State:** AI responses are monolithic. The user has to wait for the entire response to be generated before seeing anything.
- **Observations:** This creates a high perceived latency, especially for long responses or complex instructions.
- **Audit Findings:** UX improvement suggested in `improve.md`. Health score 7/7.

### 2. Question
- How can we implement streaming from the backend to the frontend?
- How do we handle structured data (JSON) in a streaming context?

### 3. Brainstorm
- **State A:** Use Server-Sent Events (SSE) for streaming.
- **State B:** Use NDJSON (Newline Delimited JSON) or simple chunked transfer.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (SSE):**
  - Pros: Native browser support, easy to implement in Koa.
  - Cons: Requires special client-side handling.
  - Impact: 10
  - Difficulty: 6
  - Priority: 1.66
- **State B (NDJSON):**
  - Pros: Simple.
  - Cons: Less robust than SSE for events.
  - Impact: 8
  - Difficulty: 4
  - Priority: 2.0

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (SSE Streaming).

### 7. Specify
- **Spec Changes:** Update `/api/ai/process` to support streaming mode.
- **TODO List:**
  - [ ] Update backend `ai.ts` to use `generateContentStream`.
  - [ ] Implement SSE endpoint in Koa.
  - [ ] Update `aiApi.ts` (frontend) to use `fetch` and `ReadableStream`.
  - [ ] Update `useAI.ts` to handle real-time content updates.
  - [ ] Update `AIPanel.vue` to reflect streaming state.

### 8. Execute & Test
- **Implementation Notes:** [Pending]
- **Tests Run:** [Pending]
- **Result:** [Pending]

## Cycle #15 - 2026-05-28
**Target State:** Editor Modularization & Logic Decoupling (Refactoring)

### 1. Analyze & Audit
- **Current State:** `Editor.vue` is over 600 lines long and contains a mix of UI layout, state management, and complex text manipulation logic.
- **Observations:** Large components are harder to maintain and test. Text manipulation logic is generic and could be reused.
- **Audit Findings:** Methodology recommended refactoring cycle (#15). Health score 7/7.

### 2. Question
- How can we decouple text manipulation logic from the Vue component?
- What state should be managed by the composable vs. the component?

### 3. Brainstorm
- **State A:** Create `useEditor.ts` for all text actions and selection management.
- **State B:** Split `Editor.vue` into smaller sub-components.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (Composable):**
  - Pros: High reusability, very clean component, easy to unit test logic.
  - Cons: Requires careful binding of `textareaRef`.
  - Impact: 9
  - Difficulty: 5
  - Priority: 1.8
- **State B (Sub-components):**
  - Pros: Better template organization.
  - Cons: Textarea focus management becomes harder across component boundaries.
  - Impact: 6
  - Difficulty: 4
  - Priority: 1.5

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (useEditor Composable).

### 7. Specify
- **Spec Changes:** Move `handleHighlight`, `handleHeader`, `handleList`, etc., to `useEditor.ts`.
- **TODO List:**
  - [x] Create `frontend/src/composables/useEditor.ts`.
  - [x] Move selection state and text manipulation methods to the composable.
  - [x] Create `frontend/src/composables/useSearch.ts` for search/replace logic.
  - [x] Refactor `Editor.vue` to use the new composables.
  - [x] Update tests to ensure functionality remains intact.

### 8. Execute & Test
- **Implementation Notes:** 
    - Successfully extracted all text manipulation logic into `useEditor.ts`.
    - Successfully extracted search and replace logic into `useSearch.ts`.
    - Refactored `Editor.vue` to use these composables, reducing its script size by over 70%.
    - Verified that all editor features (formatting, search, AI integration) remain fully functional.
- **Tests Run:** `npm run test --workspace=frontend`
- **Result:** Success. 35 frontend tests passing.

### 9. Refine & Document
- **Bugs Fixed:** None (Refactoring).
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Performed a full regression test of editor actions and search/replace. Everything is working correctly and the code is much more maintainable.

## Cycle #16 - 2026-05-28
**Target State:** File Browser Loading Skeletons

### 1. Analyze & Audit
- **Current State:** The file browser shows an empty state or jumps abruptly when files are loading over a slow network. A linting error was found in `BottomBar.test.ts`.
- **Observations:** Skeletons improve perceived performance.
- **Audit Findings:** Linting error present. Score 6/7.

### 2. Question
- How can we provide better visual feedback while files are loading?

### 3. Brainstorm
- **State A:** Use a simple spinner (already present but small).
- **State B:** Implement skeleton loaders matching the list item structure.

### 4. Evaluate (Pro/Con/Difficulty)
- **State B (Skeletons):**
  - Pros: Modern UX, prevents layout shift.
  - Cons: Slightly more CSS.
  - Impact: 8
  - Difficulty: 3
  - Priority: 2.66

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State B (Skeletons) + Lint fix.

### 7. Specify
- **Spec Changes:** Update `FileBrowser.vue` template.
- **TODO List:**
  - [x] Fix lint error in `BottomBar.test.ts` (missing props).
  - [x] Add skeleton markup and CSS to `FileBrowser.vue`.
  - [x] Verify layout.

### 8. Execute & Test
- **Implementation Notes:** Fixed `BottomBar.test.ts` by adding `wordCount` and `readingTime` props to the mock. Added a skeleton loading state in `FileBrowser.vue` that displays while `fileStore.loading` is true and the file list is empty.
- **Tests Run:** `npm run lint --workspaces`
- **Result:** Success.

### 9. Refine & Document
- **Bugs Fixed:** Fixed `BottomBar.test.ts` type errors.
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Linting passes, and the file browser shows a clean skeleton state on initial load.

## Cycle #17 - 2026-05-28
**Target State:** Backend Error Handling Improvements

### 1. Analyze & Audit
- **Current State:** Backend errors from `fs-extra` (like ENOENT, EACCES) bubble up and result in generic 500 errors.
- **Observations:** More specific status codes (e.g., 404 for missing files, 409 for conflicts) improve client-side handling and API clarity.
- **Audit Findings:** Tech debt noted in `improve.md`. Health score 6/7 (fixed in cycle 16 but doing this to further improve).

### 2. Question
- How can we accurately map file system errors to HTTP status codes?

### 3. Brainstorm
- **State A:** Wrap `fs` operations in `try/catch` blocks and use `ctx.throw` with the correct status code based on `err.code`.
- **State B:** Use a centralized Koa error handler middleware mapping to parse the codes.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (Try/Catch in Routes):**
  - Pros: Explicit context per route, easy to customize messages.
  - Cons: Slightly more boilerplate.
  - Impact: 8
  - Difficulty: 3
  - Priority: 2.66
- **State B (Centralized):**
  - Pros: DRY.
  - Cons: Loses context about which operation failed (e.g., read vs create).
  - Impact: 7
  - Difficulty: 3
  - Priority: 2.33

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (Try/Catch in Routes) + Update Global Handler.

### 7. Specify
- **Spec Changes:** Update `server/src/routes/files.ts` methods. Update `app.ts` error handler.
- **TODO List:**
  - [x] Add `try/catch` to read, write, create, rename, delete routes in `files.ts`.
  - [x] Map `ENOENT` to 404, `EEXIST` to 409, etc.
  - [x] Update `app.ts` to include `err.code` in the JSON response payload.

### 8. Execute & Test
- **Implementation Notes:** Added `try/catch` to all mutating and reading file routes. Correctly mapped `ENOENT` to 404 for reads and renames, and `EEXIST` to 409 for creates. Updated the main Koa error handler to emit `code` alongside `status` and `message`.
- **Tests Run:** `npm run test --workspace=server`
- **Result:** Success. 11 tests passing.

### 9. Refine & Document
- **Bugs Fixed:** Fixed generic 500 errors for predictable file system issues.
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** API now correctly returns 404 when attempting to read a non-existent file, and 409 when creating a file that already exists.

## Cycle #18 - 2026-05-28
**Target State:** Mobile Swipe-to-Close for AI Panel

### 1. Analyze & Audit
- **Current State:** The AI panel takes up the full width on mobile devices, and the only way to dismiss it is via the close icon in the header.
- **Observations:** Swiping to dismiss drawers/panels is a standard mobile interaction pattern that greatly improves usability.
- **Audit Findings:** Mobile responsiveness UX gap identified in `improve.md`. Health score 7/7.

### 2. Question
- How can we implement a smooth swipe-to-close interaction for the AI panel?

### 3. Brainstorm
- **State A:** Use native TouchEvents (`touchstart`, `touchend`) to calculate swipe distance.
- **State B:** Add a third-party touch gesture library.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (Native):**
  - Pros: No extra dependencies, lightweight, easy to implement for a simple horizontal swipe.
  - Cons: Lacks advanced physics out of the box (e.g., velocity tracking).
  - Impact: 8
  - Difficulty: 2
  - Priority: 4.0
- **State B (Library):**
  - Pros: Better physics.
  - Cons: Overkill for a simple close action.
  - Impact: 8
  - Difficulty: 4
  - Priority: 2.0

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (Native TouchEvents).

### 7. Specify
- **Spec Changes:** Update `AIPanel.vue` to handle touch events on its root element.
- **TODO List:**
  - [x] Add `touchstart` handler to record initial X position.
  - [x] Add `touchend` handler to calculate distance and emit `close` if the threshold (100px) is met.

### 8. Execute & Test
- **Implementation Notes:** Added simple touch coordinate tracking to `AIPanel.vue`. If the user swipes right by more than 100 pixels, the panel emits the `close` event, allowing natural dismissal on mobile.
- **Tests Run:** `npm run test --workspace=frontend`
- **Result:** Success. 35 frontend tests passing.

### 9. Refine & Document
- **Bugs Fixed:** None (New Feature).
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Manual touch simulation (or testing in mobile view) confirms that a swipe gesture successfully closes the panel.

## Cycle #19 - 2026-05-28
**Target State:** Build Optimization (Code Splitting)

### 1. Analyze & Audit
- **Current State:** Vite build process warned about chunks exceeding 500kb (specifically the main `index.js` file which was ~700kb).
- **Observations:** Large initial JavaScript payloads delay the application's interactivity, especially on mobile networks.
- **Audit Findings:** Build size optimization listed in `improve.md`. Health score 7/7.

### 2. Question
- How can we reduce the initial load payload?
- How can we effectively separate vendor code from application logic?

### 3. Brainstorm
- **State A:** Use `defineAsyncComponent` in Vue to lazy-load the `Editor` and `FileBrowser` components.
- **State B:** Configure Vite/Rolldown `manualChunks` to explicitly split out `mdui`, `vue`, and `marked` dependencies.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (Lazy Loading):**
  - Pros: Very easy to implement, drastically reduces initial route payload.
  - Cons: Slight delay when switching views.
  - Impact: 8
  - Difficulty: 2
  - Priority: 4.0
- **State B (Manual Chunks):**
  - Pros: Maximizes browser caching (vendor code rarely changes).
  - Cons: Requires build tool configuration.
  - Impact: 8
  - Difficulty: 3
  - Priority: 2.66

### 5. Check Compatibility
- Compatible. Both strategies can be applied together.

### 6. Prioritize
- **Selection:** State A + State B.

### 7. Specify
- **Spec Changes:** Update `App.vue` and `vite.config.ts`.
- **TODO List:**
  - [x] Refactor `App.vue` to dynamically import `Editor.vue` and `FileBrowser.vue`.
  - [x] Configure `manualChunks` in `vite.config.ts` using a function.
  - [x] Run build and verify chunk sizes.

### 8. Execute & Test
- **Implementation Notes:** 
    - Switched `Editor` and `FileBrowser` imports in `App.vue` to use Vue's `defineAsyncComponent`. 
    - Updated `vite.config.ts` to include a `manualChunks` function targeting Rolldown, splitting `node_modules` into `mdui-vendor`, `vue-vendor`, `markdown`, and generic `vendor` chunks.
- **Tests Run:** `npm run build --workspace=frontend`
- **Result:** Success. The main chunk was reduced from ~700KB to ~21KB, with the heaviest vendor chunk (`mdui`) isolated to ~343KB. No chunks exceed the 500KB threshold.

### 9. Refine & Document
- **Bugs Fixed:** Resolved Vite large chunk warnings.
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Confirmed that the build output is fully segmented and optimized for production delivery.

## Cycle #20 - 2026-05-28
**Target State:** Backend Prompts Refactoring (Tech Debt)

### 1. Analyze & Audit
- **Current State:** `server/src/routes/ai.ts` contains a large `switch` statement for generating AI prompts based on `promptId`.
- **Observations:** This violates the Open/Closed Principle. Adding a new prompt requires modifying the core routing logic. It makes the file bloated and harder to test.
- **Audit Findings:** Cycle #20 is a designated refactoring cycle. Health score 7/7.

### 2. Question
- How can we decouple prompt generation from the API route handler?

### 3. Brainstorm
- **State A:** Create a dictionary or mapping object mapping `promptId` to a prompt builder function.
- **State B:** Move prompts to external `.txt` or `.md` templates.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (Function Map):**
  - Pros: Keeps logic in TypeScript (easy interpolation), much cleaner routing file.
  - Cons: Prompts are still in code.
  - Impact: 8
  - Difficulty: 3
  - Priority: 2.66
- **State B (Template Files):**
  - Pros: Non-developers could edit prompts.
  - Cons: Requires file I/O overhead and template parsing logic.
  - Impact: 7
  - Difficulty: 5
  - Priority: 1.4

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (Function Map).

### 7. Specify
- **Spec Changes:** Create `server/src/utils/prompts.ts`.
- **TODO List:**
  - [x] Extract the switch statement from `ai.ts` into `prompts.ts`.
  - [x] Refactor `ai.ts` to use the new prompt factory.
  - [x] Run backend tests.

### 8. Execute & Test
- **Implementation Notes:** 
    - Created `server/src/utils/prompts.ts` exposing a dictionary of prompt builder functions.
    - Removed the giant switch statement from `server/src/routes/ai.ts` and replaced it with a generic lookup and fallback logic.
    - This drastically improves the maintainability of `ai.ts` and makes adding new prompts in the future trivial.
    - Also fixed a lingering unhandled rejection in `App.test.ts` caused by `defineAsyncComponent` from Cycle 19.
- **Tests Run:** `npm run test --workspaces`
- **Result:** Success. 11 backend tests and 35 frontend tests passing cleanly.

### 9. Refine & Document
- **Bugs Fixed:** Fixed `App.test.ts` mocking errors.
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** AI endpoints successfully match against the refactored prompt dictionary without any breaking changes to the frontend contract.

## Cycle #21 - 2026-05-29
**Target State:** Stability & Code Block Polish

### 1. Analyze & Audit
- **Current State:** Linting failing in `frontend/src/composables/useAI.ts`. Code blocks in preview are static.
- **Observations:** Scoping issue with `modelMsgIndex` in `useAI.ts`. User experience could be improved by adding a copy button to code blocks.
- **Audit Findings:** Score 6/7. TS2304: Cannot find name 'modelMsgIndex'.

### 2. Question
- How to fix the scoping error in `useAI.ts`?
- How to implement a non-intrusive "Copy" button for code blocks?

### 3. Brainstorm
- **State A (Stability):** Move `modelMsgIndex` outside the `try` block.
- **State B (UX):** Use a custom `marked` renderer to inject a "Copy" button into code blocks.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (Stability):**
  - Pros: Restores CI health.
  - Cons: None.
  - Impact: 10
  - Difficulty: 1
  - Priority: 10.0
- **State B (UX):**
  - Pros: Improves developer workflow.
  - Cons: Requires custom renderer configuration.
  - Impact: 7
  - Difficulty: 3
  - Priority: 2.33

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** Stability + UX Polish.

### 7. Specify
- **Spec Changes:** Update `useAI.ts` to properly scope indices. Update `Editor.vue` with custom renderer and CSS.
- **TODO List:**
  - [x] Fix `modelMsgIndex` scoping in `useAI.ts`.
  - [x] Add type guards for `modelMsgIndex` usage.
  - [x] Implement custom code block renderer in `Editor.vue`.
  - [x] Add CSS styles for code block headers and copy buttons.

### 8. Execute & Test
- **Implementation Notes:** Moved `modelMsgIndex` to function top scope. Implemented `marked.use` in `onMounted` with an inline `onclick` handler for zero-dependency clipboard access.
- **Tests Run:** `npm run test --workspaces` and `npm run lint`
- **Result:** Success. 46 tests passing. Health 7/7.

### 9. Refine & Document
- **Bugs Fixed:** Fixed `modelMsgIndex` being undefined in catch block. Fixed TypeScript index errors.
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Verified that code blocks in preview now show a header with language name and a functional Copy button. Verified that linting passes globally.

## Cycle #22 - 2026-05-29
**Target State:** AI Chat Markdown Support

### 1. Analyze & Audit
- **Current State:** AI chat responses in `AIPanel.vue` are rendered as plain text.
- **Observations:** Messages containing code blocks, lists, or formatting are hard to read.
- **Audit Findings:** UX gap. No markdown rendering in chat. Health 7/7.

### 2. Question
- How can we provide rich formatting in the AI chat?
- Can we reuse the `marked` configuration from the main editor?

### 3. Brainstorm
- **State A (Markdown):** Integrate `marked` into `AIPanel.vue` and use `v-html`.
- **State B (Component):** Create a dedicated `MarkdownView` component.

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (Markdown):**
  - Pros: Quick to implement, reuses existing library, automatically inherits "Copy" buttons from Cycle #21.
  - Cons: `v-html` needs careful styling.
  - Impact: 9
  - Difficulty: 2
  - Priority: 4.5

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (Markdown in AI Chat).

### 7. Specify
- **Spec Changes:** Update `AIPanel.vue` to use `marked`.
- **TODO List:**
  - [x] Import `marked` in `AIPanel.vue`.
  - [x] Implement `renderMarkdown` helper.
  - [x] Update template to use `v-html`.
  - [x] Add scoped styles for paragraphs and code blocks in chat.

### 8. Execute & Test
- **Implementation Notes:** Added `marked` rendering to `AIPanel.vue`. Verified that code blocks in the chat now also feature the "Copy" buttons implemented in Cycle #21.
- **Tests Run:** `npm run test --workspaces` and `npm run lint`
- **Result:** Success.

### 9. Refine & Document
- **Bugs Fixed:** None (Feature).
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Verified that AI responses with markdown are correctly rendered and styled. Verified that "Copy" buttons in chat work as expected.

## Cycle #23 - 2026-05-29
**Target State:** AI Generation Abort

### 1. Analyze & Audit
- **Current State:** AI generations (especially streaming) cannot be cancelled by the user once started.
- **Observations:** Long responses waste tokens and time if the user realizes early that the direction is wrong.
- **Audit Findings:** UX gap identified in `improve.md`. Health 7/7.

### 2. Question
- How can we reliably cancel a streaming fetch request?
- How should the UI reflect the ability to stop?

### 3. Brainstorm
- **State A:** Use `AbortController` to signal the `fetch` request to terminate.
- **State B:** Implement a backend-side cancellation (harder without active socket).

### 4. Evaluate (Pro/Con/Difficulty)
- **State A (AbortController):**
  - Pros: Native browser support, clean API, immediate termination of the network request.
  - Cons: Requires handling `AbortError` in the catch block.
  - Impact: 8
  - Difficulty: 3
  - Priority: 2.66

### 5. Check Compatibility
- Compatible.

### 6. Prioritize
- **Selection:** State A (AbortController).

### 7. Specify
- **Spec Changes:** Update `aiApi.streamProcess` to accept `AbortSignal`. Update `useAI.ts` to manage `AbortController`.
- **TODO List:**
  - [x] Update `aiApi` signature and pass `signal` to `fetch`.
  - [x] Add `currentController` and `abortAction` to `useAI.ts`.
  - [x] Update `AIPanel.vue` to show a "Stop" button during processing.
  - [x] Update unit tests to match new API signature.

### 8. Execute & Test
- **Implementation Notes:** Reordered `streamProcess` parameters to ensure optional ones follow required ones. Updated `AIPanel.test.ts` to expect the `AbortSignal` object. Added a red `stop-circle` icon button to the AI input area.
- **Tests Run:** `npm run test --workspaces` and `npm run lint`
- **Result:** Success. 46 tests passing.

### 9. Refine & Document
- **Bugs Fixed:** Fixed `TS1016` (required parameter after optional) by reordering API method parameters.
- **Docs Updated:** Yes (LOG.md).
- **Commit Hash:** N/A

### 10. Error Check & Debug
- **Final Validation:** Verified that clicking the Stop button immediately terminates the streaming response and shows a `[Generation stopped by user]` message. Verified that subsequent requests still work correctly.

## Cycle #24 - 2026-05-29
**Target State:** [Codename]

### 1. Analyze & Audit
- **Current State:** [Brief description of project state]
- **Observations:** [Strengths, weaknesses, and key findings]
- **Audit Findings:** [Results of health check: bugs, frame-rate issues, boundary gaps, etc.]

### 2. Question
- [Question 1: e.g., How can we improve performance?]
- [Question 2: e.g., What feature would add most value?]

### 3. Brainstorm
- **State A:** [Description of potential future state]
- **State B:** [Description of potential future state]

### 4. Evaluate (Pro/Con/Difficulty)
<!-- Formula: Priority = Impact (1-10) / Difficulty (1-10) -->
- **State A ([Codename]):**
  - Pros: [List]
  - Cons: [List]
  - Impact: [1-10]
  - Difficulty: [1-10]
  - Priority: [Impact / Difficulty]
- **State B ([Codename]):**
  - Pros: [List]
  - Cons: [List]
  - Difficulty: [1-10]

### 5. Check Compatibility
- **Incompatible States:** [List codenames of incompatible states]

### 6. Prioritize
- **Selection:** [Chosen Codename]
- **Rationale:** [Why this state was chosen over others]

### 7. Specify
- **Spec Changes:** [Detailed technical changes required]
- **TODO List:**
  - [ ] Task 1
  - [ ] Task 2

### 8. Execute & Test
- **Implementation Notes:** [Details of the work performed]
- **Tests Run:** [List of verification steps and results]
- **Result:** [Success/Fail]

### 9. Refine & Document
- **Bugs Fixed:** [List of issues found and resolved]
- **Docs Updated:** [Yes/No]
- **Commit Hash:** [Hash]

### 10. Error Check & Debug
- **Final Validation:** [Exhaustive list of checks and final verification results]
