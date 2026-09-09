// Layout used by every screen inside the authenticated app.
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      <div className="gov-stripe fixed inset-x-0 top-0 z-50 h-1" aria-hidden="true" />
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-1">
        <div className="mx-auto max-w-[1600px] p-6 lg:p-8">
          <div className="page-enter">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
