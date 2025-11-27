# Project: Deliver Different Admin Settings Menu

## 🚨 MANDATORY: Use Workflow Orchestrator

**EVERY SESSION MUST START WITH:**
```
Use the workflow-orchestrator agent to begin this session.
```

The orchestrator will:
1. Run doc-reader to recover context
2. Verify dev server is running
3. Run browser-inspector to verify UI state
4. Report ready state

**NEVER call MCP tools directly. ALWAYS use agents.**

---

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

## Agent Workflow (13 Agents)

### Session Start (AUTO-RUN)
| Agent | Purpose |
|-------|---------|
| workflow-orchestrator | Master coordinator |
| doc-reader | Recover context from specs |
| browser-inspector | Verify UI state |

### During Implementation (AUTO-RUN)
| Agent | Trigger | Blocks? |
|-------|---------|---------|
| build-watcher | File save | YES |
| tag-compliance-checker | Component edit | YES |
| browser-inspector | File save | YES (errors) |

### Pre-Commit (AUTO-RUN)
| Agent | Purpose | Blocks? |
|-------|---------|---------|
| code-reviewer | Full spec check | YES |
| smoke-tester | Quick sanity | YES |
| visual-regression-tester | Screenshot diff | YES |
| integration-tester | Click flows | YES |

### On Request
| Agent | Purpose |
|-------|---------|
| plan-validator | Check plan vs specs |
| edge-case-tester | Boundary testing |
| accessibility-tester | A11y checks |
| debug-helper | Troubleshooting |

---

## COMMIT BLOCKING RULES

**CANNOT COMMIT if ANY agent fails:**
- build-watcher (TypeScript errors)
- tag-compliance-checker (spec violations)
- code-reviewer (design system violations)
- smoke-tester (app doesn't load)
- browser-inspector (console errors)

**Commit message MUST include agent pass list.**

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

### ✅ Agent Workflow System (COMPLETE - Nov 27, 2024)
- 13 agents defined in `.claude/agents/`
- Auto-run at checkpoints
- Commit blocking on failures

---

## Key Files

| File | Purpose |
|------|---------|
| `TAG-SYSTEM-SPEC.md` | How tags/connections work |
| `DESIGN-SYSTEM.md` | UI patterns, colors, components |
| `SESSION-SUMMARY.md` | Implementation status |
| `.claude/agents/` | All 13 agent definitions |
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

## Agents List

| # | Agent | Model | MCP | Auto-Run | Blocks |
|---|-------|-------|-----|----------|--------|
| 1 | workflow-orchestrator | sonnet | - | Session | - |
| 2 | doc-reader | haiku | - | Session | No |
| 3 | browser-inspector | haiku | chrome-devtools | File save | Yes |
| 4 | code-reviewer | sonnet | - | Pre-commit | Yes |
| 5 | plan-validator | sonnet | - | On request | No |
| 6 | build-watcher | haiku | - | File save | Yes |
| 7 | tag-compliance-checker | sonnet | - | Component | Yes |
| 8 | visual-regression-tester | haiku | playwright | Pre-commit | Yes |
| 9 | integration-tester | sonnet | playwright | Pre-commit | Yes |
| 10 | smoke-tester | haiku | chrome-devtools | Pre-commit | Yes |
| 11 | edge-case-tester | sonnet | - | On request | No |
| 12 | accessibility-tester | haiku | - | On request | No |
| 13 | debug-helper | sonnet | chrome-devtools | On error | No |

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

- [ ] Workflow orchestrator started session
- [ ] Read TAG-SYSTEM-SPEC.md
- [ ] Read DESIGN-SYSTEM.md
- [ ] Dev server running
- [ ] Understand: Tags = Navigation, NOT Labels
- [ ] Never display thousands of items inline
- [ ] All agents passing before commit
