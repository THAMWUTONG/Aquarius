import { useEffect, useState } from "react"
import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate, Link } from "react-router"
import { fetchAdminStats } from "../services/adminService.jsx"
import { fetchScoreTrend } from "../services/scoreTrendService.jsx"
import { fetchAuditLogs } from "../services/auditService.jsx"
import {
  FaUsers,
  FaBook,
  FaUserCheck,
  FaExclamationTriangle,
  FaUsersCog,
  FaChartBar,
  FaShieldAlt,
  FaUserGraduate,
  FaHistory,
} from "react-icons/fa"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

/**
 * Admin landing page. Guards access to admin-only users, then fetches and
 * displays platform stats, a role breakdown, a score trend chart, recent
 * audit activity, and quick links to the other admin pages.
 */
function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [trend, setTrend] = useState([])
  const [recentLogs, setRecentLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Route guard: redirect anyone who isn't a logged-in admin.
    if (!user || user.role !== "admin") {
      navigate("/")
    }
  }, [user, navigate])

  useEffect(() => {
    if (!user || user.role !== "admin") return

    let isMounted = true

    // Fetch all three data sources in parallel rather than sequentially,
    // since none of them depend on each other's result.
    Promise.all([fetchAdminStats(), fetchScoreTrend(), fetchAuditLogs()])
      .then(([statsData, trendData, logsData]) => {
        if (!isMounted) return
        setStats(statsData)
        setTrend(trendData)
        setRecentLogs(logsData.slice(0, 5))
      })
      .catch((err) => { if (isMounted) setError(err.message) })
      .finally(() => { if (isMounted) setLoading(false) })

    return () => { isMounted = false }
  }, [user])

  // Avoid flashing admin content before the redirect above takes effect.
  if (!user || user.role !== "admin") {
    return null;
  }
  else {
    const quickLinks = [
      { label: "Manage Users", href: "/manage-users", icon: <FaUsersCog size={18} /> },
      { label: "Platform Statistics", href: "/platform-statistics", icon: <FaChartBar size={18} /> },
      { label: "Platform Regulation", href: "/platform-regulation", icon: <FaShieldAlt size={18} /> },
      { label: "Manage Enrollment", href: "/manage-enrollment", icon: <FaUserGraduate size={18} /> },
      { label: "Audit Log", href: "/audit-log", icon: <FaHistory size={18} /> },
    ];

    return (
      <div className="flex min-h-screen flex-row bg-gray-100">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <HeaderBar displayedTitle="Admin Dashboard" userName={user.name} userRole={user.role} />

          <div className="space-y-6 p-8">
            {/* Non-blocking error banner: one or more fetches failed, but the page itself still renders */}
            {error && (
              <div className="rounded-lg p-4 text-sm text-red-600 bg-red-50 ring ring-red-200">
                Failed to load dashboard data: {error}
              </div>
            )}

            <div className="flex justify-between items-center p-6 rounded-xl shadow-md bg-linear-to-r from-sky-400 to-sky-600">
              <div>
                <h2 className="text-2xl font-bold text-white">Good morning, { user.name }!</h2>
                <p className="text-white">Here's what's happening on Aquarius today.</p>
              </div>
              <div className="flex gap-2">
                </div>
            </div>

            {/* Top stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Users" value={loading ? null : stats?.totalUsers} icon={<FaUsers className="text-sky-500" size={20} />} />
              <StatCard label="Total Courses" value={loading ? null : stats?.totalCourses} icon={<FaBook className="text-sky-500" size={20} />} />
              <StatCard label="Active Today" value={loading ? null : stats?.activeUsers} icon={<FaUserCheck className="text-sky-500" size={20} />} />
              <StatCard
                label="Pending Approvals"
                value={loading ? null : stats?.pendingApprovals}
                icon={<FaExclamationTriangle className="text-sky-500" size={20} />}
                sublabel={!loading && stats ? `${stats.pendingMaterials} materials · ${stats.pendingQuizzes} quizzes` : null}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Role breakdown */}
              <div className="rounded-xl p-5 bg-white ring ring-gray-300">
                <h3 className="mb-4 text-lg font-bold">User Breakdown</h3>
                {loading ? (
                  <div className="h-24 rounded bg-gray-100 animate-pulse" />
                ) : (
                  <div className="space-y-3">
                    <RoleBar label="Students" count={stats?.totalStudents} percentage={stats?.studentPercentage} color="bg-sky-400" />
                    <RoleBar label="Lecturers" count={stats?.totalLecturers} percentage={stats?.lecturerPercentage} color="bg-sky-400" />
                    <RoleBar label="Admins" count={stats?.totalAdmins} percentage={stats?.adminPercentage} color="bg-sky-400" />
                  </div>
                )}
              </div>

              {/* Score trend chart */}
              <div className="rounded-xl p-5 bg-white ring ring-gray-300 lg:col-span-2">
                <h3 className="mb-4 text-lg font-bold">Average Score Trend</h3>
                {loading ? (
                  <div className="h-40 rounded bg-gray-100 animate-pulse" />
                ) : trend.length === 0 ? (
                  <p className="text-sm text-gray-400">No quiz attempt data yet.</p>
                ) : (
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trend}>
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="averageScore" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Recent activity */}
              <div className="rounded-xl p-5 bg-white ring ring-gray-300 lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Recent Activity</h3>
                  <Link to="/audit-log" className="text-sm text-sky-500 hover:underline">View all</Link>
                </div>
                {loading ? (
                  <div className="h-32 rounded bg-gray-100 animate-pulse" />
                ) : recentLogs.length === 0 ? (
                  <p className="text-sm text-gray-400">No recent activity.</p>
                ) : (
                  <ul className="space-y-3">
                    {recentLogs.map((log, idx) => (
                      <li key={idx} className="border-b border-gray-100 pb-2 text-sm last:border-0 last:pb-0">
                        <p className="text-slate-700">{log.action}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{log.actor} · {new Date(log.timestamp).toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Quick actions */}
              <div className="rounded-xl p-5 bg-white ring ring-gray-300">
                <h3 className="mb-4 text-lg font-bold">Quick Actions</h3>
                <div className="space-y-2">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="flex items-center gap-3 rounded-lg p-3 text-sm text-slate-700 transition-all hover:bg-sky-50 hover:text-sky-600"
                    >
                      <span className="text-sky-500">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

/**
 * Displays a single dashboard statistic in a card, with a skeleton loading
 * state when the value has not arrived yet, and an optional breakdown line.
 * @param {Object} props
 * @param {string} props.label - The label describing the statistic.
 * @param {number|null|undefined} props.value - The statistic's value, or null/undefined while loading.
 * @param {JSX.Element} props.icon - The icon element shown alongside the value.
 * @param {string|null} [props.sublabel] - Optional secondary text shown under the value.
 */
function StatCard({ label, value, icon, sublabel }) {
  return (
    <div className="flex items-center justify-between rounded-lg p-5 bg-white ring ring-gray-300">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        {value === null || value === undefined ? (
          <div className="mt-1 h-7 w-12 rounded bg-gray-200 animate-pulse" />
        ) : (
          <p className="mt-1 text-2xl font-bold">{value}</p>
        )}
        {sublabel && <p className="mt-1 text-xs text-gray-400">{sublabel}</p>}
      </div>
      <div className="rounded-full p-3 bg-sky-50">{icon}</div>
    </div>
  )
}

/**
 * Displays one role's share of the platform as a labeled progress bar.
 * @param {Object} props
 * @param {string} props.label - Role name (e.g. "Students").
 * @param {number|undefined} props.count - Number of users in this role.
 * @param {number|undefined} props.percentage - This role's percentage of total users (0-100).
 * @param {string} props.color - Tailwind background color class for the filled bar.
 */
function RoleBar({ label, count, percentage, color }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="text-gray-500">{count ?? 0} ({percentage ?? 0}%)</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage ?? 0}%` }} />
      </div>
    </div>
  )
}

export default AdminDashboard