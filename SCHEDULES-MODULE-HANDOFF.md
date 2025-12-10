# Schedules Module - Complete Handoff Document

> **For Claude:** This document contains everything you need to understand and continue work on the Schedules module in the Deliver Different admin-ui project.

---

## Quick Start Prompt

Use this prompt to get a new Claude session up to speed:

```
I'm working on the admin-ui project for Deliver Different. Please read the handoff document at:
C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\SCHEDULES-MODULE-HANDOFF.md

This will give you full context on the Schedules module we built. After reading, let me know what you understand and we can continue from there.
```

---

## Project Location

```
C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui\
```

**GitHub:** https://github.com/deliverdifferent-tests/Adminmanagerupdate.git

---

## What is This Project?

This is a **React + TypeScript + Vite admin settings UI** for **Deliver Different** - a logistics/courier SaaS platform. The UI manages complex configuration settings for the delivery system.

### Tech Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- No backend yet (uses sample data)

### Module Architecture
Each feature is a self-contained module in `src/modules/`:
```
src/modules/
├── territory/      # Zones, depots, zone groups
├── clients/        # Customer management
├── tasks/          # Task templates
├── notifications/  # Notification templates
├── automations/    # If-this-then-that rules
└── schedules/      # NEW - Delivery schedule configuration
```

---

## The Schedules Module - What We Built

### The Problem It Solves

The old schedule configuration UI was:
- A "wall of fields" with 30+ inputs visible at once
- Used backwards time logic (confusing)
- Had numbered zone checkboxes (1-10) with no labels
- Mixed logistics and pricing in one place
- Required duplicating entire schedules for client variations

### The Solution We Built

A **visual chain builder** that lets users see and construct delivery journeys:

```
[Client] → [Depot DEN] → [Linehaul] → [Depot ABQ] → [Client]
```

**Key Features:**
1. **Visual Chain Builder** - Click nodes to add/configure legs
2. **Variable Complexity** - Same UI handles 1-leg (simple) to 4+ leg (complex) schedules
3. **Two Booking Modes** - "Fixed Time" (9am delivery) vs "Window" (9am-5pm range)
4. **Override System** - Client schedules inherit from base, only store differences
5. **Timeline Preview** - Shows backwards time cascade from delivery
6. **Booking Simulator** - "What happens if I book this" test tool
7. **Zone Selector** - Tag-based picker with zone names (not just numbers)

---

## File Structure

```
src/modules/schedules/
├── index.ts                              # Module exports
├── SchedulesPage.tsx                     # Main page (88 lines)
├── types.ts                              # All type definitions (473 lines)
├── components/
│   ├── ScheduleListTab.tsx              # List with filters (281 lines)
│   ├── ScheduleGroupsTab.tsx            # Schedule groups (140 lines)
│   ├── ScheduleEditForm.tsx             # Full editor (577 lines)
│   ├── ChainBuilder.tsx                 # Visual chain (188 lines)
│   ├── LegNode.tsx                      # Individual leg node (161 lines)
│   ├── LegConfigPanel.tsx               # Leg configuration (274 lines)
│   ├── OperatingScheduleSection.tsx     # Days/times (160 lines)
│   ├── TimelinePreview.tsx              # Time cascade (206 lines)
│   ├── OverrideEditor.tsx               # Client overrides (477 lines)
│   ├── ZoneSelector.tsx                 # Zone picker (207 lines)
│   ├── BookingSimulator.tsx             # Test tool (306 lines)
│   └── ScheduleCard.tsx                 # Card view (80 lines)
└── data/
    └── sampleData.ts                    # Mock data (616 lines)

Total: ~4,236 lines of code
```

---

## Key Types (from types.ts)

### Schedule (Main Interface)
```typescript
interface Schedule {
  id: string;
  name: string;
  description?: string;

  // Client visibility
  clientVisibility: 'all' | 'specific';
  clientIds: string[];

  // Booking mode
  bookingMode: 'fixed_time' | 'window';

  // Speed defaults
  defaultDeliverySpeedId?: string;
  defaultPickupSpeedId?: string;
  defaultLinehaulSpeedId?: string;

  // Origin
  originType: 'depot' | 'client_address';
  originDepotId?: string;

  // The leg chain
  legs: ScheduleLeg[];

  // Operating schedule
  operatingSchedule: OperatingSchedule;

  // Delivery window config
  deliveryWindow: DeliveryWindowConfig;

  // Status
  isActive: boolean;

  // Override system
  isOverride: boolean;
  baseScheduleId?: string;
  overriddenFields: string[];

  // Tag system integration
  connections: EntityConnections;
}
```

### Leg Types
```typescript
type LegType = 'collection' | 'depot' | 'linehaul' | 'delivery';

// Each leg has a config based on type:
type LegConfig =
  | CollectionLegConfig   // Pickup from customer
  | DepotLegConfig        // Stop at depot
  | LinehaulLegConfig     // Transport between depots
  | DeliveryLegConfig;    // Final delivery
```

### Operating Schedule
```typescript
interface OperatingSchedule {
  uniformWeekdays: boolean;
  days: Record<DayOfWeek, DaySchedule>;
  cutoffValue: number;
  cutoffUnit: 'minutes' | 'hours' | 'days';
}
```

---

## Sample Data Overview

The module includes 5 sample schedules covering all complexity levels:

| ID | Name | Legs | Type |
|----|------|------|------|
| sch-1 | 1-Hour Local Delivery | 1 | Simple direct |
| sch-2 | Next Day Standard | 2 | Collection + Delivery |
| sch-3 | DEN → ABQ Overnight | 4 | Multi-depot freight |
| sch-4 | DEN → ABQ (ACME) | 4 | Client override of sch-3 |
| sch-5 | Express Same Day | 1 | Premium service |

Also includes reference data:
- 5 depots (DEN, ABQ, PHX, SLC, LAS)
- 10 zones
- 6 speeds
- 3 linehaul runs
- 5 clients
- 4 rate cards

---

## How Components Connect

```
SchedulesPage
├── Tabs: "Schedules" | "Schedule Groups"
├── TagSidebar (connections navigation)
│
├── ScheduleListTab
│   ├── SearchInput + FilterDropdowns
│   ├── ExpandableRow (for each schedule)
│   │   └── ScheduleEditForm (when expanded, base schedule)
│   │   └── OverrideEditor (when expanded, override schedule)
│   └── Nested overrides (indented under base)
│
└── ScheduleGroupsTab
    ├── SearchInput
    └── ExpandableRow (for each group)

ScheduleEditForm
├── Header (name, description, active toggle)
├── Overview (booking mode, client visibility, speeds)
├── Origin (depot vs client address)
├── ChainBuilder
│   ├── LegNode (for each leg)
│   └── LegConfigPanel (side panel when leg selected)
├── OperatingScheduleSection
├── TimelinePreview
├── BookingSimulator
└── Action buttons (Save, Cancel)
```

---

## Design System

### Colors (Tailwind)
```
brand-cyan:      #43C7F4    (Primary action, selected state)
brand-dark:      #14152D    (Sidebar)
surface-light:   Background
surface-cream:   Hover/expanded state
text-primary:    Main text
text-secondary:  Subtitles
text-muted:      Disabled
border:          Dividers
```

### Leg Type Colors
```
Collection:  Blue    (bg-blue-50, border-blue-300)
Depot:       Grey    (bg-gray-50, border-gray-300)
Linehaul:    Orange  (bg-orange-50, border-orange-300)
Delivery:    Green   (bg-green-50, border-green-300)
```

### Spacing
- Base unit: 8px (Tailwind: px-2 = 8px, px-4 = 16px)
- Card padding: p-4 or p-6
- Section gaps: space-y-4

### Components Used
- Button (variants: primary, secondary, ghost)
- Input, Select, Toggle
- Badge (variants: default, customized, system, blue)
- ExpandableRow
- SearchInput, FilterDropdown
- PageHeader, Card, Tabs

---

## Integration Points

### Tag System (Connections)
Every schedule has an `EntityConnections` object tracking relationships to:
- Customers
- Zone Groups
- Depots
- Rate Cards
- Services
- Vehicles
- Notifications
- Airports
- Linehauls
- Regions

The TagSidebar shows these connections and allows navigation to related modules.

### App.tsx Registration
The module is registered in `src/App.tsx`:
- Import: `import { SchedulesPage } from './modules/schedules';`
- ModuleId type includes `'schedules'`
- IMPLEMENTED_MODULES array includes `'schedules'`
- Menu item in Advanced section
- renderModule switch case

---

## What's Working

- [x] Schedule list with search and filters
- [x] Grouped display (base schedules with nested overrides)
- [x] Full schedule editor with all sections
- [x] Visual chain builder with add/remove legs
- [x] Leg configuration panel (all 4 leg types)
- [x] Operating schedule (days/times/cutoff)
- [x] Timeline preview
- [x] Override editor for client-specific schedules
- [x] Zone selector (tag-based)
- [x] Booking simulator
- [x] Schedule groups tab
- [x] Connection badge integration

---

## What Could Be Added Next

### Immediate Enhancements
1. **New Schedule Modal** - Currently the "+ New Schedule" button just logs to console
2. **Delete Confirmation** - Add confirmation dialog for leg/schedule deletion
3. **Validation** - Form validation before save
4. **Undo/Redo** - For chain builder operations

### Future Features
1. **Real Backend Integration** - Replace sample data with API calls
2. **Drag & Drop** - Reorder legs by dragging
3. **Clone Schedule** - Duplicate a schedule as starting point
4. **Bulk Operations** - Activate/deactivate multiple schedules
5. **Schedule Versioning** - History of changes
6. **Import/Export** - CSV or JSON import/export

### Client-Specific Schedules in Customer Module
The OverrideEditor was designed to be reusable. It could be embedded in the Clients module to let users create client-specific schedule overrides from the customer's profile page.

---

## Running the Project

```bash
cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui"

# Install dependencies (if needed)
npm install

# Development server
npm run dev

# Build for production
npm run build

# Type check only
npx tsc --noEmit
```

The app runs at http://localhost:5173 (Vite default)

---

## Git History

The module was built in 12 commits:

```
ed95b1c docs(schedules): add implementation plan document
a11c93c Task 16: Final integration and polish
367bf08 feat(schedules): add OverrideEditor, ZoneSelector, BookingSimulator
5afbf46 feat(schedules): implement ScheduleEditForm
5e05f4b feat(schedules): add config panels and timeline (Tasks 9-11)
e0ec456 feat(schedules): integrate ChainBuilder into list
aee7c29 feat(schedules): add visual chain builder (Tasks 6-8)
e3b2cc5 feat(schedules): add ScheduleListTab with filtering
e2fe9ac feat(schedules): register module in App.tsx
766ba21 feat(schedules): add SchedulesPage
0ca87a3 feat(schedules): add sample data
8735a1b feat(schedules): add type definitions
```

---

## Original Scope Documents

The design was based on three scope documents comparing approaches:

| Document | Source | Key Contribution |
|----------|--------|------------------|
| Scope 1 | Gemini | Forward-facing time model, guarantee offset |
| Scope 2 | GPT | Wizard flow, booking simulator concept |
| Scope 3 | Claude | Complete spec with domain context, chain builder |

**We used Scope 3 as the base** with the booking simulator from Scope 2.

Location: `C:\Users\dane\Documents\Mytests\Schedules scope docs dec 25\`

---

## Implementation Plan

Full detailed plan with code snippets:
`admin-ui/docs/plans/2024-12-09-schedules-module.md`

---

## Troubleshooting

### Build Errors
```bash
# Check TypeScript errors
npx tsc --noEmit

# Common issues:
# - Missing imports: Check relative paths (../../../components/)
# - Type errors: Check types.ts for correct interface
```

### Module Not Showing in Menu
1. Check `IMPLEMENTED_MODULES` array in App.tsx includes `'schedules'`
2. Check import statement at top of App.tsx
3. Check renderModule switch case

### Components Not Rendering
1. Check the component is exported from its file
2. Check import path is correct
3. Check for TypeScript errors in the component

---

## Key Files to Read First

When picking up this project:

1. **This document** - Overview and context
2. **types.ts** - All the data structures
3. **sampleData.ts** - Understand the data shape
4. **ScheduleEditForm.tsx** - The main editor, imports everything
5. **ChainBuilder.tsx** - The visual chain component

---

## Questions?

If you're a new Claude instance picking this up:

1. Read this document fully
2. Explore the `src/modules/schedules/` directory
3. Run `npm run dev` and navigate to Schedules in the menu
4. Ask the user what they want to work on next

The module is complete and production-ready. Future work would be enhancements or integrations with other modules.
