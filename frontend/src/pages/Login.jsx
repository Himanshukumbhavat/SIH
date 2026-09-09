// Login — email + password credential form.
// Shows a few sample credentials so the evaluator can test different roles.
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { useAuth } from '../context/AuthContext'
import { LOCATION_HIERARCHY } from '../data/mockData'
import Logo from '../components/Logo'
import Badge from '../components/Badge'

// A small set of sample credentials to show on the login screen for demo.
const ghaziabadStations = LOCATION_HIERARCHY['Uttar Pradesh'].Ghaziabad
const SAMPLE_CREDS = [
  ...ghaziabadStations.flatMap((station) => {
    const slug = station.toLowerCase().replace(/\s+ps$/i, '').replace(/[^a-z0-9]+/g, '')
    return [
      { email: `${slug}.uploader@dems.gov`, label: station, role: 'Uploader', tone: 'primary' },
      { email: `${slug}.reader@dems.gov`, label: station, role: 'Reader', tone: 'neutral' },
    ]
  }),
  { email: 'ghaziabad.dm@dems.gov', label: 'Ghaziabad District, Uttar Pradesh', role: 'District DM', tone: 'neutral' },
]

export default function Login() {
  const { login, verifyMfa, resetMfaSetup } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showCreds, setShowCreds] = useState(false)
  const [mfaStep, setMfaStep] = useState(null)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaSetup, setMfaSetup] = useState(null)
  const [mfaQrCode, setMfaQrCode] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) { setError('Enter your email.'); return }
    if (!password)     { setError('Enter your password.'); return }
    const result = login(email, password)
    if (result.success) {
      if (result.mfaSetupRequired) {
        setMfaSetup(result.setup)
        QRCode.toDataURL(result.setup.uri, {
          width: 192,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: { dark: '#111827', light: '#ffffff' },
        }).then(setMfaQrCode).catch(() => setMfaQrCode(''))
        setMfaStep('setup')
      } else {
        setMfaStep('verify')
      }
    } else {
      setError(result.error)
    }

  }

  async function handleMfaSubmit(e) {
    e.preventDefault()
    const result = await verifyMfa(mfaCode, mfaSetup?.secret)
    if (result.success) navigate('/dashboard', { replace: true })
    else setError(result.error)
  }

  function restartMfaSetup() {
    resetMfaSetup(email)
    setMfaStep(null)
    setMfaSetup(null)
    setMfaCode('')
    setError('Sign in again to generate a new QR code.')
  }

  // Quick-fill a sample credential
  function fill(cred) {
    setEmail(cred.email)
    setPassword('dems2026')
    setError('')
  }

  return (
    <div className="min-h-screen bg-surface-900">
      <div className="gov-stripe h-1" aria-hidden="true" />
      <div className="bg-gradient-to-r from-[#168f9b] via-[#567bc8] to-[#ee6d2f] px-4 py-2 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs sm:text-sm">
          <span className="font-semibold tracking-wide">🇮🇳 GOVERNMENT OF INDIA</span>
          <div className="hidden items-center gap-5 sm:flex">
            <span>Skip to main content</span>
            <span className="rounded-full border border-white/60 px-3 py-1">A अ English⌄</span>
            <span className="text-lg">☰</span>
          </div>
        </div>
      </div>

      <header className="border-b border-surface-700 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-5 px-4 py-4 sm:px-8">
          <div className="flex min-w-[210px] items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#e47d35] text-2xl text-[#1c5276]">☸</div>
            <div>
              <p className="font-display text-xl font-bold text-[#1d5578]">DEMS</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-600">Digital Evidence Mission</p>
            </div>
          </div>
          <div className="flex min-w-[240px] flex-1 overflow-hidden rounded-md border border-surface-600 bg-surface-950">
            <input className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm outline-none" placeholder="Search government services" />
            <button type="button" className="bg-[#df7b4e] px-5 text-sm font-semibold text-white">Search</button>
          </div>
          <Link to="/" className="text-sm font-semibold text-primary-600 transition hover:text-primary-700">Home</Link>
          <button type="button" className="text-2xl text-slate-600" aria-label="Open menu">☰</button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-8">
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#fef7ed] via-white to-[#e9f4f5] px-6 py-10 shadow-sm sm:px-12 sm:py-14">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-orange-200/40 blur-2xl" aria-hidden="true" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-primary-100/60 blur-2xl" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-orange-600">National public service platform</p>
            <h1 className="font-display text-4xl font-bold leading-tight text-[#1b5575] sm:text-5xl">
              Secure evidence. <span className="text-primary-600">Stronger justice.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
              A unified government platform for police stations and district authorities to preserve,
              verify, and manage digital evidence with transparency.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
              <span className="rounded-full bg-primary-600 px-4 py-2 text-white">Trusted government access</span>
              <span className="rounded-full border border-orange-300 bg-white px-4 py-2 text-orange-700">Digital India ready</span>
            </div>
          </div>
        </section>

        <div className="my-6 grid gap-4 sm:grid-cols-3">
          {[
            ['🔐', 'Secure by design', 'Multi-factor authentication and controlled access.'],
            ['⚖', 'Accountable process', 'A complete audit trail for every evidence action.'],
            ['▣', 'One digital window', 'Connect stations, investigators, and districts.'],
          ].map(([icon, title, description]) => (
            <div key={title} className="rounded-lg border border-surface-700 bg-white p-4 shadow-sm">
              <span className="text-2xl">{icon}</span>
              <h2 className="mt-2 font-display font-bold text-slate-100">{title}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto grid max-w-3xl items-start gap-6">
        <div className="card text-center">
          <h1 className="font-display text-2xl font-bold text-white">
            {mfaStep ? 'Verify your identity' : 'Sign in'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {mfaStep ? 'Enter the six-digit code from your authenticator app.' : 'Enter your police station credentials to access the portal.'}
          </p>

          {mfaStep ? (
            <form onSubmit={handleMfaSubmit} className="mt-6 space-y-4">
              {mfaStep === 'setup' && (
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Set up an authenticator app</p>
                  <p className="mt-2">Add this key in Google Authenticator, Microsoft Authenticator, or Authy.</p>
                  {mfaQrCode && (
                    <div className="mt-3 flex justify-center rounded-lg bg-white p-3">
                      <img src={mfaQrCode} alt="DEMS authenticator setup QR code" width="192" height="192" />
                    </div>
                  )}
                  <p className="mt-3 text-xs text-slate-400">
                    In Microsoft Authenticator, tap <strong className="text-slate-300">+</strong>, choose <strong className="text-slate-300">Other account</strong>, then scan this QR code.
                  </p>
                  <code className="mt-3 block break-all rounded bg-surface-900 p-3 font-mono text-primary-300">{mfaSetup?.secret}</code>
                  <p className="mt-3 text-xs text-slate-400">After adding it, enter the current six-digit code below.</p>
                </div>
              )}
              <label htmlFor="mfa-code" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Authenticator code</label>
              <input id="mfa-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={mfaCode} onChange={(e) => { setMfaCode(e.target.value.replace(/\D/g, '')); setError('') }} className="field text-center font-mono text-xl tracking-[0.4em]" placeholder="000000" />
              {error && <p className="text-sm text-danger">{error}</p>}
              <button type="submit" disabled={mfaCode.length !== 6} className="btn-primary w-full">Verify and continue</button>
              {mfaStep === 'verify' && (
                <button type="button" onClick={restartMfaSetup} className="btn-ghost w-full">
                  I need a new QR code
                </button>
              )}
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="stationname.uploader@dems.gov"
                className="field"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                className="field"
              />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button type="submit" className="btn-primary w-full">Sign in</button>
          </form>
          )}

          {/* Demo credential helper */}
          <div className="mt-6 border-t border-surface-700 pt-4">
            <button
              onClick={() => setShowCreds(!showCreds)}
              className="flex w-full items-center justify-between text-left text-sm text-slate-400 transition hover:text-white"
            >
              <span>Demo Credentials</span>
              <span className="text-xs">{showCreds ? '▲ Hide' : '▼ Show'}</span>
            </button>

            {showCreds && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-slate-500">
                  Password for all accounts: <span className="font-mono text-primary-300">dems2026</span>
                </p>
                {SAMPLE_CREDS.map((c) => (
                  <button
                    key={c.email}
                    onClick={() => fill(c)}
                    className="flex w-full items-center justify-between rounded-lg border border-surface-600 bg-surface-800 px-3 py-2.5 text-left transition hover:border-surface-400"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-primary-300">{c.email}</p>
                      <p className="text-xs text-slate-500">{c.label}</p>
                    </div>
                    <Badge tone={c.tone}>{c.role}</Badge>
                  </button>
                ))}
                <p className="text-xs text-slate-500 mt-2">
                  Every police station has two credentials — <strong className="text-slate-300">uploader</strong> (can upload evidence) and <strong className="text-slate-300">reader</strong> (view only).
                </p>
              </div>
            )}
          </div>

        <aside className="card border-primary/20 bg-gradient-to-br from-primary-50 via-white to-orange-50 text-center">
          <div className="flex items-start gap-3">
            <div className="gov-stripe h-12 w-1.5 shrink-0 rounded-full" aria-hidden="true" />
            <div>
              <p className="label text-primary-600">Government of India</p>
              <h2 className="mt-1 font-display text-xl font-bold text-slate-100">Digital governance, built on trust</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            DEMS helps authorised police and district teams preserve digital evidence with accountability,
            traceability, and secure access.
          </p>
          <div className="mt-5 space-y-3">
            {[
              ['01', 'Secure chain of custody', 'Every evidence action is recorded for review.'],
              ['02', 'Accountable public service', 'Role-based access keeps information with the right teams.'],
              ['03', 'Ready for digital India', 'A structured platform for faster, transparent investigations.'],
            ].map(([number, title, description]) => (
              <div key={number} className="rounded-md border border-surface-700 bg-white/70 p-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary-600">{number}</span>
                  <p className="text-sm font-semibold text-slate-100">{title}</p>
                </div>
                <p className="mt-1 pl-7 text-xs leading-5 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-surface-700 pt-4 text-xs text-slate-500">
            <p className="font-semibold text-slate-400">For authorised personnel only</p>
            <p className="mt-1">Please protect your credentials and never share authenticator codes.</p>
          </div>
        </aside>
          </div>
        </div>
        <footer className="mt-8 flex flex-wrap justify-between gap-3 border-t border-surface-700 pt-5 text-xs text-slate-500">
          <span>© 2026 DEMS · Government digital service initiative</span>
          <span>Privacy · Accessibility · Helpdesk</span>
        </footer>
      </main>
      </div>
  )
}