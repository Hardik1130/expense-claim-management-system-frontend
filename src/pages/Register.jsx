
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { WalletCards } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Register() {
  const { signUp } = useAuth()
  const nav = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const submit = async (e) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match')
    }

    try {
      await signUp({
        name: form.name,
        email: form.email,
        password: form.password,
      })

      toast.success('Registration submitted')
      nav('/login')
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Registration failed'
      )
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#f6f7fb] p-5">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-3xl border bg-white p-8 shadow-sm"
      >
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <span className="rounded-xl bg-indigo-600 p-3 text-white">
            <WalletCards />
          </span>

          <b className="text-xl">Claimly</b>
        </div>

        <h1 className="text-2xl font-bold">
          Create your employee account
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          New registrations are assigned the Employee role.
        </p>

        {/* Registration Fields */}
        {[
          ['name', 'Full name', 'text'],
          ['email', 'Work email', 'email'],
          ['password', 'Password', 'password'],
          ['confirmPassword', 'Confirm password', 'password'],
        ].map(([name, label, type]) => (
          <label
            key={name}
            className="mt-5 block text-sm font-medium"
          >
            {label}

            <input
              name={name}
              type={type}
              required
              minLength={
                name.includes('password') ? 8 : undefined
              }
              value={form[name]}
              onChange={change}
              className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500"
            />
          </label>
        ))}

        <button className="mt-7 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white">
          Create account
        </button>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-600"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
