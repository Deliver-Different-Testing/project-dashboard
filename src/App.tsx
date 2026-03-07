import { useState, useEffect } from 'react'

interface Project {
  name: string
  emoji: string
  slug: string
  status: 'Active' | 'Complete' | 'Paused'
  description: string
  live?: string
  repo?: string
  docs?: string
}

const projects: Project[] = [
  { name: 'DFRNT CSP', emoji: '💬', slug: 'dfrnt-csp', status: 'Active', description: 'Unified inbox (email/chat/tasks), client health, Auto-Mate AI assistant', live: 'https://deliver-different-testing.github.io/DFRNT-CRM/', repo: 'https://github.com/Deliver-Different-Testing/DFRNT-CRM', docs: 'https://github.com/Deliver-Different-Testing/DFRNT-CRM/blob/main/IMPLEMENTATION.md' },
  { name: 'Setup Dashboard', emoji: '🧩', slug: 'setup-dashboard', status: 'Complete', description: '10-step tenant onboarding wizard with smart CSV import, training arena', live: 'https://deliver-different-testing.github.io/setup-dashboard/', repo: 'https://github.com/Deliver-Different-Testing/setup-dashboard', docs: 'https://github.com/Deliver-Different-Testing/setup-dashboard/blob/main/IMPLEMENTATION.md' },
  { name: 'Agents & Partners', emoji: '🤝', slug: 'agents-partners', status: 'Active', description: 'Fleet management, marketplace, courier compliance & recruitment', live: 'https://deliver-different-testing.github.io/NP-Agent-Management/', repo: 'https://github.com/Deliver-Different-Testing/NP-Agent-Management', docs: 'https://github.com/Deliver-Different-Testing/NP-Agent-Management/blob/main/IMPLEMENTATION.md' },
  { name: 'Reports', emoji: '📊', slug: 'reports', status: 'Active', description: 'Rate schedule, invoice builder (ported to Accounts)', live: 'https://deliver-different-testing.github.io/reports/', repo: 'https://github.com/Deliver-Different-Testing/reports' },
  { name: 'Dev Dashboard', emoji: '⚡', slug: 'dev-dashboard', status: 'Active', description: 'Dev activity tracking, GitLab MR stats', live: 'https://deliver-different-testing.github.io/dev-dashboard/', repo: 'https://github.com/Deliver-Different-Testing/dev-dashboard' },
  { name: 'Booking Redesign', emoji: '📦', slug: 'booking-redesign', status: 'Paused', description: 'Single-page booking with voice input, per-location accessorials', live: 'https://deliver-different-testing.github.io/booking-redesign/', repo: 'https://github.com/Deliver-Different-Testing/booking-redesign' },
  { name: 'Auto Dispatch', emoji: '🚀', slug: 'auto-dispatch', status: 'Active', description: 'AI-powered dispatch with HERE Maps, ECA Dallas MVP deadline', repo: 'https://github.com/Deliver-Different-Testing/auto-dispatch' },
  { name: 'ECA Dallas', emoji: '🏢', slug: 'eca-dallas', status: 'Active', description: 'Battlecard v2.0, 17-slide branded presentation, onboarding strategy' },
]

interface RunsheetEntry { ts: number; text: string }

const statusColors: Record<string, string> = {
  Active: 'bg-green-500',
  Complete: 'bg-blue-500',
  Paused: 'bg-amber-500',
}

function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<RunsheetEntry[]>([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('')
  const key = `runsheet-${project.slug}`

  useEffect(() => {
    const stored = localStorage.getItem(key)
    if (stored) setEntries(JSON.parse(stored))
  }, [key])

  const save = (e: RunsheetEntry[]) => { setEntries(e); localStorage.setItem(key, JSON.stringify(e)) }

  const addEntry = () => {
    if (!input.trim()) return
    const updated = [{ ts: Date.now(), text: input.trim() }, ...entries]
    save(updated)
    setInput('')
  }

  const deleteEntry = (ts: number) => save(entries.filter(e => e.ts !== ts))

  const filtered = filter ? entries.filter(e => e.text.toLowerCase().includes(filter.toLowerCase())) : entries

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-primary">
            <span className="mr-2">{project.emoji}</span>{project.name}
          </h3>
          <span className={`${statusColors[project.status]} text-white text-xs font-medium px-2.5 py-0.5 rounded-full`}>
            {project.status}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.live && <a href={project.live} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-cyan/10 text-cyan hover:bg-cyan/20 transition">🌐 Live</a>}
          {project.repo && <a href={project.repo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">📦 Repo</a>}
          {project.docs && <a href={project.docs} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">📄 Docs</a>}
          <button onClick={() => setOpen(!open)} className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition ${open ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            📋 Runsheet {entries.length > 0 && <span className="bg-white/20 rounded-full px-1.5">{entries.length}</span>}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <div className="flex gap-2 mb-3">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEntry()} placeholder="Add entry..." className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan/50" />
            <button onClick={addEntry} className="text-sm px-3 py-1.5 bg-cyan text-white rounded-lg hover:bg-cyan/80 transition font-medium">Add</button>
          </div>
          {entries.length > 3 && (
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter entries..." className="w-full text-sm px-3 py-1.5 rounded-lg border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-cyan/50" />
          )}
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">No entries yet</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filtered.map(e => (
                <div key={e.ts} className="flex items-start gap-2 text-sm bg-white rounded-lg p-2 border border-gray-100">
                  <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">{new Date(e.ts).toLocaleDateString()} {new Date(e.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="flex-1 text-gray-700">{e.text}</span>
                  <button onClick={() => deleteEntry(e.ts)} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-light-grey">
      <header className="bg-primary text-white px-6 py-4 shadow-lg">
        <h1 className="text-xl font-bold">⚡ DFRNT Project Dashboard</h1>
      </header>
      <main className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map(p => <ProjectCard key={p.slug} project={p} />)}
        </div>
      </main>
    </div>
  )
}
