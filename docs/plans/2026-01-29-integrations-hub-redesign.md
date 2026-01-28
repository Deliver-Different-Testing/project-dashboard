# Integrations Hub Redesign

**Date:** 2026-01-29
**Status:** Approved
**Repos:**
- Frontend: `Adminmanagerupdate/admin-ui/src/modules/integrations-hub/`
- Backend: `Integrationtest/src/IntegrationManager.*/`

---

## Overview

Redesign the Integrations Hub to support multiple integration categories, add troubleshooting/logging capabilities, and streamline the carrier detail view tabs.

---

## 1. Dashboard Layout Changes

**New layout (top to bottom):**

1. **Stats Cards Row** (existing - keep)
2. **Troubleshooting & Logs Section** (NEW - replaces Getting Started)
3. **Integration Category Tabs** (NEW)
4. **Integration Tiles** (filtered by selected category tab)

### 1.1 Troubleshooting & Logs Section

Replaces the "Getting Started" progress section.

**Purpose:** Show recent integration API activity so admins can self-serve troubleshooting without asking developers to dig through server logs.

**Features:**
- Live/recent integration activity log
- Shows: timestamp, carrier/integration, endpoint, status (success/error), duration
- Filterable by: carrier, status, time range
- Click to expand: full request/response payload
- Paginated or virtualized for performance

**Backend Requirements (build in Integrationtest first):**
- New `IntegrationLog` table/model
- Middleware to capture outgoing API calls and responses
- `GET /api/v1/admin/integration-logs` endpoint with filtering/pagination
- Consider retention policy (e.g., 30 days)

### 1.2 Integration Category Tabs

**Tabs:**
| Tab | Integrations |
|-----|-------------|
| **Freight** | FedEx, UPS, USPS, DHL |
| **Financial** | QuickBooks, Xero (placeholder) |
| **Other** | Openforce (placeholder) |

**Behavior:**
- Horizontal tab bar using existing design language
- Cyan accent (#43C7F4) for active tab
- Selecting a tab filters the integration tiles below
- Financial & Other are placeholders - tiles render but detail views show "Coming Soon"

---

## 2. Integration Detail View - Tab Restructure

When clicking an integration tile, show the detail view with **6 tabs** (reduced from 8).

### 2.1 New Tab Order

| # | Tab | Status |
|---|-----|--------|
| 1 | **Setup Wizard** | Moved to first (was last) |
| 2 | **Accounts** | Keep - restore primary/secondary |
| 3 | **Service Mappings** | Keep as-is |
| 4 | **Tracking Mappings** | Keep |
| 5 | **Zone Mappings** | Keep as placeholder |
| 6 | **Rate Calculator** | Keep as-is |

### 2.2 Removed Tabs
- ~~Fuel Surcharges~~ (can exist elsewhere in app)
- ~~Contract Tiers~~ (not needed)

### 2.3 Accounts Tab - Primary/Secondary Support

**Restore functionality that was lost.** Backend already supports this via `ClientId` field.

**UI Structure:**
```
┌─────────────────────────────────────────────────┐
│ PRIMARY ACCOUNT                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Account: 1234567890                         │ │
│ │ Status: Active                    [Edit]    │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ SECONDARY ACCOUNTS          [+ Add Secondary]  │
│ ┌─────────────────────────────────────────────┐ │
│ │ Client      │ Account    │ Status │ Actions │ │
│ │ Acme Corp   │ 9876543210 │ Active │ Edit/Del│ │
│ │ Beta Inc    │ 5555555555 │ Active │ Edit/Del│ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Data mapping:**
- Primary Account: `CarrierIntegrationAccount` where `ClientId = null`
- Secondary Accounts: `CarrierIntegrationAccount` where `ClientId != null`

### 2.4 Tracking Mappings Tab

Maps carrier status codes to internal system statuses.

**Example mappings:**
| Carrier Code | Carrier Description | Internal Status |
|--------------|---------------------|-----------------|
| DL | Delivered | Delivered |
| IT | In Transit | In Transit |
| PU | Picked Up | Picked Up |
| EX | Exception | Exception |

**Backend Requirements (build in Integrationtest first):**
- New `TrackingStatusMapping` model
- CRUD API endpoints
- Used by tracking handlers to translate statuses

### 2.5 Zone Mappings Tab

**Status:** Placeholder for now. Keep the tab but show "Coming Soon" or basic placeholder UI.

### 2.6 Other Mappings (Future)

**Not building now, but keep in mind for future:**

A generic/configurable mapping system for fields beyond service/tracking:
- Mapping name (e.g., "Package Type", "Payment Terms")
- Source field (from carrier/integration API)
- Target field (internal system field)

**Placeholder:** Can add an "Other Mappings" section or tab as placeholder in UI.

---

## 3. Integration Tiles

### 3.1 Freight Integrations (Existing)
- FedEx
- UPS
- USPS
- DHL

### 3.2 Financial Integrations (New - Placeholder)
- QuickBooks
- Xero

**Tile design:** Same as freight tiles but with appropriate logos/icons. Clicking shows detail view with "Coming Soon" message.

### 3.3 Other Integrations (New - Placeholder)
- Openforce

---

## 4. Development Approach

### Phase 1: Backend (Integrationtest)
1. Add `IntegrationLog` model and migration
2. Add logging middleware for carrier API calls
3. Add `GET /api/v1/admin/integration-logs` endpoint
4. Add `TrackingStatusMapping` model if not exists
5. Add tracking mapping CRUD endpoints

### Phase 2: Frontend (Adminmanagerupdate)
1. Remove "Getting Started" section from dashboard
2. Add "Troubleshooting & Logs" component
3. Add integration category tabs (Freight/Financial/Other)
4. Add placeholder tiles for Financial and Other
5. Restructure carrier detail tabs (reorder, remove 2)
6. Restore primary/secondary accounts in Accounts tab
7. Add "Other Mappings" placeholder

### Phase 3: Integration
1. Connect Troubleshooting & Logs to real API
2. Connect Tracking Mappings to real API
3. Ensure all components follow backend API patterns

---

## 5. File Changes Summary

### Adminmanagerupdate (Frontend)

**Modify:**
- `IntegrationsHubPage.tsx` - Dashboard layout, category tabs, remove Getting Started
- `components/CarrierAccountsTab.tsx` - Add primary/secondary sections

**Add:**
- `components/TroubleshootingLogs.tsx` - New logs component
- `components/IntegrationCategoryTabs.tsx` - Category tab bar
- `data/financialIntegrations.ts` - QuickBooks, Xero placeholder data
- `data/otherIntegrations.ts` - Openforce placeholder data

**Remove/Deprecate:**
- `components/FuelSurchargesTab.tsx` - Remove from carrier detail
- `components/ContractTiersTab.tsx` - Remove from carrier detail

### Integrationtest (Backend)

**Add:**
- `Models/IntegrationLog.cs` - Log entry model
- `Models/TrackingStatusMapping.cs` - Status mapping model (if not exists)
- `Middleware/IntegrationLoggingMiddleware.cs` - Capture API calls
- `Controllers/Admin/IntegrationLogsController.cs` - Logs API
- `Controllers/Admin/TrackingMappingsController.cs` - Mappings API

---

## 6. Design Tokens

Using existing design system:
- Dark sidebar: `#14152D`
- Cyan accent: `#43C7F4`
- Purple secondary: `#606DB4`
- Tab active state: Cyan accent with underline
- Cards: Existing card component styles

---

## 7. Open Questions

1. **Log retention:** How long to keep integration logs? (Suggest 30 days)
2. **Financial integrations:** Any specific fields needed for QuickBooks/Xero placeholders?
3. **Openforce:** What category of integration is this? (Contractor management?)

---

## Approved By

Design approved via brainstorming session on 2026-01-29.
