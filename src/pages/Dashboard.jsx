import { useMemo } from 'react'
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    getEmployeeDashboard,
    getManagerDashboard
} from '../services/dashboardService';
import {
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    Receipt,
    Wallet,
    XCircle,
    Users,
    TrendingUp,
} from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts'
import useAuth from '../hooks/useAuth'
import StatCard from '../components/StatCard'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import {
    getClaims,
    getManagerClaims,
} from '../services/claimService';

// const demoClaims = [
//     {
//         id: 'CLM-1048',
//         title: 'Client meeting travel',
//         category: 'Travel',
//         amount: 2450,
//         status: 'PENDING',
//         date: '2026-11-01',
//         employee: 'Aarav Sharma',
//     },
//     {
//         id: 'CLM-1047',
//         title: 'Team lunch',
//         category: 'Meals',
//         amount: 3800,
//         status: 'APPROVED',
//         date: '2026-10-29',
//         employee: 'Aarav Sharma',
//     },
//     {
//         id: 'CLM-1046',
//         title: 'Design software subscription',
//         category: 'Software',
//         amount: 1299,
//         status: 'APPROVED',
//         date: '2026-10-25',
//         employee: 'Neha Verma',
//     },
//     {
//         id: 'CLM-1045',
//         title: 'Airport cab',
//         category: 'Travel',
//         amount: 950,
//         status: 'REJECTED',
//         date: '2026-10-22',
//         employee: 'Rohan Das',
//     },
//     {
//         id: 'CLM-1044',
//         title: 'Office supplies',
//         category: 'Supplies',
//         amount: 1680,
//         status: 'PENDING',
//         date: '2026-10-20',
//         employee: 'Aarav Sharma',
//     },
// ]

// const monthly = [
//     { month: 'Jun', amount: 18000 },
//     { month: 'Jul', amount: 24500 },
//     { month: 'Aug', amount: 21000 },
//     { month: 'Sep', amount: 32000 },
//     { month: 'Oct', amount: 27800 },
//     { month: 'Nov', amount: 12400 },
// ]

const Badge = ({ status }) => {
    const colorClasses =
        status === 'APPROVED'
            ? 'bg-emerald-50 text-emerald-700'
            : status === 'REJECTED'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-amber-50 text-amber-700'

    return (
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${colorClasses}`}>
            {status[0] + status.slice(1).toLowerCase()}
        </span>
    )
}

export default function Dashboard() {
    const { user } = useAuth()
    const manager = user?.role === 'MANAGER'

    const [dashboard, setDashboard] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);

    const [recentClaims, setRecentClaims] = useState([]);
    const [claimsLoading, setClaimsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = manager
                    ? await getManagerDashboard()
                    : await getEmployeeDashboard();

                setDashboard(response.data.data);
            } catch (error) {
                toast.error(
                    error.response?.data?.message ||
                    'Unable to load dashboard'
                );
            } finally {
                setDashboardLoading(false);
            }
        };

        fetchDashboard();
    }, [manager]);

    useEffect(() => {
        const fetchRecentClaims = async () => {
            try {
                setClaimsLoading(true);

                const response = manager
                    ? await getManagerClaims({ page: 0, size: 5 })
                    : await getClaims({ page: 0, size: 5 });

                const result = response.data.data;

                const claimList = Array.isArray(result)
                    ? result
                    : result?.content ??
                    result?.claims ??
                    result?.items ??
                    [];

                setRecentClaims(claimList);
            } catch (error) {
                console.error('Recent claims error:', error);
                toast.error(
                    error.response?.data?.message ||
                    'Unable to load recent claims'
                );
                setRecentClaims([]);
            } finally {
                setClaimsLoading(false);
            }
        };

        fetchRecentClaims();
    }, [manager]);

    // const mine = demoClaims.filter((c) => c.employee === user?.name)
    // const claims = manager ? demoClaims : mine

    // const total = claims.reduce((s, c) => s + c.amount, 0)
    // const approved = claims
    //     .filter((c) => c.status === 'APPROVED')
    //     .reduce((s, c) => s + c.amount, 0)
    // const pending = claims
    //     .filter((c) => c.status === 'PENDING')
    //     .reduce((s, c) => s + c.amount, 0)
    // const rejected = claims
    //     .filter((c) => c.status === 'REJECTED')
    //     .reduce((s, c) => s + c.amount, 0)

    // const pie = [
    //     { name: 'Travel', value: 12400 },
    //     { name: 'Meals', value: 8200 },
    //     { name: 'Software', value: 5600 },
    //     { name: 'Supplies', value: 3900 },
    // ]

    const monthly = (dashboard?.monthlySummary ?? []).map((item) => {
        const [year, month] = item.month.split('-');

        return {
            month: new Date(
                Number(year),
                Number(month) - 1
            ).toLocaleString('en-IN', {
                month: 'short',
            }),
            amount: Number(item.amount),
        };
    });

    const pie = (dashboard?.categoryTotals ?? []).map((item) => ({
        name: item.category,
        value: Number(item.amount),
    }));

    const pieColors = ['#6366f1', '#10b981', '#f59e0b', '#f472b6']

    if (dashboardLoading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-slate-500">Loading dashboard...</p>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="rounded-xl border bg-white p-6 text-center">
                <p className="text-red-600">
                    Unable to load dashboard data.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-7">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-sm text-slate-500">
                        {manager ? 'MANAGER OVERVIEW' : 'EMPLOYEE OVERVIEW'}
                    </p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight">
                        Good afternoon, {user?.name?.split(' ')[0]}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        {manager
                            ? 'Here is what is happening across your organisation.'
                            : 'Here is a snapshot of your expense activity.'}
                    </p>
                </div>
                <div className="rounded-xl border bg-white px-4 py-2 text-sm text-slate-500">
                    November 2026 <span className="ml-2 text-slate-900">⌄</span>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {manager ? (
                    <>
                        <StatCard
                            label="Total claims"
                            value={dashboard?.totalClaims ?? 0}
                            sub="Across the organisation"
                            icon={Receipt}
                            tone="indigo"
                        />

                        <StatCard
                            label="Awaiting review"
                            value={dashboard?.pendingCount ?? 0}
                            sub="Needs your attention"
                            icon={Clock3}
                            tone="amber"
                        />

                        <StatCard
                            label="Approved amount"
                            value={formatCurrency(dashboard?.approvedAmount ?? 0)}
                            sub={`${dashboard?.approvedCount ?? 0} approved claims`}
                            icon={CheckCircle2}
                            tone="emerald"
                        />

                        <StatCard
                            label="Rejected claims"
                            value={dashboard?.rejectedCount ?? 0}
                            sub="Rejected expense claims"
                            icon={XCircle}
                            tone="rose"
                        />
                    </>
                ) : (
                    <>
                        <StatCard
                            label="Total claimed"
                            value={formatCurrency(dashboard?.totalClaimedAmount ?? 0)}
                            sub={`${dashboard?.totalClaims ?? 0} submitted claims`}
                            icon={Wallet}
                            tone="indigo"
                        />

                        <StatCard
                            label="Approved amount"
                            value={formatCurrency(dashboard?.approvedAmount ?? 0)}
                            sub={`${dashboard?.approvedCount ?? 0} approved claims`}
                            icon={CheckCircle2}
                            tone="emerald"
                        />

                        <StatCard
                            label="Pending amount"
                            value={formatCurrency(dashboard?.pendingAmount ?? 0)}
                            sub={`${dashboard?.pendingCount ?? 0} pending claims`}
                            icon={Clock3}
                            tone="amber"
                        />

                        <StatCard
                            label="Rejected amount"
                            value={formatCurrency(dashboard?.rejectedAmount ?? 0)}
                            sub={`${dashboard?.rejectedCount ?? 0} rejected claims`}
                            icon={XCircle}
                            tone="rose"
                        />
                    </>
                )}
            </div>

            {/* Analytics Charts */}
            <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">
                                {manager ? 'Monthly expense overview' : 'Your expense trend'}
                            </h2>
                            <p className="mt-1 text-xs text-slate-400">
                                Expense volume over the last six months
                            </p>
                        </div>
                        <button className="text-xs font-semibold text-indigo-600">
                            View report <ArrowUpRight className="inline" size={14} />
                        </button>
                    </div>
                    <div className="mt-5 h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthly}>
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    tickFormatter={(v) => `${v / 1000}k`}
                                />
                                <Tooltip formatter={(v) => formatCurrency(v)} />
                                <Bar
                                    dataKey="amount"
                                    fill="#6366f1"
                                    radius={[6, 6, 0, 0]}
                                    barSize={28}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="font-semibold">
                        {manager ? 'Spend by category' : 'Your category split'}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                        Approved and submitted expenses
                    </p>
                    <div className="mt-2 h-[190px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pie}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={55}
                                    outerRadius={82}
                                    paddingAngle={3}
                                >
                                    {pie.map((x, i) => (
                                        <Cell key={x.name} fill={pieColors[i % pieColors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => formatCurrency(v)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {pie.map((p, i) => (
                            <div key={p.name} className="flex items-center gap-2 text-xs text-slate-500">
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ background: pieColors[i % pieColors.length] }}
                                />
                                {p.name}
                                <b className="ml-auto text-slate-800">{formatCurrency(p.value)}</b>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Claims Table */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 py-5">
                    <div>
                        <h2 className="font-semibold">
                            {manager ? 'Recent claims' : 'Recent activity'}
                        </h2>
                        <p className="mt-1 text-xs text-slate-400">
                            {manager
                                ? 'Latest submissions from your team'
                                : 'Your latest submitted expenses'}
                        </p>
                    </div>
                    <a href="/claims" className="text-sm font-semibold text-indigo-600">
                        View all <ArrowUpRight className="inline" size={14} />
                    </a>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                            <tr>
                                {['Claim', 'Category', ...(manager ? ['Employee'] : []), 'Date', 'Amount', 'Status'].map(
                                    (header) => (
                                        <th key={header} className="px-5 py-3 font-semibold">
                                            {header}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {claimsLoading ? (
                                <tr>
                                    <td
                                        colSpan={manager ? 6 : 5}
                                        className="px-5 py-8 text-center text-slate-500"
                                    >
                                        Loading recent claims...
                                    </td>
                                </tr>
                            ) : recentClaims.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={manager ? 6 : 5}
                                        className="px-5 py-8 text-center text-slate-500"
                                    >
                                        No claims found.
                                    </td>
                                </tr>
                            ) : (
                                recentClaims.map((c) => (
                                    <tr key={c.id}>
                                        <td className="px-5 py-4">
                                            <b className="block text-slate-800">
                                                {c.title}
                                            </b>
                                            <span className="text-xs text-slate-400">
                                                {c.id}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-slate-500">
                                            {typeof c.category === 'object'
                                                ? c.category?.name
                                                : c.category}
                                        </td>

                                        {manager && (
                                            <td className="px-5 py-4 text-slate-500">
                                                {c.employeeName ||
                                                    c.userName ||
                                                    c.user?.name ||
                                                    '-'}
                                            </td>
                                        )}

                                        <td className="px-5 py-4 text-slate-500">
                                            {formatDate(c.expenseDate || c.date)}
                                        </td>

                                        <td className="px-5 py-4 font-semibold">
                                            {formatCurrency(c.amount)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <Badge status={c.status} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}