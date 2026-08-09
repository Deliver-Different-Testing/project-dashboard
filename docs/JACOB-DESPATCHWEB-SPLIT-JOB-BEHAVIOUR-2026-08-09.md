# Jacob — DespatchWeb split-job behaviour fixes

Date: 2026-08-09
Owner: Jacob
System: despatchweb

## Why this change is needed

The current split-job flow in despatchweb creates inconsistent dispatch state when a job is split before dispatch, and it does not fully clean up courier-device state when an already-dispatched job is split.

Key code currently involved:

- `gitlab-source/despatchweb/Services/SplitJobService.cs`
- `gitlab-source/despatchweb/Controllers/JobController.cs`
- `gitlab-source/despatchweb/wwwroot/app/react/services/splitJobFlow.ts`
- `gitlab-source/despatchweb/wwwroot/app/react/services/splitJobApi.ts`
- likely courier-device sync path via existing resend/re-dispatch procedures in `Repositories/JobRepository.cs`

## Current behaviour observed

### 1) Split before dispatch
`SplitJobService.SplitJobAsync(...)` currently stamps the pickup leg with:

- `UcjbDispTime = tenantClock.TenantNow`
- `UcjbDispDate = tenantClock.TenantNow`
- `UcjbDispId = job.UcjbDispId`

That happens even when the original job was never dispatched.

### 2) Split after dispatch
When the original job already has a courier:

- the original courier is captured from `job.UcjbCourierId`
- the parent/original job is converted into the split parent
- the parent courier is replaced with `ParentJobCourierId` (or null)
- `DisplayInDespatch` is set to `false`
- the pickup child inherits the original courier

This is directionally right, but the parent/original job is not being explicitly removed from the courier handset/device after the split.

## Required behaviour

## 1. Split before dispatch
If a job is split before dispatch:

- pickup leg `UcjbDispTime` must remain `null`
- pickup leg `UcjbDispDate` must remain `null`
- pickup leg `UcjbDispId` must remain `null`
- pickup leg must not be treated as dispatched just because the split happened
- delivery leg dispatch fields must also remain `null` unless a courier is assigned during split

### Practical rule
Only copy/set dispatch metadata onto a child leg if that leg is genuinely being dispatched as part of the split.

---

## 2. Split after dispatch
If the original job is already dispatched:

- pickup leg must inherit the original courier
- pickup leg must inherit the original dispatch values from the original/now-parent job:
  - `UcjbDispTime`
  - `UcjbDispDate`
  - `UcjbDispId`
- pickup leg must inherit the original pickup timestamp if the original job is already picked up:
  - `PickUpTime`

### Important
Do **not** replace the real historic dispatch/pickup timestamps with `tenantClock.TenantNow` during split. If the job was dispatched earlier, the child pickup leg should preserve that real operational history.

---

## 3. Remove original/now-parent from the pickup courier device
If an already-dispatched job is split:

- the original/now-parent must be removed from the original courier device
- the pickup leg should be what remains visible/active for that courier

### Requirement
After the split commits, trigger the courier-device sync/removal path for the original courier so the handset no longer shows the parent/original job.

### Implementation note
There are already existing resend/re-dispatch paths in `JobRepository.cs`, including:

- `ReSendSelectedJobsAsync(...)` → `uspReDespatchJobAsync(...)`
- `ReSendAllJobsAsync(courierId)` → `uspReDespatchJobByCourierIDAsync(courierId)`

Preferred approach:

1. capture the original courier ID before mutating the parent
2. complete the split transaction
3. if the original courier existed, trigger the existing courier resend/sync flow for that courier
4. verify that this actually removes the hidden parent from device state and leaves only the valid child job(s)

If the existing resend procedure only adds/refreshes jobs and does **not** remove stale parent jobs from the handset, then add the explicit removal behaviour needed in the device-sync path.

---

## 4. Delivery leg dispatch behaviour
The delivery leg can receive dispatch metadata during split **only** if the dispatcher assigns a courier to leg B as part of the split flow.

### Required behaviour

If `courierIdForLegB` is supplied during split:

- delivery leg `UcjbCourierId` = assigned courier
- delivery leg `UcjbDispTime` can be set
- delivery leg `UcjbDispDate` can be set
- delivery leg `UcjbDispId` can be set

If `courierIdForLegB` is **not** supplied:

- delivery leg `UcjbCourierId` must remain `null`
- delivery leg `UcjbDispTime` must remain `null`
- delivery leg `UcjbDispDate` must remain `null`
- delivery leg `UcjbDispId` must remain `null`

---

## Implementation outline

## `Services/SplitJobService.cs`

### A. Pickup leg dispatch logic
Replace the unconditional pickup-leg dispatch stamping.

Current shape is effectively:

```csharp
pickupJob.UcjbCourierId = originalCourierId;
pickupJob.UcjbDispTime = currentTenantTime;
pickupJob.UcjbDispDate = currentTenantTime;
pickupJob.UcjbDispId = job.UcjbDispId;
```

Target behaviour:

- if original job was not dispatched (`UcjbDispTime`, `UcjbDispDate`, `UcjbDispId`, and likely courier all absent), keep those fields null on pickup leg
- if original job was already dispatched, copy the original values through unchanged
- if original job was already picked up, copy `PickUpTime` through to pickup leg

### B. Delivery leg dispatch logic
Keep the current rule that leg B only gets dispatch metadata when `courierIdForLegB` is provided.

### C. Parent device cleanup trigger
After commit, if the original job had a courier, invoke the courier-device refresh/removal path.

This should be done after commit, not inside the transaction.

---

## Acceptance criteria

### Scenario A — split before dispatch
Given:

- original job has no courier
- original job has no `UcjbDispTime`
- original job has no `UcjbDispDate`
- original job has no `UcjbDispId`

When:

- dispatcher splits the job

Then:

- parent becomes split parent and is hidden from despatch
- pickup leg has null `UcjbDispTime`
- pickup leg has null `UcjbDispDate`
- pickup leg has null `UcjbDispId`
- delivery leg has null dispatch fields unless courier assigned during split

### Scenario B — split after dispatch but before pickup
Given:

- original job already has courier
- original job already has `UcjbDispTime`, `UcjbDispDate`, `UcjbDispId`
- original job `PickUpTime` is null

When:

- dispatcher splits the job

Then:

- pickup leg inherits original courier
- pickup leg inherits original `UcjbDispTime`
- pickup leg inherits original `UcjbDispDate`
- pickup leg inherits original `UcjbDispId`
- pickup leg `PickUpTime` remains null
- parent/original is removed from courier device

### Scenario C — split after pickup
Given:

- original job already has courier
- original job already has dispatch metadata
- original job already has `PickUpTime`

When:

- dispatcher splits the job

Then:

- pickup leg inherits courier
- pickup leg inherits original dispatch metadata unchanged
- pickup leg inherits original `PickUpTime`
- parent/original is removed from courier device

### Scenario D — delivery leg courier assigned during split
Given:

- dispatcher assigns courier to leg B while splitting

Then:

- delivery leg gets `UcjbCourierId`
- delivery leg gets dispatch metadata

### Scenario E — delivery leg courier not assigned during split
Given:

- dispatcher does not assign courier to leg B while splitting

Then:

- delivery leg courier remains null
- delivery leg dispatch fields remain null

---

## Test updates needed

Add/adjust tests around:

- split before dispatch → pickup leg dispatch fields stay null
- split after dispatch → pickup leg preserves original dispatch values, not `TenantNow`
- split after pickup → pickup leg preserves `PickUpTime`
- leg B with no courier → dispatch fields remain null
- leg B with courier → dispatch fields set
- already-dispatched split triggers courier-device cleanup path for the original courier

Existing split-job tests already live near:

- `DespatchWeb.Tests/Services/SplitJobServiceTests.cs`
- `DespatchWeb.Tests/Controllers/JobControllerTests.cs`
- `DespatchWeb.Tests/Repositories/JobRepositorySplitJobTests.cs`

## Deliverable

Update despatchweb split behaviour so that child-leg dispatch history reflects the real operational state, not the time the split was performed, and ensure courier handset state no longer shows the stale parent after a split of an already-dispatched job.
