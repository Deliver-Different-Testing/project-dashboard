// Automation Runway: a snapshot of Marcus's planner (the self-saving artifact)
// plus a port of its trigger engine, so the dashboard can show the plan and the
// Sprint board can compare it with what is actually scheduled.
// Refresh the snapshot with `npm run sync-runway -- <saved planner html>`.
import runwayData from './data/automation-runway.json'

export interface RunwayTeam { id: string; name: string; rate: number; current: number; target: number; note?: string }
export interface RunwayFunction { id: string; name: string; who: string }
export type RunwayStatus = 'planned' | 'active' | 'done'
export interface RunwayProject {
  id: string
  fn: string
  name: string
  owner: string
  start: string // YYYY-MM
  end: string   // YYYY-MM
  status: RunwayStatus
  hours: Record<string, number>
  cost: number
  note?: string
  stream?: string
}
export interface RunwayAction { id: string; teamId: string; date: string }
export interface RunwayData {
  syncedAt: string
  artifactUrl: string
  settings: { fteHours: number; thresholdPct: number; leadWeeks: number }
  teams: RunwayTeam[]
  functions: RunwayFunction[]
  projects: RunwayProject[]
  actions: RunwayAction[]
}

export const RUNWAY = runwayData as unknown as RunwayData
export const RUNWAY_PROJECT_BY_ID = new Map(RUNWAY.projects.map(project => [project.id, project]))
export const RUNWAY_FUNCTION_BY_ID = new Map(RUNWAY.functions.map(fn => [fn.id, fn]))
export const TEAM_SHORT: Record<string, string> = { cs: 'CS', dispatch: 'Disp', ops: 'Ops', sales: 'Sales', finance: 'Fin' }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function ymIdx(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return y * 12 + (m - 1)
}
export function idxYm(i: number) {
  return `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`
}
export function ymLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS[m - 1]} ${String(y).slice(2)}`
}
export function ymEndIso(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return `${ym}-${String(last).padStart(2, '0')}`
}
export function fmtK(value: number) {
  if (value === 0) return '$0'
  if (value >= 995000) return '$' + (value / 1e6).toFixed(2).replace(/0$/, '') + 'M'
  return '$' + Math.round(value / 1000) + 'K'
}

export function projectHours(project: RunwayProject, teamId: string) {
  return Number(project.hours?.[teamId]) || 0
}
export function projectHoursTotal(project: RunwayProject) {
  return Object.values(project.hours || {}).reduce((sum, value) => sum + (Number(value) || 0), 0)
}
export function hoursLabel(hours: Record<string, number>) {
  return Object.entries(hours).filter(([, value]) => value > 0).map(([team, value]) => `${TEAM_SHORT[team] || team} ${Math.round(value)}h`).join(' · ')
}
export function projectHoursLabel(project: RunwayProject) {
  const parts = hoursLabel(project.hours || {})
  const cost = Number(project.cost) || 0
  return [parts, cost > 0 ? `${fmtK(cost)}/yr` : ''].filter(Boolean).join(' · ')
}

export function runwayMonthRange(data: RunwayData = RUNWAY) {
  let lo = ymIdx('2026-09'), hi = ymIdx('2027-08')
  for (const project of data.projects) {
    lo = Math.min(lo, ymIdx(project.start))
    hi = Math.max(hi, ymIdx(project.end))
  }
  const months: { i: number; ym: string; label: string }[] = []
  for (let i = lo; i <= hi; i += 1) months.push({ i, ym: idxYm(i), label: ymLabel(idxYm(i)) })
  return months
}

export interface Crossing { n: number; ym: string }
export interface TeamProjection {
  team: RunwayTeam
  capN: number
  totalHrs: number
  bankedHrs: number
  potentialN: number
  crossings: Crossing[]
  opsNeeded?: number
}

/**
 * Port of the planner's trigger engine. The nth reduction for a team is reached
 * when cumulative hours saved (by planned finish month) reach n − (1 − threshold)
 * FTEs; e.g. at 85% the first fires at 0.85 FTE, the second at 1.85. Ops Managers
 * fire once the combined CS + Dispatch headcount has been halved.
 */
export function projectRunway(data: RunwayData = RUNWAY): TeamProjection[] {
  const H = data.settings.fteHours || 40
  const thr = (data.settings.thresholdPct || 85) / 100
  const results: TeamProjection[] = []
  for (const team of data.teams) {
    if (team.id === 'ops') continue
    const totalHrs = data.projects.reduce((sum, project) => sum + projectHours(project, team.id), 0)
    const bankedHrs = data.projects.filter(project => project.status === 'done').reduce((sum, project) => sum + projectHours(project, team.id), 0)
    const capN = Math.floor(Math.max(0, team.current - team.target))
    const sequence = data.projects.filter(project => projectHours(project, team.id) > 0).sort((a, b) => ymIdx(a.end) - ymIdx(b.end))
    const crossings: Crossing[] = []
    let cumulative = 0
    let n = 1
    for (const project of sequence) {
      cumulative += projectHours(project, team.id) / H
      while (n <= capN && cumulative >= n - (1 - thr) - 1e-9) {
        crossings.push({ n, ym: project.end })
        n += 1
      }
    }
    let potentialN = 0
    for (let k = 1; k <= capN; k += 1) if (totalHrs / H >= k - (1 - thr) - 1e-9) potentialN = k
    results.push({ team, capN, totalHrs, bankedHrs, potentialN, crossings })
  }
  const ops = data.teams.find(team => team.id === 'ops')
  if (ops) {
    const cs = results.find(result => result.team.id === 'cs')
    const dispatch = results.find(result => result.team.id === 'dispatch')
    const capN = Math.floor(Math.max(0, ops.current - ops.target))
    const totalHrs = data.projects.reduce((sum, project) => sum + projectHours(project, 'ops'), 0)
    const bankedHrs = data.projects.filter(project => project.status === 'done').reduce((sum, project) => sum + projectHours(project, 'ops'), 0)
    let crossings: Crossing[] = []
    let potentialN = 0
    let opsNeeded: number | undefined
    if (cs && dispatch) {
      opsNeeded = Math.ceil((cs.team.current + dispatch.team.current) / 2)
      const all = [...cs.crossings, ...dispatch.crossings].sort((a, b) => ymIdx(a.ym) - ymIdx(b.ym))
      if (capN > 0 && all.length >= opsNeeded) crossings = [{ n: 1, ym: all[opsNeeded - 1].ym }]
      potentialN = cs.potentialN + dispatch.potentialN >= opsNeeded ? capN : 0
    }
    results.push({ team: ops, capN, totalHrs, bankedHrs, potentialN, crossings, opsNeeded })
  }
  return data.teams.map(team => results.find(result => result.team.id === team.id)!).filter(Boolean)
}

export function fullPlanPotential(data: RunwayData = RUNWAY) {
  const projections = projectRunway(data)
  const people = projections.reduce((sum, projection) => sum + projection.potentialN * projection.team.rate, 0)
  const cash = data.projects.reduce((sum, project) => sum + (Number(project.cost) || 0), 0)
  return people + cash
}

/** Reductions reached under an arbitrary landing order (used for the Sprint board's projection). */
export function crossingsForSchedule(capN: number, landings: { position: number; hours: number }[], settings = RUNWAY.settings): { n: number; position: number }[] {
  const H = settings.fteHours || 40
  const thr = (settings.thresholdPct || 85) / 100
  const ordered = [...landings].sort((a, b) => a.position - b.position)
  const crossings: { n: number; position: number }[] = []
  let cumulative = 0
  let n = 1
  for (const landing of ordered) {
    cumulative += landing.hours / H
    while (n <= capN && cumulative >= n - (1 - thr) - 1e-9) {
      crossings.push({ n, position: landing.position })
      n += 1
    }
  }
  return crossings
}

export const RUNWAY_FUNCTION_STYLE: Record<string, { bar: string; outline: string; dot: string; text: string }> = {
  intake: { bar: 'bg-blue-600 text-white', outline: 'border-2 border-blue-600 text-blue-700', dot: 'bg-blue-600', text: 'text-blue-700' },
  dispatch: { bar: 'bg-emerald-600 text-white', outline: 'border-2 border-emerald-600 text-emerald-700', dot: 'bg-emerald-600', text: 'text-emerald-700' },
  support: { bar: 'bg-violet-600 text-white', outline: 'border-2 border-violet-600 text-violet-700', dot: 'bg-violet-600', text: 'text-violet-700' },
  reporting: { bar: 'bg-amber-600 text-white', outline: 'border-2 border-amber-600 text-amber-700', dot: 'bg-amber-600', text: 'text-amber-700' },
}
export function functionStyle(fnId: string) {
  return RUNWAY_FUNCTION_STYLE[fnId] ?? { bar: 'bg-gray-600 text-white', outline: 'border-2 border-gray-500 text-gray-700', dot: 'bg-gray-500', text: 'text-gray-700' }
}
