# Quality audit and improvement backlog

Audit date: 2026-07-13. Items below are based on the current implementation,
not generic wish-list work. Priority reflects user impact and risk.

## Completed

1. **Sanitize every Markdown HTML sink (completed 2026-07-13).** Added a
   DOMPurify-backed HTML allow-list for the editor preview and AI chat output.
   This blocks executable elements, event attributes, unsafe URL schemes, SVG,
   and MathML. Preview code-copy behavior now uses Vue event delegation instead
   of an inline `onclick` handler, and the code renderer escapes code and
   language values before adding them to HTML. Regression tests cover script,
   event-handler, unsafe-link, and SVG payloads.
2. **Harden safe-path validation (completed 2026-07-13).** Replaced the string
   prefix check with `path.relative()` containment validation and explicitly
   reject absolute request paths. Unit and API tests now cover parent traversal
   and the sibling-prefix bypass.
3. **Synchronize external filesystem changes (completed 2026-07-13).** File
   watcher events now refresh the affected directory, cleanly update an open
   note when it has no unsaved local draft, preserve drafts through the conflict
   resolver, and return to a refreshed listing when the open file or directory
   is moved or deleted. The Termux E2E suite covers external write, move, and
   deletion flows.
4. **Update vulnerable production dependencies (completed 2026-07-13).** Ran
   non-forcing npm audit remediation and regenerated the lockfiles. Socket.io,
   Engine.IO, `ws`, and Vite now resolve to patched versions; the production
   audit has no high-severity findings.
5. **Clean up lifecycle listeners and sockets (completed 2026-07-13).** The
   file store now creates one socket/listener set, exposes `dispose()`, and the
   app unregisters its global event handlers and disconnects the socket on
   unmount. A store test verifies idempotent setup and disposal.
6. **Add stable editor toolbar labels (completed 2026-07-13).** The editor's
   icon-only controls now expose accessible names for sidebar, search, format,
   undo, preview, version history, and AI actions.

## Fix first

1. **Track the remaining development dependency advisory (low security).**
   `npm audit --omit=dev` now reports only the low-severity Windows development
   server advisory in transitive `esbuild` 0.27.7. Upgrade when the Vite/Vitest
   dependency chain accepts an esbuild release at or above 0.28.1, then confirm
   the production audit is clean.

## Improve next

2. **Split `Editor.vue` into focused composables/components (maintainability).**
   It currently owns persistence, formatting, search/replace, autocomplete,
   preview rendering, history, responsive navigation, and AI state. This makes
   regressions likely and leaves most user paths hard to test independently.
3. **Remove production logging that exposes operational details (privacy/noise).**
   The file routes log absolute note paths and directory contents; AI setup logs
   part of the API-key prefix. Use a structured logger with a debug level and
   never log credential-derived values.
4. **Replace the five-second delete delay with explicit confirmation or a
   cancellable task (UX/reliability).** The current delete action waits five
   seconds inside a Promise. Navigation/unmount during that time is not
   explicitly handled, and failures appear late. Keep a clear undo toast while
   managing the task lifecycle and surface a retryable error.
5. **Implement real offline conflict semantics (data integrity).** Pending
   writes currently overwrite server content after reconnect; comments note
   conflicts are only assumed away. Send a revision/mtime/ETag with writes and
   invoke the existing conflict resolver on a mismatch.
6. **Add lifecycle and browser coverage to CI (quality gate).** Unit tests are
    present, but the historical E2E backlog was still open. The new Termux suite
    covers the core desktop/mobile editor flow; expand it with auth, create,
    rename/delete/undo, search, read-only, offline-queue, and two-client
    conflict cases.

## Documentation cleanup

7. **Update README commands and runtime claims.** It documents `npm start`,
    but the root package has no `start` script. It also claims fully offline
    background sync although conflict-safe reconnect handling is not complete.
    Document the actual CLI command and the current offline limitations.
8. **Remove or integrate obsolete editor code.** `HighlightOverlay.vue`,
    `RichEditor.vue`, and `BottomBar.vue` remain beside the native textarea and
    top-toolbar editor path. Either delete dead code after a usage audit or
    clearly mark and test the supported editor path.
