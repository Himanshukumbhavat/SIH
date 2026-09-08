// Left navigation rail for the authenticated app.
import { NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import Badge from './Badge'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '▤' },
  { to: '/cases',     label: 'Cases',     icon: '▣' },
  { to: '/documents', label: 'Documents', icon: '▦' },
  { to: '/activity',  label: 'Activity',  icon: '≡' },
]

export default function Sidebar() {
  const { user, logout, canUpload } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-surface-700 bg-surface-900">
      <div className="px-5 py-5">
        <NavLink to="/dashboard">
          <Logo />
        </NavLink>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-surface-700 text-white'
                  : 'text-slate-400 hover:bg-surface-800 hover:text-slate-200'
              }`
            }
          >
            <span className="w-5 text-center text-slate-500">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* Signed-in user info + sign out */}
      <div className="border-t border-surface-700 p-4">
        <div className="flex items-center gap-3">
          <span className={`grid h-9 w-9 place-items-center rounded-full font-display text-sm font-semibold text-white ${
            canUpload ? 'bg-primary-600' : 'bg-surface-600'
          }`}>
            {canUpload ? '↑' : '👁'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.thana || user?.name}</p>
            <Badge tone={canUpload ? 'primary' : 'neutral'}>
              {user?.roleInfo?.name || user?.role}
            </Badge>
          </div>
        </div>
        {/* Location detail */}
        <p className="mt-2 truncate text-xs text-slate-500">
          {user?.district}, {user?.state}
        </p>
        <p className="truncate text-xs text-slate-600">{user?.email}</p>
        <button onClick={handleLogout} className="mt-3 w-full rounded-lg border border-surface-600 px-3 py-2 text-sm text-slate-300 transition hover:bg-surface-800">
          Sign out
        </button>
      </div>
    </aside>
  )
}
