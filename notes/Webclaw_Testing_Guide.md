# Webclaw UI Testing Guide for `noted`

This document describes how to use the Webclaw MCP skill to perform end-to-end UI testing and regression verification for the `noted` application.

## Test Suite: Toolbar State Persistence

### Objective
Verify that the toolbar correctly toggles between "File Browser" mode (showing Sort) and "Editor" mode (showing Editor Actions).

### Procedure

1.  **Navigate to the App**
    *   **Tool:** `mcp_webclaw_navigate_to`
    *   **URL:** `http://localhost:6767`

2.  **Verify Browser Mode Toolbar**
    *   **Tool:** `mcp_webclaw_evaluate`
    *   **Expression:**
        ```javascript
        (() => {
          const sortBtn = document.querySelector('mdui-button-icon[mdui-tooltip="Sort"]');
          const editorActions = document.querySelector('.editor-top-actions');
          return {
            sortVisible: !!sortBtn,
            editorActionsHidden: !editorActions || editorActions.children.length === 0
          };
        })()
        ```
    *   **Expectation:** `sortVisible: true`, `editorActionsHidden: true`.

3.  **Open a File**
    *   **Tool:** `mcp_webclaw_click`
    *   **Ref:** Find an `@ref` for a file in the list.

4.  **Verify Editor Mode Toolbar**
    *   **Tool:** `mcp_webclaw_evaluate`
    *   **Expression:**
        ```javascript
        (() => {
          const sortBtn = document.querySelector('mdui-button-icon[mdui-tooltip="Sort"]');
          const editorActions = document.querySelector('.editor-top-actions');
          return {
            sortHidden: !sortBtn,
            editorActionsVisible: !!editorActions && editorActions.children.length > 0
          };
        })()
        ```
    *   **Expectation:** `sortHidden: true`, `editorActionsVisible: true`.

## Automation
The following script can be pasted into the agent's prompt to run this test automatically:

```javascript
// AGENT INSTRUCTION: Use mcp_webclaw_evaluate with this script to verify toolbar
(() => {
  const check = (mode) => {
    const sortBtn = document.querySelector('mdui-button-icon[mdui-tooltip="Sort"]');
    const editorActions = document.querySelector('.editor-top-actions');
    const idTarget = document.getElementById('top-bar-actions');
    return {
      mode,
      sort: !!sortBtn,
      editorActions: !!editorActions,
      idTarget: !!idTarget
    };
  };
  return check(document.querySelector('.native-textarea') ? 'editor' : 'browser');
})()
```
