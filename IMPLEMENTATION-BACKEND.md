# Automation Engine — Implementation Guide

> **Handover document for developers.** Everything you need to get the automation engine running against the production TMS database.

---

## 1. Claude Code Steps (Run First)

```bash
# Clone and set up the frontend (React/Vite)
cd /path/to/workspace
git clone git@github.com:Deliver-Different-Testing/App-Configurator.git app-configurator
cd app-configurator
npm install

# Clone the backend (.NET 8)
cd /path/to/workspace
git clone -b feature/automation-engine-backend git@github.com:Deliver-Different-Testing/App-Configurator.git app-configurator-backend
cd app-configurator-backend/src/DfrntAutomation.Api
dotnet restore

# Run the migration against your database
sqlcmd -S <server> -d <database> -i ../../Migrations/001-automation-engine-tables.sql

# Configure connection string
# Edit appsettings.Development.json:
#   "ConnectionStrings": { "DefaultConnection": "Server=...;Database=...;..." }

# Configure frontend API base URL
# Create app-configurator/.env.local:
#   VITE_API_BASE_URL=https://localhost:5001/api

# Start backend
cd app-configurator-backend/src/DfrntAutomation.Api
dotnet run

# Start frontend
cd app-configurator
npm run dev
```

---

## 2. Feature Overview

The Automation Engine adds "if this, then that" rules to the TMS:

- **Conditions** — job unassigned, job assigned, status changes, time-based triggers (before/after/at scheduled pickup/delivery/flight time), barcode scan events
- **Actions** — update job status, create tasks, complete tasks, trigger notifications, send SMS, change status from→to
- **Scope** — rules can target all customers/speeds or specific subsets (referencing `tucClient.ucclID` and `tucJobType.ucjtID`)
- **Execution logging** — every evaluation is logged with duration, actions taken, and errors

---

## 3. Architecture: What's Built vs What Developer Needs to Do

### ✅ Built (Ready to Use)

| Component | Location | Notes |
|-----------|----------|-------|
| React UI — full CRUD | `app-configurator/src/modules/automations/` | AutomationsPage, cards, forms, conditions, actions, scope selector |
| API client + type mappers | `app-configurator/src/modules/automations/api.ts` | Typed fetch helpers, DTO↔frontend mappers |
| .NET API controllers | `DfrntAutomation.Api/Controllers/` | AutomationController, AutomationLogController, AppConfigController, WorkflowController |
| Entity models | `DfrntAutomation.Core/Entities/` | AutomationRule, AutomationCondition, AutomationAction, AutomationExecutionLog, ActionExecutionDetail, AppConfig |
| DTOs | `DfrntAutomation.Core/DTOs/` | Request/response models for all endpoints |
| Enums | `DfrntAutomation.Core/Enums/` | ActionType, ConditionType, JobTypeFilter, ScanType, etc. |
| Migration SQL | `Migrations/001-automation-engine-tables.sql` | Extends existing tables + creates new ones |

### 🔧 Developer Needs To Do

| Task | Details |
|------|---------|
| Wire `IAutomationRepository` | Implement EF Core repository reading from `AutomationRules`, `AutomationConditions`, `AutomationActions`, `AutomationExecutionLog` |
| Wire `IAutomationEngineService` | Implement the engine: evaluate conditions against `tucJob` data, execute actions (status updates, task creation via `tucEvent`, SMS via `tucManualMessage`) |
| Add EF Core DbContext mappings | Map entities to real table names (`AutomationRules`, `AutomationActions`, `AutomationConditions`, `AutomationExecutionLog`, `ActionExecutionDetail`, `AppConfig`) |
| Wire reference data endpoints | The frontend API stubs for customers/speeds/statuses/templates return `[]` — connect to existing TMS data (tucClient, tucJobType, tucJobStatus, tucEventTemplate) |
| Configure auth | Controllers use `[Authorize]` — configure JWT/cookie auth matching the existing TMS auth |
| Run migration | Execute `Migrations/001-automation-engine-tables.sql` against staging then production |
| Test dry-run mode | AppConfig `AutomationEngine.DryRunMode` defaults to `true` — actions log but don't execute |

---

## 4. Step-by-Step Checklist

### Step 1: Run the Database Migration

```bash
sqlcmd -S <server> -d <database> -i Migrations/001-automation-engine-tables.sql
```

This extends existing tables:
- `AutomationRules` — adds `IsDeleted`, `ConditionMatchMode`, `AllCustomers`, `CustomerIds`, `AllSpeeds`, `SpeedIds`
- `AutomationConditions` — adds `SortOrder`, `StatusConditionMode`, `StatusId`, `ScheduledTimeField`, `OffsetValue`, `OffsetUnit`, `ScanTypes`
- `AutomationActions` — adds `SortOrder`, `ToStatusId`, `FromStatusId`, `TaskTemplateId`, `TaskAssigneeId`, `TaskAssigneeGroupId`, `TaskDueOffsetMinutes`, `NotificationTemplateId`, `SmsRecipientType`, `SmsFixedNumber`, `SmsMessageContent`
- `AutomationExecutionLog` — adds `RuleName`, `ConditionsMet`, `TriggerType`, `TriggerDetail`, `ActionsExecuted`, `ActionsSummary`, `DurationMs`

And creates new tables:
- `ActionExecutionDetail` — per-action execution results
- `AppConfig` — feature flags and configuration

### Step 2: Implement `IAutomationRepository`

File: `src/DfrntAutomation.Infrastructure/Repositories/AutomationRepository.cs`

Key methods:
- `GetAllAsync()` — `SELECT * FROM AutomationRules WHERE IsDeleted = 0`, include `AutomationConditions` and `AutomationActions`
- `GetByIdAsync(id)` — single rule with includes
- `CreateAsync(rule)` — INSERT into `AutomationRules` + child conditions/actions
- `UpdateAsync(rule)` — UPDATE rule, DELETE+INSERT conditions/actions
- `SoftDeleteAsync(id)` — `UPDATE AutomationRules SET IsDeleted = 1 WHERE Id = @id`
- `ToggleActiveAsync(id)` — `UPDATE AutomationRules SET IsActive = ~IsActive WHERE Id = @id`
- `GetLogsAsync(...)` — query `AutomationExecutionLog` with filters

### Step 3: Implement `IAutomationEngineService`

Core logic in `EvaluateEventAsync(AutomationEvent)`:

1. Load active rules from `AutomationRules WHERE IsActive = 1 AND IsDeleted = 0`
2. Filter by scope (CustomerIds contains event.CustomerId, SpeedIds contains event.SpeedId)
3. Evaluate conditions against job data from `tucJob` (read via `ucjbID`)
4. If conditions met, execute actions:
   - **UpdateJobStatus / ChangeStatus** → `UPDATE tucJob SET ucjbStatus = @toStatusId WHERE ucjbID = @jobId`
   - **CreateTask** → `INSERT INTO tucEvent` with `ucevType` from `tucEventType.ucetID`, `ucevJobID` from `tucJob.ucjbID`
   - **TriggerNotification** → INSERT into `tucManualMessage` with `ucmmMessage`, `JobID`, `ucmmSendTo`
   - **SendSms** → INSERT into `tucManualMessage` with `SendToMobile` populated
5. Log everything to `AutomationExecutionLog` + `ActionExecutionDetail`

### Step 4: Add EF Core DbContext Configuration

```csharp
// In your DbContext.OnModelCreating:
modelBuilder.Entity<AutomationRule>().ToTable("AutomationRules");
modelBuilder.Entity<AutomationCondition>().ToTable("AutomationConditions");
modelBuilder.Entity<AutomationAction>().ToTable("AutomationActions");
modelBuilder.Entity<AutomationExecutionLog>().ToTable("AutomationExecutionLog");
modelBuilder.Entity<ActionExecutionDetail>().ToTable("ActionExecutionDetail");
modelBuilder.Entity<AppConfig>().ToTable("AppConfig");
```

### Step 5: Wire Reference Data Endpoints

The frontend `api.ts` has scaffolded stubs that return `[]`. Wire them to real TMS data:

| Frontend function | Data source | Key columns |
|---|---|---|
| `fetchCustomers()` | `tucClient` | `ucclID` → id, `ucclName` → name, `ucclCode` → shortName |
| `fetchSpeeds()` | `tucJobType` | `ucjtID` → id, `ucjtName` → name, `ucjtCode` → code |
| `fetchJobStatuses()` | `tucJobStatus` | `ucjsID` → id, `ucjsName` → name, `ucjsCode` → code |
| `fetchTaskTemplates()` | `tucEventTemplate` | `ucetID` → id, `ucetName` → name |
| `fetchNotificationTemplates()` | notification system | depends on implementation |

### Step 6: Enable in Production

1. Set `AppConfig.AutomationEngine.Enabled` = `true`
2. Set `AppConfig.AutomationEngine.DryRunMode` = `false` (after testing)
3. Hook `EvaluateEventAsync` into TMS event pipeline (status changes, scan events)

---

## 5. Database Tables

### Tables the Automation Engine Reads

| Table | PK | Purpose | Key Columns |
|-------|-----|---------|-------------|
| `tucJob` | `ucjbID` (int) | Job data for condition evaluation | `ucjbStatus` → tucJobStatus.ucjsID, `ucjbClientID` → tucClient.ucclID, `ucjbSpeed` (int), `ucjbCourierID` → tucCourier.uccrID, `ucjbDate`, `ucjbTime`, `PickUpTime` |
| `tucJobArchive` | `ucjbID` (int) | Archived jobs (same structure as tucJob) | Same columns as tucJob |
| `tucJobStatus` | `ucjsID` (int) | Status lookup | `ucjsName`, `ucjsCode` |
| `tucJobType` | `ucjtID` (int) | Speed/service level lookup | `ucjtName`, `ucjtCode` |
| `tucClient` | `ucclID` (int) | Customer lookup | `ucclName`, `ucclCode` |
| `tucEventType` | `ucetID` (int) | Event type for task creation | `ucetName`, `ucetGroup` |
| `tucEventTemplate` | `ucetID` (int) | Task templates | `ucetName`, `ucetDescription` |

### Tables the Automation Engine Writes

| Table | PK | Purpose | Key Columns Written |
|-------|-----|---------|---------------------|
| `AutomationRules` | `Id` (int) | Rule CRUD | `Name`, `Description`, `IsActive`, `IsDeleted`, `ConditionMatchMode`, `AllCustomers`, `CustomerIds`, `AllSpeeds`, `SpeedIds`, `CreatedBy`, `CreatedDate`, `ModifiedBy`, `ModifiedDate` |
| `AutomationConditions` | `Id` (int) | Rule conditions | `RuleId` → AutomationRules.Id, `ConditionType`, `SortOrder`, `JobTypeFilter`, `StatusConditionMode`, `StatusId`, `ScheduledTimeField`, `OffsetValue`, `OffsetUnit`, `ScanTypes` |
| `AutomationActions` | `Id` (int) | Rule actions | `RuleId` → AutomationRules.Id, `ActionType`, `SortOrder`, `ToStatusId`, `FromStatusId`, `TaskTemplateId`, etc. |
| `AutomationExecutionLog` | `Id` (int) | Execution history | `RuleId`, `JobId` → tucJob.ucjbID, `RuleName`, `ExecutedDate`, `ConditionsMet`, `TriggerType`, `ActionsExecuted`, `ErrorMessage`, `DurationMs` |
| `ActionExecutionDetail` | `Id` (bigint) | Per-action results | `ExecutionLogId` → AutomationExecutionLog.Id, `ActionType`, `Success`, `Detail`, `ErrorMessage`, `DurationMs` |
| `AppConfig` | `AppConfigId` (int) | Feature flags | `ConfigKey`, `ConfigValue` |
| `tucJob` | `ucjbID` (int) | Status updates | `ucjbStatus` (when UpdateJobStatus/ChangeStatus actions fire) |
| `tucEvent` | `ucevID` (int) | Task creation | `ucevType`, `ucevJobID`, `ucevClientID`, `ucevDate`, `ucevTime`, `ucevDescription`, `ucevNotes` |
| `tucManualMessage` | `ucmmID` (int) | Notifications/SMS | `ucmmMessage`, `ucmmDate`, `JobID`, `SendToEmailAddress`, `SendToMobile` |

### ⚠️ Important: tucJob is a VIEW in some environments

`tucJob` may be implemented as a VIEW over `tucJobArchive` + active jobs. Writing to it (e.g., status updates) may require writing to the underlying base table instead. Verify in your environment before enabling write actions.

---

## 6. Key Questions Answered

### "Can we reuse existing components?"

**Yes.** The React UI is fully built — AutomationsPage, AutomationCard, AutomationEditForm, ConditionRow, ActionRow, ScopeSelector. The .NET services (controllers, DTOs, entities, enums) are built. What's needed is the EF Core plumbing (`IAutomationRepository` implementation, `IAutomationEngineService` implementation, DbContext configuration).

### "What tables does this read/write?"

**Reads:** `tucJob` (ucjbID, ucjbStatus, ucjbClientID, ucjbSpeed, ucjbCourierID), `tucJobStatus` (ucjsID, ucjsName), `tucJobType` (ucjtID, ucjtName), `tucClient` (ucclID, ucclName, ucclCode), `tucEventType` (ucetID, ucetName), `tucEventTemplate` (ucetID, ucetName), `AutomationRules`, `AutomationConditions`, `AutomationActions`

**Writes:** `AutomationRules`, `AutomationConditions`, `AutomationActions`, `AutomationExecutionLog`, `ActionExecutionDetail`, `AppConfig`, `tucJob` (status updates), `tucEvent` (task creation), `tucManualMessage` (notifications/SMS)

### "Are there triggers/side effects?"

- **tucJob may be a VIEW** — in some environments `tucJob` is a view joining active and archive tables. Direct UPDATE may fail. Check if you need to update `tucJobArchive` or the base table instead.
- **tucEvent inserts** may trigger existing TMS event handlers/notifications. Understand the existing event pipeline before enabling CreateTask actions.
- **tucManualMessage inserts** may trigger email/SMS sending services. The automation engine should set `ucmmSent = 0` and let the existing send service pick it up.

---

## 7. API Endpoints Summary

| Method | Route | Purpose | Tables Read | Tables Written |
|--------|-------|---------|-------------|----------------|
| GET | `/api/automations` | List rules (filterable) | AutomationRules, AutomationConditions, AutomationActions | — |
| GET | `/api/automations/{id}` | Get single rule | AutomationRules, AutomationConditions, AutomationActions | — |
| POST | `/api/automations` | Create rule | — | AutomationRules, AutomationConditions, AutomationActions |
| PUT | `/api/automations/{id}` | Update rule | AutomationRules | AutomationRules, AutomationConditions, AutomationActions |
| DELETE | `/api/automations/{id}` | Soft-delete rule | AutomationRules | AutomationRules (IsDeleted=1) |
| POST | `/api/automations/{id}/toggle` | Toggle active | AutomationRules | AutomationRules (IsActive flip) |
| POST | `/api/automations/{id}/test?jobId=N` | Dry-run test | AutomationRules, tucJob | AutomationExecutionLog, ActionExecutionDetail |
| POST | `/api/automations/evaluate` | Trigger evaluation | AutomationRules, tucJob | AutomationExecutionLog, ActionExecutionDetail, tucJob, tucEvent, tucManualMessage |
| GET | `/api/automations/logs` | Query execution logs | AutomationExecutionLog, ActionExecutionDetail | — |
| GET | `/api/automations/logs/{id}` | Single log entry | AutomationExecutionLog, ActionExecutionDetail | — |
| GET | `/api/automations/{ruleId}/logs` | Logs for a rule | AutomationExecutionLog, ActionExecutionDetail | — |

---

## 8. Frontend Components

```
src/modules/automations/
├── AutomationsPage.tsx          # Main page: list, filter, CRUD orchestration
├── api.ts                       # API client: typed fetch helpers + DTO↔frontend mappers
├── types.ts                     # TypeScript types: AutomationRule, Condition, Action, etc.
├── index.ts                     # Module exports
└── components/
    ├── AutomationCard.tsx       # Collapsible card: summary view + expand to edit
    ├── AutomationEditForm.tsx   # Full edit form: name, description, scope, conditions, actions
    ├── ConditionRow.tsx         # Single condition editor (type selector + type-specific fields)
    ├── ActionRow.tsx            # Single action editor (type selector + type-specific fields)
    └── ScopeSelector.tsx        # Customer/speed multi-select scope picker
```

---

## 9. Entity ↔ Database Column Mapping

### Findings from validation against DB-SCHEMA.md

| Entity Property | DB Table.Column | Status |
|----------------|-----------------|--------|
| `AutomationRule.Id` | `AutomationRules.Id` | ✅ Match |
| `AutomationRule.Name` | `AutomationRules.Name` | ✅ Match |
| `AutomationRule.Description` | `AutomationRules.Description` | ✅ Match |
| `AutomationRule.IsActive` | `AutomationRules.IsActive` | ✅ Match |
| `AutomationRule.CreatedBy` | `AutomationRules.CreatedBy` | ✅ Fixed — was `int?`, now `string?` to match `nvarchar(100)` |
| `AutomationRule.CreatedDate` | `AutomationRules.CreatedDate` | ✅ Match |
| `AutomationRule.ModifiedBy` | `AutomationRules.ModifiedBy` | ✅ Fixed — was `int?`, now `string?` to match `nvarchar(100)` |
| `AutomationRule.ModifiedDate` | `AutomationRules.ModifiedDate` | ✅ Match |
| `AutomationRule.IsDeleted` | `AutomationRules.IsDeleted` | 🔧 New column (added by migration) |
| `AutomationRule.ConditionMatchMode` | `AutomationRules.ConditionMatchMode` | 🔧 New column (added by migration) |
| `AutomationRule.AllCustomers` | `AutomationRules.AllCustomers` | 🔧 New column (added by migration) |
| `AutomationRule.CustomerIds` | `AutomationRules.CustomerIds` | 🔧 New column — values reference `tucClient.ucclID` |
| `AutomationRule.AllSpeeds` | `AutomationRules.AllSpeeds` | 🔧 New column (added by migration) |
| `AutomationRule.SpeedIds` | `AutomationRules.SpeedIds` | 🔧 New column — values reference `tucJobType.ucjtID` |
| `AutomationExecutionLog.Id` | `AutomationExecutionLog.Id` | ⚠️ Entity uses `long`, DB is `int` — may need ALTER to BIGINT for high-volume logging |
| `AutomationExecutionLog.JobId` | `AutomationExecutionLog.JobId` | ✅ Match — references `tucJob.ucjbID` |
| `AutomationCondition.StatusId` | `AutomationConditions.StatusId` | 🔧 New column — references `tucJobStatus.ucjsID` |
| `AutomationAction.ToStatusId` | `AutomationActions.ToStatusId` | 🔧 New column — references `tucJobStatus.ucjsID` |
| `AutomationAction.TaskTemplateId` | `AutomationActions.TaskTemplateId` | 🔧 New column — references `tucEventTemplate.ucetID` |
| `AutomationAction.TaskAssigneeId` | `AutomationActions.TaskAssigneeId` | 🔧 New column — references `tucStaff.ucstID` |

---

## 10. Testing Checklist

### Staging

- [ ] Run migration `001-automation-engine-tables.sql` — verify no errors
- [ ] Verify `AutomationRules` table has new columns (`IsDeleted`, `ConditionMatchMode`, etc.)
- [ ] Start backend — verify `/api/automations` returns `200 []`
- [ ] Create a rule via the React UI — verify row appears in `AutomationRules`
- [ ] Edit the rule — verify conditions/actions persist correctly
- [ ] Delete the rule — verify `IsDeleted = 1` (not hard deleted)
- [ ] Test toggle active/inactive
- [ ] Test dry-run with a real job ID (`POST /api/automations/{id}/test?jobId=<real job>`)
- [ ] Verify execution logs appear in `AutomationExecutionLog`
- [ ] Test filters: by customer, by speed, by search text

### Production

- [ ] Run migration during maintenance window
- [ ] Set `AutomationEngine.DryRunMode = true` initially
- [ ] Create test rules and verify they log correctly without executing
- [ ] Monitor `AutomationExecutionLog` for unexpected evaluations
- [ ] Gradually switch `DryRunMode = false` for low-risk rules first
- [ ] Monitor `tucJob` status changes to ensure automation doesn't conflict with manual operations
