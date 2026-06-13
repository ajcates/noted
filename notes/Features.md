# Feature Ideas

## Settings
- [ ] View and edit the settings file as a YAML note.
- [ ] Create a settings UI accessible from the sidebar in the file view.

## Server & Connection
- [ ] **Magic Port Numbers**: When running `noted` before the server launches, pick a unique port number (1024-49151) mapped to the working directory (e.g., `/dev/noted` gets `23543`, `/notes` gets a different one). This ensures the PWA offline storage is more reliable.

## UI & Toolbar Restructuring
- [ ] Move the history and preview buttons down into the bottom toolbar.
- [ ] Remove the play and robot buttons from the bottom toolbar.
- [ ] Move the undo button by itself to the far left of the bottom toolbar, and place the text editing buttons to the far right.

## Search & Find
- [ ] Make the find panel expressive when opened.
- [ ] Move the search button to the far right of the toolbar.
- [ ] Hide the search bar by default, and only show it when the find button is pressed in the file list view.

## File View & Plugins
- [ ] **Plugin Preview System**: Allow viewing other file types (e.g., PDFs, Word documents) besides plain text.

## Completed / Done
- [x] View last edited time for files and sort the note view.