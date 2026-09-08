// Dashboard — the executive overview.
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { CASE_TREND, LOCATION_HIERARCHY, getCasesForUser, getActivityForUser, formatDateTime } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'

const STAGE_TONE = {
  Active:       'info',
  'Under Review': 'warning',
  Closed:       'neutral',
}
const PRIORITY_TONE = { High: 'danger', Medium: 'warning', Low: 'neutral' }

export default function Dashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('recent')
  const cases = useMemo(() => getCasesForUser(user), [user])
  const stationActivity = useMemo(() => getActivityForUser(user), [user])

  // Compute real stats from the case data
  const liveStats = useMemo(() => [
    { label: 'Total Cases', value: cases.length, delta: user?.role === 'DISTRICT_DM' ? `${user.district} district` : user?.thana || 'your station', tone: 'primary' },
    { label: 'Active Cases', value: cases.filter(c => c.stage === 'Active').length, delta: 'currently active', tone: 'info' },
    { label: 'Under Review', value: cases.filter(c => c.stage === 'Under Review').length, delta: 'pending approval', tone: 'warning' },
    { label: 'High Priority', value: cases.filter(c => c.priority === 'High').length, delta: 'require attention', tone: 'danger' },
  ], [cases, user?.thana])

  // Recent 8 cases for the overview table
  const recentCases = useMemo(() => cases.slice(0, 8), [cases])

  // State-level jurisdiction summary
  const stateStats = useMemo(() =>
    Object.keys(LOCATION_HIERARCHY).filter((st) => st === user?.state).map((st) => {
      const stateCases = cases.filter(c => c.state === st)
      return {
        state: st,
        total: stateCases.length,
        active: stateCases.filter(c => c.stage === 'Active').length,
        districts: Object.keys(LOCATION_HIERARCHY[st]).length,
      }
    }),
  [cases, user?.state])

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          {user?.role === 'DISTRICT_DM' ? `${user.district} District Dashboard` : user?.thana || 'Dashboard'}
          <span className="ml-2 align-middle text-base font-normal text-slate-400">
            — {user?.roleInfo?.name || user?.role}
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {user?.district}, {user?.state} · Here's what's happening across your evidence operations.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {liveStats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} tone={s.tone} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main panel — cases or trend */}
        <section className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">
              {tab === 'recent' ? 'Case Overview' : 'Case Load Trend'}
            </h2>
            <div className="flex rounded-lg border border-surface-600 bg-surface-800 p-0.5">
              <button
                onClick={() => setTab('recent')}
                className={`rounded-md px-3 py-1 text-sm transition ${tab === 'recent' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Recent
              </button>
              <button
                onClick={() => setTab('trend')}
                className={`rounded-md px-3 py-1 text-sm transition ${tab === 'trend' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Trend
              </button>
            </div>
          </div>

          {tab === 'recent' ? (
            <>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-700 text-xs uppercase tracking-wider text-slate-500">
                    <th className="pb-2 font-medium">Case</th>
                    <th className="pb-2 font-medium">Location</th>
                    <th className="pb-2 font-medium">Stage</th>
                    <th className="pb-2 font-medium">Priority</th>
                    <th className="pb-2 text-right font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700">
                  {recentCases.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3">
                        <p className="font-medium text-white">{c.title}</p>
                        <p className="text-xs text-slate-500">{c.id}</p>
                      </td>
                      <td className="py-3">
                        <p className="text-xs text-slate-400">{c.thana}</p>
                        <p className="text-xs text-slate-500">{c.district}, {c.state}</p>
                      </td>
                      <td className="py-3"><Badge tone={STAGE_TONE[c.stage]}>{c.stage}</Badge></td>
                      <td className="py-3"><Badge tone={PRIORITY_TONE[c.priority]}>{c.priority}</Badge></td>
                      <td className="py-3 text-right text-slate-400">                      {c.updatedAt ? formatDateTime(c.updatedAt) : c.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 border-t border-surface-700 pt-3 text-center">
                <Link to="/cases" className="text-sm font-medium text-primary-400 transition hover:text-primary-300">
                  View all {cases.length} cases →
                </Link>
              </div>
            </>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CASE_TREND} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid stroke="#22304f" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#111a2e', border: '1px solid #22304f', borderRadius: 8 }} />
                  <Bar dataKey="cases" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Side panel — recent activity */}
        <aside className="card">
          <h2 className="font-display text-lg font-semibold text-white">Recent Activity</h2>
          <ul className="mt-4 space-y-4">
            {stationActivity.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-none rounded-full bg-primary-400" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-300">
                    <span className="font-medium text-white">{a.actor}</span> {a.action}{' '}
                    <span className="font-mono text-primary-300">{a.target}</span>
                  </p>
                  <p className="text-xs text-slate-500">{a.time}</p>
                </div>
              </li>
            ))}
            {!stationActivity.length && <li className="text-sm text-slate-500">No recent activity for this station.</li>}
          </ul>
        </aside>
      </div>

      {user?.role === 'DISTRICT_DM' && (
        <section className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">Ghaziabad Police Station Breakdown</h2>
            <span className="text-sm text-slate-400">{cases.length} total cases</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(cases.reduce((groups, item) => {
              groups[item.thana] = (groups[item.thana] || 0) + 1
              return groups
            }, {})).map(([thana, count]) => (
              <div key={thana} className="rounded-lg border border-surface-700 bg-surface-800/70 p-4">
                <p className="font-medium text-white">{thana}</p>
                <p className="mt-1 text-sm text-slate-400">{count} case{count !== 1 ? 's' : ''} registered</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Jurisdiction Overview */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Jurisdiction Overview</h2>
          <Link to="/cases" className="text-sm text-primary-400 transition hover:text-primary-300">
            Browse by location →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stateStats.map((s) => (
            <Link
              key={s.state}
              to="/cases"
              className="group relative overflow-hidden rounded-xl border border-surface-700 bg-surface-800/70 p-4 transition hover:border-primary-500/50 hover:bg-surface-800"
            >
              <span className="absolute inset-x-0 top-0 h-0.5 bg-primary-500 opacity-0 transition-opacity group-hover:opacity-100" />
              <p className="font-display text-sm font-semibold text-white">{s.state}</p>
              <p className="mt-0.5 text-xs text-slate-500">{s.districts} district{s.districts !== 1 ? 's' : ''}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="font-display text-xl font-bold text-white">{s.total}</span>
                <span className="text-xs text-slate-400">cases</span>
              </div>
              <div className="mt-2">
                {/* Progress bar — active vs total */}
                <div className="h-1 w-full overflow-hidden rounded-full bg-surface-600">
                  <div
                    className="h-full rounded-full bg-primary-500 transition-all"
                    style={{ width: `${s.total > 0 ? (s.active / s.total) * 100 : 0}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">{s.active} active</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}