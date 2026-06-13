# TODO: Phase 10 - Advanced Markdown Editor (Pen Integration)

## Stage 1: Core Editing Engine Refactor
- [ ] Migrate from basic `<textarea>` to a **ContentEditable** or logic-based approach similar to `Pen`.
- [ ] Implement **Markdown Auto-conversion**:
  - [ ] Automatically convert `#` into header styling as the user types.
  - [ ] Handle lists, bold, and italic markers in real-time.
- [ ] Ensure **Clean Markdown Output**: The underlying data must remain pure Markdown, not HTML.

## Stage 2: Selection & Floating Toolbar
- [ ] Implement **Floating Action Menu**:
  - [ ] Detect text selection.
  - [ ] Show a minimalist toolbar (Bold, Italic, Header, Link) directly above the selection.
- [ ] Re-integrate the **Text Actions Menu** from the bottom bar into the floating experience.

## Stage 3: UX & Typography
- [ ] Implement **Smooth Scrolling** and focus behavior.
- [ ] Add **Empty Placeholder** logic ("Type something...").
- [ ] Refine typography:
  - [ ] Support custom font sizes via settings.
  - [ ] Better line-height and paragraph spacing for reading comfort.

## Stage 4: Real-time Markdown Preview
- [ ] Implement a **Hybrid View**: Markdown syntax remains visible, but renders stylistically (Wysiwyg-lite).
- [ ] Add a **Full Preview Toggle**: Instant switch to a fully rendered view using `markdown-it`.
- [ ] Support **Code Block Syntax Highlighting**.

## Stage 5: Advanced AI Assistants
- [ ] Implement **Inline AI Ghostwriting**:
  - [ ] "Press Tab to complete" logic using Gemini 3.5 Flash.
  - [ ] Inline context-aware suggestions.
- [ ] Add **Multi-modal Support** (Optional): Ability to process image descriptions if images are referenced.
