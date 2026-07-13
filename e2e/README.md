# Termux E2E tests

`noted-termux.e2e.cjs` runs the real server against a temporary notes folder
and drives the system Chromium through the repository's `playwright-termux`
copy of `playwright-core`. It does not download a browser or alter a real notes
directory.

Run it after building the frontend:

```sh
npm run build:frontend
npm run test:e2e
```

The runner uses `CHROMIUM_PATH` when set; otherwise it uses Termux's standard
`/data/data/com.termux/files/usr/bin/chromium-browser`. Each run selects a
per-process port for clean browser storage; set `NOTED_E2E_PORT` to use a fixed
port when debugging.

Coverage:

- Desktop (1440x900): loads a real notes list, opens a file, saves editor text,
  verifies the server-side file, receives an external file edit while the note
  is open, toggles Markdown preview, and verifies an external move updates the
  file list.
- Mobile (390x844 touch): enters a directory, opens a note, verifies the
  responsive sidebar begins closed, opens it, verifies its backdrop, dismisses
  it, and verifies an external deletion exits the editor and removes the row.
