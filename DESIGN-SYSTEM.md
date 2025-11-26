# Deliver Different Admin Menu - Design System

## Overview

This document extracts the design patterns, components, and field inventories from 3 existing HTML modules to serve as the source of truth for rebuilding in React.

**Source Files Analyzed:**
1. `territory-locations-complete-redesigned.html` (3,228 lines)
2. `notification-center-FINALv4.0.html` (4,061 lines)
3. `deliver-different-v2.0-final.html` (2,689 lines - Clients/Services)

---

## 1. Brand Colors (OFFICIAL - from Brand colours.docx)

These override any colors in the HTML files:

| Name | Hex | Usage |
|------|-----|-------|
| **Main Dark** | `#14152D` | Dark navy backgrounds, primary text |
| **Main Highlight** | `#43C7F4` | Primary CTAs, accents, active states |
| **Secondary** | `#606DB4` | Secondary elements, light purple/blue |

### Extended Palette (from HTML)

```css
:root {
  /* Brand Colors */
  --primary-dark: #14152D;
  --primary-cyan: #43C7F4;
  --secondary-purple: #606DB4;

  /* Surfaces */
  --surface-white: #ffffff;
  --surface-light: #f6f8fa;
  --surface-cream: #fafbfc;
  --border: #e8ecf1;
  --border-light: #f1f5f9;

  /* Text */
  --text-primary: #0d0c2c;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;

  /* Status */
  --success: #10b981;
  --success-bg: #d1fae5;
  --warning: #f59e0b;
  --warning-bg: #fef3c7;
  --error: #ef4444;
  --error-bg: #fee2e2;

  /* Badge Colors */
  --badge-blue-bg: #dbeafe;
  --badge-blue-text: #1e40af;
  --badge-purple-bg: #ede9fe;
  --badge-purple-text: #6d28d9;
  --badge-green-bg: #d1fae5;
  --badge-green-text: #065f46;
  --badge-orange-bg: #fff7ed;
  --badge-yellow-bg: #fefce8;
}
```

---

## 2. Design Principles (from NO AI Design prompt.docx)

### Mandatory Standards

1. **Spacing Rhythm**: 8pt scale everywhere (8, 16, 24, 32, 40, 48px). No random values.
2. **Typography System**: One heading font, one body font. Clear type ramp.
3. **Disciplined Color**: Small palette, no neon, no novelty gradients.
4. **Consistent Components**: Same border-radius, shadow, padding across ALL components.
5. **Subtle Interactions**: Hover effects don't distort layout. Natural animation timing.
6. **Proper Grid**: Clean alignment, predictable widths, balanced sections.
7. **Loading States**: Every async action has feedback. Skeletons for data.
8. **Real Copy**: No "build your dreams" filler. Specific, grounded language.

### Anti-Patterns to Avoid

- Sparkles, random emojis
- Purple gradients without brand justification
- Inconsistent spacing/shadows/radiuses
- Generic hero lines
- Chaotic animations
- Broken responsiveness

---

## 3. Spacing & Sizing

```css
/* Spacing Scale (8pt base) */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 14, 37, 0.05);
--shadow-md: 0 2px 8px rgba(0, 14, 37, 0.08);
--shadow-lg: 0 4px 12px rgba(0, 14, 37, 0.12);
--shadow-xl: 0 8px 24px rgba(0, 14, 37, 0.15);
--shadow-cyan-glow: 0 4px 12px rgba(67, 199, 244, 0.3);
--shadow-sidebar: -4px 0 24px rgba(0, 14, 37, 0.15);
```

---

## 4. Typography

```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Type Scale */
--text-xs: 11px;      /* Labels, uppercase */
--text-sm: 12px;      /* Small text, meta */
--text-base: 14px;    /* Body text, inputs */
--text-lg: 16px;      /* Card titles */
--text-xl: 18px;      /* Section titles */
--text-2xl: 20px;     /* Page subtitles */
--text-3xl: 24px;     /* Page titles */
--text-4xl: 28px;     /* Hero titles */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Letter Spacing */
--tracking-tight: -0.5px;
--tracking-normal: 0;
--tracking-wide: 0.5px;   /* Used for uppercase labels */
```

---

## 5. Component Library

### 5.1 Page Header

```
┌─────────────────────────────────────────────────────────┐
│  Page Title                    [Tags Button] [Primary]  │
│  Subtitle description text                              │
└─────────────────────────────────────────────────────────┘
```

**Props:**
- `title`: string
- `subtitle`: string
- `clientBadge?`: string (e.g., "Client: 1976 Limited")
- `actions`: ReactNode[]

---

### 5.2 Tabs

```
┌──────────────────────────────────────────────────┐
│ [Tab 1 Active] [Tab 2] [Tab 3] [Tab 4]          │
└──────────────────────────────────────────────────┘
```

**States:**
- Inactive: transparent bg, muted text
- Active: cyan bottom border, primary text
- Hover: light bg

**Props:**
- `tabs`: { id: string, label: string, icon?: ReactNode }[]
- `activeTab`: string
- `onTabChange`: (tabId: string) => void

---

### 5.3 Expandable Row

```
┌─────────────────────────────────────────────────────────┐
│ [Toggle] Name [Badge] [Stats] [Tags Button] [Chevron ▼] │
├─────────────────────────────────────────────────────────┤
│  EXPANDED CONTENT (hidden until clicked)                │
│  ├─ Edit Controls (Name input + Cancel/Save)            │
│  ├─ Collapsed Items Bar                                 │
│  ├─ Filter Section                                      │
│  └─ Content (Table/Cards/Form)                          │
└─────────────────────────────────────────────────────────┘
```

**States:**
- Collapsed: max-height: 0, chevron pointing down
- Expanded: max-height: auto, chevron rotated 180deg, cyan left border

**Props:**
- `id`: string
- `name`: string
- `badge?`: { text: string, variant: 'default' | 'customized' | 'system' }
- `preview?`: string (tags preview text)
- `stats`: { label: string, value: string | number }[]
- `tagCount`: number
- `isExpanded`: boolean
- `onToggle`: () => void
- `onTagsClick`: () => void
- `children`: ReactNode (expanded content)

---

### 5.4 Filter Bar

```
┌────────────────────────────────────────────────────────┐
│ [Region ▼] [Depot ▼] [Service ▼] ... [Clear Filters]  │
└────────────────────────────────────────────────────────┘
```

**Props:**
- `filters`: { id: string, label: string, icon?: ReactNode, options: string[] }[]
- `activeFilters`: Record<string, string[]>
- `onFilterChange`: (filterId: string, values: string[]) => void
- `onClear`: () => void

---

### 5.5 Filter Chips

```
┌─────────────────────────────────────────────────────────┐
│ [Region: Auckland ×] [Service: Express ×] [Clear All]  │
└─────────────────────────────────────────────────────────┘
```

**Props:**
- `chips`: { category: string, value: string }[]
- `onRemove`: (category: string, value: string) => void
- `onClearAll`: () => void

---

### 5.6 Data Table

```
┌─────────────────────────────────────────────────────────┐
│ ☐  Column 1    Column 2    Column 3    Actions         │
├─────────────────────────────────────────────────────────┤
│ ☐  Value       Value       Value       [Edit] [Del]    │
│ ☐  Value       Value       Value       [Edit] [Del]    │
└─────────────────────────────────────────────────────────┘
│         Showing 1-20 of 2,438  [< 1 2 3 ... >]         │
└─────────────────────────────────────────────────────────┘
```

**Props:**
- `columns`: { key: string, label: string, width?: string }[]
- `data`: Record<string, any>[]
- `selectable?`: boolean
- `selectedIds?`: Set<string>
- `onSelectionChange?`: (ids: Set<string>) => void
- `pagination?`: { page: number, pageSize: number, total: number }
- `onPageChange?`: (page: number) => void
- `actions?`: (row: any) => ReactNode

---

### 5.7 Tag Sidebar (Connection Navigator)

> **IMPORTANT:** See `TAG-SYSTEM-SPEC.md` for complete specification.
> Tags are a **navigation system**, not a labeling system.

```
┌──────────────────────────────────────┐
│ Connections for: Zip Code 10001      │
│ "Related areas of the system"        │
├──────────────────────────────────────┤
│                                      │
│ ✓ CUSTOMERS          [→ View]        │  ← Click to navigate
│   Connected via 3 zone groups        │
│                                      │
│ ✓ ZONE GROUPS        [→ View]        │
│   Member of 3 groups                 │
│                                      │
│ ✗ RATE CARDS                         │  ← No connection (debug hint)
│   Not connected                      │
│                                      │
└──────────────────────────────────────┘
```

**Purpose:**
- Show which OTHER settings pages relate to the current item
- Enable cross-navigation with pre-filled search
- Reveal missing connections for debugging

**10 Tag Categories:**
1. Region, 2. Depot, 3. Country, 4. Customer, 5. Service
6. Vehicle, 7. Notification, 8. Rate Card, 9. Airport, 10. Linehaul

**Connection States:**
- ✓ Connected (cyan) - Relationships exist, clickable
- ✗ Not Connected (gray) - No relationships, might be a problem
- ⚠ Partial (orange) - Some expected connections missing

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `sourceItem`: { type: string, id: string, name: string }
- `connections`: EntityConnections (computed relationship summary)
- `onNavigate`: (targetModule: string, searchQuery: string) => void

---

### 5.8 Toggle Switch

**Full Size (48x24px):**
```
┌──────────────────┐
│ ○────────────────│  OFF (gray)
└──────────────────┘

┌──────────────────┐
│────────────────○ │  ON (cyan gradient)
└──────────────────┘
```

**Mini Size (40x20px):**
Same pattern, smaller dimensions.

**Props:**
- `checked`: boolean
- `onChange`: (checked: boolean) => void
- `size?`: 'sm' | 'md'
- `disabled?`: boolean

---

### 5.9 Button Variants

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Primary | cyan (#43C7F4) | dark | none |
| Secondary | white | secondary text | 2px border |
| Save | success (#10b981) | white | none |
| Danger | error (#ef4444) | white | none |
| Ghost | transparent | secondary | none |
| Icon | transparent | current | none |

**Sizes:**
- sm: padding 6px 12px, text 12px
- md: padding 10px 20px, text 14px
- lg: padding 12px 24px, text 16px

**States:**
- Hover: translateY(-1px), shadow
- Active: translateY(0)
- Disabled: opacity 0.5, no pointer events

---

### 5.10 Badge

| Variant | Background | Text |
|---------|------------|------|
| default | #e8ecf1 | #64748b |
| blue | #dbeafe | #1e40af |
| purple | #ede9fe | #6d28d9 |
| green | #d1fae5 | #065f46 |
| cyan | #43C7F4 | #14152D |
| system | #e8ecf1 | #64748b |
| customized | #ede9fe | #6d28d9 |

**Props:**
- `variant`: string
- `children`: ReactNode

---

### 5.11 Info Card

```
┌───────────────────────┐
│ [Icon] LABEL          │
│        Value          │
└───────────────────────┘
```

**Color Variants:**
- blue: #eff6ff
- gray: #f6f8fa
- green: #f0fdf4
- purple: #faf5ff
- orange: #fff7ed
- yellow: #fefce8

**Props:**
- `icon`: ReactNode
- `label`: string
- `value`: string | ReactNode
- `variant`: 'blue' | 'gray' | 'green' | 'purple' | 'orange' | 'yellow'
- `editable?`: boolean
- `onEdit?`: (value: string) => void

---

### 5.12 Form Inputs

**Text Input:**
- padding: 10px 14px
- border: 2px solid var(--border)
- border-radius: 8px
- focus: cyan border + cyan glow shadow

**Select:**
- Same as text input
- Custom chevron icon

**Textarea:**
- Same as text input
- min-height: 100px
- resize: vertical

**Search Input:**
- Same as text input
- Left icon (magnifying glass)
- padding-left: 42px

---

### 5.13 Modal

**Right-Slide Modal (Contact Edit):**
```
┌──────────────────────────────────────────┐
│ [Avatar] Title                   [Close] │  <- Sticky header
├──────────────────────────────────────────┤
│                                          │
│  Form content                            │  <- Scrollable
│                                          │
├──────────────────────────────────────────┤
│ [Delete]              [Cancel] [Save]    │  <- Sticky footer
└──────────────────────────────────────────┘
```

**Center Modal (Schedule Detail):**
```
       ┌──────────────────────────┐
       │ Title            [Close] │
       ├──────────────────────────┤
       │                          │
       │  Content                 │
       │                          │
       └──────────────────────────┘
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `variant`: 'right-slide' | 'center'
- `children`: ReactNode
- `footer?`: ReactNode

---

### 5.14 Template Card (Notification Center)

```
┌─────────────────────────────────────────────────────────┐
│ [Icon] Template Name                                    │
│        Last sent: 2h ago • 1.2K sent                   │
│                              [Toggle] [Edit] [Delete]  │
├─────────────────────────────────────────────────────────┤
│  EDITOR (hidden until Edit clicked)                    │
│  ├─ Template Name input                                │
│  ├─ From Name / Reply-To (email only)                  │
│  ├─ Subject with merge field buttons                   │
│  ├─ Body with mode toggle (Rich/HTML)                  │
│  ├─ Attachments section                                │
│  └─ [Preview] [Duplicate] [Cancel] [Save]              │
└─────────────────────────────────────────────────────────┘
```

---

### 5.15 Canvas Editor (Attachment Builder)

```
┌─────────────────────────────────────────────────────────┐
│ [Back] Template Name                    [Preview] [Save]│
├──────────┬─────────────────────────────┬───────────────┤
│ LEFT     │ CENTER                      │ RIGHT         │
│          │                             │               │
│ Preview  │ [Zoom] Canvas Area          │ Field Library │
│ Doc Info │ with draggable fields       │ + Properties  │
│          │                             │               │
└──────────┴─────────────────────────────┴───────────────┘
```

---

## 6. Field Inventory by Module

### 6.1 Territory & Locations

#### Tab 1: All Zip Zones (9 Filters)

| Filter | ID | Type | Options |
|--------|-----|------|---------|
| Zone # | zipZoneNum | select | All Zones, 1A, 1B, 2A, 2B |
| Zone Name | zipZoneName | select | All Names, Manhattan Central, etc. |
| Region | zipRegion | select | All Regions, North America, etc. |
| Depot | zipDepot | select | All Depots, NYC Central, etc. |
| Service | zipService | select | All Services, Standard, Express, etc. |
| Vehicle | zipVehicle | select | All Vehicles, Van, Truck, etc. |
| Customer | zipCustomer | select | All Customers, 1976 Limited, etc. |
| Rate Card | zipRateCard | select | All Rate Cards, Standard Rates, etc. |
| Tag Search | zipTagSearch | text | Wildcard tag search... |

#### Tab 2: Zone Groups

**Per Zone Group (expanded):**
- Group Name (text input)
- 9 filters same as Tab 1
- Master Search (text input)
- Zip selection table (checkbox, zip, zone#, zoneName, depot)

#### Tab 3: Depots/Locations

**Per Depot (expanded):**
- Depot Name (text input)
- Address (text input)
- City (text input)
- State (text input)
- Zip Code (text input)
- Phone (text input)
- Email (email input)
- Status (select: Active, Inactive)
- 4 zone group filters (Region, Service, Customer, Tag)
- Zone groups table (checkbox, name, zipCount, status)
- Drop-off locations list

---

### 6.2 Notification Center

#### Tab 1: Template Groups

**Per Template Group (expanded):**
- Group Name (text input)
- Email Templates:
  - Template Name (text)
  - From Name (text)
  - Reply-To Email (email)
  - Subject with merge fields (text)
  - Body - Rich Editor (textarea)
  - Body - HTML Code (textarea, monospace)
  - Attachments list
- SMS Templates:
  - Template Name (text)
  - Message with merge fields (textarea)
  - Character counter (87/160)

**Merge Fields Available:**
- [CompanyName], [JobNumber], [Date], [Time]
- [FromAddress], [ToAddress], [CourierName]
- [ETA], [TrackingLink], [SMSPhone]
- [PickupAddress], [DeliveryAddress]
- [Quantity], [Weight]

#### Tab 2: Attachment Builder

**Per Attachment Template (expanded):**
- Document Name (text input)
- Background Preview
- Dimensions (display)
- Canvas with draggable fields
- Field properties:
  - Field Name (readonly)
  - Font Size (number, 8-72)
  - Font Weight (select: Normal, Bold)
  - Text Align (select: Left, Center, Right)
  - Text Color (color picker)

**Field Categories:**
- Job Details: JobNumber, ConNote, Date, Weight, Quantity
- Pickup Address: Company, Street, City, State, ZIP
- Delivery Address: Company, Street, City, State, ZIP

---

### 6.3 Clients/Services (deliver-different)

#### General Tab

**Basic Information:**
- Client ID (text)
- Status (toggle: Active/Inactive)
- Group Code (text)
- Location (text)
- Last Updated (display)
- Trading Name (text)
- Legal Name (text)
- Date Joined (text)

**Location Details:**
- Address (text)
- Extra Address Info (text)
- Address Notes (contenteditable)
- Phone (tel)
- Email (email)

#### Available Services Tab

**Per Service (expanded):**
- Service Status (toggle)
- Custom Display Name (text)
- Custom Description (textarea)
- Fixed Price (text)
- Markup % (text)
- Visibility toggles:
  - API (toggle)
  - Booking Page (toggle)
  - Bulk Upload (toggle)
  - Internal Dispatch (toggle)
- Availability Window (number)
- Max Schedules Total (number)
- Max Schedules Per Day (number)

#### Schedule Tab

**Filters:**
- Origin Region (select)
- Destination Region (select)
- Service Type (select)

**Per Schedule:**
- Power Toggle
- Route Name (display)
- Status Badge
- Cost (display)
- Collection Days (M-Su grid)
- Collection Zones (1-10 grid)
- Delivery Days (M-Su grid)
- Delivery Zones (1-10 grid)

#### Contacts Tab

**Per Contact (in modal):**
- First Name (text)
- Last Name (text)
- Job Title (text)
- Relationship (select: Primary, Billing, Technical, Emergency)
- Email (email)
- Direct Dial (tel)
- Mobile (tel)
- Active (checkbox)
- Default Contact (checkbox)
- Permissions (6 toggles):
  - Bulk Upload
  - Create Jobs
  - Dispatch Web
  - Maintain Clients
  - Maintain Contacts
  - View Markup

---

## 7. JavaScript Behaviors

### State Patterns

```typescript
interface ComponentState {
  activeFilters: Record<string, string[]>;
  expandedItems: Set<string>;
  editingItem: string | null;
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  selectedItems: Set<string>;
}
```

### Key Interactions

| Action | Trigger | Effect |
|--------|---------|--------|
| Tab Switch | Click tab button | Hide all content, show selected, animate fade-in |
| Row Expand | Click row header | Toggle max-height 0↔auto, rotate chevron |
| Filter Apply | Change filter select | Update activeFilters, re-render list |
| Filter Remove | Click chip × | Remove from activeFilters, re-render |
| Tag Sidebar Open | Click tag button | Add .open class, show overlay |
| Tag Sidebar Close | Click ×/overlay | Remove .open class, hide overlay |
| Toggle Switch | Click toggle | Toggle .active class, call onChange |
| Modal Open | Click edit button | Add .active to modal overlay |
| Modal Close | Click ×/overlay/cancel | Remove .active from modal overlay |
| Search | Input in search field | Filter visible items (debounced 300ms) |
| Save | Click save button | Call API, show toast, close editor |

### Animation Timings

```css
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;
--expand-timing: 500ms ease-out;
```

---

## 8. Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  /* Stack columns, hide sidebar */
}

/* Tablet */
@media (max-width: 1024px) {
  /* 2-column grids, collapsible sidebar */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Full layout */
}

/* Large Desktop */
@media (min-width: 1400px) {
  /* Max-width container: 1600px */
}
```

---

## 9. React Component Structure (Proposed)

```
src/
├── components/
│   ├── ui/                    # Atomic components
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Toggle.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   │
│   ├── layout/                # Layout components
│   │   ├── PageHeader.tsx
│   │   ├── Tabs.tsx
│   │   ├── Card.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── data/                  # Data display components
│   │   ├── DataTable.tsx
│   │   ├── InfoCard.tsx
│   │   ├── ExpandableRow.tsx
│   │   └── Pagination.tsx
│   │
│   ├── filters/               # Filter components
│   │   ├── FilterBar.tsx
│   │   ├── FilterChips.tsx
│   │   ├── FilterDropdown.tsx
│   │   └── SearchInput.tsx
│   │
│   ├── tags/                  # Tag system
│   │   ├── TagSidebar.tsx
│   │   ├── TagCategory.tsx
│   │   └── TagItem.tsx
│   │
│   └── templates/             # Notification templates
│       ├── TemplateCard.tsx
│       ├── TemplateEditor.tsx
│       ├── MergeFieldToolbar.tsx
│       └── AttachmentList.tsx
│
├── modules/                   # Page modules
│   ├── territory/
│   │   ├── TerritoryPage.tsx
│   │   ├── ZipZonesTab.tsx
│   │   ├── ZoneGroupsTab.tsx
│   │   └── DepotsTab.tsx
│   │
│   ├── notifications/
│   │   ├── NotificationsPage.tsx
│   │   ├── TemplateGroupsTab.tsx
│   │   ├── AttachmentBuilderTab.tsx
│   │   └── CanvasEditor.tsx
│   │
│   └── clients/
│       ├── ClientsPage.tsx
│       ├── GeneralTab.tsx
│       ├── ServicesTab.tsx
│       ├── ScheduleTab.tsx
│       ├── ContactsTab.tsx
│       └── ContactModal.tsx
│
├── styles/
│   └── design-tokens.css      # CSS variables
│
└── lib/
    ├── constants.ts           # Color/spacing constants
    └── types.ts               # TypeScript interfaces
```

---

## 10. Next Steps

1. **Initialize React + Vite + Tailwind project**
2. **Create design tokens** (CSS variables + Tailwind config)
3. **Build atomic components** (Button, Badge, Toggle, Input, etc.)
4. **Build layout components** (PageHeader, Tabs, Card, Modal)
5. **Build data components** (DataTable, ExpandableRow, FilterBar)
6. **Build tag system** (TagSidebar with 10 categories)
7. **Build first module** (Territory - simplest structure)
8. **Add remaining modules** (Notifications, Clients)
9. **Integrate tag connectivity** (show menu connections)
10. **Build setup wizard** (AI-guided onboarding)

---

*Document generated from HTML analysis. All fields are required - do not remove or rename.*
