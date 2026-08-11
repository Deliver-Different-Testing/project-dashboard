# Shopify → Integrations Hub Upgrade — Jacob Implementation MD

## Claude Code Steps

```bash
cd /data/.openclaw/workspace/project-dashboard

git pull github master

cd /data/.openclaw/workspace/integration-manager

cd src/IntegrationManager.AdminPortal
npm install
npm run build
```

## 1. Goal

Move the legacy Shopify integration into the **latest Integration Manager Integrations Hub** in a way that matches the real current codebase.

This is **not** just a matter of adding a Shopify card.

The old Shopify implementation spans:

- embedded Shopify app auth/install flow
- shop-level settings persisted in SQL
- checkout rating logic
- order webhook/polling ingestion
- auto-fulfilment background jobs
- theme/widget installation
- rate/window/package-size CRUD

So the job is to migrate a **full integration product surface** into the new hub, not just a carrier definition.

---

## 2. Source Repos You Need To Read First

### Legacy Shopify repos in GitLab

- `gitlab-source/shopifyapp/`
- `gitlab-source/shopifyservice/`

### Older shared Despatch/API seam still relevant

- `gitlab-source/api/Models/ShopifyShop.cs`
- `gitlab-source/api/Models/DespatchContext.cs`
- `gitlab-source/api/Models/TblBulkJob.cs`
- `gitlab-source/api/Models/TucClientContact.cs`
- `gitlab-source/api/Models/Repository/JobRepository.cs`
- `gitlab-source/despatchweb/Enums/JobSource.cs`

### Latest Integration Hub code you are upgrading into

- `integration-manager/src/IntegrationManager.AdminPortal/src/pages/IntegrationsHub.tsx`
- `integration-manager/src/IntegrationManager.AdminPortal/src/pages/IntegrationDetail.tsx`
- `integration-manager/src/IntegrationManager.AdminPortal/src/hooks/useIntegrations.ts`
- `integration-manager/src/IntegrationManager.AdminPortal/src/constants/integrationTabs.ts`
- `integration-manager/src/IntegrationManager.Api/Controllers/Admin/IntegrationDefinitionsController.cs`
- `integration-manager/src/IntegrationManager.Core/Models/CarrierIntegrationType.cs`

---

## 3. What Exists In Legacy Shopify Today

## 3.1 API surface

Legacy Shopify app controllers:

- `shopifyapp/Shopify.App/Api/Controllers/AuthController.cs`
- `shopifyapp/Shopify.App/Api/Controllers/OrdersController.cs`
- `shopifyapp/Shopify.App/Api/Controllers/RatesController.cs`
- `shopifyapp/Shopify.App/Api/Controllers/SettingsController.cs`

These cover:

- app install callback / uninstall webhook / login
- order-created webhook processing
- checkout rate response
- delivery + widget settings CRUD

## 3.2 Core services

Main business logic lives in:

- `shopifyapp/Shopify.Core/Application/Services/ShopService.cs`
- `shopifyapp/Shopify.Core/Application/Services/RateService.cs`
- `shopifyapp/Shopify.Core/Application/Services/SettingsService.cs`
- `shopifyapp/Shopify.Core/Application/Services/OrderService.cs`
- `shopifyapp/Shopify.Core/Application/Services/ThemeService.cs`

Important confirmed behaviours:

- `ShopService.InstallCallbackAsync(...)` creates or reactivates `ShopifyShop`, stores `AccessToken`, registers carrier service + webhooks, seeds default package/rate/window records.
- `RateService` owns shop rate CRUD and Shopify checkout-rate responses.
- `SettingsService` owns delivery settings, widget delivery settings, widget pickup settings, translations, address mode, instructions, and tax/signature/reference settings.
- `OrderService` handles webhook processing plus polling/auto-fulfil pipelines.
- `ThemeService` installs Liquid snippets/assets and renders the storefront widget script.

## 3.3 Background service

Worker repo:

- `shopifyservice/Shopify.Service/Program.cs`
- `shopifyservice/Shopify.Service/Jobs/OrderJob.cs`
- `shopifyservice/Shopify.Service/Jobs/AutoFulfullmentJob.cs`

Confirmed schedules:

- order polling: every minute
- auto fulfilment: hourly

This means the migration is **not complete** if the hub only recreates admin UI.

## 3.4 Persisted data model

Confirmed core table/entity:

- `shopifyapp/Shopify.Core/Domain/Despatch/ShopifyShop.cs`

This is not just credentials. It stores, among other things:

- `AccessToken`
- `Scope`
- `VersionInstalled`
- `Alias`
- polling settings (`PollingStartDate`, `PollingEndDate`, `PollingSortOrder`, `PollingOrderStatus`, `PollingSinceId`, `PollingDelay`, `PollingIgnoreAfter`)
- fulfilment mode (`AutoFulfillMode`)
- operational mappings (`DeliveryInstructionAttributes`, `ClientRefA`, `ClientRefB`, `OurRef`)
- flags (`SignatureRequired`, `IncludeTax`)
- widget delivery config + translations
- widget pickup config + translations

Related config/data entities also exist off the same shop:

- `ShopPackageSize`
- `ShopRate`
- `ShopWindowGroup`
- `ShopifyThemeInstallCart`
- `TblBulkJob`
- `TucJob`

---

## 4. Legacy Merchant UI Surface To Preserve

Legacy embedded app routes are declared in:

- `shopifyapp/Shopify.App/ClientApp/src/App.js`

Confirmed page surface:

- `PageHome`
- `PagePackageSizes` / `PagePackageSize`
- `PageRates` / `PageRate`
- `PageWindows` / `PageWindowsGroup`
- `PageSettings`
- `PageSettingsDelivery`
- `PageSettingsThemes`
- `PageSettingsWidget`
- `PageSettingsWidgetDelivery`
- `PageSettingsWidgetPickup`

That is the minimum functional admin surface you should map into the new hub.

---

## 5. What The Latest Integrations Hub Currently Assumes

## 5.1 Definitions are carrier-type driven

`IntegrationDefinitionsController.cs` currently builds definitions from `ICarrierServiceMappingService.GetCarrierTypesAsync(...)`.

So right now the hub treats the integration catalog as a projection of `CarrierIntegrationType` rows.

## 5.2 Detail UX is carrier-first

`IntegrationDetail.tsx` currently does this:

- if `!isCarrier(integration.id)` → show a generic **Coming Soon** card
- otherwise show carrier tabs:
  - setup
  - accounts
  - service mappings
  - tracking mappings
  - webhooks

## 5.3 `isCarrier(...)` is not actually carrier-safe

In `useIntegrations.ts`, `isCarrier` currently returns true for any definition whose code matches and whose status is `active`.

That means if you simply seed Shopify as an active definition, the detail page will incorrectly treat it like a carrier and dump the user into carrier tabs that do not match Shopify.

This needs fixing before Shopify can be integrated cleanly.

---

## 6. Key Design Decision

## Recommendation: **do not** force Shopify into the existing `CarrierIntegrationType` + `CarrierIntegrationAccount` model.

Why:

1. Shopify is not a carrier account setup problem.
2. Shopify has shop-specific operational configuration far beyond account number + mappings.
3. Shopify needs merchant install/auth, widget/theme management, and background processing.
4. The current carrier tabs (`Accounts`, `Service Mappings`, `Tracking Mappings`, `Webhooks`) are only a partial fit.

### Better direction

Introduce a **first-class integration definition model** for the hub, with explicit integration kind / supported tabs, then hang Shopify-specific APIs + UI off that.

At minimum, the latest code needs a concept like:

```csharp
IntegrationKind = Carrier | Commerce | Financial | Partner | Other
```

and the frontend needs something richer than `isCarrier()` based on `status`.

---

## 7. Recommended Target Shape

## 7.1 Backend catalog

Replace or extend the current definition source so the hub can return entries like Shopify without pretending they are carrier types.

Recommended DTO expansion from current `IntegrationDefinitionDto`:

```csharp
public sealed class IntegrationDefinitionDto
{
    public int? Id { get; set; }
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string Category { get; set; } = "other";
    public string Status { get; set; } = "active";
    public string? BrandColor { get; set; }

    // new
    public string Kind { get; set; } = "carrier";      // carrier | commerce | financial | partner | other
    public string[] Tabs { get; set; } = Array.Empty<string>();
}
```

## 7.2 Frontend detail routing

`IntegrationDetail.tsx` should stop using the binary carrier/not-carrier branch.

Instead:

- render tabs from `integration.tabs`
- switch on `integration.kind` and/or `integration.code`
- allow Shopify to have its own detail components

## 7.3 Shopify tab set

Recommended first tab set for Shopify:

- `setup`
- `delivery`
- `widget-delivery`
- `widget-pickup`
- `rates`
- `windows`
- `package-sizes`
- `themes`
- `activity`

If you want a smaller first cut, do this minimum viable set:

- `setup`
- `delivery`
- `widget`
- `rates`
- `windows`
- `package-sizes`
- `themes`

---

## 8. Concrete Jacob Work Plan

## Step 1 — Decouple the hub catalog from carrier-only assumptions

### Files to change

- `integration-manager/src/IntegrationManager.Api/Controllers/Admin/IntegrationDefinitionsController.cs`
- `integration-manager/src/IntegrationManager.AdminPortal/src/hooks/useIntegrations.ts`
- `integration-manager/src/IntegrationManager.AdminPortal/src/pages/IntegrationDetail.tsx`
- `integration-manager/src/IntegrationManager.AdminPortal/src/constants/integrationTabs.ts`

### Required change

Stop assuming every active definition is a carrier.

### Acceptance criteria

- Shopify can appear in the hub without being treated like FEDEX/UPS/Delta Cargo.
- Tab visibility comes from definition metadata, not hardcoded carrier-only assumptions.

---

## Step 2 — Add a Shopify definition to the hub

### Minimum expected definition

```json
{
  "code": "SHOPIFY",
  "name": "Shopify",
  "description": "Shopify checkout, booking, polling, fulfilment, and storefront widget integration",
  "category": "other",
  "status": "active",
  "kind": "commerce",
  "tabs": ["setup", "delivery", "widget-delivery", "widget-pickup", "rates", "windows", "package-sizes", "themes", "activity"]
}
```

### Notes

- `category: "other"` works with the current hub category tabs.
- Do **not** use `financial` or `freight` just to make it visible.

---

## Step 3 — Build a Shopify detail shell in Admin Portal

### Recommended new folder

- `integration-manager/src/IntegrationManager.AdminPortal/src/pages/Shopify/`

### Suggested components

- `ShopifySetup.tsx`
- `ShopifyDeliverySettings.tsx`
- `ShopifyWidgetDeliverySettings.tsx`
- `ShopifyWidgetPickupSettings.tsx`
- `ShopifyRates.tsx`
- `ShopifyWindows.tsx`
- `ShopifyPackageSizes.tsx`
- `ShopifyThemes.tsx`
- `ShopifyActivity.tsx`

### Why

The Delta Cargo setup already shows the right pattern for a dedicated integration experience:

- `integration-manager/src/IntegrationManager.AdminPortal/src/pages/DeltaCargoSetup/DeltaCargoSetup.tsx`

Use the same idea, but as a Shopify-specific sub-area instead of jamming this into carrier account pages.

---

## Step 4 — Port the auth/install flow

### Legacy reference

- `shopifyapp/Shopify.App/Api/Controllers/AuthController.cs`
- `shopifyapp/Shopify.Core/Application/Services/ShopService.cs`

### You need equivalent latest-code endpoints for

- begin install
- install callback
- uninstall webhook
- login / tenant linking if still required
- status lookup for connected shops

### Important implementation note

`ShopService.InstallCallbackAsync(...)` currently does more than OAuth:

- registers webhooks
- registers carrier service
- creates default package size
- creates default rate
- creates default window group
- reactivates an existing shop
- updates stored scopes/access token

Do not reduce this to a thin OAuth callback without recreating the provisioning side effects.

---

## Step 5 — Port settings CRUD

### Legacy reference

- `shopifyapp/Shopify.App/Api/Controllers/SettingsController.cs`
- `shopifyapp/Shopify.Core/Application/Services/SettingsService.cs`

### Settings you must preserve

#### Delivery settings

- book mode (orders page vs webhook)
- auto fulfil mode
- delivery instruction attributes
- book-tags-add-date
- client refs A/B
- our ref
- signature required
- include tax

#### Widget delivery settings

- address mode
- show rates
- show available options
- show instructions
- all delivery translation labels/placeholders

#### Widget pickup settings

- show rates
- show available options
- show instructions
- all pickup translation labels/placeholders

---

## Step 6 — Port rates/windows/package sizes management

### Legacy reference

- `shopifyapp/Shopify.Core/Application/Services/RateService.cs`
- `shopifyapp/Shopify.Core/Application/Services/WindowService.cs`
- `shopifyapp/Shopify.Core/Application/Services/PackageSizeService.cs`

### Minimum expectation

The new hub must support the same CRUD/admin surface the old embedded app exposes for:

- shop rates + overrides + rules
- delivery/pickup windows
- package sizes + rule binding

Do not ship the hub version with read-only placeholders if the old app still relies on these records operationally.

---

## Step 7 — Port theme/widget management

### Legacy reference

- `shopifyapp/Shopify.Core/Application/Services/ThemeService.cs`

Confirmed responsibilities:

- list themes
- determine whether a theme is supported
- install snippets/assets
- inject widget markup/scripts into theme/cart assets
- serve the storefront script with shop-specific settings

This is part of the Shopify integration, not optional polish.

If you defer this, call it out explicitly as phase 2 and keep the old surface alive until replacement is ready.

---

## Step 8 — Migrate background processing

### Legacy reference

- `shopifyservice/Shopify.Service/Program.cs`
- `shopifyservice/Shopify.Service/Jobs/OrderJob.cs`
- `shopifyservice/Shopify.Service/Jobs/AutoFulfullmentJob.cs`
- `shopifyapp/Shopify.Core/Application/Services/OrderService.cs`

### Recommendation

Keep this as a **separate worker process** in the latest architecture.

Do not bury minute/hourly polling into the Admin Portal frontend or request-response API path.

Reason:

- polling and auto fulfilment are scheduled operational jobs
- they need independent deployment/runtime/health
- the legacy split between app + worker is directionally correct

### Acceptable latest-code options

1. new `IntegrationManager.ShopifyWorker` project
2. hosted background service in a dedicated API/worker host

### Less good option

- bolting timers into the main admin API host

---

## 9. Data / Schema Notes

## 9.1 Do not throw away `ShopifyShop` behaviour accidentally

The legacy `ShopifyShop` record is effectively the shop integration aggregate.

If you want a cleaner latest-code schema, that is fine, but the new model must still preserve:

- install/auth state
- operational polling settings
- fulfilment settings
- reference-field mappings
- tax/signature flags
- widget/translations config

## 9.2 Related data sets also need a home

If latest code introduces a new schema, account for migration/storage for:

- rates
- rate overrides
- rules
- window groups / windows
- package sizes
- theme install compatibility metadata

---

## 10. Suggested File-Level Latest-Code Changes

## Backend

### Add / extend definition source

- `src/IntegrationManager.Api/Controllers/Admin/IntegrationDefinitionsController.cs`
- likely new service/repository under `src/IntegrationManager.Core/Services/` and `.../Interfaces/`

### Add Shopify admin endpoints

Suggested controller namespace:

- `src/IntegrationManager.Api/Controllers/Admin/ShopifyController.cs`
- or split:
  - `Admin/ShopifySetupController.cs`
  - `Admin/ShopifySettingsController.cs`
  - `Admin/ShopifyRatesController.cs`
  - `Admin/ShopifyThemesController.cs`

### Add worker host/project

Suggested new project:

- `src/IntegrationManager.ShopifyWorker/`

## Frontend

### Hub typing and routing

- `src/IntegrationManager.AdminPortal/src/types/index.ts`
- `src/IntegrationManager.AdminPortal/src/api/metadata.ts`
- `src/IntegrationManager.AdminPortal/src/hooks/useIntegrations.ts`
- `src/IntegrationManager.AdminPortal/src/constants/integrationTabs.ts`
- `src/IntegrationManager.AdminPortal/src/pages/IntegrationDetail.tsx`

### Shopify pages/components

- `src/IntegrationManager.AdminPortal/src/pages/Shopify/...`
- route/render wiring in `IntegrationDetail.tsx`

---

## 11. Phasing Recommendation

## Phase 1 — Hub shell + setup + settings

Ship:

- Shopify card in Integrations Hub
- Shopify detail layout
- install/auth status
- delivery settings
- widget settings

## Phase 2 — operational config

Ship:

- rates
- windows
- package sizes
- themes

## Phase 3 — background jobs + cutover

Ship:

- polling worker
- auto fulfilment worker
- webhook validation
- cutover from old Shopify app/service

This phased path is safer than pretending the whole migration is “just UI”.

---

## 12. Specific Risks To Avoid

- **Wrong assumption:** Shopify can be represented as a normal carrier account.
- **Wrong assumption:** adding an active definition is enough. It is not; current `isCarrier()` logic will misroute it.
- **Wrong assumption:** OAuth/install is the whole integration. It is not; provisioning + settings + workers matter.
- **Wrong assumption:** theme/widget management is optional. It is part of the current production surface.
- **Wrong assumption:** the worker can disappear. Polling + auto fulfilment are still active behaviours in legacy code.

---

## 13. Acceptance Criteria

Jacob’s upgrade is done when all of the below are true:

- [ ] Shopify appears in Integrations Hub under **Other**.
- [ ] Clicking Shopify opens a Shopify-specific detail experience, not the generic coming-soon card and not carrier-account tabs.
- [ ] Integration definitions are no longer hard-wired to “active carrier type means carrier detail”.
- [ ] Shopify install/callback/uninstall flow exists in latest code.
- [ ] Shop-level delivery settings can be read and updated in latest code.
- [ ] Widget delivery and pickup settings can be read and updated in latest code.
- [ ] Rates/windows/package sizes have a real latest-code management path.
- [ ] Theme/widget installation has a defined replacement path.
- [ ] Polling and auto fulfilment background jobs have a latest-code host.
- [ ] There is a documented data migration / coexistence plan for `ShopifyShop` and related tables.

---

## 14. My Recommendation On Implementation Order

Do this in order:

1. fix the hub definition model
2. add Shopify definition + custom detail routing
3. port setup/install/status
4. port settings
5. port rates/windows/package sizes
6. port theme management
7. port worker jobs
8. cut over production traffic

If you skip step 1, the rest gets built on the wrong abstraction.
