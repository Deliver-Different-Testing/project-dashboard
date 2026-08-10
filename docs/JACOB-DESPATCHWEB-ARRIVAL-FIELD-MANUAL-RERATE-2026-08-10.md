# Jacob — DespatchWeb manual rerate from dispatcher arrival-field edits

Date: 2026-08-10
Owner: Jacob
System: despatchweb

## Why this change is needed

Today a dispatcher can manually edit:

- `PickupArrivalTime`
- `DeliveryArrivalTime`

in DespatchWeb, but that edit is only a bare field write.

It does **not** currently:

- derive the relevant waiting minutes
- rerate the job
- update `ucjbAmount`
- rewrite the `PricingBreakdown` rows
- add the waiting-time charge into the price breakdown output

That leaves ops doing a split workflow:

1. manually correct the arrival field for operational truth
2. manually correct the waiting-time charge separately

The goal of this task is to close that gap for dispatcher-entered arrival corrections.

## Current code path

### Dispatcher UI entry point

Arrival fields are already editable in the job details metrics grid:

- `gitlab-source/despatchweb/wwwroot/app/react/components/common/job-details/components/MetricsGrid.tsx`

That edit flows into the normal job update endpoint.

### Current backend update path

Manual job field edits currently go through:

- `gitlab-source/despatchweb/Controllers/JobController.cs`
  - `UpdateJob(int jobId, JobProperty field, string value, CancellationToken ct)`
- `gitlab-source/despatchweb/Repositories/JobRepository.EditOperations.cs`
  - `JobProperty.PickupArrivalTime` → `j.PickupArrivalTime`
  - `JobProperty.DeliveryArrivalTime` → `j.DeliveryArrivalTime`

Right now those two properties are **not** included in `JobController.ShouldRecalculateRate(...)`, so the write succeeds but no rerate happens.

### Existing rerate path to reuse

Do **not** build a one-off pricing writer for this.

Reuse the same live-job rerate pipeline DespatchWeb already uses elsewhere:

- `jobQueryRepository.GetJobDetailsForRatingNzAsync(jobId, false)`
- `rateJobService.RateJobNzAsync(jobDetails)`
- `jobCommandRepository.UpdateUrgentJobRateAsync(jobId, rate, jobType, pricingBreakdown)`

Relevant files:

- `gitlab-source/despatchweb/Controllers/JobController.cs`
- `gitlab-source/despatchweb/Services/RateJobService.cs`
- `gitlab-source/despatchweb/Repositories/JobRepository.RatingOperations.cs`

That existing path already:

- recalculates the live NZ urgent-job rate
- updates `tucJob.ucjbAmount`
- rewrites `PricingBreakdown` via `DD_InsertPricingBreakdownAsync(...)`
- writes the repricing note

## Required behaviour

## 1. Pickup arrival manual edit must support pickup waiting rerate

When dispatch manually edits `PickupArrivalTime` on a live job:

1. persist the edited arrival field
2. derive pickup waiting minutes from the effective pickup arrival and actual pickup completion point
3. store that derived value into `tucJob.WaitedPickUp`
4. call the normal live-job NZ rerate path
5. persist the resulting rate and updated `PricingBreakdown`

### Pickup wait-minute basis

Use:

- wait start = `PickupArrivalTime`
- wait end = `PickUpTime`

Exact calculation rule:

- `WaitedPickUp = max(0, DATEDIFF(MINUTE, PickupArrivalTime, PickUpTime))`

Equivalent C# rule is fine, but it must be the same outcome as SQL `DATEDIFF(MINUTE, start, end)` on those two timestamps.

Important:

- both fields are already tenant-local wall-clock values in DespatchWeb
- do **not** apply an additional timezone correction in this manual dispatcher-edit path
- this task is about measuring the elapsed minutes between two already-corrected operational timestamps

If either value is missing, there is no pickup waiting basis.

## 2. Delivery arrival manual edit must support delivery waiting rerate

When dispatch manually edits `DeliveryArrivalTime` on a live job:

1. persist the edited arrival field
2. derive delivery waiting minutes from the effective delivery arrival and actual delivery completion point
3. store that derived value into `tucJob.WaitedDelivery`
4. call the normal live-job NZ rerate path
5. persist the resulting rate and updated `PricingBreakdown`

### Delivery wait-minute basis

Use:

- wait start = `DeliveryArrivalTime`
- wait end = `ucjbComplTime`

Exact calculation rule:

- `WaitedDelivery = max(0, DATEDIFF(MINUTE, DeliveryArrivalTime, ucjbComplTime))`

Equivalent C# rule is fine, but it must be the same outcome as SQL `DATEDIFF(MINUTE, start, end)` on those two timestamps.

Important:

- both fields are already tenant-local wall-clock values in DespatchWeb
- do **not** apply an additional timezone correction in this manual dispatcher-edit path
- this task is about measuring the elapsed minutes between two already-corrected operational timestamps

If either value is missing, there is no delivery waiting basis.

## 3. Do not hand-write a fake charge row

The waiting-time charge must come out of the normal rating result, not a custom insert that bypasses rating.

So the implementation should:

- derive and persist the correct waited-minute fields first
- then call the normal rerate path
- then let the normal pricing breakdown persistence rewrite the job breakdown rows

That keeps the amount, charge lines, and future rerates internally consistent.

## 4. Scope this to the manual dispatcher-edit path

This is specifically for the DespatchWeb dispatcher edit path.

It is **not** the same task as Garry’s event-driven stamping work.

Garry’s work covers:

- driver wait events stamping arrival fields automatically
- invoice/display alignment

This Jacob task is the follow-on for when a dispatcher manually corrects the arrival field and wants charging to catch up automatically.

## Implementation outline

## A. Make arrival fields rate-affecting in the controller

File:

- `gitlab-source/despatchweb/Controllers/JobController.cs`

Update `ShouldRecalculateRate(...)` so it returns `true` for:

- `JobProperty.PickupArrivalTime`
- `JobProperty.DeliveryArrivalTime`

Without that, the edit path will keep writing the field with no rerate.

## B. Add an arrival-edit rerate branch before the normal rerate call

File:

- `gitlab-source/despatchweb/Controllers/JobController.cs`
- possibly small helper/service extraction if cleaner

Required flow after `UpdateJobAsync(...)` succeeds:

1. detect whether the edited field is `PickupArrivalTime` or `DeliveryArrivalTime`
2. load the live job row
3. compute the relevant wait minutes from the edited arrival field and the leg end time using the exact rules below
4. persist the relevant waited-minute field onto `WaitedPickUp` or `WaitedDelivery`
5. run the existing NZ rerate path

This should remain inside the same request flow so the dispatcher edit and resulting rerate are one user action.

## C. Persist the derived wait minutes onto the correct field

Relevant current fields:

- `tucJob.WaitedPickUp`
- `tucJob.WaitedDelivery`

Relevant entity:

- `gitlab-source/despatchweb/EntityClasses/TucJob.cs`

Required rule:

- pickup arrival edit updates `WaitedPickUp`
- delivery arrival edit updates `WaitedDelivery`

Use this exact minute derivation:

```text
WaitedPickUp = max(0, DATEDIFF(MINUTE, PickupArrivalTime, PickUpTime))
WaitedDelivery = max(0, DATEDIFF(MINUTE, DeliveryArrivalTime, ucjbComplTime))
```

Implementation can be in C# or SQL-adjacent code, but the result must be equivalent to SQL Server `DATEDIFF(MINUTE, start, end)` using the already-stored tenant-local timestamps.

Do **not** invent a separate timezone conversion or alternate rounding rule in the UI/controller layer.

## D. Reuse the normal NZ rerate persistence path

Relevant files:

- `gitlab-source/despatchweb/Services/RateJobService.cs`
- `gitlab-source/despatchweb/Repositories/JobRepository.RatingOperations.cs`

Target result:

- `RateJobNzAsync(...)` recalculates the job
- `UpdateUrgentJobRateAsync(...)` updates `ucjbAmount`
- `UpdateUrgentJobRateAsync(...)` rewrites `PricingBreakdown` via `DD_InsertPricingBreakdownAsync(...)`

This is the correct place for the price-breakdown write.

## Important caveat — current NZ rating mapping gap

Current NZ live rerate mapping still reads:

- `WaitTime = job.WaitedPickUp ?? 0`

from:

- `gitlab-source/despatchweb/Helpers/JobMappings.Rating.cs`

That means a delivery-only dispatcher correction will **not** flow into the rerate correctly unless this mapping/rating input is also addressed.

So this task must explicitly review and fix the NZ waiting input contract so:

- pickup waiting rerate uses the pickup waited minutes correctly, and
- delivery waiting rerate uses the delivery waited minutes correctly

**Jacob: check this mapping/input rule with Kerran before finalising the rerate change.** Kerran authored the rerating spec/workstream, so the canonical rerate wait-minute input needs to stay aligned with his design rather than drifting in DespatchWeb only.

Default implementation rule if Kerran has not already defined a different contract:

- live rerate `WaitTime` input should be based on the recorded wait minutes needed by rating
- for this dispatcher-edit path, that means the rerate input must reflect the derived waited values created by the edit
- if the rerate path uses one combined wait-minute input, the safe default is:
  - `ISNULL(WaitedPickUp, 0) + ISNULL(WaitedDelivery, 0)`

Do **not** ship a version that auto-rerates pickup edits but silently ignores delivery edits.

## Recommended design guardrails

- live jobs only for the first pass
- NZ urgent jobs only for the first pass
- do not create a separate manual price-edit path
- do not insert ad-hoc pricing breakdown rows outside the normal rerate persistence path
- do not rerate recurring/prebook/archive jobs from this first implementation unless explicitly added and tested

## Acceptance criteria

### Functional

- Editing `PickupArrivalTime` in DespatchWeb on a live NZ urgent job triggers an automatic rerate.
- Editing `DeliveryArrivalTime` in DespatchWeb on a live NZ urgent job triggers an automatic rerate.
- Pickup edit updates `WaitedPickUp` before rerating.
- Delivery edit updates `WaitedDelivery` before rerating.
- Resulting `ucjbAmount` is updated automatically.
- Resulting `PricingBreakdown` is rewritten automatically through the normal persistence path.
- The waiting-time charge appears in the price breakdown without the dispatcher manually adding it.

### Regression / safety

- Editing arrival fields does not break non-pricing job edits.
- Jobs with no valid end timestamp (`PickUpTime` / `ucjbComplTime`) do not throw; they simply skip wait-minute derivation until a valid basis exists.
- Negative derived waits are clamped to zero rather than producing nonsense values.
- Delivery rerate is proven end-to-end, not just pickup.

### Proof on staging

At minimum prove:

1. manually edit `PickupArrivalTime` earlier than `PickUpTime`
2. `WaitedPickUp` updates to the expected minutes
3. rerate fires automatically
4. `PricingBreakdown` now includes the waiting-time line
5. job total updates accordingly
6. manually edit `DeliveryArrivalTime` earlier than `ucjbComplTime`
7. `WaitedDelivery` updates to the expected minutes
8. rerate fires automatically
9. `PricingBreakdown` includes the delivery waiting-time effect correctly
10. no manual secondary repricing step is required from ops

## Suggested tests

Add/extend tests around:

- `DespatchWeb.Tests/Controllers/JobControllerShouldRecalculateRateTests.cs`
  - arrival fields should now return `true`
- `DespatchWeb.Tests/Repositories/JobRepositoryEditArrivalTimeTests.cs`
  - keep the field-write assertions
- controller/service rerate tests
  - verify arrival edit triggers rerate for NZ jobs
  - verify waited-minute field is persisted before rerate
- rating-path tests
  - verify the pricing breakdown write path is called after arrival-edit rerate

## Summary

Please extend the dispatcher arrival-field edit path so a manual edit to:

- `PickupArrivalTime`, or
- `DeliveryArrivalTime`

becomes a **real waiting-time rerate action**, not just a timestamp correction.

That means:

1. save the edited arrival field
2. derive the relevant waited minutes
3. persist `WaitedPickUp` / `WaitedDelivery`
4. call the normal NZ rerate path
5. let the normal rerate persistence rewrite `ucjbAmount` and `PricingBreakdown`

The key business outcome is that ops should no longer have to manually correct both the arrival timestamp **and** the wait charge as two separate actions.

In other words: the dispatcher edit must first materialise the correct `WaitedPickUp` / `WaitedDelivery` minutes from the arrival-to-end timestamps, and only then call the normal rerate path so rating has the inputs it actually needs.

Before Jacob closes this, he should confirm the final rerate wait-minute contract with **Kerran** so the DespatchWeb-side implementation matches the authored rerating spec.
