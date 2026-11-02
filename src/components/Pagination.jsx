
export default function Pagination({ page, totalPages, onChange }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm">
      <span className="text-slate-500">
        Page {page} of {Math.max(totalPages, 1)}
      </span>

      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
        >
          Previous
        </button>

        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
