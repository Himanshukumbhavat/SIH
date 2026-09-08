// Public landing page. Dense, asymmetric layout — not a generic centered hero.
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

const FEATURES = [
  { n: '01', title: 'Secure storage', text: 'Evidence files kept under strong encryption with a complete version history, so records stay intact.' },
  { n: '02', title: 'Controlled access', text: 'Role-based permissions decide exactly who may open each case and exhibit — nothing more, nothing less.' },
  { n: '03', title: 'Traceable activity', text: 'Every view, upload and approval is recorded, giving investigators a clear chain of custody.' },
]

const STRIP = ['SHA-256', 'End-to-end audit', 'Role-based access', 'Four-tier clearance', 'Chain of custody']

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-900">
      {/* Top navigation */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white">Sign in</Link>
          <Link to="/login" className="btn-primary !py-2.5">Enter Portal</Link>
        </nav>
      </header>

      {/* Hero — asymmetric 2-column */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-5 lg:items-center">
        <div className="lg:col-span-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-surface-600 bg-surface-800 px-3 py-1 text-xs font-medium text-primary-300">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
            Digital Evidence Management · Law Enforcement
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] text-white md:text-5xl">
            Evidence that
            <br />
            <span className="text-primary-400">stands up to scrutiny.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            A single secure platform where judicial and law-enforcement teams store,
            protect and retrieve digital evidence — with guaranteed provenance and a
            complete, tamper-evident audit trail.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="btn-primary !px-6 !py-3">Enter the Portal</Link>
            <a href="#features" className="btn-ghost !px-6 !py-3">How it works</a>
          </div>
        </div>

        {/* Right — feature cards */}
        <div id="features" className="grid gap-5 lg:col-span-2">
          {FEATURES.map((f) => (
            <div key={f.n} className="card">
              <span className="font-display text-sm font-semibold text-primary-400">{f.n}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-surface-700 bg-surface-800/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-6">
          {STRIP.map((t) => (
            <span key={t} className="font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-slate-500">
        <span>© {new Date().getFullYear()} DEMS · Smart India Hackathon 2026</span>
        <span className="font-mono">v1.0</span>
      </footer>
    </div>
  )
}
