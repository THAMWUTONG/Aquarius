/**
 * A small color-coded pill used to show a status value (e.g. "approved",
 * "pending", "rejected", "active", "flagged").
 * @param {Object} props
 * @param {string} props.status - The status text to display.
 */
function Badge({ status }) {
  const normalized = (status || "").toLowerCase()

  const colorMap = {
    approved: "bg-green-100 text-green-700",
    active: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    flagged: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
    inactive: "bg-gray-100 text-gray-600",
  }

  // Fall back to neutral gray for any status string we don't recognize.
  const colorClasses = colorMap[normalized] || "bg-gray-100 text-gray-600"

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${colorClasses}`}>
      {status || "unknown"}
    </span>
  )
}

export default Badge
