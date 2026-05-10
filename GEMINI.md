# GEMINI.md - Project Context for `noted`

## Project Overview
`noted` is a planned Node.js based note editor designed to be a progressive web application (PWA) with offline capabilities and bidirectional synchronization. The project is currently in the **Planning and Design** phase, with research notes and initial concepts established.

### Core Technologies (Planned)
- **Backend:** Node.js with Koa.js.
- **Frontend:** Vue.js 3 with Pinia for state management.
- **UI Framework:** MDUI v2 (Material Design 3 web components).
- **Features:** Mobile-optimized interface, PWA support, offline-first with sync, CLI-based server launch.

## Directory Structure
- `notes/`: Contains research, documentation, and project planning files.
  - `idea.md`: The original project proposal and intended development workflow.
  - `mdui.md`: Documentation and reference for MDUI v2.
  - `vuejs.md`: Documentation and reference for Vue.js 3.
- `README.md`: Minimal project description.
- `LICENSE`: Project license information.

## Project Status & Roadmap
The project is following a structured planning phase as outlined in `notes/idea.md`:
1.  **Drafting:** Create `overview.md` and `spec.md` (Not yet started).
2.  **Roadmapping:** Develop a `RoadMap.md` with project phases.
3.  **Task Management:** Generate phase-specific TODO lists.
4.  **Execution:** Implement features, tracking progress in `done.md`.

## Building and Running
*No source code has been implemented yet.*
- **Backend Entry Point (Planned):** `noted [path] [options]`
- **Default Port:** 6767

## Development Conventions
- **Workflow:** Strictly follow the plan-then-act methodology defined in `notes/idea.md`.
- **Validation:** Each stage of implementation should be appended to a `done.md` file and committed to git.
- **Tech Stack:** Prioritize idiomatic Vue 3 (Composition API) and MDUI web components.
