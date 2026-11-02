import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Paperclip } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCategories } from '../services/categoryService'
import { createClaim } from '../services/claimService'
import { uploadReceipt } from '../services/receiptService'

export default function CreateClaim() {
    const nav = useNavigate()

    const [form, setForm] = useState({
        title: '',
        amount: '',
        categoryId: '',
        expenseDate: new Date().toISOString().slice(0, 10),
        description: '',
    })

    const [categories, setCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(true)

    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories()

                const categoryList = response.data.data || []

                setCategories(categoryList)

                if (categoryList.length > 0) {
                    setForm(prev => ({
                        ...prev,
                        categoryId: categoryList[0].id,
                    }))
                }
            } catch (error) {
                console.error('Category fetch error:', error)
                toast.error('Unable to load expense categories')
            } finally {
                setLoadingCategories(false)
            }
        }

        fetchCategories()
    }, [])


    const change = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const submit = async (e) => {
        e.preventDefault()

        if (Number(form.amount) <= 0) {
            toast.error('Amount must be greater than zero')
            return
        }

        if (!form.categoryId) {
            toast.error('Please select a category')
            return
        }

        try {
            setLoading(true)

            // STEP 1: Create claim in backend
            const response = await createClaim({
                title: form.title.trim(),
                amount: Number(form.amount),
                categoryId: form.categoryId,
                expenseDate: form.expenseDate,
                description: form.description.trim(),
            })

            const claim = response.data.data

            if (!claim?.id) {
                throw new Error('Claim ID was not returned by the server.')
            }

            // STEP 2: Upload receipt if selected
            if (file) {
                await uploadReceipt(claim.id, file)
            }

            toast.success('Claim created successfully!')

            // STEP 3: Open My Claims
            nav('/claims')

        } catch (error) {
            console.error('Claim creation error:', error)

            toast.error(
                error.response?.data?.message ||
                error.message ||
                'Unable to create claim.'
            )
        } finally {
            setLoading(false)
        }
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

                <h1 className="mt-4 text-3xl font-bold">
                    Create a claim
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Add the details of your business expense.
                </p>
            </div>

            <form
                onSubmit={submit}
                className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
            >
                <div className="grid gap-5 sm:grid-cols-2">

                    <label className="text-sm font-medium sm:col-span-2">
                        Claim title
                        <input
                            required
                            maxLength="160"
                            name="title"
                            value={form.title}
                            onChange={change}
                            placeholder="e.g. Client meeting travel"
                            className="mt-2 w-full rounded-xl border px-4 py-3"
                        />
                    </label>

                    <label className="text-sm font-medium">
                        Amount (₹)
                        <input
                            required
                            min="0.01"
                            step="0.01"
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={change}
                            placeholder="0.00"
                            className="mt-2 w-full rounded-xl border px-4 py-3"
                        />
                    </label>

                    <label className="text-sm font-medium">
                        Category

                        <select
                            required
                            name="categoryId"
                            value={form.categoryId}
                            onChange={change}
                            disabled={loadingCategories || categories.length === 0}
                            className="mt-2 w-full rounded-xl border bg-white px-4 py-3"
                        >
                            {loadingCategories ? (
                                <option value="">Loading categories...</option>
                            ) : categories.length === 0 ? (
                                <option value="">No categories available</option>
                            ) : (
                                categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </label>

                    <label className="text-sm font-medium">
                        Expense date
                        <input
                            required
                            type="date"
                            name="expenseDate"
                            value={form.expenseDate}
                            onChange={change}
                            className="mt-2 w-full rounded-xl border px-4 py-3"
                        />
                    </label>

                    <label className="text-sm font-medium sm:col-span-2">
                        Description
                        <textarea
                            required
                            maxLength="2000"
                            rows="4"
                            name="description"
                            value={form.description}
                            onChange={change}
                            placeholder="Add a short explanation for this expense..."
                            className="mt-2 w-full rounded-xl border px-4 py-3"
                        />
                    </label>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4">
                    <Paperclip className="text-indigo-600" />

                    <span className="flex-1">
                        <b className="block text-sm">Attach receipt</b>
                        <small className="text-slate-400">
                            PDF, JPG or PNG
                        </small>
                    </span>

                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => setFile(e.target.files[0] || null)}
                        className="max-w-[145px] text-xs"
                    />
                </label>

                {file && (
                    <p className="text-xs text-emerald-700">
                        Selected: {file.name}
                    </p>
                )}

                <div className="flex justify-end gap-3 border-t pt-5">
                    <Link
                        to="/claims"
                        className="rounded-xl border px-5 py-3 text-sm font-semibold"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Submit claim'}
                    </button>
                </div>
            </form>
        </div>
    )
}
