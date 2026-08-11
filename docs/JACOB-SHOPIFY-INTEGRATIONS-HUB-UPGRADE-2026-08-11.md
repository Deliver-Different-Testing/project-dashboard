# Shopify Upgrade + Accelerated Checkout Fix + Integration Manager Migration — Jacob Implementation MD

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

This work needs to be delivered as **three distinct phases**, because there are really three separate problems to solve:

1. **upgrade the current Shopify app/runtime off the old Urgent-specific ASP.NET implementation**
2. **fix the Apple Pay / Google Pay rate gap as part of that upgrade**
3. **introduce Shopify into Integration Manager as a generic DFRNT integration rather than an Urgent-only app-store product**

This is **not** just a matter of adding a Shopify card.

The old Shopify implementation spans:

- embedded Shopify app auth/install flow
- shop-level settings persisted in SQL
- checkout rating logic
- order webhook/polling ingestion
- auto-fulfilment background jobs
- theme/widget installation
- rate/window/package-size CRUD

So the job is to migrate and modernise a **full integration product surface**, while also fixing current conversion-impacting checkout issues.

---

## 1.1 Phase summary Jacob should work to

### Phase 1 — Shopify app modernisation / platform upgrade

Objective:

- replace the legacy Urgent-specific Shopify app/runtime architecture with a cleaner modern DFRNT-ready implementation

Primary outcome:

- the Shopify app is running on the new supported architecture without losing existing operational capability

### Phase 2 — Apple Pay / Google Pay / accelerated checkout compatibility

Objective:

- fix the current issue where customers using Apple Pay or Google Pay do not see Urgent / DFRNT delivery rates

Primary outcome:

- accelerated checkout is either fully supported with correct rate visibility, or explicitly and safely handled with an agreed fallback/product rule

### Phase 3 — Integration Manager migration + product generalisation

Objective:

- move Shopify into Integration Manager as a **generic tenant-capable DFRNT integration**, instead of leaving it as an Urgent Couriers-branded Shopify app only

Primary outcome:

- Shopify becomes a first-class Integration Manager integration with tenant-aware setup and management

### Important note for scope control

Steve will likely add **further enhancements and modernisation asks** on top of these phases.

Jacob should therefore treat this document as the **base phased upgrade plan**, and add later enhancements under the relevant phase rather than mixing everything into one undifferentiated rebuild.

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

The original version of this document was written mostly from the Integration Manager migration angle.

That is still important, but the work now needs to be explicitly sequenced into the three phases below.

---

## Phase 1 — Shopify app modernisation / platform upgrade

This phase is about upgrading the existing Shopify app and worker off the old Urgent-specific ASP.NET shape without breaking current merchant capability.

### Phase 1 scope

- preserve install/auth behaviour
- preserve checkout rate callback behaviour
- preserve settings CRUD
- preserve rates/windows/package-size CRUD
- preserve theme/widget behaviour
- preserve worker jobs
- review whether the direct callback pattern should remain or be replaced during upgrade

### Phase 1 key legacy references

- `shopifyapp/Shopify.App/Api/Controllers/AuthController.cs`
- `shopifyapp/Shopify.App/Api/Controllers/RatesController.cs`
- `shopifyapp/Shopify.App/Api/Controllers/SettingsController.cs`
- `shopifyapp/Shopify.Core/Application/Services/ShopService.cs`
- `shopifyapp/Shopify.Core/Application/Services/RateService.cs`
- `shopifyapp/Shopify.Core/Application/Services/SettingsService.cs`
- `shopifyapp/Shopify.Core/Application/Services/ThemeService.cs`
- `shopifyapp/Shopify.Core/Application/Services/OrderService.cs`
- `shopifyservice/Shopify.Service/Program.cs`
- `shopifyservice/Shopify.Service/Jobs/OrderJob.cs`
- `shopifyservice/Shopify.Service/Jobs/AutoFulfullmentJob.cs`

### Phase 1 required decisions

Jacob needs to make and document these decisions explicitly:

1. does the upgraded app still register Shopify carrier callbacks directly to the app, or is callback traffic moved behind a new DFRNT-controlled endpoint?
2. does the worker remain a separate deployable process? **recommended: yes**
3. what is the new source of truth for shop integration config currently held on `ShopifyShop` and related tables?

### Phase 1 acceptance criteria

- install / callback / uninstall still work
- Shopify carrier service registration still works
- existing merchant settings can still be read and updated
- rates/windows/package sizes still have a functioning admin path
- theme/widget functionality still has a valid runtime path
- polling and auto-fulfilment still have a supported worker host

---

## Phase 2 — Apple Pay / Google Pay / accelerated checkout fix

This phase is specifically about the current lost-conversion defect.

### Current suspected root cause

The current implementation is built around the **standard cart → checkout path**.

Evidence from the current code:

- carrier rates are returned from `POST /api/Rates`
- the storefront widget is only injected on the cart page in `Shopify.App/Templates/urgent-couriers-app-head.liquid`
- the injected JS in `Shopify.App/Templates/urgent-couriers-app.js` hooks standard cart/checkout controls and writes cart attributes before checkout

That strongly suggests accelerated checkout methods such as Apple Pay / Google Pay can bypass the normal widget/cart-attribute flow the app depends on.

### Phase 2 scope

- confirm the exact behaviour difference between:
  - standard checkout
  - Apple Pay
  - Google Pay
  - any other accelerated checkout path in active client themes
- determine whether Shopify is calling the carrier-service callback in each path
- determine whether required delivery metadata / cart attributes are missing in accelerated checkout
- implement a supported fix in the upgraded architecture

### Phase 2 files Jacob should inspect first

- `shopifyapp/Shopify.App/Templates/urgent-couriers-app-head.liquid`
- `shopifyapp/Shopify.App/Templates/urgent-couriers-app.js`
- `shopifyapp/Shopify.Core/Application/Services/RateService.cs`
- `shopifyapp/Shopify.Core/Application/Services/ShopService.cs`

### Phase 2 acceptance criteria

- customers using Apple Pay can see valid Urgent / DFRNT delivery options where Shopify supports them
- customers using Google Pay can see valid Urgent / DFRNT delivery options where Shopify supports them
- if Shopify platform constraints make one path impossible, that limitation is documented and a deliberate product fallback is agreed instead of silently failing
- standard checkout still works after the fix

### Important rule

Do **not** treat this as a nice-to-have after the migration.

This is a release blocker for the upgrade because the current behaviour is costing merchants conversions.

---

## Phase 3 — Integration Manager migration + generic DFRNT productisation

This phase is where Shopify stops being just an Urgent Couriers-branded app-store app and becomes a proper DFRNT integration.

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

## 11. Phased delivery summary

## Phase 1 — Shopify app modernisation / platform upgrade

Ship:

- upgraded app/runtime architecture
- preserved install/auth/webhook capability
- preserved settings + operational CRUD surface
- preserved worker capability on a supported runtime
- explicit decision on direct callback vs DFRNT-controlled endpoint/proxy path

## Phase 2 — Apple Pay / Google Pay compatibility

Ship:

- validated accelerated-checkout behaviour
- implemented fix for missing Urgent / DFRNT rates in Apple Pay / Google Pay paths
- regression coverage for normal checkout vs accelerated checkout

## Phase 3 — Integration Manager migration + DFRNT generalisation

Ship:

- Shopify card in Integrations Hub
- Shopify-specific detail experience
- tenant-aware/generic DFRNT integration model
- migration away from Urgent-only app-store framing

This is the correct phased path because it separates:

1. **technical upgrade**
2. **live commercial defect fix**
3. **product/platform migration**

Those should not be muddled into one vague rebuild task.

---

## 12. Specific Risks To Avoid

- **Wrong assumption:** Shopify can be represented as a normal carrier account.
- **Wrong assumption:** adding an active definition is enough. It is not; current `isCarrier()` logic will misroute it.
- **Wrong assumption:** OAuth/install is the whole integration. It is not; provisioning + settings + workers matter.
- **Wrong assumption:** theme/widget management is optional. It is part of the current production surface.
- **Wrong assumption:** the worker can disappear. Polling + auto fulfilment are still active behaviours in legacy code.

---

## 13. Acceptance Criteria

Jacob’s phased upgrade is done when all of the below are true:

### Phase 1 complete

- [ ] Shopify install/callback/uninstall flow exists in latest code.
- [ ] Carrier service callback registration still works correctly.
- [ ] Shop-level delivery settings can be read and updated in latest code.
- [ ] Widget delivery and pickup settings can be read and updated in latest code.
- [ ] Rates/windows/package sizes have a real latest-code management path.
- [ ] Theme/widget installation has a defined replacement path.
- [ ] Polling and auto fulfilment background jobs have a latest-code host.
- [ ] There is a documented data migration / coexistence plan for `ShopifyShop` and related tables.

### Phase 2 complete

- [ ] Apple Pay checkout path has been tested against the upgraded app.
- [ ] Google Pay checkout path has been tested against the upgraded app.
- [ ] Urgent / DFRNT delivery rates are visible in supported accelerated checkout paths.
- [ ] Any unsupported accelerated checkout limitation is explicitly documented and commercially agreed rather than silently failing.

### Phase 3 complete

- [ ] Shopify appears in Integrations Hub under **Other** (or final agreed category).
- [ ] Clicking Shopify opens a Shopify-specific detail experience, not the generic coming-soon card and not carrier-account tabs.
- [ ] Integration definitions are no longer hard-wired to “active carrier type means carrier detail”.
- [ ] Shopify is modelled as a generic DFRNT integration rather than an Urgent-only product surface.

---

## 14. Recommended implementation order

Do this in order:

1. complete the Shopify app/runtime upgrade
2. prove and fix Apple Pay / Google Pay behaviour in that upgraded flow
3. migrate Shopify into Integration Manager as a generic DFRNT integration

More detailed sequence:

1. port setup/install/status/runtime foundations
2. port settings
3. port rates/windows/package sizes/themes
4. port worker jobs
5. verify normal checkout behaviour
6. verify Apple Pay / Google Pay behaviour and fix gaps
7. fix the Integration Manager definition model
8. add Shopify definition + custom detail routing
9. migrate Shopify admin/control surfaces into Integration Manager
10. cut over production traffic

If you skip the accelerated-checkout validation in the middle, you risk shipping a modernised app that still loses conversions.
