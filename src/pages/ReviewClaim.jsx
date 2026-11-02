import { useCallback, useEffect, useState } from 'react'
import { Check, X, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import Modal from '../components/Modal'
import DataTable from '../components/DataTable'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'

import {
    getManagerClaims,
    approveClaim,
    rejectClaim,
} from '../services/claimService'

export default function ReviewClaim() {
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [active, setActive] = useState(null)
    const [mode, setMode] = useState('APPROVE')
    const [comment, setComment] = useState('')

    // Fetch pending claims from backend
    const fetchPendingClaims = useCallback(async () => {
        try {
            setLoading(true)

            const response = await getManagerClaims({
                status: 'PENDING',
                page: 0,
                size: 100,
            })

            const content = response.data?.data?.content ?? []

            setRows(content)
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Unable to fetch pending claims.'
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPendingClaims()
    }, [fetchPendingClaims])

    // Open approval/rejection modal
    const openReviewModal = (claim, action) => {
        setActive(claim)
        setMode(action)
        setComment('')
    }

    // Approve or reject claim
    const decide = async () => {
        if (!active) return

        if (mode === 'REJECT' && !comment.trim()) {
            toast.error('A rejection comment is mandatory.')
            return
        }

        try {
            setSubmitting(true)

            if (mode === 'APPROVE') {
                await approveClaim(active.id, comment.trim() || null)
                toast.success('Claim approved successfully.')
            } else {
                await rejectClaim(active.id, comment.trim())
                toast.success('Claim rejected successfully.')
            }

            setActive(null)
            setComment('')

            // Refresh pending queue after successful action
            await fetchPendingClaims()

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                `Unable to ${mode.toLowerCase()} claim.`
            )
        } finally {
            setSubmitting(false)
        }
    }

    const cols = [
        {
            key: 'id',
            label: 'Claim ID',
            render: (r) => (
                <b className="text-slate-800">
                    CLM-{r.id.slice(0, 8).toUpperCase()}
                </b>
            ),
        },
        {
            key: 'title',
            label: 'Expense',
            render: (r) => (
                <Link
                    to={`/claims/${r.id}`}
                    className="font-medium text-indigo-600 hover:underline"
                >
                    {r.title}
                </Link>
            ),
        },
        {
            key: 'employeeName',
            label: 'Employee',
            render: (r) => r.employeeName || '-',
        },
        {
            key: 'categoryName',
            label: 'Category',
            render: (r) => r.categoryName || '-',
        },
        {
            key: 'amount',
            label: 'Amount',
            render: (r) => (
                <b>{formatCurrency(r.amount)}</b>
            ),
        },
        {
            key: 'createdAt',
            label: 'Submitted',
            render: (r) => formatDate(r.createdAt),
        },
        {
            key: 'action',
            label: 'Review',
            render: (r) => (
                <div className="flex items-center gap-2">
                    <Link
                        to={`/claims/${r.id}`}
                        title="View claim details"
                        className="rounded-lg bg-indigo-50 p-2 text-indigo-600"
                    >
                        <Eye size={16} />
                    </Link>

                    <button
                        onClick={() => openReviewModal(r, 'APPROVE')}
                        title="Approve claim"
                        className="rounded-lg bg-emerald-50 p-2 text-emerald-700"
                    >
                        <Check size={16} />
                    </button>

                    <button
                        onClick={() => openReviewModal(r, 'REJECT')}
                        title="Reject claim"
                        className="rounded-lg bg-rose-50 p-2 text-rose-700"
                    >
                        <X size={16} />
                    </button>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <p className="text-sm text-slate-500">
                    MANAGER WORKSPACE
                </p>

                <h1 className="mt-1 text-3xl font-bold">
                    Review queue
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Review pending expenses and record a decision.
                </p>
            </div>

            {/* Review Queue */}
            <div className="rounded-2xl border bg-white shadow-sm">

                <div className="flex items-center justify-between border-b p-5">
                    <div>
                        <b>Awaiting your review</b>

                        <p className="mt-1 text-xs text-slate-400">
                            {rows.length} claims pending
                        </p>
                    </div>

                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Pending
                    </span>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-slate-500">
                        Loading pending claims...
                    </div>
                ) : rows.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">
                        No pending claims found.
                    </div>
                ) : (
                    <DataTable
                        columns={cols}
                        rows={rows}
                    />
                )}
            </div>

            {/* Approval / Rejection Modal */}
            <Modal
                open={!!active}
                onClose={() => {
                    if (!submitting) setActive(null)
                }}
                title={`${mode === 'APPROVE' ? 'Approve' : 'Reject'} claim`}
            >
                <p className="text-sm text-slate-600">
                    {active?.title}
                    {' · '}
                    {active && formatCurrency(active.amount)}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                    Employee: {active?.employeeName}
                </p>

                <label className="mt-5 block text-sm font-medium">
                    {mode === 'REJECT'
                        ? 'Rejection comment (required)'
                        : 'Comment (optional)'}
                </label>

                <textarea
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a note for the employee..."
                    disabled={submitting}
                    className="mt-2 w-full rounded-xl border p-3 text-sm outline-none focus:border-indigo-500"
                />

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        onClick={() => setActive(null)}
                        disabled={submitting}
                        className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={decide}
                        disabled={submitting}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                            mode === 'REJECT'
                                ? 'bg-rose-600'
                                : 'bg-emerald-600'
                        }`}
                    >
                        {submitting
                            ? 'Processing...'
                            : `Confirm ${mode.toLowerCase()}`}
                    </button>
                </div>
            </Modal>

        </div>
    )
}
