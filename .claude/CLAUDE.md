# Project: Deliver Different Admin Settings Menu

## Quick Context Recovery

If context has been compacted, read these files:
- `TAG-SYSTEM-SPEC.md` - Tags are NAVIGATION, not labels
- `DESIGN-SYSTEM.md` - UI patterns, colors, components
- `files/deliver-different-project-report.md` - Full project overview

## Available Custom Agents

Use these to save main context:

| Agent | Use For | Invoke With |
|-------|---------|-------------|
| `browser-inspector` | UI testing, screenshots | `subagent_type: "browser-inspector"` |
| `codebase-explorer` | Find files, search code | `subagent_type: "codebase-explorer"` |
| `doc-reader` | Recover specs after compaction | `subagent_type: "doc-reader"` |
| `code-reviewer` | Check implementation vs specs | `subagent_type: "code-reviewer"` |
| `test-runner` | Run builds, tests | `subagent_type: "test-runner"` |

### When to Use Agents

- **Browser work**: ALWAYS use `browser-inspector` - never load Chrome MCP in main context
- **Searching**: Use `codebase-explorer` for multi-file searches
- **Lost context**: Use `doc-reader` to recover from specs
- **After coding**: Use `code-reviewer` to verify implementation

## Key Design Decisions

### Tag System (READ TAG-SYSTEM-SPEC.md)
- Tags show which OTHER settings pages relate to current item
- Click tag → Navigate to that page with pre-filled search
- Show ✓/✗ for connection existence, NOT lists of items
- Never display thousands of connected items inline

### Design Tokens
- Brand cyan: #43C7F4
- Brand dark: #14152D
- Secondary purple: #606DB4
- Spacing: 8pt scale (8, 16, 24, 32, 48px)
- Border radius: 8px default
- Transitions: 200ms normal, 500ms expand

## Project Structure

```
Nov 25 - Admin manager menu/
├── admin-ui/                    # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   └── modules/territory/   # Territory settings module
├── files/                       # Original HTML sources
├── DESIGN-SYSTEM.md            # Component specs
├── TAG-SYSTEM-SPEC.md          # Tag navigation spec
└── .claude/
    └── agents/                  # Custom agent definitions
```

## Dev Server

The Vite dev server runs on http://localhost:5173

Start with: `cd admin-ui && npm run dev`

## Don't Forget

1. Use agents to save context
2. Tags = navigation, not labels
3. Read specs when context resets
4. Commit after significant changes
