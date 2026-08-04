import { useEffect, useState } from "react"
import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from "react-router"
import { fetchAuditLogs } from "../services/auditService.jsx"

/**
 * Admin page showing a searchable, filterable table of audit log entries.
 */
function AuditLog() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/")
    }
  }, [user, navigate])

  useEffect(() => {
    if (!user || user.role !== "admin") return

    let isMounted = true
    fetchAuditLogs()
      .then((data) => { if (isMounted) setLogs(data) })
      .catch((err) => { if (isMounted) setError(err.message) })
      .finally(() => { if (isMounted) setLoading(false) })

    return () => { isMounted = false }
  }, [user])

  /**
   * Filters log entries by actor name or action text.
   * @param {Array} allLogs
   * @returns {Array}
   */
  function getFilteredLogs(allLogs) {
    const term = searchTerm.toLowerCase();
    return allLogs.filter((log) =>
      log.actor?.toLowerCase().includes(term) || log.action?.toLowerCase().includes(term)
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }
  else {
    const filteredLogs = getFilteredLogs(logs)

    return (
      <div className="flex min-h-screen flex-row bg-gray-100">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <HeaderBar displayedTitle="Audit Log" userName={user.name} userRole={user.role} />

          <div className="space-y-4 p-8">
            {error && (
              <div className="rounded-lg p-4 text-sm text-red-600 bg-red-50 ring ring-red-200">
                Failed to load audit logs: {error}
              </div>
            )}

            <input
              className="rounded-lg px-3 py-2 text-sm ring ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Search by actor or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
            />

            <div className="overflow-x-auto rounded-xl bg-white ring ring-gray-300">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-500 bg-gray-50">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Actor</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {/* loading / empty / populated pattern, same as other admin tables */}
                  {loading ? (
                    <tr><td className="p-4 text-gray-400" colSpan={3}>Loading audit logs...</td></tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr><td className="p-4 text-gray-400" colSpan={3}>No matching log entries.</td></tr>
                  ) : (
                    filteredLogs.map((log, idx) => (
                      <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="whitespace-nowrap p-4">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-4">{log.actor}</td>
                        <td className="p-4">{log.action}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default AuditLog