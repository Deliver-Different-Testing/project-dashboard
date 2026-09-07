# Sprint board

**Where:** first tab on https://deliver-different-testing.github.io/project-dashboard/
**Code:** `SprintPlanner` and the `SPRINT_*` helpers in `src/App.tsx` (master)
**Origin:** ported from the Strategic Planner Calendar in `hub/docs/ai-native-sales-implementation-plan.html` (28 Aug 2026)

## What it is

A rolling board of 2-week sprints, starting **1 September 2026** and running to 31 August 2027, grouped by quarter.
Every developer's forward-work items (the hardcoded `forwardWorkItems` in `devs`, plus dynamic items pushed through
`/api/forward-work/:dev/items`) appear once: either in the **Unscheduled** list on the left or inside one sprint.

- Drag a card into a sprint to set its target. Drag it back to Unscheduled to clear it.
- Each card expands to show the summary, dev notes, a **project type** select (core / strategic / on-boarding), and a
  **sprint target** select. The select is the keyboard and touch fallback for drag and drop.
- Filters: developer, strategic-only, hide core, on-boarding-only, show done. Done work is hidden from Unscheduled by default.
- The sprint containing today is highlighted and tagged **Current**; past sprints are dimmed, and quarters that have fully
  passed collapse behind a "Show past sprints" button.
- The header tiles show the current sprint, how much is in it, and scheduled vs unscheduled counts.

## Where the data lives

There is no separate sprint table. The board reads and writes the existing Railway forward-work row per
`(dev_key, item_key)` in `dashboard_forward_work_state`:

| column | set from |
|---|---|
| `status`, `notes` | developer tab (Forward work table) |
| `project_type` | Sprint board card |
| `sprint_start_date`, `sprint_end_date` | Sprint board drag/drop or select |

Sprint identity is the exact `start|end` date pair. The board generates sprints deterministically from the fixed
start date, so **do not change `SPRINT_BOARD_START`** once targets exist, or saved dates will no longer match a sprint
(such rows still show, in Unscheduled, with a "custom dates" note and can be re-dropped).

The developer tabs show a `📅 Sprint N · dates` chip under any item that has a target.

## API contract (`api/server.mjs`)

`PUT /api/forward-work/:dev/:key` accepts `status`, `notes`, `projectType`, `sprintStartDate`, `sprintEndDate`,
`updatedBy`. Fields **omitted** from the body keep their stored value; send an explicit `null` to clear one.
(Before 2026-09-07 an omitted field was written as null, so a status change on a developer tab wiped the sprint
target. Both the API and the dev tab were fixed; the dev tab now sends the fields through as well.)

The board polls every 20 s for other people's changes and skips a refresh while a save or drag is in flight.

## Local mode

Without `VITE_PROJECT_DASH_API_URL` the board works against `localStorage` only (same `forward-work:<dev>:v1` keys as
the developer tabs), which is handy for layout work but is not shared.
