
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ReceiptText,
  PlusCircle,
  Users,
  ClipboardCheck,
  WalletCards,
} from 'lucide-react'
import useAuth from '../hooks/useAuth'

const employee = [
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['My claims', '/claims', ReceiptText],
  ['New claim', '/claims/new', PlusCircle],
]

const manager = [
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['All claims', '/claims', ReceiptText],
  ['Review queue', '/review', ClipboardCheck],
  ['People', '/users', Users],
]

export default function Sidebar() {
  const { user } = useAuth()
  const items = user?.role === 'MANAGER' ? manager : employee

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col bg-[#17213a] text-white md:flex">
      {/* Sidebar Header */}
      <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500">
          <WalletCards size={22} />
        </div>

        <div>
          <p className="text-lg font-bold tracking-tight">Claimly</p>
          <p className="text-[10px] uppercase tracking-[.2em] text-slate-400">
            Expense management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 pt-7">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">
          Workspace
        </p>

        <nav className="space-y-1">
          {items.map(([label, to, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-950/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold">Need a hand?</p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Keep your expense records clear and up to date.
          </p>

          <div className="mt-3 h-1.5 rounded-full bg-white/10">
            <div className="h-1.5 w-2/3 rounded-full bg-indigo-400" />
          </div>
        </div>

        <p className="px-2 pt-4 text-[10px] text-slate-500">
          CLAIMLY • WORKSPACE
        </p>
      </div>
    </aside>
  )
}
