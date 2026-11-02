import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  SlidersHorizontal,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react'

import toast from 'react-hot-toast'
import { useEffect, useState, useCallback } from 'react'

import useAuth from '../hooks/useAuth'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'

import {
  getClaims,
  getManagerClaims,
  deleteClaim,
} from '../services/claimService'

import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import Modal from '../components/Modal'


// import { Link } from 'react-router-dom'
// import { Plus, Search, SlidersHorizontal, Eye } from 'lucide-react'
// import toast from 'react-hot-toast'
// import { useEffect, useMemo, useState, useCallback } from 'react'

// import useAuth from '../hooks/useAuth'
// import DataTable from '../components/DataTable'
// import Pagination from '../components/Pagination'
// import { getClaims, getManagerClaims } from '../services/claimService'
// import { formatCurrency } from '../utils/formatCurrency'
// import { formatDate } from '../utils/formatDate'

const pill = (status) => (
  <span
    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status === 'APPROVED'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'REJECTED'
        ? 'bg-rose-50 text-rose-700'
        : 'bg-amber-50 text-amber-700'
      }`}
  >
    {status?.[0] + status?.slice(1).toLowerCase()}
  </span>
)

export default function Claims() {
  const { user } = useAuth()
  const manager = user?.role === 'MANAGER'

  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ALL')

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const PAGE_SIZE = 5

  // delete ==============================
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      setDeleting(true)

      await deleteClaim(deleteTarget.id)

      toast.success('Claim deleted successfully.')

      setDeleteTarget(null)

      await fetchClaims()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to delete claim.'
      )
    } finally {
      setDeleting(false)
    }
  }
  // delete ==============================

  useEffect(() => {
    fetchClaims()
  }, [manager, page, status, query])

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true)

      const params = {
        page: page - 1,
        size: PAGE_SIZE,
        ...(status !== 'ALL' && { status }),
        ...(query.trim() && { q: query.trim() }),
      }

      const response = manager
        ? await getManagerClaims(params)
        : await getClaims(params)

      const pageData = response.data.data

      setClaims(pageData.content || [])
      setTotalPages(pageData.totalPages || 1)
    } catch (error) {
      console.error('Claims API error:', error)
      toast.error(
        error.response?.data?.message || 'Unable to fetch claims'
      )
      setClaims([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [manager, page, status, query])

  useEffect(() => {
    fetchClaims()
  }, [fetchClaims])

  const columns = [
    {
      key: 'title',
      label: 'Claim',
      render: (r) => (
        <div>
          <b className="text-slate-800">{r.title}</b>
          <p className="mt-1 text-xs text-slate-400">
            {r.id}
          </p>
        </div>
      ),
    },
    {
      key: 'categoryName',
      label: 'Category',
      render: (r) => r.categoryName || '-',
    },
    ...(manager
      ? [
        {
          key: 'employeeName',
          label: 'Employee',
          render: (r) => r.employeeName || '-',
        },
      ]
      : []),
    {
      key: 'expenseDate',
      label: 'Expense date',
      render: (r) => formatDate(r.expenseDate),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (r) => (
        <b>{formatCurrency(Number(r.amount))}</b>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => pill(r.status),
    },
    // {
    //   key: 'action',
    //   label: '',
    //   render: (r) => (
    //     <Link
    //       to={`/claims/${r.id}`}
    //       className="inline-flex items-center gap-1 font-semibold text-indigo-600"
    //     >
    //       <Eye size={15} />
    //       View
    //     </Link>
    //   ),
    // },

    {
      key: 'action',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">

          {/* View */}
          <Link
            to={`/claims/${r.id}`}
            title="View claim"
            className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
          >
            <Eye size={16} />
          </Link>

          {/* Employee-only Edit and Delete */}
          {!manager && r.status === 'PENDING' && (
            <>
              <Link
                to={`/claims/${r.id}/edit`}
                title="Edit claim"
                className="rounded-lg bg-amber-50 p-2 text-amber-600 hover:bg-amber-100"
              >
                <Pencil size={16} />
              </Link>

              <button
                type="button"
                onClick={() => setDeleteTarget(r)}
                title="Delete claim"
                className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">

      <Modal
        open={!!deleteTarget}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        title="Delete claim"
      >
        <div className="space-y-4">

          <p className="text-sm text-slate-600">
            Are you sure you want to delete this claim?
          </p>

          <div className="rounded-xl bg-slate-50 p-3">
            <p className="font-semibold text-slate-800">
              {deleteTarget?.title}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {deleteTarget && formatCurrency(deleteTarget.amount)}
            </p>
          </div>

          <p className="text-xs text-rose-600">
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete'}
            </button>

          </div>
        </div>
      </Modal>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            {manager ? 'TEAM WORKSPACE' : 'YOUR EXPENSES'}
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            {manager ? 'All claims' : 'My claims'}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {manager
              ? 'Review and track expense submissions across your team.'
              : 'Track your submitted and reimbursed expenses.'}
          </p>
        </div>

        {!manager && (
          <Link
            to="/claims/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200"
          >
            <Plus size={17} />
            New claim
          </Link>
        )}
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">

        <div className="flex flex-wrap gap-3 border-b p-4">

          <div className="relative min-w-[220px] flex-1">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={17}
            />

            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search by claim title or ID..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal
              className="absolute left-3 top-3 text-slate-400"
              size={16}
            />

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            Loading claims...
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={claims}
          />
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
        />

      </div>
    </div>
  )
}


