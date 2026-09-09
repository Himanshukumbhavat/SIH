// Activity — a time-ordered audit feed showing who did what.
import { getActivityForUser, formatDateTime } from '../data/mockData'
import Badge from '../components/Badge'
import { useAuth } from '../context/AuthContext'

// Map an action verb to a color so different event kinds stand out.
const ACTION_TONE = {
  created:   'primary',
  uploaded:  'primary',
  approved:  'success',
  viewed:    'info',
  accessed:  'info',
  requested: 'warning',
  rejected:  'danger',
}

export default function Activity() {
  const { user } = useAuth()
  const activity = getActivityForUser(user)
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Activity</h1>
        <p className="mt-1 text-sm text-slate-400">A chain-of-custody audit of every action taken.</p>
      </div>

      <div className="card">
        <ol className="relative space-y-6 before:absolute before:left-[5px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-surface-600">
          {activity.map((a, i) => (
            <li key={i} className="relative flex items-start gap-4 pl-8">
              <span
                className={`absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full ${ACTION_TONE[a.action] === 'danger' ? 'bg-danger' : 'bg-primary-400'}`}
              />
              <div className="min-w-0">
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-white">{a.actor}</span>{' '}
                  <span className="text-slate-400">{a.action}</span>{' '}
                  <span className="font-mono text-primary-300">{a.target}</span>
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge tone={ACTION_TONE[a.action]}>{a.action}</Badge>
                  <span className="text-xs text-slate-500">{a.timestamp ? formatDateTime(a.timestamp) : a.time}</span>
                </div>
              </div>
            </li>
          ))}
          {!activity.length && <li className="pl-8 text-sm text-slate-500">No activity recorded for this account.</li>}
        </ol>
      </div>
    </div>
  )
}