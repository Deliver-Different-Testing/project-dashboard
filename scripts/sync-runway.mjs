#!/usr/bin/env node
// Refresh src/data/automation-runway.json from a saved copy of the Automation
// Runway planner (the self-saving artifact). Usage:
//   node scripts/sync-runway.mjs path/to/automation-runway.html [artifactUrl]
// Save the planner page as HTML (File > Save Page As), run this, commit the JSON.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const [, , htmlPath, artifactUrlArg] = process.argv
if (!htmlPath) {
  console.error('usage: node scripts/sync-runway.mjs <automation-runway.html> [artifactUrl]')
  process.exit(1)
}
const html = readFileSync(resolve(htmlPath), 'utf8')
const match = html.match(/<script type="application\/json" id="state">([\s\S]*?)<\/script>/)
if (!match) {
  console.error('no <script id="state"> block found — is this the planner page?')
  process.exit(1)
}
const state = JSON.parse(match[1].replace(/<\\\//g, '</'))
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/automation-runway.json')
const previous = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : {}
const doc = {
  syncedAt: new Date().toISOString().slice(0, 10),
  artifactUrl: artifactUrlArg || previous.artifactUrl || '',
  settings: state.settings,
  teams: state.teams,
  functions: state.functions,
  projects: state.projects,
  actions: state.actions || [],
}
writeFileSync(out, JSON.stringify(doc, null, 2) + '\n')
console.log(`wrote ${out}: ${doc.projects.length} projects, ${doc.teams.length} teams, synced ${doc.syncedAt}`)
