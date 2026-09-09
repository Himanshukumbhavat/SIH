// Brand mark: a monogram tile + wordmark. Reused on every screen.
export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-600 font-display text-lg font-bold text-white shadow-sm">
        <span aria-hidden="true">D</span>
      </span>
      {!compact && (
        <span>
          <span className="block font-display text-lg font-semibold tracking-tight text-white">DEMS</span>
          {!compact && <span className="block text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500">Citizen security platform</span>}
        </span>
      )}
    </div>
  )
}
