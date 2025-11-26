# Project: Deliver Different Admin Settings Menu

## 🚨 START HERE - Read Before Doing Anything

### Step 1: Read the Specs
```
TAG-SYSTEM-SPEC.md     ← CRITICAL - Tags are NAVIGATION, not labels
DESIGN-SYSTEM.md       ← UI patterns, colors, components
SESSION-SUMMARY.md     ← What's been built, what's next
```

### Step 2: Start Dev Server
```bash
cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui"
npm run dev
```
Opens at http://localhost:5173

---

## The Most Important Thing: Tag System

**Tags are NOT labels. Tags are NAVIGATION.**

```
✓ CUSTOMERS (847)  [→ View]   ← Click opens Customers page with search
✗ AIRPORTS                    ← No connection = potential problem
```

### 5 Rules (DO NOT VIOLATE):
1. **Never list thousands of items inline** - Navigate + search instead
2. **Tags show existence (✓/✗)** - Not the actual customer names
3. **Click to navigate** - Don't expand to show items
4. **Missing connections help debugging** - ✗ means potential issue
5. **TagSearchInput on every page** - Filter by connected entities

---

## What's Already Built

### ✅ Tag Navigation System (COMPLETE)
- `TagSidebar` - Shows 10 connection categories with ✓/✗
- `ConnectionBadge` - "7 Connections" button with warning state
- `TagSearchInput` - Filter input on every page
- Cross-page navigation with pre-filled search

### ✅ Territory Module (COMPLETE)
- 3 tabs: Zip Zones, Zone Groups, Depots
- ExpandableRow with connection badges
- Sample data: 53 zips, 12 zone groups, 8 depots
- Connection data for all items

### ✅ Design System (COMPLETE)
- `DESIGN-SYSTEM.md` - 2000+ lines of specs
- Tailwind config with design tokens
- All UI components built

---

## Key Files

| File | Purpose |
|------|---------|
| `TAG-SYSTEM-SPEC.md` | How tags/connections work |
| `DESIGN-SYSTEM.md` | UI patterns, colors, components |
| `SESSION-SUMMARY.md` | Implementation status |
| `admin-ui/src/modules/territory/types.ts` | EntityConnections, SourceItem |
| `admin-ui/src/components/tags/` | TagSidebar, ConnectionBadge, TagSearchInput |

---

## Design Tokens

```
Colors:
  brand-cyan:    #43C7F4
  brand-dark:    #14152D
  secondary:     #606DB4

Spacing (8pt): 4, 8, 16, 24, 32, 48px
Border radius: 8px
Transitions: 200ms normal, 500ms expand
```

---

## Custom Agents (May Not Work)

These are defined in `.claude/agents/` but may not be available:
- `browser-inspector` - Chrome DevTools
- `codebase-explorer` - Find files
- `doc-reader` - Recover specs
- `code-reviewer` - Verify vs specs
- `test-runner` - Build/test

**If they don't work, use:**
- `subagent_type: "Explore"` for codebase search
- `subagent_type: "general-purpose"` for complex tasks

---

## Git Commits

```
e5aa7b9 - Tag navigation system with ConnectionBadge and TagSearchInput
f8be941 - Custom agents for context-efficient workflows
6f998d6 - Tag System specification
7a600bd - Territory module with modular tabs
```

---

## Checklist Before Making Changes

- [ ] Read TAG-SYSTEM-SPEC.md
- [ ] Read DESIGN-SYSTEM.md
- [ ] Start dev server
- [ ] Understand: Tags = Navigation, NOT Labels
- [ ] Never display thousands of items inline
