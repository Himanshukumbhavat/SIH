// Login — email + password credential form.
// Shows a few sample credentials so the evaluator can test different roles.
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import Badge from '../components/Badge'

// A small set of sample credentials to show on the login screen for demo.
const SAMPLE_CREDS = [
  { email: 'andheri.uploader@dems.gov',       label: 'Andheri PS',           role: 'Uploader', tone: 'primary' },
  { email: 'andheri.reader@dems.gov',          label: 'Andheri PS',           role: 'Reader',   tone: 'neutral' },
  { email: 'connaughtplace.uploader@dems.gov', label: 'Connaught Place PS',   role: 'Uploader', tone: 'primary' },
  { email: 'connaughtplace.reader@dems.gov',   label: 'Connaught Place PS',   role: 'Reader',   tone: 'neutral' },
  { email: 'cubbon park.uploader@dems.gov'.replace(/\s/g,''), label: 'Cubbon Park PS', role: 'Uploader', tone: 'primary' },
  { email: 'whitefield.uploader@dems.gov',     label: 'Whitefield PS',        role: 'Uploader', tone: 'primary' },
  { email: 'ghaziabad.dm@dems.gov',            label: 'Ghaziabad District',    role: 'District DM', tone: 'neutral' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showCreds, setShowCreds] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) { setError('Enter your email.'); return }
    if (!password)     { setError('Enter your password.'); return }
    const result = login(email, password)
    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      setError(result.error)
    }
  }

  // Quick-fill a sample credential
  function fill(cred) {
    setEmail(cred.email)
    setPassword('dems2026')
    setError('')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <Link to="/" className="text-sm text-slate-400 transition hover:text-white">← Back</Link>
        </div>

        <div className="card">
          <h1 className="font-display text-2xl font-bold text-white">Sign in</h1>
          <p className="mt-1 text-sm text-slate-400">
            Enter your police station credentials to access the portal.
          </p>

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
        </div>
      </div>
    </div>
  )
}