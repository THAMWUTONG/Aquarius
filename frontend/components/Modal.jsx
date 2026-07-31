import { FaTimes } from "react-icons/fa"

/**
 * Generic centered modal shell with a title, close button, and body content.
 * Renders nothing when isOpen is false.
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal should be shown.
 * @param {string} props.title - Modal heading text.
 * @param {Function} props.onClose - Called when the user closes the modal.
 * @param {React.ReactNode} props.children - Modal body content.
 */
function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            className="text-gray-400 transition-all hover:text-gray-600"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <FaTimes size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export default Modal