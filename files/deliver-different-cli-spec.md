# DELIVER DIFFERENT - CLI BUILD SPECIFICATION
## Condensed Technical Spec for Claude Code / CLI Tools

---

## BRAND SYSTEM
```css
--primary-cyan: #23c4ff;
--primary-blue: #443ffe;
--primary-dark: #000e25;
--surface-light: #f6f8fa;
--border: #e8ecf1;
--text-primary: #0d0c2c;
--text-secondary: #64748b;
--text-muted: #94a3b8;
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
```

---

## MENU STRUCTURE (4 SECTIONS)

```
1. GENERAL
   1.1 Clients & Customers [COMPLETE]
       - General, Services, Schedule, Contacts, Rates, History
   1.2 Agents [TO BUILD]
   1.3 Drivers [TO BUILD]
       1.3.1 Vehicle Management
   1.4 Holidays / Afterhours [TO BUILD]
   1.5 Rates & Accessorials [TO BUILD]

2. SERVICES
   2.1 Customer Contacts [TO BUILD]
   2.2 Billing Types [TO BUILD]
   2.3 Job Settings [TO BUILD]
   2.4 Sources [TO BUILD]
   2.5 Airports & Airfreight [TO BUILD]

3. USERS & PERMISSIONS
   3.1 Staff & Admin Users [TO BUILD]
   3.2 Customer/Client Users [TO BUILD]

4. ADVANCED
   4.1 Tasks & Notifications [COMPLETE]
       - Automation Rules
       - Tasks (Task Logs, Rules, Triggers, Types, Workflows)
       - Notification Center
   4.2 Territory & Locations [COMPLETE]
       - All Zip Zones, Zone Groups, Depots/Locations
   4.3 Dashboards [TO BUILD]
       - App Pages, Apps, Customer Views, Despatch Views
   4.4 Site Level Settings & Integrations [TO BUILD]
```

---

## TAG SYSTEM (10 Categories)

Used for filtering and relating entities across modules:
1. Region, 2. Depot, 3. Country, 4. Customer, 5. Service
6. Vehicle, 7. Notification, 8. Rate Card, 9. Airport, 10. Linehaul

---

## CORE UI PATTERNS

### 1. Page Header
```html
<div class="page-header">
    <h1 class="page-title">Title</h1>
    <p class="page-subtitle">Subtitle</p>
    <div class="header-actions">
        <button class="btn btn-primary">+ Add New</button>
    </div>
    <div class="tabs">
        <button class="tab active">Tab 1</button>
        <button class="tab">Tab 2</button>
    </div>
</div>
```

### 2. Expandable Row
```html
<div class="item-row">
    <div class="row-header" onclick="toggleRow()">
        <span class="item-name">Name</span>
        <span class="badge">Badge</span>
        <svg class="chevron">▼</svg>
    </div>
    <div class="row-expanded">
        <!-- Expanded content, filters, tables -->
    </div>
</div>
```

### 3. Filter System
```html
<div class="filter-bar">
    <button class="filter-tag-btn">Region ▼</button>
    <button class="filter-tag-btn">Depot ▼</button>
</div>
<div class="active-filters">
    <div class="filter-chip">Region: Auckland <button>×</button></div>
    <button class="clear-all-btn">Clear All</button>
</div>
```

### 4. Tag Sidebar
```html
<div class="tag-sidebar">
    <div class="tag-category">
        <div class="tag-category-header">
            <svg>icon</svg><span>Region</span>
        </div>
        <div class="tag-list" id="regionTags">
            <!-- Tag checkboxes -->
        </div>
    </div>
    <!-- Repeat for 10 categories -->
</div>
```

---

## BUTTON CLASSES
```css
.btn-primary   /* Cyan background, dark text */
.btn-secondary /* White background, border */
.btn-save      /* Green background */
```

---

## STATE CLASSES
```css
.active    /* Currently selected */
.expanded  /* Row is expanded */
.editing   /* Item being edited */
```

---

## MODULE LOADING
```javascript
const MODULE_URLS = {
    clients: 'https://clientsettingsmodule.tiiny.site/',
    territory: 'https://finalzonelocationsmenu.tiiny.site/',
    notifications: 'URL_HERE'
};

function loadModule(name) {
    document.getElementById('contentBody').innerHTML = 
        `<iframe class="module-frame" src="${MODULE_URLS[name]}"></iframe>`;
}
```

---

## BUILD CHECKLIST FOR NEW MODULE
1. Copy template structure from existing module
2. Set page title/subtitle
3. Configure tabs if multi-tab
4. Add filter categories relevant to module
5. Implement expandable rows or cards
6. Add tag sidebar if filtering by tags
7. Test all interactions
8. Deploy to tiiny.site
9. Update MODULE_URLS in shell

---

## FILE TYPES
- All modules: Self-contained HTML (CSS+JS inline)
- No build tools required
- No frameworks (vanilla HTML/CSS/JS)
- Hosted on tiiny.site
- Loaded via iframe in shell

---

## COMPLETED FILES
- `deliver-different-settings-menu-final.html` - Navigation shell
- `territory-locations-complete-redesigned.html` - Territory module
- `notification-center-FIXED.html` - Notifications
- `attachment-builder-tab2-COMPLETE.html` - Attachments
- `Enhanced_Complete_Admin_System...html` - Clients module

---

*This spec can be used with Claude Code or any CLI tool to understand and extend the system.*
