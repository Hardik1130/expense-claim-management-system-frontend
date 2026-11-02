
import { Bell, ChevronDown, LogOut, UserCircle } from 'lucide-react'
import { useState } from 'react'
import useAuth from '../hooks/useAuth'

export default function Navbar() {
  const { user, signOut, demo } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur md:px-8">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          Expense workspace
        </p>
        <p className="text-xs text-slate-400">
          Manage claims with clarity
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 sm:inline-flex">
          {demo ? 'DEMO MODE' : 'LIVE API'}
        </span>

        <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
          <Bell size={19} />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-50"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {user?.name
                ?.split(' ')
                .map((x) => x[0])
                .join('')
                .slice(0, 2)}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>

            <ChevronDown size={15} />
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-48 rounded-xl border bg-white p-2 shadow-xl">
              <div className="px-3 py-2 text-xs text-slate-400">
                {user?.email}
              </div>

              <button
                onClick={signOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
