// Top bar: page title on the left, quick actions on the right.
export default function Topbar({ title, subtitle, children }) {
  return (
    <header className="flex items-center justify-between border-b border-surface-700 bg-surface-800/40 px-6 py-4">
      <div>
        <h1 className="font-display text-xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  )
}
