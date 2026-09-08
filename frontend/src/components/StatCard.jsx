// KPI card for the dashboard. Tone shades the accent number bar.
const BAR = {
  primary: 'bg-primary-500',
  info:    'bg-info',
  warning: 'bg-warning',
  danger:  'bg-danger',
}

export default function StatCard({ label, value, delta, tone = 'primary' }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-surface-700 bg-surface-800/70 p-5">
      <span className={`absolute inset-x-0 top-0 h-0.5 ${BAR[tone] || BAR.primary}`} />
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{delta}</p>
    </div>
  )
}
