import { useMemo, useState } from 'react'
import { getCasesForUser, addCase, addActivity, formatDateTime } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/Badge'
import { sha256Hex } from '../lib/hash'

const STAGE_TONE = { Active: 'info', 'Under Review': 'warning', Closed: 'neutral' }
const PRIORITY_TONE = { High: 'danger', Medium: 'warning', Low: 'neutral' }

export default function Cases() {
  const { user, canUpload } = useAuth()
  const [cases, setCases] = useState(() => getCasesForUser(user))
  const [query, setQuery] = useState('')
  const [stageFilter, setStageFilter] = useState('All')
  const [showNewCase, setShowNewCase] = useState(false)
  const [newCase, setNewCase] = useState({ title: '', priority: 'Medium', suspectName: '', suspectEmail: '', aadhaarCard: null })
  const [caseError, setCaseError] = useState('')
  const [creatingCase, setCreatingCase] = useState(false)

  const filteredCases = useMemo(() => cases.filter((c) => {
    const q = query.toLowerCase()
    return (!q || c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
      && (stageFilter === 'All' || c.stage === stageFilter)
  }), [cases, query, stageFilter])

  async function handleCreateCase(event) {
    event.preventDefault()
    if (!newCase.title.trim() || !newCase.aadhaarCard) {
      setCaseError('Case title and suspect Aadhaar card are required.')
      return
    }
    setCreatingCase(true)
    setCaseError('')
    const aadhaarHash = await sha256Hex(newCase.aadhaarCard)
    const record = {
      id: `C-${Date.now().toString().slice(-4)}`,
      title: newCase.title.trim(), state: user.state, district: user.district, thana: user.thana,
      stage: 'Active', priority: newCase.priority,       updated: 'Just now', updatedAt: new Date().toISOString(),
      suspect: { name: newCase.suspectName.trim() || 'Not provided', email: newCase.suspectEmail.trim() || 'Not provided' },
      aadhaarCard: {
        name: newCase.aadhaarCard.name,
        size: newCase.aadhaarCard.size,
        type: newCase.aadhaarCard.type,
        sha256: aadhaarHash,
      },
    }
    addCase(record)
    addActivity({
      actor: `${user.thana} — ${user.roleInfo.name}`,
      action: 'created',
      target: record.id,
      timestamp: record.updatedAt,
    })
    setCases(getCasesForUser(user))
    setNewCase({ title: '', priority: 'Medium', suspectName: '', suspectEmail: '', aadhaarCard: null })
    setCreatingCase(false)
    setShowNewCase(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Cases</h1>
          <p className="mt-1 text-sm text-slate-400">
            {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''} in {user?.role === 'DISTRICT_DM' ? `${user.district} district` : user?.thana}
          </p>
        </div>
        {canUpload && <button onClick={() => setShowNewCase(true)} className="btn-primary">+ New Case</button>}
      </div>

      {showNewCase && (
        <form onSubmit={handleCreateCase} className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">Create New Case</h2>
            <button type="button" onClick={() => setShowNewCase(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <input className="field" placeholder="Case title" value={newCase.title} onChange={(e) => { setNewCase({ ...newCase, title: e.target.value }); setCaseError('') }} required />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="field" value={newCase.priority} onChange={(e) => setNewCase({ ...newCase, priority: e.target.value })}>
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
            <input className="field" placeholder="Suspect name" value={newCase.suspectName} onChange={(e) => setNewCase({ ...newCase, suspectName: e.target.value })} />
            <input className="field sm:col-span-2" type="email" placeholder="Suspect email" value={newCase.suspectEmail} onChange={(e) => setNewCase({ ...newCase, suspectEmail: e.target.value })} />
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Suspect Aadhaar card
              </span>
              <input
                className="field"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => { setNewCase({ ...newCase, aadhaarCard: e.target.files?.[0] || null }); setCaseError('') }}
                required
              />
              <span className="mt-1 block text-xs text-slate-500">Accepted: image or PDF. Only the file name, size, type, and SHA-256 fingerprint are recorded in this demo.</span>
            </label>
          </div>
          {caseError && <p className="text-sm text-danger">{caseError}</p>}
          <button type="submit" disabled={creatingCase} className="btn-primary">
            {creatingCase ? 'Securing Aadhaar record…' : 'Create Case'}
          </button>
        </form>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title or case ID…" className="field !w-72" />
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="field !w-44">
          <option>All</option><option>Active</option><option>Under Review</option><option>Closed</option>
        </select>
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-surface-700 text-xs uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3 font-medium">Case ID</th><th className="px-5 py-3 font-medium">Title</th>
            <th className="px-5 py-3 font-medium">Stage</th><th className="px-5 py-3 font-medium">Priority</th>
            <th className="px-5 py-3 text-right font-medium">Updated</th>
          </tr></thead>
          <tbody className="divide-y divide-surface-700">
            {filteredCases.map((c) => (
              <tr key={c.id} className="transition hover:bg-surface-800/50">
                <td className="px-5 py-4 font-mono text-xs text-primary-300">{c.id}</td>
                <td className="px-5 py-4"><p className="font-medium text-white">{c.title}</p><p className="text-xs text-slate-500">{c.suspect?.name}</p></td>
                <td className="px-5 py-4"><Badge tone={STAGE_TONE[c.stage]}>{c.stage}</Badge></td>
                <td className="px-5 py-4"><Badge tone={PRIORITY_TONE[c.priority]}>{c.priority}</Badge></td>
                <td className="px-5 py-4 text-right text-slate-400">{c.updatedAt ? formatDateTime(c.updatedAt) : c.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filteredCases.length && <p className="px-5 py-10 text-center text-slate-500">No cases found for this station.</p>}
      </div>
    </div>
  )
}
