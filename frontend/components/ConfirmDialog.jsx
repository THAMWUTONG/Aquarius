import Modal from "./Modal.jsx"

/**
 * A confirmation modal for destructive actions (e.g. delete, disenroll).
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dialog should be shown.
 * @param {string} props.title - Dialog heading (e.g. "Delete User?").
 * @param {string} props.message - Explanation of what will happen.
 * @param {Function} props.onConfirm - Called when the user confirms the action.
 * @param {Function} props.onCancel - Called when the user cancels.
 */
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <p className="mb-6 text-sm text-gray-600">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          className="rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:bg-gray-100"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-500 transition-all hover:bg-red-600"
          onClick={onConfirm}
          type="button"
        >
          Confirm
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
