
import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'

export default function AccessDenied() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-5">
      <div className="text-center">
        <ShieldX size={54} className="mx-auto text-rose-500" />

        <h1 className="mt-5 text-3xl font-bold">
          Access denied
        </h1>

        <p className="mt-2 text-slate-500">
          You don't have permission to view this page.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
