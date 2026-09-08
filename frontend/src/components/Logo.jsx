// Brand mark: a monogram tile + wordmark. Reused on every screen.
export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-600 font-display text-lg font-bold text-white shadow-sm">
        D
      </span>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight text-white">DEMS</span>
      )}
    </div>
  )
}
