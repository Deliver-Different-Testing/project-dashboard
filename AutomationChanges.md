# Automation Engine — Filter Architecture Change

> **For:** Garry Fraser
> **From:** Steve Bonnici
> **Date:** 15 March 2026
> **Context:** You started building from `HANDOVER-GARRY.md` in `App-Configurator/feature/automation-engine-backend`. This document describes a design change we've made to the frontend and backend scaffolding that affects where filters live.

---

## What Changed

**Filters have moved from condition level → rule/scope level.**

The original `HANDOVER-GARRY.md` had these 6 filter fields on `AutomationCondition`:

- `PriorityFilter`
- `FromSiteFilter`
- `ToSiteFilter`
- `FromRegionFilter`
- `ToRegionFilter`
- `TimeThreshold`

They now live on `AutomationRule` alongside `AllCustomers`/`CustomerIds` and `AllSpeeds`/`SpeedIds`.

---

## Why

When filters sit on individual conditions, a rule with multiple conditions can have **conflicting filters that silently match nothing**.

**Example of the problem:**
- Rule has match mode = ALL (both conditions must be true)
- Condition 1: "Job unassigned" with `FromSiteFilter = Site A`
- Condition 2: "After scheduled time" with `FromSiteFilter = Site B`
- Result: No job can ever originate from both Site A and Site B → rule never fires, no error, no warning

At scope level this can't happen. One set of filters per rule, evaluated once before any conditions are checked. Clean and predictable.

---

## What the Frontend Now Looks Like

The Scope section of the automation edit form has 8 filter groups, all using the same UI pattern:

| Filter | Default | Pattern |
|--------|---------|---------|
| Customers | ✅ Apply to All | Checkbox + multi-select pills |
| Speeds | ✅ Apply to All | Checkbox + multi-select pills |
| Job Statuses | ☐ (no selection = all) | Checkbox + multi-select pills |
| Priorities | ☐ (no selection = all) | Checkbox + multi-select pills |
| Origin Sites | ☐ (no selection = all) | Checkbox + multi-select pills |
| Destination Sites | ☐ (no selection = all) | Checkbox + multi-select pills |
| Origin Regions | ☐ (no selection = all) | Checkbox + multi-select pills |
| Destination Regions | ☐ (no selection = all) | Checkbox + multi-select pills |
| Time Threshold | empty (number input) | Minutes — job must be in state for X mins |

Each filter section is collapsible. Selected items show as pills with ✕ remove buttons and a "Clear all" link. Customers and Speeds default to "Apply to All" checked; the other 6 default to unchecked/collapsed (no selection = applies to all).

**Live demo:** https://deliver-different-testing.github.io/Adminmanagerupdate/

---

## Entity Changes

### AutomationRule (new fields)

```csharp
// These are NEW columns on the rule — same pattern as AllCustomers/CustomerIds
public bool AllJobStatuses { get; set; }
public string? JobStatusIds { get; set; }        // comma-separated

public bool AllPriorities { get; set; }
public string? PriorityIds { get; set; }          // 1=Critical, 2=High, 3=Normal, 4=Low

public bool AllFromSites { get; set; }
public string? FromSiteIds { get; set; }          // comma-separated site IDs

public bool AllToSites { get; set; }
public string? ToSiteIds { get; set; }

public bool AllFromRegions { get; set; }
public string? FromRegionIds { get; set; }

public bool AllToRegions { get; set; }
public string? ToRegionIds { get; set; }

public int? TimeThreshold { get; set; }           // minutes
```

### AutomationCondition (fields removed)

These fields are **no longer on the condition entity**:

```csharp
// REMOVED — now on AutomationRule
// public string PriorityFilter { get; set; }
// public string? FromSiteFilter { get; set; }
// public string? ToSiteFilter { get; set; }
// public string? FromRegionFilter { get; set; }
// public string? ToRegionFilter { get; set; }
// public int? TimeThreshold { get; set; }
```

`AutomationCondition` keeps only its condition-specific fields: `ConditionType`, `JobTypeFilter`, `StatusConditionMode`, `StatusId`, `ScheduledTimeField`, `OffsetValue`, `OffsetUnit`, `ScanTypes`.

---

## Engine Logic Change

### Before (condition level)

```
For each rule:
  1. IsInScope() — checks customers + speeds only
  2. For each condition:
     a. PassesAdvancedFilters() — checks priority, sites, regions, threshold
     b. EvaluateCondition() — checks the actual condition logic
```

### After (scope level)

```
For each rule:
  1. IsInScope() — checks ALL filters (customers, speeds, statuses, priorities,
     from/to sites, from/to regions, time threshold)
  2. For each condition:
     a. EvaluateCondition() — checks the actual condition logic only
```

`PassesAdvancedFilters()` has been deleted. All filtering happens in `IsInScope()` before conditions are evaluated.

---

## DTO Change

### AutomationScopeDto (expanded)

```csharp
public class AutomationScopeDto
{
    public bool AllCustomers { get; set; } = true;
    public List<int> CustomerIds { get; set; } = new();
    public bool AllSpeeds { get; set; } = true;
    public List<int> SpeedIds { get; set; } = new();

    // NEW — all default to false (no selection = applies to all)
    public bool AllJobStatuses { get; set; }
    public List<int> JobStatusIds { get; set; } = new();
    public bool AllPriorities { get; set; }
    public List<int> PriorityIds { get; set; } = new();
    public bool AllFromSites { get; set; }
    public List<int> FromSiteIds { get; set; } = new();
    public bool AllToSites { get; set; }
    public List<int> ToSiteIds { get; set; } = new();
    public bool AllFromRegions { get; set; }
    public List<int> FromRegionIds { get; set; } = new();
    public bool AllToRegions { get; set; }
    public List<int> ToRegionIds { get; set; } = new();
    public int? TimeThreshold { get; set; }
}
```

### AutomationConditionDto (slimmed)

Filter fields removed. Only condition logic fields remain.

---

## SQL Migration Impact

The original `003-extend-automation-tables.sql` added filter columns to `AutomationConditions`. The new architecture needs those columns on `AutomationRules` instead.

**If you haven't run migration 003 yet:** Modify it to add the new columns to `tucAutomationRule` instead of `AutomationCondition`.

**If you've already run migration 003:** Create a new migration that:
1. Adds the new columns to `tucAutomationRule`
2. Leaves the old columns on `AutomationCondition` (don't drop — backward compatibility with SP until cutover)

Example:

```sql
-- 006-move-filters-to-rule.sql
IF COL_LENGTH('tucAutomationRule', 'AllJobStatuses') IS NULL
    ALTER TABLE tucAutomationRule ADD AllJobStatuses BIT NOT NULL DEFAULT 0;

IF COL_LENGTH('tucAutomationRule', 'JobStatusIds') IS NULL
    ALTER TABLE tucAutomationRule ADD JobStatusIds NVARCHAR(2000) NULL;

IF COL_LENGTH('tucAutomationRule', 'AllPriorities') IS NULL
    ALTER TABLE tucAutomationRule ADD AllPriorities BIT NOT NULL DEFAULT 0;

IF COL_LENGTH('tucAutomationRule', 'PriorityIds') IS NULL
    ALTER TABLE tucAutomationRule ADD PriorityIds NVARCHAR(2000) NULL;

IF COL_LENGTH('tucAutomationRule', 'AllFromSites') IS NULL
    ALTER TABLE tucAutomationRule ADD AllFromSites BIT NOT NULL DEFAULT 0;

IF COL_LENGTH('tucAutomationRule', 'FromSiteIds') IS NULL
    ALTER TABLE tucAutomationRule ADD FromSiteIds NVARCHAR(2000) NULL;

IF COL_LENGTH('tucAutomationRule', 'AllToSites') IS NULL
    ALTER TABLE tucAutomationRule ADD AllToSites BIT NOT NULL DEFAULT 0;

IF COL_LENGTH('tucAutomationRule', 'ToSiteIds') IS NULL
    ALTER TABLE tucAutomationRule ADD ToSiteIds NVARCHAR(2000) NULL;

IF COL_LENGTH('tucAutomationRule', 'AllFromRegions') IS NULL
    ALTER TABLE tucAutomationRule ADD AllFromRegions BIT NOT NULL DEFAULT 0;

IF COL_LENGTH('tucAutomationRule', 'FromRegionIds') IS NULL
    ALTER TABLE tucAutomationRule ADD FromRegionIds NVARCHAR(2000) NULL;

IF COL_LENGTH('tucAutomationRule', 'AllToRegions') IS NULL
    ALTER TABLE tucAutomationRule ADD AllToRegions BIT NOT NULL DEFAULT 0;

IF COL_LENGTH('tucAutomationRule', 'ToRegionIds') IS NULL
    ALTER TABLE tucAutomationRule ADD ToRegionIds NVARCHAR(2000) NULL;

IF COL_LENGTH('tucAutomationRule', 'TimeThreshold') IS NULL
    ALTER TABLE tucAutomationRule ADD TimeThreshold INT NULL;
```

---

## Future: Condition-Level Filter Overrides

Condition-level filters aren't inherently wrong — there are legitimate use cases. For example:

- Condition 1: "Unassigned for 15 mins" filtered to **Express** jobs only
- Condition 2: "Status changes to Delayed" filtered to **all** jobs
- Match mode: **ANY** (either condition triggers the actions)

That's perfectly valid. The problem is only when match mode is **ALL** and two conditions have mutually exclusive filters — no job can satisfy both, so the rule silently does nothing.

**Plan:** Keep scope-level filters as the default (simple, covers 95% of use cases). In a future iteration, add optional condition-level filter overrides with **conflict detection guardrails**:

- If match mode is ALL and two conditions filter to mutually exclusive sites → show warning: *"These conditions can never match together"*
- If match mode is ALL and conditions filter to different priorities → show warning
- Visual indicator (amber/red) on conflicting condition rows
- Optionally block save with conflicts, or allow with explicit "I understand" acknowledgement

**Important:** Do NOT drop the condition-level filter columns from the database. They'll be needed when condition-level overrides are reintroduced with guardrails. The columns also maintain backward compatibility with the SP during shadow mode.

---

## SP Compatibility Note

The existing `sp_AutomationEngine` reads filter values from the condition rows. During the transition period where both engines run in parallel (shadow mode), the SP will continue reading from condition-level columns. That's fine — the old columns stay on the table until the SP is fully retired.

Once the SP is disabled and the .NET engine is confirmed stable, **do not drop the condition-level filter columns**. They will be reused when condition-level filter overrides are reintroduced with conflict detection guardrails (see section above).

---

## Where to Find the Updated Code

| What | Location |
|------|----------|
| Updated frontend (ScopeSelector, types, sampleData) | `Adminmanagerupdate/admin-ui/src/modules/automations/` |
| Updated C# backend (entities, DTOs, engine, controller, DbContext) | `Adminmanagerupdate/backend-src/` |
| Live frontend demo | https://deliver-different-testing.github.io/Adminmanagerupdate/ |
| This document | `Adminmanagerupdate/AutomationChanges.md` |

The `Adminmanagerupdate` repo now contains both the frontend (`admin-ui/`) and the backend (`backend-src/`).

---

## Your Call

You've already started building from the original `HANDOVER-GARRY.md` and I don't have visibility into where you're at. Options:

1. **Adopt the new structure now** — move filter fields from your condition entity/table to the rule entity/table, update your engine service to check filters in scope instead of per-condition. The updated C# code in `Adminmanagerupdate/backend-src/` shows the complete implementation.

2. **Keep building condition-level for now, migrate later** — finish what you're working on with the current architecture, then lift the filters to rule level before go-live. The SP uses condition-level filters anyway, so this stays compatible during shadow mode.

3. **Hybrid approach** — keep the condition-level columns in the DB for SP compatibility, but have the .NET engine read them from the rule level. The frontend already sends them at scope level.

Whatever works best for where you're at. The key thing is that **the frontend now sends all filters at scope level in the `Scope` object**, not on individual conditions. The backend needs to match that contract before the UI goes live.
