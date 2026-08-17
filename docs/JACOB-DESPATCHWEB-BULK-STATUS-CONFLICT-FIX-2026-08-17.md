# Jacob — DespatchWeb bulk status conflict fix

Date: 2026-08-17
Owner: Jacob
System: despatchweb

## Why this change is needed

Marcus has surfaced what looks like a regression from the last release where the same bulk/parent flow is showing contradictory state depending on which status field the screen is reading.

Observed example:

- bulk job status = `new`
- parent job status = `new`
- job properties = `done`
- linehaul = `complete` and `null`
- LHP = `complete` and `done`
- dispatch cannot get the parent and DEL out of bulk

This is the same class of defect as the earlier case where one surface showed `new` while job properties showed `void`.

The core problem appears to be duplicated status truth being stored and/or projected from multiple places, with those sources drifting out of sync after the release.

## Current risk

When dispatch sees mixed states like `new`, `done`, `complete`, `void`, or `null` for the same job family:

- the UI cannot reliably decide whether the bulk is still active, completed, voided, or releasable
- release/remove-from-bulk logic can refuse to act because one branch says the job is still `new`
- linehaul and LHP steps can appear completed in one place while still blocked in another
- ops loses confidence because the same record is telling two different stories

## Most likely fault line

There appear to be at least two independent status representations in play:

1. **Main status field**
   - bulk search / job list projections currently expose `TblBulkJob.JobStatus` via `JobMappings.BulkJob.cs`
   - related live-job screens also expose status code / status id separately

2. **Property/flag state**
   - bulk rows also carry property-style flags like `Done` and `Void`
   - downstream UI may also be reading derived/job-property values rather than the primary status code

If the last release changed one path but not the other, the same job can render as:

- status = `new`
- properties = `done`

or:

- status = `new`
- properties = `void`

That mismatch is almost certainly what is breaking release behaviour.

## Relevant code areas to inspect first

- `gitlab-source/despatchweb/Helpers/JobMappings.BulkJob.cs`
- `gitlab-source/despatchweb/Repositories/JobRepository.cs`
  - bulk search/projection path
  - `VoidBulkJobAsync(...)`
  - `ReleaseBulkJobByIdAsync(...)`
- `gitlab-source/despatchweb/Repositories/JobRepository.EditOperations.cs`
  - `UpdateBulkJobAsync(...)`
- `gitlab-source/despatchweb/Controllers/JobController.cs`
  - bulk update / release endpoints
- React bulk/dispatch screens that decide whether a parent/DEL can be released from bulk

## Required behaviour

## 1. One displayed operational state per job family

For bulk, parent, DEL, LH, and LHP views, the screen must not show contradictory values for the same operational state.

If the job is operationally complete, every relevant surface must resolve to the same answer.
If the job is still new, every relevant surface must resolve to the same answer.
If the job is void, every relevant surface must resolve to the same answer.

`null` should never be surfaced as a competing status when a valid resolved state already exists.

## 2. Release/remove-from-bulk must use the same truth source as the UI

If dispatch is allowed to release the parent and DEL out of bulk, both:

- the visible status shown to dispatch
- the backend release guard/eligibility logic

must be driven from the same resolved state.

Do not let the UI read one status source while `ReleaseBulkJobByIdAsync(...)` or related checks use another.

## 3. Linehaul/LHP state must resolve consistently

The linehaul and LHP rows must not be able to render combinations like:

- `complete` + `null`
- `complete` + `done`

for the same stage.

If the underlying model needs both a workflow status code and completion flags for internal reasons, that is fine — but the dispatch UI must resolve them into one authoritative display/result.

## 4. Fix the sync bug first; only remove a field if truly safe

Marcus's question is the right one: if two fields are displaying the same business meaning, we should not keep letting them drift.

But the first implementation step should be:

- identify the canonical operational status source
- make every display and release decision resolve from that source
- backfill/sync any stale companion fields where required

Only remove one of the underlying fields if Jacob confirms it is not needed by legacy procedures, reporting, handset sync, or historic workflows.

## Recommended implementation approach

## A. Define a canonical resolved status

Add one explicit resolution rule for bulk-family jobs, for example:

- void beats everything
- done/complete beats new
- null never beats a populated status
- parent/child release logic evaluates the resolved state, not raw mixed fields

Whether this becomes a helper method, projection expression, or backend DTO field is up to Jacob, but it needs to exist in one place.

## B. Make projections use the resolved status

Update bulk/job projections so dispatch screens are not separately exposing conflicting raw fields as if they were equivalent status values.

At minimum:

- review `JobMappings.BulkJob.cs`
- review any DTO/view-model mapping that sends both status code and property flags to the UI
- stop the UI from independently inferring final operational state from mismatched fields

## C. Make release logic use the same resolution rule

Trace the release path used when dispatch tries to get the parent and DEL out of bulk.

Likely starting points:

- `JobController.ReleaseBulkJobById(...)`
- `JobRepository.ReleaseBulkJobByIdAsync(...)`

Ensure eligibility checks and actual release behaviour use the same resolved state as the screen.

## D. Audit last-release changes touching bulk status propagation

This smells like a regression, so compare the last release diff around:

- bulk-job status mapping
- completion/void flag updates
- linehaul/LHP propagation
- any recent UI refactor that started reading a different field than before

## Acceptance criteria

### Scenario A — bulk/parent status mismatch
Given:

- bulk raw status says `new`
- companion property/flag state says `done`

When:

- dispatch opens the job family

Then:

- the UI shows one resolved operational state only
- the UI does not show contradictory `new` vs `done` answers for the same job family

### Scenario B — prior `new` vs `void` conflict
Given:

- one source says `new`
- one source says `void`

When:

- the job is loaded in dispatch/bulk screens

Then:

- the resolved status is deterministic
- release/edit actions follow that same resolved status

### Scenario C — linehaul/LHP mismatch
Given:

- linehaul/LHP raw fields currently produce `complete` plus `null` or `done`

When:

- the job family is loaded

Then:

- each stage renders a single consistent state
- no stage shows a conflicting pair of statuses

### Scenario D — parent and DEL can be released correctly
Given:

- the job family is in the affected mixed-state condition

When:

- dispatch attempts to get the parent and DEL out of bulk

Then:

- the action succeeds when the resolved status permits it
- it does not fail just because one stale raw field still says `new`

## Tests to add/update

Add targeted tests around:

- bulk projection/status resolution
- `ReleaseBulkJobByIdAsync(...)` eligibility and release behaviour
- void/done/new precedence rules
- linehaul/LHP resolved-state mapping
- regression coverage for the earlier `new` vs `void` conflict

Likely starting test files:

- `gitlab-source/despatchweb/DespatchWeb.Tests/Repositories/JobRepositoryBulkSearchTests.cs`
- `gitlab-source/despatchweb/DespatchWeb.Tests/Repositories/JobRepositoryVoidBulkJobTests.cs`
- `gitlab-source/despatchweb/DespatchWeb.Tests/Controllers/JobControllerTests.cs`

## Deliverable

Fix the bulk/parent/DEL/linehaul status regression so dispatch has one consistent status truth, parent + DEL can be released from bulk again, and we stop seeing mixed `new` / `done` / `complete` / `void` / `null` answers for the same operational job state.