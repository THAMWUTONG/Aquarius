import { useEffect, useState } from "react"
import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import { useRoleGuard } from "../hooks/useRoleGuard.jsx"
import { fetchAdminStats } from "../services/adminService.jsx"
import { FaUsers, FaBook, FaUserCheck, FaExclamationTriangle } from "react-icons/fa"

/**
 * Admin landing page. Guards access to admin-only users, then fetches and
 * displays aggregate platform statistics.
 */
function AdminDashboard() {
  const { user, isAuthorized } = useRoleGuard(["admin"])

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isAuthorized) return

    let isMounted = true
    fetchAdminStats()
      .then((data) => { if (isMounted) setStats(data) })
      .catch((err) => { if (isMounted) setError(err.message) })
      .finally(() => { if (isMounted) setLoading(false) })

    return () => { isMounted = false }
  }, [isAuthorized])

  if (!isAuthorized) return null

  return (
    <div className="flex min-h-screen flex-row bg-gray-100">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <HeaderBar displayedTitle="Admin Dashboard" userName={user.name} userRole={user.role} />

        <div className="space-y-6 p-8">
          {/* Non-blocking error banner: stats API failed, but the page itself still renders */}
          {error && (
            <div className="rounded-lg p-4 text-sm text-red-600 bg-red-50 ring ring-red-200">
              Failed to load dashboard stats: {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Users" value={loading ? null : stats?.totalUsers} icon={<FaUsers className="text-sky-500" size={20} />} />
            <StatCard label="Total Courses" value={loading ? null : stats?.totalCourses} icon={<FaBook className="text-sky-500" size={20} />} />
            <StatCard label="Active Users" value={loading ? null : stats?.activeUsers} icon={<FaUserCheck className="text-emerald-500" size={20} />} />
            <StatCard label="Pending Approvals" value={loading ? null : stats?.pendingApprovals} icon={<FaExclamationTriangle className="text-amber-500" size={20} />} />
          </div>
        </div>
      </main>
    </div>
  )
}

/**
 * Displays a single dashboard statistic in a card, with a skeleton
 * loading state when the value has not arrived yet.
 * @param {Object} props
 * @param {string} props.label
 * @param {number|null|undefined} props.value
 * @param {JSX.Element} props.icon
 */
function StatCard({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between rounded-lg p-5 bg-white ring ring-gray-300">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        {/* value is null while loading, undefined if the field is missing from the API response */}
        {value === null || value === undefined ? (
          <div className="mt-1 h-7 w-12 rounded bg-gray-200 animate-pulse" />
        ) : (
          <p className="mt-1 text-2xl font-bold">{value}</p>
        )}
      </div>
      <div className="rounded-full p-3 bg-sky-50">{icon}</div>
    </div>
  )
}

export default AdminDashboard