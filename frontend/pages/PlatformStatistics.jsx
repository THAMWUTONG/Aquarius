import { useEffect, useState } from "react"
import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import { useRoleGuard } from "../hooks/useRoleGuard.jsx"
import { fetchPlatformStatistics } from "../services/platformStatsService.jsx"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

/**
 * Admin page showing platform-wide usage trends, system-wide weak-topic
 * aggregation, and overall performance, rendered with Recharts.
 */
function PlatformStatistics() {
  const { user, isAuthorized } = useRoleGuard(["admin"])

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isAuthorized) return

    let isMounted = true
    fetchPlatformStatistics()
      .then((result) => { if (isMounted) setData(result) })
      .catch((err) => { if (isMounted) setError(err.message) })
      .finally(() => { if (isMounted) setLoading(false) })

    return () => { isMounted = false }
  }, [isAuthorized])

  if (!isAuthorized) return null

  const usageOverTime = data?.usageOverTime || [];
  const weakTopics = data?.weakTopics || [];
  const performanceTrend = data?.performanceTrend || [];

  return (
    <div className="flex min-h-screen flex-row bg-gray-100">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <HeaderBar displayedTitle="Platform Statistics" userName={user.name} userRole={user.role} />

        <div className="space-y-6 p-8">
          {error && (
            <div className="rounded-lg p-4 text-sm text-red-600 bg-red-50 ring ring-red-200">
              Failed to load platform statistics: {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl p-5 bg-white ring ring-gray-300">
              <h2 className="mb-4 text-lg font-bold">Overall Performance</h2>
              {loading ? (
                <div className="h-10 w-24 rounded bg-gray-200 animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-sky-500">
                  {data?.averageScore != null ? `${data.averageScore}%` : "No data yet"}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">Average score across the platform</p>
            </div>

            <div className="rounded-xl p-5 bg-white ring ring-gray-300">
              <h2 className="mb-4 text-lg font-bold">Active Users (Today)</h2>
              {loading ? (
                <div className="h-10 w-24 rounded bg-gray-200 animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-sky-500">{data?.activeUsersToday ?? "No data yet"}</p>
              )}
            </div>
          </div>

          {/* Platform Usage Over Time */}
          <div className="rounded-xl p-5 bg-white ring ring-gray-300">
            <h2 className="mb-4 text-lg font-bold">Platform Usage (Last 30 Days)</h2>
            {/* loading → skeleton block; no data → empty-state text; otherwise → the actual chart */}
            {loading ? (
              <div className="h-64 rounded bg-gray-100 animate-pulse" />
            ) : usageOverTime.length === 0 ? (
              <p className="text-sm text-gray-400">No usage data yet.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usageOverTime}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="activeUsers" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Overall Performance Trend */}
          <div className="rounded-xl p-5 bg-white ring ring-gray-300">
            <h2 className="mb-4 text-lg font-bold">Average Score Trend</h2>
            {loading ? (
              <div className="h-64 rounded bg-gray-100 animate-pulse" />
            ) : performanceTrend.length === 0 ? (
              <p className="text-sm text-gray-400">No performance trend data yet.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceTrend}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="averageScore" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* System-Wide Weak Topics */}
          <div className="rounded-xl p-5 bg-white ring ring-gray-300">
            <h2 className="mb-4 text-lg font-bold">System-Wide Weak Topics</h2>
            {loading ? (
              <div className="h-64 rounded bg-gray-100 animate-pulse" />
            ) : weakTopics.length === 0 ? (
              <p className="text-sm text-gray-400">No weak topics detected.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weakTopics} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default PlatformStatistics
