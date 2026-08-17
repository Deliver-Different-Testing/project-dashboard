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

Vincent has added an important operational nuance: the inconsistency is not just a display issue. The timing of when the parent goes live versus when LHP/LH1 go live appears to differ between different services, which likely contributes both to the release-from-bulk issue and to false triggering of POD texts to final-mile customers.

## Current risk

When dispatch sees mixed states like `new`, `done`, `complete`, `void`, or `null` for the same job family:

- the UI cannot reliably decide whether the bulk is still active, completed, voided, or releasable
- release/remove-from-bulk logic can refuse to act because one branch says the job is still `new`
- linehaul and LHP steps can appear completed in one place while still blocked in another
- parent/family completion can be inferred too early from upstream legs
- POD/customer messaging can trigger off the wrong milestone
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

There also appears to be a second inconsistency around **when the parent job is treated as live** relative to LHP/LH1/LH2/DEL. If different services are activating different legs at different times, the family can fall into contradictory states even before the UI renders them.

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
- any service(s) that decide when parent, LHP, LH1, LH2, and DEL transition from bulk/planned state into live state
- any notification/POD trigger path that currently keys off child completion rather than resolved parent-family completion

## Vincent's operational model to preserve

The fix should not just normalise labels. It should make the parent job the single operational truth for the job family once linehaul activity becomes relevant.

### Proposed live-state model

- **Parent** goes live on the day that LHP or LH1 becomes relevant
- **Parent** then acts as the single source of truth for family status
- **Parent** also becomes the canonical record for family-level scan/state reporting such as barcode, sort-scan, and in-transit behaviour
- **DEL** holds the final-mile run names once DEL itself goes live, so sort scans and app scan speech can refer to the active delivery run correctly
- **Parent** is only marked completed when the final-mile **DEL** job is delivered
- **POD text** should trigger from that completed parent/family outcome, not from an earlier LHP/LH completion event

### Expected family progression

For a multi-stage movement such as Tauranga pickup with Auckland final delivery:

1. **Initial booking for final delivery a few days later**
   - Parent remains in bulk/planned state
   - DEL remains in bulk/planned state
2. **Day when linehaul becomes relevant**
   - Parent goes live
   - LHP / LH1 / LH2 may already exist in live tables, but this is the point where the parent becomes the family truth
3. **LHP picked up from client on its way to depot**
   - Parent becomes `Booked` → `In-transit`
4. **Arrived in first depot / about to go onto linehaul**
   - Parent remains `In-transit`
5. **All LH portions complete while DEL is not yet complete**
   - Parent becomes `Destination Depot`
   - Parent must not become `Completed` yet
6. **DEL goes live and is picked up by the final-mile driver**
   - DEL now carries the final-mile run-name context
7. **DEL delivered**
   - Parent becomes `Destination Delivery`, then `Completed` / `Done`
   - POD text triggers here

This sequence matters because LHP, LH1, and LH2 can legitimately be live and completed before DEL is relevant. That must not be interpreted as the whole family being complete.

## Required behaviour

## 1. One displayed operational state per job family

For bulk, parent, DEL, LH, and LHP views, the screen must not show contradictory values for the same operational state.

If the job is operationally complete, every relevant surface must resolve to the same answer.
If the job is still new, every relevant surface must resolve to the same answer.
If the job is void, every relevant surface must resolve to the same answer.

`null` should never be surfaced as a competing status when a valid resolved state already exists.

The parent must become the canonical family state once LHP/LH1 becomes relevant, rather than allowing each child service to imply family state independently.

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

Just as importantly, LHP/LH completion must not falsely imply that the parent family is complete or ready to fire the customer POD notification.

## 4. Fix the sync bug first; only remove a field if truly safe

Marcus's question is the right one: if two fields are displaying the same business meaning, we should not keep letting them drift.

But the first implementation step should be:

- identify the canonical operational status source
- make every display and release decision resolve from that source
- backfill/sync any stale companion fields where required

Only remove one of the underlying fields if Jacob confirms it is not needed by legacy procedures, reporting, handset sync, or historic workflows.

## Recommended implementation approach

## A. Define a canonical resolved status

Add one explicit resolution rule for bulk-family jobs, with the **parent** as the canonical family-state record once linehaul activity becomes relevant.

At minimum:

- void beats everything for the specific leg being voided
- done/complete beats new for that leg, but child-leg completion does **not** automatically mean family completion
- `null` never beats a populated status
- parent/family state transitions are driven from explicit milestones:
  - parent goes live when the LHP/LH stage becomes relevant
  - LHP pickup moves parent from `Booked` to `In-transit`
  - completion of all LH legs without DEL completion moves parent to `Destination Depot`
  - DEL delivery moves parent to `Destination Delivery`, then `Completed` / `Done`
- parent/child release logic evaluates the resolved state, not raw mixed fields
- POD/customer completion messaging keys off the resolved parent completion state, not whichever child leg happened to complete first

Whether this becomes a helper method, projection expression, or backend DTO field is up to Jacob, but it needs to exist in one place.

## B. Make projections use the resolved status

Update bulk/job projections so dispatch screens are not separately exposing conflicting raw fields as if they were equivalent status values.

At minimum:

- review `JobMappings.BulkJob.cs`
- review any DTO/view-model mapping that sends both status code and property flags to the UI
- stop the UI from independently inferring final operational state from mismatched fields
- ensure family-level status shown to dispatch is the resolved parent-family state, not a random child leg's state

## C. Make release logic use the same resolution rule

Trace the release path used when dispatch tries to get the parent and DEL out of bulk.

Likely starting points:

- `JobController.ReleaseBulkJobById(...)`
- `JobRepository.ReleaseBulkJobByIdAsync(...)`

Ensure eligibility checks and actual release behaviour use the same resolved state as the screen.

Also confirm the release/live-transition logic respects Vincent's intended progression:

- LHP/LH can become live before DEL
- parent should come live when those stages become relevant
- DEL should not be forced live too early just because upstream legs are active

## D. Audit last-release changes touching bulk status propagation

This smells like a regression, so compare the last release diff around:

- bulk-job status mapping
- completion/void flag updates
- linehaul/LHP propagation
- the rule that decides when parent versus child jobs become live
- any POD-text / notification trigger that may be reading child completion instead of parent-family completion
- any recent UI refactor that started reading a different field than before

## E. Handle voiding and repricing exceptions properly

Vincent's edge cases need to be treated as expected operations, not corruption:

- if an LHP or LH portion is voided because the client dropped it off, it travelled on another booked run, or similar, that must **not** void the parent or unrelated sibling legs
- instead, the system should recalculate the total family/job price to remove the voided portion of work
- if someone tries to void the DEL job, the system should first check whether any LHP/LH portion has already been picked up before allowing or deciding how that void should proceed

This means void logic needs family-awareness, not just single-row status toggling.

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
- parent state does not advance to completed purely because an upstream LH/LHP stage completed

### Scenario D — parent and DEL can be released correctly
Given:

- the job family is in the affected mixed-state condition

When:

- dispatch attempts to get the parent and DEL out of bulk

Then:

- the action succeeds when the resolved status permits it
- it does not fail just because one stale raw field still says `new`

### Scenario E — parent goes live at the correct family milestone
Given:

- a future delivery has been booked
- LHP or LH1 becomes relevant before DEL is relevant

When:

- the operational day reaches that upstream stage

Then:

- the parent job moves live
- the parent becomes the family status truth
- DEL can remain non-live until final-mile handling is actually relevant

### Scenario F — POD text only fires on true family completion
Given:

- one or more LHP/LH stages have completed
- DEL has not yet been delivered

When:

- the family is reloaded and status/notifications are evaluated

Then:

- the parent is not treated as completed yet
- no final-mile customer POD text fires yet
- the POD text fires only after DEL delivery advances the parent to completed/done

### Scenario G — voiding an upstream leg does not destroy the whole family
Given:

- an LHP or LH leg is voided because the freight was dropped off or moved via another booked run

When:

- the void is processed

Then:

- the parent remains valid unless business rules explicitly require otherwise
- sibling legs remain valid
- family pricing is recalculated to remove the voided portion

### Scenario H — DEL void checks prior upstream pickup state
Given:

- a user attempts to void DEL
- one or more LHP/LH legs may already have been picked up

When:

- the void is processed

Then:

- the system checks upstream pickup state first
- DEL void handling follows explicit family-aware rules instead of blindly voiding the row

## Tests to add/update

Add targeted tests around:

- bulk projection/status resolution
- `ReleaseBulkJobByIdAsync(...)` eligibility and release behaviour
- void/done/new precedence rules
- linehaul/LHP resolved-state mapping
- parent go-live timing when LHP/LH becomes relevant
- parent progression through `Booked` → `In-transit` → `Destination Depot` → `Destination Delivery` → `Completed` / `Done`, matching Vincent's table
- POD notification gating so upstream completion does not trigger final-mile POD text early
- family-aware void/repricing rules for LHP/LH/DEL edge cases
- regression coverage for the earlier `new` vs `void` conflict

Likely starting test files:

- `gitlab-source/despatchweb/DespatchWeb.Tests/Repositories/JobRepositoryBulkSearchTests.cs`
- `gitlab-source/despatchweb/DespatchWeb.Tests/Repositories/JobRepositoryVoidBulkJobTests.cs`
- `gitlab-source/despatchweb/DespatchWeb.Tests/Controllers/JobControllerTests.cs`

## Deliverable

Fix the bulk/parent/DEL/linehaul status regression so dispatch has one consistent status truth, parent + DEL can be released from bulk again, and we stop seeing mixed `new` / `done` / `complete` / `void` / `null` answers for the same operational job state.

The final implementation should also align the family lifecycle with operations reality:

- parent becomes the single source of truth once upstream linehaul activity becomes relevant
- child-leg completion does not falsely complete the family
- DEL delivery is the point that completes the family and triggers POD text
- routine upstream voids do not collapse the entire job family
