import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, UserRound, ShieldCheck, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import { getUsers, updateUserStatus } from '../services/userService'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const pageSize = 10

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)

      const response = await getUsers({
        page: page - 1,
        size: pageSize,
      })

      const result = response.data.data

      setUsers(result.content || [])
      setTotalPages(result.totalPages || 1)
      setTotalElements(result.totalElements || 0)
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to fetch employees'
      )
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const toggleStatus = async (user) => {
    try {
      setUpdatingId(user.id)

      await updateUserStatus(user.id, !user.active)

      toast.success(
        `${user.name} ${user.active ? 'deactivated' : 'activated'} successfully`
      )

      await fetchUsers()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to update employee status'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase()

    if (!value) return users

    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(value) ||
        user.email?.toLowerCase().includes(value)
    )
  }, [users, search])

  const activeCount = users.filter((user) => user.active).length
  const inactiveCount = users.filter((user) => !user.active).length

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      render: (user) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-50 text-indigo-600">
            <UserRound size={17} />
          </span>

          <div>
            <b className="text-slate-800">{user.name}</b>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => (
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <ShieldCheck size={14} />
          {user.role}
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Account status',
      render: (user) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            user.active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {user.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (user) =>
        user.createdAt
          ? new Date(user.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '-',
    },
    {
      key: 'action',
      label: 'Action',
      render: (user) => (
        <button
          disabled={updatingId === user.id}
          onClick={() => toggleStatus(user)}
          className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
            user.active
              ? 'bg-rose-50 text-rose-700'
              : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {updatingId === user.id
            ? 'Updating...'
            : user.active
              ? 'Deactivate'
              : 'Activate'}
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">ORGANISATION</p>

          <h1 className="mt-1 text-3xl font-bold">
            User management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage employee access to the expense workspace.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">Total employees</p>
          <p className="mt-2 text-2xl font-bold">{totalElements}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">Active on this page</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">Inactive on this page</p>
          <p className="mt-2 text-2xl font-bold text-slate-700">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* Employee Table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <div className="relative max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading employees...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            {search ? 'No employees found.' : 'No employees available.'}
          </div>
        ) : (
          <DataTable columns={columns} rows={filteredUsers} />
        )}

        {!loading && totalElements > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(nextPage) => {
              setPage(nextPage)
              setSearch('')
            }}
          />
        )}
      </div>
    </div>
  )
}
