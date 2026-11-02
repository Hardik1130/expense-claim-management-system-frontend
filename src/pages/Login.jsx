import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, WalletCards, ShieldCheck } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Login() {
  const { user, signIn, loading, demo } = useAuth()
 const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
  const nav = useNavigate()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const submit = async (e) => {
    e.preventDefault()
    try {
      await signIn(email, password)
      nav('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    }
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      {/* Left Branding Section */}
      <section className="hidden flex-col justify-between bg-[#17213a] p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-500 p-3">
            <WalletCards />
          </div>
          <span className="text-xl font-bold">Claimly</span>
        </div>

        <div className="max-w-xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[.25em] text-indigo-300">
            Expense management, simplified
          </p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Every expense.<br />One clear picture.
          </h1>
          <p className="mt-6 max-w-md leading-7 text-slate-300">
            A smarter way for teams to submit, review and manage expense claims.
          </p>
          <div className="mt-10 flex items-center gap-3 text-sm text-slate-300">
            <ShieldCheck className="text-emerald-300" /> Role-based and secure workspace
          </div>
        </div>

        <p className="text-xs text-slate-500">© 2026 Claimly Workspace</p>
      </section>

      {/* Right Login Form Section */}
      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-md">
          <div className="mb-9 lg:hidden">
            <div className="inline-flex rounded-xl bg-indigo-600 p-3 text-white">
              <WalletCards />
            </div>
            <h1 className="mt-3 text-2xl font-bold">Claimly</h1>
          </div>

          <p className="text-sm font-semibold text-indigo-600">WELCOME BACK</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Sign in to your account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter your details to access your workspace.
          </p>

          <label className="mt-8 block text-sm font-medium">Email address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
          />

          <label className="mt-5 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
          />

          <button
            disabled={loading}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Signing in' : 'Sign in'} <ArrowRight size={17} />
          </button>

          <p className="mt-7 text-center text-sm text-slate-500">
            New to Claimly?{' '}
            <Link className="font-semibold text-indigo-600" to="/register">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </div>
  )
}
