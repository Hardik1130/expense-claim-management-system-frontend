
import Modal from './Modal'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
    >
      <p className="text-sm text-slate-600">
        {message}
      </p>

      <div className="mt-6 flex justify-end gap-2">
        <button
          className="rounded-lg border px-4 py-2 text-sm"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white"
          onClick={onConfirm}
        >
          Confirm
        </button>
      </div>
    </Modal>
  )
}
