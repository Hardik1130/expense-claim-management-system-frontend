
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'

import { getClaim, updateClaim } from '../services/claimService'
import api from '../services/api'
import { formatCurrency } from '../utils/formatCurrency'

export default function EditClaim() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    amount: '',
    categoryId: '',
    expenseDate: '',
    description: '',
  })

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch claim and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [claimResponse, categoryResponse] = await Promise.all([
          getClaim(id),
          api.get('/categories'),
        ])

        const claim = claimResponse.data.data
        const categoryList = categoryResponse.data.data || []

        if (claim.status !== 'PENDING') {
          toast.error('Only pending claims can be edited.')
          navigate('/claims', { replace: true })
          return
        }

        setCategories(categoryList)

        setForm({
          title: claim.title || '',
          amount: claim.amount?.toString() || '',
          categoryId: claim.categoryId || '',
          expenseDate: claim.expenseDate || '',
          description: claim.description || '',
        })
      } catch (error) {
        console.error('Failed to load claim:', error)

        toast.error(
          error.response?.data?.message || 'Unable to load claim details.'
        )

        navigate('/claims', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title.trim()) {
      return toast.error('Please enter claim title.')
    }

    if (!form.amount || Number(form.amount) <= 0) {
      return toast.error('Amount must be greater than zero.')
    }

    if (!form.categoryId) {
      return toast.error('Please select a category.')
    }

    if (!form.expenseDate) {
      return toast.error('Please select expense date.')
    }

    try {
      setSaving(true)

      await updateClaim(id, {
        title: form.title.trim(),
        amount: Number(form.amount),
        categoryId: form.categoryId,
        expenseDate: form.expenseDate,
        description: form.description.trim(),
      })

      toast.success('Claim updated successfully!')
      navigate('/claims')
    } catch (error) {
      console.error('Claim update error:', error)

      toast.error(
        error.response?.data?.message || 'Unable to update claim.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        Loading claim details...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      <div>
        <Link
          to="/claims"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Back to claims
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Edit claim
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Update the details of your pending expense claim.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 sm:grid-cols-2">

          {/* Claim Title */}
          <label className="text-sm font-medium sm:col-span-2">
            Claim title

            <input
              required
              maxLength={160}
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Client meeting travel"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </label>

          {/* Amount */}
          <label className="text-sm font-medium">
            Amount (₹)

            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </label>

          {/* Category */}
          <label className="text-sm font-medium">
            Category

            <select
              required
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="">Select category</option>

              {categories
                .filter((category) => category.active)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </label>

          {/* Expense Date */}
          <label className="text-sm font-medium sm:col-span-2">
            Expense date

            <input
              required
              type="date"
              name="expenseDate"
              value={form.expenseDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>

          {/* Description */}
          <label className="text-sm font-medium sm:col-span-2">
            Description

            <textarea
              maxLength={2000}
              rows={4}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add a short explanation for this expense..."
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </label>

        </div>

        {/* Current Claim Amount */}
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">
            Updated claim amount
          </p>

          <p className="mt-1 text-xl font-bold text-slate-800">
            {formatCurrency(Number(form.amount) || 0)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t pt-5">

          <Link
            to="/claims"
            className="rounded-xl border px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save changes'}
          </button>

        </div>
      </form>
    </div>
  )
}
