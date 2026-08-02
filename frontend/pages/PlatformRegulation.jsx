import { useEffect, useState } from "react"
import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import Badge from "../components/Badge.jsx"
import Toast from "../components/Toast.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from "react-router"
import { fetchMaterials, updateMaterialStatus } from "../services/materialService.jsx"
import { fetchQuizzes, updateQuizStatus } from "../services/quizService.jsx"
import { FaCheck, FaTimes, FaFlag } from "react-icons/fa"

/**
 * Admin page for approving, rejecting, or flagging study materials and quizzes.
 */
function PlatformRegulation() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("materials")
  const [materials, setMaterials] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/")
    }
  }, [user, navigate])

  useEffect(() => {
    if (!user || user.role !== "admin") return
    loadData()
  }, [user])

  /**
   * Loads both materials and quizzes in parallel.
   * @returns {Promise<void>}
   */
  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [materialsData, quizzesData] = await Promise.all([fetchMaterials(), fetchQuizzes()])
      setMaterials(materialsData)
      setQuizzes(quizzesData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Applies a new regulation status to a material and refreshes local state.
   * @param {number} materialId
   * @param {"approved"|"rejected"|"flagged"} status
   * @returns {Promise<void>}
   */
  async function handleMaterialStatusChange(materialId, status) {
    try {
      await updateMaterialStatus(materialId, status)
      setMaterials((prev) => prev.map((m) => (m.id === materialId ? { ...m, status } : m)))
      setToast({ type: "success", message: `Material marked as ${status}.` })
    } catch (err) {
      setToast({ type: "error", message: err.message })
    }
  }

  /**
   * Applies a new regulation status to a quiz and refreshes local state.
   * @param {number} quizId
   * @param {"approved"|"rejected"|"flagged"} status
   * @returns {Promise<void>}
   */
  async function handleQuizStatusChange(quizId, status) {
    try {
      await updateQuizStatus(quizId, status)
      setQuizzes((prev) => prev.map((q) => (q.id === quizId ? { ...q, status } : q)))
      setToast({ type: "success", message: `Quiz marked as ${status}.` })
    } catch (err) {
      setToast({ type: "error", message: err.message })
    }
  }

  if (!user || user.role !== "admin") {
    return null;
  }
  else {
    // activeTab decides both which dataset feeds the table and which handler the action buttons call.
    const rows = activeTab === "materials" ? materials : quizzes

    return (
      <div className="flex min-h-screen flex-row bg-gray-100">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <HeaderBar displayedTitle="Platform Regulation" userName={user.name} userRole={user.role} />

          <div className="space-y-4 p-8">
            {error && (
              <div className="rounded-lg p-4 text-sm text-red-600 bg-red-50 ring ring-red-200">
                Failed to load data: {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${activeTab === "materials" ? "text-white bg-sky-500" : "text-gray-600 bg-white ring ring-gray-300"}`}
                onClick={() => setActiveTab("materials")}
                type="button"
              >
                Study Materials
              </button>
              <button
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${activeTab === "quizzes" ? "text-white bg-sky-500" : "text-gray-600 bg-white ring ring-gray-300"}`}
                onClick={() => setActiveTab("quizzes")}
                type="button"
              >
                Quizzes
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl bg-white ring ring-gray-300">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-500 bg-gray-50">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Course</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Same loading / empty / populated pattern as ManageUsers, applied to whichever tab is active */}
                  {loading ? (
                    <tr><td className="p-4 text-gray-400" colSpan={4}>Loading {activeTab}...</td></tr>
                  ) : rows.length === 0 ? (
                    <tr><td className="p-4 text-gray-400" colSpan={4}>No {activeTab} to review.</td></tr>
                  ) : (
                    rows.map((item) => (
                      <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="p-4">{item.title}</td>
                        <td className="p-4">{item.courseName || "—"}</td>
                        <td className="p-4"><Badge status={item.status} /></td>
                        <td className="p-4">
                          <div className="flex gap-3 text-gray-500">
                            <button
                              aria-label="Approve"
                              className="hover:text-green-600"
                              onClick={() => activeTab === "materials"
                                ? handleMaterialStatusChange(item.id, "approved")
                                : handleQuizStatusChange(item.id, "approved")}
                              type="button"
                            ><FaCheck /></button>
                            <button
                              aria-label="Reject"
                              className="hover:text-red-600"
                              onClick={() => activeTab === "materials"
                                ? handleMaterialStatusChange(item.id, "rejected")
                                : handleQuizStatusChange(item.id, "rejected")}
                              type="button"
                            ><FaTimes /></button>
                            <button
                              aria-label="Flag"
                              className="hover:text-amber-600"
                              onClick={() => activeTab === "materials"
                                ? handleMaterialStatusChange(item.id, "flagged")
                                : handleQuizStatusChange(item.id, "flagged")}
                              type="button"
                            ><FaFlag /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
      </div>
    )
  }
}

export default PlatformRegulation