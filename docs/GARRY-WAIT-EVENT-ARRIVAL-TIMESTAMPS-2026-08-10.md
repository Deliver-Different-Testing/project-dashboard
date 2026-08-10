# Garry — wait-event arrival timestamps handover (2026-08-10)

## Ask

Close the disconnect between:

- what operations can see/edit in **DespatchWeb**
- what Garry's waiting-time pipeline is feeding through for **invoice display / charging**

The required behaviour is now **two-path**:

1. last week's **Job Not Ready / waiting event** flow should stamp the real arrival timestamps onto:
   - `tucJob.PickupArrivalTime`
   - `tucJob.DeliveryArrivalTime`
2. if the driver forgets to raise the waiting / arrival event, a dispatcher-entered arrival time in DespatchWeb must still be enough to drive the waiting-time charge / invoice output from the same arrival fields

This is for the same event family already used for pickup/delivery waiting charges:

- `60` = legacy waiting event
- `87` = waiting to collect job - 5 min
- `88` = waiting to collect job - 10 min
- `89` = waiting to collect job - 15 min
- `90` = waiting to collect job - 20 min
- `91` = waiting to collect job - 30 min

## Why this is needed

Your Aug 6 delivery waiting-charge change correctly made the **delivery leg** consume open waiting events and charge them.

Relevant change:

- `dbmigrationsv2/DatabaseScripts/Migrations/20260806140000_DeliveryWaitingCharge.sql`
- commit `3c43e33` — `Charge waiting time at the delivery leg`

That work already proves the system has the right source timestamp for real onsite waiting:

- wait start lives in `tucEvent.ucevDate` + `ucevTime`
- pickup wait end lives in `tucJob.PickUpTime`
- delivery wait end lives in `tucJob.ucjbComplTime`
- the event/tenant clock correction is already handled via:

```sql
DECLARE @TenantNow datetime = dbo.UTL_GetTenantLocalDateTime();
DECLARE @ClockOffsetMin int = DATEDIFF(MINUTE, GETDATE(), @TenantNow);
```

Right now the waiting path **charges correctly**, but it does **not** also write that real arrival timestamp back into:

- `PickupArrivalTime`
- `DeliveryArrivalTime`

Steve wants the arrival fields to become the shared operational source that bridges DespatchWeb and invoicing:

- when there is a valid waiting event, stamp the arrival field from that event
- when there is no waiting event, dispatcher-entered `PickupArrivalTime` / `DeliveryArrivalTime` must still support the waiting-time outcome

That is the missing connection today: DespatchWeb can show one thing, while the invoicing path Garry built for Kerran is using a different source path.

## Current proven behaviour

### Pickup path

`MARS_stpJob_CourierResponse_PickUp` already:

- looks up the latest open waiting event in `tblEvent` / `tucEvent`
- uses event types `(60,87,88,89,90,91)`
- measures elapsed wait from the event timestamp to pickup completion
- closes the event
- updates `WaitedPickUp`

Relevant file:

- `dbmigrationsv2/DatabaseScripts/Migrations/20250617132923_MarsPickupChanges.sql`

### Delivery path

`MARS_stpJob_CourierResponse_Delivery` now also:

- looks up the latest open waiting event in `tblEvent` / `tucEvent`
- uses event types `(60,87,88,89,90,91)`
- applies the same clock correction / free allowance / charge logic
- closes the event
- updates `WaitedDelivery`

Relevant file:

- `dbmigrationsv2/DatabaseScripts/Migrations/20260806140000_DeliveryWaitingCharge.sql`

### Gap

There are two gaps today:

1. neither path currently writes:
   - `tucJob.PickupArrivalTime`
   - `tucJob.DeliveryArrivalTime`
2. if the driver forgets to create the waiting event, dispatcher-populated arrival fields in DespatchWeb are not acting as the fallback trigger for waiting-time charging / invoice display

## Required behaviour

### 1. Pickup waiting events should stamp `PickupArrivalTime`

When pickup completion consumes an open waiting event for the **pickup leg**, also write:

- `PickupArrivalTime = corrected waiting-event start timestamp`

That timestamp should be the **clock-corrected** event time, not raw NZ server time.

### 2. Delivery waiting events should stamp `DeliveryArrivalTime`

When delivery completion consumes an open waiting event for the **delivery leg**, also write:

- `DeliveryArrivalTime = corrected waiting-event start timestamp`

Again: use the corrected tenant-local event time, not raw server time.

### 3. Do not overwrite with later waiting episodes on the same leg

A driver can raise **Job Not Ready** more than once on a leg. Arrival time should represent the **first arrival / first wait-start** for that leg, not the last escalation or repeat event.

So the write rule should be:

- if the arrival field is `NULL`, set it
- if the arrival field already has a later value than this corrected event start, replace it with the earlier corrected event start
- if the field already has an earlier value, leave it alone

In plain English: **preserve the earliest proven arrival for that leg**.

### 4. Dispatcher-entered arrival fields must also work as the fallback path

If the driver forgets to start the waiting / arrival event at pickup or delivery, operations can still populate:

- `PickupArrivalTime`
- `DeliveryArrivalTime`

in DespatchWeb.

That manual entry must be enough to trigger the same waiting-time outcome for the relevant leg.

In plain English:

- **preferred path:** driver raises Job Not Ready event, which stamps the arrival field and drives the charge
- **fallback path:** no event exists, dispatcher enters the arrival field in DespatchWeb, and the waiting-time logic / invoice output still uses that field rather than silently showing no wait

### 5. Scope

Do **not** redesign invoice reporting beyond what is required to make DespatchWeb and invoice output agree on the same effective arrival source.

The core requirement is to stop the source-of-truth split between:

- event-driven waiting charge logic
- dispatcher-visible arrival fields
- invoice display/output

## Recommended implementation point

Use the same place the wait event is already resolved and charged.

### Pickup

Update the pickup proc logic in the existing waiting-event block inside:

- `MARS_stpJob_CourierResponse_PickUp`

Source file:

- `dbmigrationsv2/DatabaseScripts/Migrations/20250617132923_MarsPickupChanges.sql`

### Delivery

Update the delivery proc logic in:

- `MARS_stpJob_CourierResponse_Delivery`

Source file:

- `dbmigrationsv2/DatabaseScripts/Migrations/20260806140000_DeliveryWaitingCharge.sql`

This is the safest place because:

- the event is already resolved there
- the tenant/server clock correction is already there
- leg classification is already there
- duplicate charging / duplicate open-event handling is already managed there

But this is only half the change. The other half is to make the manual DespatchWeb arrival-field path feed the same charging/display logic when no event exists.

## Additional implementation requirement — unify the source used by invoicing / charging

Today the attachment for Kerran effectively treats event-derived wait timing as one pipeline and DespatchWeb arrival fields as another. That split is the business problem.

Required direction:

- for each leg, determine an **effective arrival time**
- prefer the event-derived corrected timestamp when a valid wait event exists
- otherwise fall back to dispatcher-entered `PickupArrivalTime` / `DeliveryArrivalTime`
- use that effective arrival consistently wherever waiting charge / invoice waiting timing is derived

### Effective arrival rule

For pickup:

1. if a valid pickup waiting event exists, use the corrected event start
2. else if `PickupArrivalTime` is populated, use `PickupArrivalTime`
3. else there is no pickup waiting basis

For delivery:

1. if a valid delivery waiting event exists, use the corrected event start
2. else if `DeliveryArrivalTime` is populated, use `DeliveryArrivalTime`
3. else there is no delivery waiting basis

### Why this matters

That gives ops one visible field in DespatchWeb that still matters operationally when the handset flow is missed, and it gives Kerran/invoicing a stable source that agrees with what dispatch sees.

## Suggested SQL shape

Not exact copy-paste SQL, but the write rule should be equivalent to:

### Pickup leg

```sql
PickupArrivalTime =
    CASE
        WHEN PickupArrivalTime IS NULL THEN @CorrectedEventDateTime
        WHEN PickupArrivalTime > @CorrectedEventDateTime THEN @CorrectedEventDateTime
        ELSE PickupArrivalTime
    END
```

### Delivery leg

```sql
DeliveryArrivalTime =
    CASE
        WHEN DeliveryArrivalTime IS NULL THEN @CorrectedEventDateTime
        WHEN DeliveryArrivalTime > @CorrectedEventDateTime THEN @CorrectedEventDateTime
        ELSE DeliveryArrivalTime
    END
```

Where `@CorrectedEventDateTime` is the tenant-local event start after applying the same clock offset already used in the delivery waiting-charge migration.

## Important constraints

### Use corrected event time, not raw event time

The attachment Kerran was given is explicit: `tucEvent` is NZ server time while `PickUpTime` / `ucjbComplTime` are tenant-local.

If you stamp raw event time into arrival fields for a US tenant, the values will be hours wrong but still look superficially plausible.

### Do not use `WaitedPickUp` / `WaitedDelivery` as the source of truth

Those fields are not the source timestamp; they are wait-minute fields and historically unreliable as the raw evidence source.

Use the event timestamp itself.

### Dispatcher-entered arrival values are now an intentional fallback, not something to ignore

The attached invoice note correctly says the fields were historically unreliable for measurement.

This handover changes that rule going forward:

- event-driven jobs should persist the driver/event-sourced arrival time into those fields
- manual dispatcher entry should remain valid as the fallback when the driver missed the event

So from this change onward, those fields should be treated as the operational bridge between DespatchWeb and invoice output, not ignored outright.

## Acceptance criteria

### Functional

- Pickup leg wait event (`60/87/88/89/90/91`) results in `tucJob.PickupArrivalTime` being populated from the corrected wait-event start time.
- Delivery leg wait event (`60/87/88/89/90/91`) results in `tucJob.DeliveryArrivalTime` being populated from the corrected wait-event start time.
- Repeated waiting events on the same leg do not move the field later; the earliest proven arrival is preserved.
- If no valid wait event exists, dispatcher-entered `PickupArrivalTime` still supports the pickup waiting-time outcome.
- If no valid wait event exists, dispatcher-entered `DeliveryArrivalTime` still supports the delivery waiting-time outcome.
- DespatchWeb-visible arrival values and invoice waiting-time output no longer disagree for the same job/leg.
- Existing wait notes / charge lines / event closing behaviour remain unchanged except where necessary to enable the fallback.

### Regression / proof

Use the same staging tenant + evidence style as the Aug 6 handover.

At minimum prove on staging that:

1. a pickup wait episode still charges correctly
2. a delivery wait episode still charges correctly
3. `PickupArrivalTime` now equals the corrected pickup waiting-event start
4. `DeliveryArrivalTime` now equals the corrected delivery waiting-event start
5. with no wait event present, manually entering `PickupArrivalTime` in DespatchWeb still produces the correct pickup waiting-time outcome
6. with no wait event present, manually entering `DeliveryArrivalTime` in DespatchWeb still produces the correct delivery waiting-time outcome
7. total job amount and pricing breakdown still reconcile exactly

### Historical / archive safety

- No historical backfill is required in this task unless you explicitly decide to do one.
- Archived rows should continue to carry these fields through the existing archive flow; only add archive-specific work if testing proves they are dropped.

## Good test fixture

The invoice context note cites staging job **415685** for pickup + delivery waiting proof. Use that style of validation again, or create a fresh staging fixture with one wait episode on each leg and capture:

- raw `tucEvent` timestamp
- corrected tenant-local event timestamp
- `PickUpTime`
- `ucjbComplTime`
- resulting `PickupArrivalTime`
- resulting `DeliveryArrivalTime`
- resulting `PricingBreakdown` rows

## Out of scope

- invoice report/query redesign
- changing how wait charges are calculated
- fixing the known wait-block truncation behaviour
- changing mobile app UX
- changing dispatcher-side manual arrival editing

## Summary

Please extend the same waiting-event machinery you shipped last week so it also persists the **real driver wait-start timestamp** into:

- `PickupArrivalTime`
- `DeliveryArrivalTime`

using the **corrected tenant-local event time**, and preserving the **earliest event on each leg** rather than overwriting with later repeats.

Then close the second gap as well: if the driver misses the event, a dispatcher-entered arrival time in DespatchWeb must still drive the waiting-time result so the operational screen and the invoice output are using the same effective arrival basis.
