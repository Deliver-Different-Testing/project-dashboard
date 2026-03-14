# Automation Engine — Handover for Garry

> Single consolidated document covering both frontend and backend. Read this first, then dive into `IMPLEMENTATION.md` and `HANDOVER.md` for deep details.

---

## 1. Quick Start

### Clone Both Repos

```bash
# Frontend (React/Vite — GitHub Pages)
git clone https://github.com/Deliver-Different-Testing/App-Configurator.git app-configurator
cd app-configurator
npm install
npm run dev
# Runs on http://localhost:5173

# Backend (.NET 8)
cd ..
git clone -b feature/automation-engine-backend https://github.com/Deliver-Different-Testing/App-Configurator.git app-configurator-backend
cd app-configurator-backend
dotnet restore
dotnet build

# Configure connection string in src/DfrntAutomation.Api/appsettings.json or appsettings.Development.json:
#   "ConnectionStrings": { "DefaultConnection": "Server=...;Database=...;Trusted_Connection=true;..." }

# Run backend
dotnet run --project src/DfrntAutomation.Api
# Swagger UI: https://localhost:5001/swagger

# Point frontend at backend — create app-configurator/.env.local:
#   VITE_API_BASE_URL=https://localhost:5001/api
```

### Run Database Migrations (in order)

```bash
# Against the TMS database — all use IF NOT EXISTS guards, safe to re-run
sqlcmd -S <server> -d <database> -i Migrations/001-automation-engine-tables.sql
sqlcmd -S <server> -d <database> -i src/DfrntAutomation.Infrastructure/Migrations/001-create-automation-execution-log.sql
sqlcmd -S <server> -d <database> -i src/DfrntAutomation.Infrastructure/Migrations/002-create-app-config.sql
sqlcmd -S <server> -d <database> -i src/DfrntAutomation.Infrastructure/Migrations/003-extend-automation-tables.sql
sqlcmd -S <server> -d <database> -i src/DfrntAutomation.Infrastructure/Migrations/004-extend-event-template.sql
sqlcmd -S <server> -d <database> -i src/DfrntAutomation.Infrastructure/Migrations/005-seed-app-config.sql
```

---

## 2. Architecture Overview

```
┌──────────────────────────┐         ┌─────────────────────────────────┐
│  Frontend (React/Vite)   │  HTTP   │  Backend (.NET 8 Web API)       │
│  GitHub Pages            │────────▶│  DfrntAutomation.Api            │
│                          │         │                                 │
│  src/modules/automations/│         │  Controllers:                   │
│  ├─ AutomationsPage.tsx  │         │  ├─ AutomationController        │
│  ├─ api.ts (typed client)│         │  ├─ AutomationLogController     │
│  ├─ types.ts             │         │  ├─ AppConfigController          │
│  └─ components/          │         │  └─ WorkflowController          │
│     ├─ AutomationCard    │         │                                 │
│     ├─ AutomationEditForm│         │  Services:                      │
│     ├─ ConditionRow      │         │  ├─ AutomationEngineService     │
│     ├─ ActionRow         │         │  ├─ AutomationTimerService (5m) │
│     └─ ScopeSelector     │         │  ├─ EventService, TaskService   │
│                          │         │  ├─ SmsService, PlaceholderResolver│
│                          │         │  └─ AppConfigService            │
└──────────────────────────┘         └──────────┬──────────────────────┘
                                                │
                                     ┌──────────▼──────────────┐
                                     │   SQL Server (TMS DB)    │
                                     │                          │
                                     │  Existing: tucJob,       │
                                     │  tucClient, tucJobStatus,│
                                     │  tucJobType, tucEvent,   │
                                     │  tucEventType,           │
                                     │  tucManualMessage         │
                                     │                          │
                                     │  New: AutomationRules,   │
                                     │  AutomationConditions,   │
                                     │  AutomationActions,      │
                                     │  AutomationExecutionLog, │
                                     │  ActionExecutionDetail,  │
                                     │  AppConfig               │
                                     └──────────────────────────┘
```

**Two evaluation paths:**
1. **Event-driven** — `POST /api/automations/evaluate` called by TMS when status changes or scan events occur
2. **Time-based** — `AutomationTimerService` polls every 5 minutes, checking time-based conditions (before/after/at scheduled pickup/delivery/flight)

**This replaces** the `sp_AutomationEngine` stored procedure. See `HANDOVER.md` for shadow mode and cutover steps.

---

## 3. What's Done vs What Needs Doing

| Area | Status | Detail |
|------|--------|--------|
| React UI — full CRUD | ✅ Done | AutomationsPage, cards, forms, conditions, actions, scope selector |
| TypeScript types | ✅ Done | Complete discriminated union types for all condition/action variants |
| API client (`api.ts`) | ✅ Done | Typed fetch helpers, DTO↔frontend mappers, error handling |
| .NET Controllers | ✅ Done | All 4 controllers with full CRUD + evaluate + logs |
| Entity models | ✅ Done | All entities with proper relationships |
| DTOs | ✅ Done | Request/response models |
| Enums | ✅ Done | ActionType, ConditionType, JobTypeFilter, ScanType, etc. |
| Repository (`AutomationRepository`) | ✅ Done | EF Core implementation |
| Engine service | ✅ Done | Condition evaluation + action execution |
| Timer service | ✅ Done | 5-min background poll for time-based rules |
| SMS / Email / Task services | ✅ Done | Scaffolded with real implementations |
| Migration SQL | ✅ Done | 6 migration files with IF NOT EXISTS guards |
| Shadow mode | ✅ Done | Ships ON by default — logs everything, executes nothing |
| DbContext + mappings | ✅ Done | `AutomationDbContext` |
| **Reference data endpoints** | ⚠️ Stub | `fetchCustomers()`, `fetchSpeeds()`, etc. return `[]` — need wiring to real TMS |
| **Auth configuration** | 🔧 TODO | Controllers use `[Authorize]` — needs JWT/cookie config matching TMS |
| **Frontend↔Backend integration test** | 🔧 TODO | Not yet tested end-to-end with real data |

---

## 4. Frontend State

### Module Structure

```
app-configurator/src/modules/automations/
├── AutomationsPage.tsx          # Main page — list, filter, CRUD orchestration
├── api.ts                       # API client with typed fetch + DTO mappers
├── types.ts                     # All TypeScript types (discriminated unions)
├── index.ts                     # Re-exports everything
└── components/
    ├── AutomationCard.tsx       # Collapsible card with summary + expand-to-edit
    ├── AutomationEditForm.tsx   # Full editor: name, description, scope, conditions, actions
    ├── ConditionRow.tsx         # Condition editor (7 condition types)
    ├── ActionRow.tsx            # Action editor (6 action types)
    └── ScopeSelector.tsx        # Customer/speed multi-select scope picker
```

### API Wiring Status

**AutomationsPage is fully wired to `api.ts`** — no mock data files, no sample data. The page:
- Calls `fetchAutomations()` on mount via the `useAutomationsData()` hook
- Maps API DTOs to frontend types via `apiRuleToFrontend()` / `frontendRuleToApi()`
- Has loading spinner, error state with retry, and empty state
- CRUD operations call `createAutomation()`, `updateAutomation()`, `deleteAutomationApi()`, `toggleAutomation()`

**However:** The reference data functions (`fetchCustomers()`, `fetchSpeeds()`, `fetchJobStatuses()`, `fetchTaskTemplates()`, `fetchNotificationTemplates()`) currently return empty arrays `[]`. This means:
- Customer/Speed filter dropdowns will be empty
- Status dropdowns in condition/action editors will be empty
- Task template dropdowns will be empty

These need wiring to real TMS endpoints — see Section 6.

### TypeScript Build

`npx tsc --noEmit` passes clean with zero errors.

---

## 5. Backend State

### Solution Structure

```
DfrntAutomation.sln
├── DfrntAutomation.Api/              # ASP.NET Web API
│   ├── Controllers/
│   │   ├── AutomationController.cs   # CRUD + toggle + test + evaluate
│   │   ├── AutomationLogController.cs # Execution log queries
│   │   ├── AppConfigController.cs     # Feature flag CRUD
│   │   └── WorkflowController.cs      # Workflow resolution
│   ├── Middleware/
│   │   └── TenantMiddleware.cs        # Multi-tenant support
│   └── Program.cs                     # DI registration + pipeline
│
├── DfrntAutomation.Core/             # Domain layer (no dependencies)
│   ├── Entities/                      # AutomationRule, Condition, Action, ExecutionLog, AppConfig
│   ├── DTOs/                          # API request/response models
│   ├── Enums/                         # ActionType, ConditionType, ScanType, etc.
│   └── Interfaces/                    # IAutomationRepository, IAutomationEngineService, etc.
│
└── DfrntAutomation.Infrastructure/   # Data + Services
    ├── Data/
    │   ├── AutomationDbContext.cs     # EF Core context with table mappings
    │   └── AutomationDbContextFactory.cs
    ├── Repositories/
    │   └── AutomationRepository.cs   # Full EF Core implementation
    ├── Services/
    │   ├── AutomationEngineService.cs # Core engine: evaluate + execute
    │   ├── AutomationTimerService.cs  # 5-min background hosted service
    │   ├── AppConfigService.cs        # Feature flag reads from AppConfig table
    │   ├── EventService.cs            # tucEvent operations
    │   ├── TaskService.cs             # Task creation
    │   ├── SmsService.cs              # SMS sending
    │   ├── MailtrapEmailService.cs    # Email via Mailtrap
    │   ├── PlaceholderResolver.cs     # Template variable resolution
    │   └── WorkflowResolutionService.cs
    └── Migrations/
        ├── 001-create-automation-execution-log.sql
        ├── 002-create-app-config.sql
        ├── 003-extend-automation-tables.sql
        ├── 004-extend-event-template.sql
        └── 005-seed-app-config.sql
```

### What the Migrations Create

**New tables:** `AutomationExecutionLog`, `ActionExecutionDetail`, `AppConfig`

**Extended existing tables:** `AutomationRules` (added IsDeleted, ConditionMatchMode, scope columns), `AutomationConditions` (added SortOrder, StatusConditionMode, scheduling fields, ScanTypes), `AutomationActions` (added SortOrder, all action-specific columns)

All migrations use `IF NOT EXISTS` — safe to re-run.

---

## 6. Reference Data TODO

These functions in `app-configurator/src/modules/automations/api.ts` return empty arrays and need wiring to real TMS endpoints:

| Function | TMS Table | Key Columns | Notes |
|----------|-----------|-------------|-------|
| `fetchCustomers()` | `tucClient` | `ucclID` → id, `ucclName` → name, `ucclCode` → shortName | Populates customer scope selector + filter |
| `fetchSpeeds()` | `tucJobType` | `ucjtID` → id, `ucjtName` → name, `ucjtCode` → code | Populates speed scope selector + filter |
| `fetchJobStatuses()` | `tucJobStatus` | `ucjsID` → id, `ucjsName` → name, `ucjsCode` → code | Used in status conditions + status change actions |
| `fetchTaskTemplates()` | `tucEventTemplate` | `ucetID` → id, `ucetName` → name | Used in create task / complete task actions |
| `fetchNotificationTemplates()` | notification system | TBD | Used in trigger notification action |

**Two ways to wire these:**
1. **Add endpoints to the .NET backend** that query these TMS tables and return JSON
2. **Point the frontend directly** at existing TMS API endpoints if they already exist

Each function has a JSDoc comment explaining the intended data source.

---

## 7. Key Context

### Replaces sp_AutomationEngine
This .NET engine replaces the existing SQL stored procedure `sp_AutomationEngine`. The `HANDOVER.md` file has detailed shadow mode and cutover steps — run both in parallel, compare logs, then disable the SP.

### Two Evaluation Paths
- **Event-driven:** `POST /api/automations/evaluate` — called by TMS on status changes, scan events
- **Time-based:** `AutomationTimerService` polls every 5 minutes for time-based conditions (before/after/at scheduled time)

### Existing TMS Tables Used
- **`tucEvent` / `tucEventType`** — for task creation actions
- **`tucManualMessage`** — for notification and SMS actions
- **`tucJob`** — condition evaluation + status updates (⚠️ may be a VIEW in some environments)

### Only New Tables
- **`AutomationExecutionLog`** — every evaluation logged
- **`ActionExecutionDetail`** — per-action results
- **`AppConfig`** — feature flags (shadow mode, engine enabled, etc.)

### Reference Data Returns Empty
The frontend API stubs for customers, speeds, statuses, templates return `[]`. The UI will render but dropdowns will be empty until these are wired to real TMS data. **This is not a bug** — it's intentional scaffolding documented with JSDoc.

### App Configurator UI Auto-Generates configJson
The App Configurator UI generates `configJson` for rules automatically from the form state. You can't inject custom properties into `configJson` without building new UI components for them.

### Garry's Hardcoded Label Matching Workaround
In DFRNT Drive, Garry used hardcoded label matching as a workaround for automation logic. This engine replaces that pattern with proper rule configuration.

---

## 8. Deployment

### Frontend
- Hosted on **GitHub Pages** from the `master` branch
- Build: `npm run build` → outputs to `dist/`
- The `VITE_API_BASE_URL` env var must point to the production backend URL

### Backend
- .NET 8 Web API — deploy as IIS site, Azure App Service, or standalone
- Needs SQL Server connection string to TMS database
- See `HANDOVER.md` for environment variables (JWT, Mailtrap, SMS provider)
- Shadow mode ships ON — no actions execute until you flip the config

---

## 9. Testing Checklist

### Build Verification
- [ ] `cd app-configurator && npm install && npx tsc --noEmit` — zero errors
- [ ] `cd app-configurator-backend && dotnet build` — zero errors

### Database
- [ ] Run all 6 migration SQL files against staging — verify no errors
- [ ] Verify `AutomationRules` table has new columns (IsDeleted, ConditionMatchMode, scope columns)
- [ ] Verify `AppConfig` table exists with seed data (shadow mode = true)

### Backend API
- [ ] Start backend → Swagger UI loads at `/swagger`
- [ ] `GET /api/automations` returns `200 []`
- [ ] Create a rule via POST → verify row in `AutomationRules`
- [ ] Update, toggle, delete the rule
- [ ] `GET /api/automations/logs` returns `200`

### Frontend UI
- [ ] Start frontend → Automations page loads with spinner then empty state
- [ ] Click "New Automation" → form appears
- [ ] Fill in name, add a condition, add an action → Save
- [ ] Card appears in list → expand → edit → save
- [ ] Delete → card removed
- [ ] Filters work (even though dropdowns are empty without reference data)

### Integration
- [ ] Test dry-run: `POST /api/automations/{id}/test?jobId=<real job ID>`
- [ ] Verify execution log appears in `AutomationExecutionLog`
- [ ] Shadow mode: trigger `POST /api/automations/evaluate` → verify log but no action execution

### Shadow Mode → Live
- [ ] Run in shadow mode for 1-2 weeks, compare logs against SP output
- [ ] Flip `Automation.DotNetEngine.ShadowMode` to `false`
- [ ] Run both engines in parallel for 1 week
- [ ] Disable SP: `Automation.StoredProcedure.Enabled = false`

---

## 10. Key Files Reference

| File | What It Does |
|------|-------------|
| `app-configurator/src/modules/automations/api.ts` | All API calls + DTO mappers — **start here for frontend** |
| `app-configurator/src/modules/automations/types.ts` | All TypeScript types |
| `app-configurator-backend/IMPLEMENTATION.md` | Deep implementation guide with SQL, C# signatures, table mappings |
| `app-configurator-backend/HANDOVER.md` | Shadow mode, cutover steps, integration options |
| `app-configurator-backend/src/DfrntAutomation.Infrastructure/Services/AutomationEngineService.cs` | Core evaluation logic — **start here for backend** |
| `app-configurator-backend/Migrations/001-automation-engine-tables.sql` | Main migration extending existing tables |
