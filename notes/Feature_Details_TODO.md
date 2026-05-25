# Feature Detail TODOs

This file tracks granular implementation details for complex features.

## Text Highlighting (Markdown Marker Approach)
- [x] Add `mdui-button-icon` for "Highlight" to the bottom bar menu.
- [x] Implement `isHighlighted` computed property in `Editor.vue`.
- [x] Logic: Wrap selection in `==markers==`.
- [x] Logic: Insert `====` if no selection.
- [ ] Refinement: Smarter detection for "Cancel Highlight" to handle nested/adjacent markers.

## AI Prompt System
- [x] Build the UI for AI prompt selection and "Run" button.
- [ ] Implement actual **AI API Integration** (Backend + Frontend communication).
- [ ] Implement **Text Replacement**: Replace selection or append result.
- [ ] Handle loading states and errors gracefully.

## Undo Functionality
- [x] Integrate native `document.execCommand('undo')`.
- [ ] Refinement: Evaluate if a custom history stack is needed for non-text state changes (e.g., metadata edits).

## Auto-Format & Spell Check
- [x] Implement `handleFormat()`: Trim whitespace and fix line breaks.
- [ ] Add "Format successful" snackbar confirmation.
- [x] Leverage browser native `spellcheck="true"` (Verified on mobile).
- [ ] (Optional) Implement a custom word-wrap toggle.

## New Editor Tools
- [x] **Header Tool**: Toggle `# ` at line start.
- [x] **List Tool**: Toggle `- ` at line start.
- [x] **Link Tool**: Insert `[text](url)` template and focus URL field.
