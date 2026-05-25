# TODO: Phase 8 - Editor Enhancements & AI Integration

## Stage 1: Bottom App Bar & Basic Tools
- [x] Create a `BottomBar.vue` component.
- [x] Adjust `Editor.vue` layout to accommodate the bottom bar (using `dvh`).
- [x] Consolidate actions into a single "Text Actions" menu.
- [x] Implement core transformation tools:
  - [x] **Highlight**: Wrap selection in `==markers==`.
  - [x] **Header**: Toggle `# ` at start of line.
  - [x] **List**: Toggle `- ` at start of lines.
  - [x] **Link**: Insert `[text](url)` template.

## Stage 2: Editing Utilities & Persistence
- [x] Implement **Auto-format**: Trim whitespace and fix paragraph spacing.
- [x] Implement **Undo**: Native `document.execCommand('undo')` integration.
- [x] Ensure keyboard persistence on mobile using focus protection (`pointerdown.prevent`).
- [x] Implement **Highlight Removal**: Smarter marker detection to remove `==` when caret is inside.
- [x] Add **Markdown Character Escaping**: Tool to escape special characters in selection.

## Stage 3: AI Prompt System (Logic Implementation)
- [x] Build the UI for AI prompt selection and "Run" button.
- [x] Implement actual **AI API Integration**:
  - [x] Add a `POST /api/ai/process` endpoint on the backend.
  - [x] Support different models/prompts (Summarize, Fix Grammar, Rewrite).
- [ ] Handle **Streaming Responses** (Optional): Real-time text generation in the editor.
- [ ] Add a "Stop" button for ongoing AI generations.

## Stage 4: Selection & Context Awareness
- [x] Track selection state in `Editor.vue` to enable/disable buttons.
- [x] **Context-sensitive Menu**: Added Reading Mode and Search toggles to the toolbar.
- [x] Implement **Search & Replace** within the editor.

## Stage 5: Final Polish
- [x] Add tooltips for all consolidated menu items.
- [x] Implement a "Reading Mode" that hides the keyboard and toolbar for better focus.
- [x] Verify AMOLED theme consistency across all new menus.
