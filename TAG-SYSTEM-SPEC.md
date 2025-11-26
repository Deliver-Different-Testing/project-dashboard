# Tag System Specification
## Deliver Different Admin Settings Menu

---

## 1. Core Concept: Tags as Relationship Navigator

### The Problem
Enterprise settings are a **web of interconnections, not a hierarchical tree**.

A single zip code might be:
- In 3 Zone Groups
- Which are assigned to 2 Depots
- Which have 5 Rate Cards attached
- Which are used by 10,000 Customers
- Who have access to 8 Services

**You cannot display these relationships inline** - showing "10,000 connected customers" on a zip code would make the UI unusable.

### The Solution
Tags are **navigation aids that show relationship existence and enable cross-navigation**.

They answer: "What OTHER parts of the system does this item connect to?"

---

## 2. Tag Categories (10 Total)

| # | Category | Icon | What It Represents |
|---|----------|------|-------------------|
| 1 | Region | 🌎 | Geographic regions this item operates in |
| 2 | Depot | 🏢 | Physical depot locations connected |
| 3 | Country | 🌍 | Countries for international routing |
| 4 | Customer | 👤 | Customer accounts that use/see this |
| 5 | Service | ⚡ | Service types that apply |
| 6 | Vehicle | 🚚 | Vehicle types that can service this |
| 7 | Notification | 🔔 | Notification templates that trigger |
| 8 | Rate Card | 💰 | Pricing configurations applied |
| 9 | Airport | ✈️ | Airport codes for airfreight |
| 10 | Linehaul | 🚛 | Linehaul routes connected |

---

## 3. How Tags Display

### 3.1 On an Item Row (Collapsed State)
```
┌─────────────────────────────────────────────────────────────────┐
│ [Toggle] Zip Code 10001    [Stats]    [6 Connections]  [▼]     │
└─────────────────────────────────────────────────────────────────┘
```

The button shows **connection count** (not tag count). "6 Connections" means this item has relationships to 6 different tag categories.

### 3.2 In the Tag Sidebar (Expanded)
```
┌──────────────────────────────────────┐
│ Connections for: Zip Code 10001      │
│ "See which parts of the system       │
│  this item relates to"               │
├──────────────────────────────────────┤
│                                      │
│ ✓ CUSTOMERS          [→ View]        │  ← Has connections
│   Connected via 3 zone groups        │
│                                      │
│ ✓ ZONE GROUPS        [→ View]        │  ← Has connections
│   Member of 3 groups                 │
│                                      │
│ ✓ DEPOTS             [→ View]        │  ← Has connections
│   Serviced by 2 depots               │
│                                      │
│ ✓ RATE CARDS         [→ View]        │  ← Has connections
│   4 rate cards apply                 │
│                                      │
│ ✗ AIRPORTS                           │  ← NO connections (problem?)
│   Not connected to any airports      │
│                                      │
│ ✗ LINEHAUL                           │  ← NO connections
│   No linehaul routes                 │
│                                      │
└──────────────────────────────────────┘
```

### 3.3 Visual States

| State | Display | Meaning |
|-------|---------|---------|
| ✓ Connected | Cyan highlight, clickable | Relationships exist - click to explore |
| ✗ Not Connected | Gray, muted | No relationships - might be a config issue |
| ⚠ Partial | Orange/warning | Some expected connections missing |

---

## 4. Tag Click Behavior

When you click a tag category (e.g., "Customers"):

1. **Navigate** to that settings module (Customers page)
2. **Pre-search** for the item you came from
3. **Filter** to show only related items

### Example Flow:
```
1. User is editing: Zip Code 10001
2. User clicks: [Customers →]
3. System does:
   - Opens /settings/customers
   - Sets search filter to "10001"
   - Shows customers whose zone groups contain zip 10001
4. User sees: List of customers connected to this zip code
```

This lets you:
- See the 10,000 customers without cluttering the zip code page
- Debug why a customer can't see a zip code
- Trace the relationship chain

---

## 5. Connection Detection (How It Works)

### 5.1 Direct Connections
Item A directly references Item B in its data.

```
Zone Group "Manhattan Express" → zips: ["10001", "10002", "10003"]
```
Zip 10001 is DIRECTLY connected to Zone Group "Manhattan Express"

### 5.2 Indirect Connections (Transitive)
Item A connects to Item B through intermediate items.

```
Customer "1976 Limited"
  → uses Zone Group "Manhattan Express"
    → which contains Zip 10001
```
Zip 10001 is INDIRECTLY connected to Customer "1976 Limited"

### 5.3 Connection Depth
The system should trace connections up to N levels deep (suggest: 3-4 levels).

```
Zip → Zone Group → Depot → Rate Card → Customer
 1        2          3         4           5
```

For MVP: Show direct connections only (1 level)
For V2: Add transitive connection tracing

---

## 6. The Tag Search Feature

Every settings page has a **Tag Search** input that lets you:
- Search by any connected entity
- Find items by their relationships

### Example: On Customers Page
```
┌─────────────────────────────────────────────────────────────┐
│ Tag Search: [10001                                    ] 🔍  │
└─────────────────────────────────────────────────────────────┘

Results: 847 customers connected to zip code 10001
- 1976 Limited (via Manhattan Express zone group)
- Acme Corp (via Manhattan Express zone group)
- Global Logistics (via NYC Metro zone group)
...
```

This is where the "thousands of connections" get displayed - in a searchable, paginated list on the TARGET page, not inline on the source item.

---

## 7. Debugging Use Case

### Scenario: "Why can't Customer X book to zip code 10001?"

**Step 1: Open Zip Code 10001**
```
Connections:
✓ Zone Groups (3)    [→ View]
✓ Depots (2)         [→ View]
✗ Customers          ← RED FLAG
✗ Rate Cards         ← RED FLAG
✓ Services (4)       [→ View]
```

**Step 2: Identify the problem**
No customers and no rate cards are connected. This zip code exists but isn't priced or assigned.

**Step 3: Click [Zone Groups →]**
Opens zone groups page, filtered to show groups containing 10001.
Check if these groups are assigned to any customers.

**Step 4: Trace the break**
Find where the chain breaks:
- Zip → Zone Group ✓
- Zone Group → Depot ✓
- Depot → Rate Card ✗ ← PROBLEM: No rate card assigned to depot
- Rate Card → Customer ✗

---

## 8. Implementation Architecture

### 8.1 Data Model Addition

Each entity type gets a computed `connections` property:

```typescript
interface EntityConnections {
  customers: ConnectionInfo;
  zoneGroups: ConnectionInfo;
  depots: ConnectionInfo;
  rateCards: ConnectionInfo;
  services: ConnectionInfo;
  vehicles: ConnectionInfo;
  notifications: ConnectionInfo;
  airports: ConnectionInfo;
  linehauls: ConnectionInfo;
  regions: ConnectionInfo;
}

interface ConnectionInfo {
  hasConnections: boolean;      // For quick ✓/✗ display
  count: number;                // "Connected via 3 zone groups"
  connectionPath?: string;      // "via Manhattan Express zone group"
  // NOT the actual list - that's fetched on demand
}
```

### 8.2 Tag Sidebar Component

```typescript
interface TagSidebarProps {
  isOpen: boolean;
  onClose: () => void;

  // Context: What item are we showing connections for?
  sourceItem: {
    type: 'zipZone' | 'zoneGroup' | 'depot' | 'customer' | etc;
    id: string;
    name: string;
  };

  // Computed connections for this item
  connections: EntityConnections;

  // Navigation callback
  onNavigate: (targetModule: string, searchQuery: string) => void;
}
```

### 8.3 Navigation Flow

```typescript
// When user clicks a tag category
function handleTagClick(category: string) {
  const targetRoute = MODULE_ROUTES[category]; // e.g., '/settings/customers'
  const searchQuery = sourceItem.name;          // e.g., '10001'

  // Navigate to target page with pre-filled search
  navigate(`${targetRoute}?tagSearch=${searchQuery}`);

  // Or emit event for parent to handle
  onNavigate(category, searchQuery);
}
```

### 8.4 Connection Computation (Backend/Service)

```typescript
// This would be a service that computes connections
// Can be done client-side for MVP with sample data
// Should be backend API for production with real data

function computeConnections(itemType: string, itemId: string): EntityConnections {
  // Trace direct relationships
  // Optionally trace indirect relationships
  // Return summary (not full lists)
}
```

---

## 9. UI Components Needed

### 9.1 ConnectionBadge (replaces current Tags button)
Shows count of connected categories, not tags.

```typescript
interface ConnectionBadgeProps {
  connectionCount: number;  // How many categories have connections
  onClick: () => void;      // Opens the Tag Sidebar
}

// Display: "6 Connections" or "3 Links" or similar
```

### 9.2 TagSidebar (refactored)
Shows connection status per category with navigation.

### 9.3 TagSearchInput
Search input on each page that filters by connected entities.

### 9.4 ConnectionIndicator
Visual indicator (✓/✗/⚠) for each category in sidebar.

---

## 10. MVP vs Full Implementation

### MVP (Phase 1)
- [ ] Display connection counts (can be mocked/estimated for now)
- [ ] Tag Sidebar shows categories with ✓/✗ status
- [ ] Clicking navigates to target page
- [ ] Target page has Tag Search input
- [ ] Direct connections only (1 level)

### Full (Phase 2)
- [ ] Backend API for real connection computation
- [ ] Transitive connections (multi-level tracing)
- [ ] Connection path display ("via Zone Group X")
- [ ] Warning indicators for broken/missing connections
- [ ] Bulk connection analysis ("show all unconnected zip codes")

---

## 11. Key Principles (Do Not Violate)

1. **Never list thousands of items inline** - Use navigation + search instead
2. **Tags show existence, not content** - ✓/✗, not the actual 10,000 customers
3. **Click to explore, don't expand to see** - Navigation, not accordions
4. **Search is the interface for large lists** - Tag Search on every page
5. **Connections are computed, not stored** - Don't duplicate data
6. **Missing connections are informative** - ✗ helps debugging

---

## 12. Terminology

| Term | Meaning |
|------|---------|
| Connection | A relationship between two entities (direct or indirect) |
| Tag Category | One of the 10 system areas (Customers, Depots, etc.) |
| Tag Search | Search input that filters by connected entities |
| Connection Badge | The button showing "6 Connections" on a row |
| Tag Sidebar | Panel showing which categories have connections |
| Source Item | The item you're currently viewing/editing |
| Target Module | The settings page you navigate TO |

---

*This document is the source of truth for tag system implementation.
Read this before implementing any tag-related features.*
