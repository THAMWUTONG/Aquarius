import { useEffect } from "react"
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa"

/**
 * A transient notification banner shown at the bottom-right of the screen.
 * Automatically calls onDismiss after 3 seconds.
 * @param {Object} props
 * @param {string} props.message - Text to display.
 * @param {"success"|"error"} props.type - Visual style of the toast.
 * @param {Function} props.onDismiss - Called automatically after the timeout.
 */
function Toast({ message, type = "success", onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000)

    // Cleanup: cancel the timer if the toast unmounts early.
    return () => clearTimeout(timer)
  }, [onDismiss])

  const isError = type === "error"

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
        isError ? "bg-red-500" : "bg-emerald-500"
      }`}
      role="status"
    >
      {isError ? <FaExclamationCircle /> : <FaCheckCircle />}
      <span>{message}</span>
    </div>
  )
}

export default Toast