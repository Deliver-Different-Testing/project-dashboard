# Automation Engine — add old trigger reference options into the new engine (2026-08-14)

## Context
Steve compared the trigger-time dropdown in the **new Automation Engine** against the equivalent dropdown in the **old engine**.

The new engine currently exposes only a reduced set of schedule-reference options.

This note is to restore parity by bringing the missing old-engine options into the new engine.

---

## What Steve is seeing

### New engine currently shows
- Pickup time
- Delivery time
- Flight time

### Old engine shows
- Start Time
- Dispatch Time
- Pickup Time
- Delivery Time
- Flight Departure
- Flight Arrival
- Connection Flight Departure

---

## Required change
Add the missing **old-engine schedule reference / trigger options** into the new engine.

### Missing options that must be added
- Start Time
- Dispatch Time
- Flight Departure
- Flight Arrival
- Connection Flight Departure

### Existing options that should remain
- Pickup time
- Delivery time
- Flight time

Do **not** remove the current new-engine options unless Garry finds a confirmed backend/logic reason they cannot coexist.

---

## Expected result
After the change, the new engine trigger dropdown should support the full legacy set Steve expects, instead of the cut-down version currently visible.

Minimum acceptable outcome:
- Start Time
- Dispatch Time
- Pickup Time
- Delivery Time
- Flight Departure
- Flight Arrival
- Connection Flight Departure

If `Flight time` in the new engine is a separate concept rather than a legacy label, keep it as well unless there is a confirmed duplication problem.

---

## Implementation intent
This is a **parity restoration** task, not a rethink of the trigger model.

Garry should:
1. identify where the new engine defines the trigger reference enum / option list
2. add the missing legacy options into the frontend dropdown
3. wire each option through the backend condition model / evaluation path if any are currently unsupported
4. verify that saved automations can persist and reload those options cleanly

---

## Acceptance criteria
- The new Automation Engine trigger reference dropdown includes the old-engine options Steve listed.
- A user can select and save automations using:
  - Start Time
  - Dispatch Time
  - Pickup Time
  - Delivery Time
  - Flight Departure
  - Flight Arrival
  - Connection Flight Departure
- Existing automations using current options do not break.
- If any option cannot yet be evaluated end-to-end, Garry should document exactly which layer is missing (UI, API, enum, DB mapping, evaluator).

---

## Steve's framing
The ask is simple:
- the **old engine had these trigger options**
- the **new engine needs them too**

This should be treated as missing functionality in the new engine, not as an optional enhancement.
