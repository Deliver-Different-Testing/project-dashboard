# Automation Engine — Advanced Filters Update

**Date:** 12 March 2026  
**For:** Garry Fraser  
**Branch:** `feature/automation-engine-backend`

---

## Summary

Six advanced filter fields have been added to the Automation Engine condition evaluation. These match the filters available in the staging Admin Manager UI and the `sp_AutomationEngine` stored procedure.

The filters were already present on the **Entity**, **DTO**, **DbContext**, and **Controller** layers (committed previously). This update adds the **execution logic** — the engine now evaluates these filters when processing rules.

---

## What Changed

### 1. `AutomationEvent.cs` (Core/DTOs)

Added 7 new properties so the trigger event carries the job context needed for filter matching:

| Property | Type | Source (tucJob column) |
|---|---|---|
| `PriorityId` | `int?` | `ucjbSpeedID` |
| `FromSiteId` | `int?` | `ucjbFromSiteID` → `tucSite` |
| `ToSiteId` | `int?` | `ucjbToSiteID` → `tucSite` |
| `FromRegionId` | `int?` | `tucSite.SiteRegionID` → `tucRegion` |
| `ToRegionId` | `int?` | `tucSite.SiteRegionID` → `tucRegion` |
| `JobType` | `string?` | Job type string for `JobTypeFilter` matching |
| `MinutesInState` | `int?` | Calculated: minutes since job entered current state |

**Action for Garry:** When raising an `AutomationEvent` from the TMS webhook or timer poll, populate these fields from `tucJob` and its related `tucSite` records. Example:

```csharp
var evt = new AutomationEvent
{
    TriggerType = "StatusChange",
    JobId = job.ucjbID,
    CustomerId = job.ucjbClientID,
    SpeedId = job.ucjbSpeedID,
    NewStatusId = job.ucjbStatusID,
    OldStatusId = previousStatusId,
    // NEW — populate from job + site lookups
    PriorityId = job.ucjbSpeedID,
    FromSiteId = job.ucjbFromSiteID,
    ToSiteId = job.ucjbToSiteID,
    FromRegionId = fromSite?.SiteRegionID,
    ToRegionId = toSite?.SiteRegionID,
    MinutesInState = (int)(DateTime.UtcNow - job.LastStatusChangeUtc).TotalMinutes
};
```

### 2. `AutomationEngineService.cs` (Infrastructure/Services)

Added two new methods:

#### `PassesAdvancedFilters(condition, evt)` → `bool`
Called at the **top** of `EvaluateCondition()` — if any filter fails, the condition fails immediately (short-circuit). Checks all 6 filters:

| Filter | Logic | SP Equivalent |
|---|---|---|
| `PriorityFilter` | `"ALL"` passes everything; otherwise CSV match against `evt.PriorityId` | `CHARINDEX` on `PriorityFilter` column |
| `FromSiteFilter` | CSV match `evt.FromSiteId` against comma-separated IDs | `CHARINDEX` on `FromSiteFilter` |
| `ToSiteFilter` | CSV match `evt.ToSiteId` | `CHARINDEX` on `ToSiteFilter` |
| `FromRegionFilter` | CSV match `evt.FromRegionId` | Column exists in DB but SP doesn't use it yet |
| `ToRegionFilter` | CSV match `evt.ToRegionId` | Column exists in DB but SP doesn't use it yet |
| `TimeThreshold` | `evt.MinutesInState >= condition.TimeThreshold` | SP uses `DATEDIFF(MINUTE, ...)` |

**Note:** `FromRegionFilter` and `ToRegionFilter` columns exist in the `AutomationConditions` table but the stored procedure doesn't use them yet. Our C# engine **does** — this is a feature improvement over the SP.

#### `CsvContains(csv, value)` → `bool`
Helper that splits a comma-separated string and checks membership. Matches the SP's `CHARINDEX(','+ @value + ',', ',' + @filter + ',') > 0` pattern but using proper string splitting.

### 3. Existing layers (no changes needed)

These were already committed and are confirmed correct:

| Layer | File | Status |
|---|---|---|
| **Entity** | `AutomationCondition.cs` | ✅ All 6 properties with XML docs |
| **DTO** | `AutomationConditionDto.cs` | ✅ All 6 properties |
| **DbContext** | `AutomationDbContext.cs` | ✅ Column mappings with max lengths |
| **Controller** | `AutomationController.cs` | ✅ Read + write mapping in GET/POST/PUT |

---

## Database

No new migration needed — the columns already exist in the `AutomationConditions` table (they were part of the original schema from the stored procedure era). The existing EF mappings handle them.

If starting from a fresh database, the columns are created by the DbContext configuration:

```sql
-- Already exists in production DB
ALTER TABLE AutomationConditions ADD PriorityFilter NVARCHAR(50) DEFAULT 'ALL';
ALTER TABLE AutomationConditions ADD FromSiteFilter NVARCHAR(2000) NULL;
ALTER TABLE AutomationConditions ADD ToSiteFilter NVARCHAR(2000) NULL;
ALTER TABLE AutomationConditions ADD FromRegionFilter NVARCHAR(2000) NULL;
ALTER TABLE AutomationConditions ADD ToRegionFilter NVARCHAR(2000) NULL;
ALTER TABLE AutomationConditions ADD TimeThreshold INT NULL;
```

---

## Frontend

The React frontend (App-Configurator repo, `feature/inline-filters` branch) already has full UI for these 6 filters:

- **Priority:** Dropdown (All Priorities / specific speed)
- **From/To Site:** Multi-select pill chips (Auckland CBD, East Tamaki, Penrose, etc.)
- **From/To Region:** Multi-select pill chips (Auckland, Waikato, Bay of Plenty, etc.)
- **Time Threshold:** Numeric input (minutes before triggering)

All displayed in a collapsible "Advanced Filters" section on each condition row.

**Live demo:** https://deliver-different-testing.github.io/App-Configurator/

---

## Testing Checklist

- [ ] Create a rule with `PriorityFilter = "1,3"` → verify only jobs with SpeedID 1 or 3 trigger
- [ ] Create a rule with `FromSiteFilter = "5,12"` → verify only jobs from site 5 or 12 trigger
- [ ] Create a rule with `TimeThreshold = 15` → verify job must be unassigned for 15+ minutes
- [ ] Create a rule with no filters set → verify it triggers for all jobs (backward compatible)
- [ ] Create a rule with `FromRegionFilter = "2"` → verify region filtering works (new vs SP)
- [ ] Verify existing rules without filters still work unchanged

---

## Files Changed

```
src/DfrntAutomation.Core/DTOs/AutomationEvent.cs          — 7 new properties
src/DfrntAutomation.Infrastructure/Services/AutomationEngineService.cs — PassesAdvancedFilters() + CsvContains()
FiltersUpdate.md                                           — this document
```
