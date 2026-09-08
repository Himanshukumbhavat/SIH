// Small status pill. `tone` maps to a color; static class map so Tailwind
// can see every possible value at build time (no dynamic class names).
const TONES = {
  primary: 'bg-primary-soft text-primary-300 border-primary-500/20',
  success: 'bg-success-soft text-success border-success/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
  danger:  'bg-danger-soft text-danger border-danger/20',
  info:    'bg-info-soft text-info border-info/20',
  neutral: 'bg-surface-600 text-slate-300 border-surface-500/40',
}

export default function Badge({ children, tone = 'neutral' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONES[tone] || TONES.neutral}`}
    >
      {children}
    </span>
  )
}
