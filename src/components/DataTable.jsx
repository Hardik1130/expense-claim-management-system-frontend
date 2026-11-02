
export default function DataTable({
  columns,
  rows,
  empty = 'No records found',
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        {/* Table Header */}
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-5 py-3 font-semibold"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100">
          {rows.length ? (
            rows.map((r, i) => (
              <tr
                key={r.id || i}
                className="hover:bg-slate-50/70"
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className="whitespace-nowrap px-5 py-4 text-slate-700"
                  >
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-12 text-center text-slate-400"
              >
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
