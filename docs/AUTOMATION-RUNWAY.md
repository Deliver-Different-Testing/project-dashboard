# Automation Runway on the dashboard

**Live planner (source of truth):** Steve's self-saving artifact, linked from the Runway tab. Marcus's original stays as an archive.
**Snapshot in this repo:** `src/data/automation-runway.json` (projects, teams, settings, actions) plus `src/runway.ts`, a port of the planner's trigger engine.
**Refresh the snapshot:** save the planner page as HTML (File > Save Page As), then

```bash
npm run sync-runway -- path/to/automation-runway.html
git commit -am "Sync automation runway snapshot" && git push
```

The script keeps the stored artifact URL; pass it as a second argument to change it.

## Runway tab

Read-only view of the snapshot: full-plan potential, projects, admin headcount, next projected trigger, a team table with projected trigger months, and a month timeline grouped by process or by person. Each project shows how many Sprint board items deliver it, or "no dev item".

## How the runway links to the Sprint board

`RUNWAY_LINKS` in `src/App.tsx` maps `devKey:itemKey` to runway project ids. Add a line there whenever a forward-work item delivers a runway project. Effects:

- The item counts as **Strategic automation** on the board even if its Railway project type is unset (the strategic filter includes it).
- The item shows a 🛫 chip on the developer tab and on its board card, with the runway project, its window and hours.
- A runway project's hours **land** in the sprint where the last card linked to it is scheduled; if any linked card is unscheduled, the project is not landed. Done cards count as banked. Each sprint card shows the hours landing in it.
- The board header compares headcount triggers: what the runway plan projects by planned finish month versus what the board schedule projects by sprint, plus hours not yet scheduled per team.

Runway projects with **no** linked item (e.g. the on-demand Auckland auto-dispatch phases, the voice agent series) appear on the board as their own cards, owner shown as the runway owner. They can be dragged into sprints like any other card; their sprint dates are stored in Railway under the pseudo developer key `runway` (`/api/forward-work/runway/<projectId>`). When such a project gets a real developer item, add the link and the runway card disappears.

## Due dates

`ForwardWorkItem.due` (YYYY-MM-DD) is the delivery commitment written in the developer's handover MD. It shows as a ⏰ chip on the developer tab and board card. The Sprint board target is the live plan; the due date is what was agreed at handover. Every new MD should state one (see the `dashboard-project-md` skill).
