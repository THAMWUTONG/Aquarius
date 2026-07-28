import { useEffect, useState } from "react"
import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import ConfirmDialog from "../components/ConfirmDialog.jsx"
import Toast from "../components/Toast.jsx"
import { useRoleGuard } from "../hooks/useRoleGuard.jsx"
import { fetchUsers } from "../services/userService.jsx"
import { fetchCourses } from "../services/courseService.jsx"
import { fetchEnrollments, enrollStudent, disenrollStudent } from "../services/enrollmentService.jsx"
import { FaUserPlus, FaTrash } from "react-icons/fa"

/**
 * Admin page for enrolling and disenrolling students from courses.
 */
function ManageEnrollment() {
  const { user, isAuthorized } = useRoleGuard(["admin"])

  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [formError, setFormError] = useState(null)
  const [deletingEnrollment, setDeletingEnrollment] = useState(null)

  useEffect(() => {
    if (!isAuthorized) return
    loadData()
  }, [isAuthorized])

  /**
   * Loads users, courses, and current enrollments in parallel, and filters
   * users down to students only for the enrollment dropdown.
   * @returns {Promise<void>}
   */
  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [usersData, coursesData, enrollmentsData] = await Promise.all([
        fetchUsers(),
        fetchCourses(),
        fetchEnrollments(),
      ])
      setStudents(usersData.filter((u) => u.role === "student"))
      setCourses(coursesData)
      setEnrollments(enrollmentsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Validates and submits the enrollment form.
   * @param {React.FormEvent} e
   * @returns {Promise<void>}
   */
  async function handleEnroll(e) {
    e.preventDefault()
    if (!selectedStudentId || !selectedCourseId) {
      setFormError("Please select both a student and a course.")
      return
    }
    setFormError(null)

    try {
      await enrollStudent(Number(selectedStudentId), Number(selectedCourseId))
      setToast({ type: "success", message: "Student enrolled successfully." })
      setSelectedStudentId("")
      setSelectedCourseId("")
      await loadData()
    } catch (err) {
      setToast({ type: "error", message: err.message })
    }
  }

  /**
   * Handles confirmed removal of an enrollment.
   * @returns {Promise<void>}
   */
  async function handleConfirmDisenroll() {
    try {
      await disenrollStudent(deletingEnrollment.id)
      setDeletingEnrollment(null)
      setToast({ type: "success", message: "Student disenrolled." })
      await loadData()
    } catch (err) {
      setToast({ type: "error", message: err.message })
    }
  }

  if (!isAuthorized) return null

  return (
    <div className="flex min-h-screen flex-row bg-gray-100">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <HeaderBar displayedTitle="Manage Enrollment" userName={user.name} userRole={user.role} />

        <div className="space-y-6 p-8">
          {error && (
            <div className="rounded-lg p-4 text-sm text-red-600 bg-red-50 ring ring-red-200">
              Failed to load data: {error}
            </div>
          )}

          <form className="flex flex-wrap items-end gap-3 rounded-xl p-5 bg-white ring ring-gray-300" onSubmit={handleEnroll}>
            <div className="flex flex-col gap-1">
              <label className="text-sm" htmlFor="student-select">Student</label>
              <select
                className="rounded-lg px-3 py-2 text-sm ring ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                id="student-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">Select a student...</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm" htmlFor="course-select">Course</label>
              <select
                className="rounded-lg px-3 py-2 text-sm ring ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                id="course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="">Select a course...</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <button
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white bg-sky-500 transition-all hover:bg-sky-600"
              type="submit"
            >
              <FaUserPlus /> Enroll
            </button>
            {formError && <p className="w-full text-sm text-red-500">{formError}</p>}
          </form>

          <div className="overflow-x-auto rounded-xl bg-white ring ring-gray-300">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500 bg-gray-50">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* loading / empty / populated pattern, same as other admin tables */}
                {loading ? (
                  <tr><td className="p-4 text-gray-400" colSpan={3}>Loading enrollments...</td></tr>
                ) : enrollments.length === 0 ? (
                  <tr><td className="p-4 text-gray-400" colSpan={3}>No enrollments yet.</td></tr>
                ) : (
                  enrollments.map((en) => (
                    <tr key={en.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="p-4">{en.studentName}</td>
                      <td className="p-4">{en.courseName}</td>
                      <td className="p-4">
                        <button
                          aria-label="Disenroll"
                          className="text-gray-500 hover:text-red-600"
                          onClick={() => setDeletingEnrollment(en)}
                          type="button"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ConfirmDialog
        isOpen={!!deletingEnrollment}
        title="Disenroll Student?"
        message={`This will remove ${deletingEnrollment?.studentName} from ${deletingEnrollment?.courseName}.`}
        onConfirm={handleConfirmDisenroll}
        onCancel={() => setDeletingEnrollment(null)}
      />

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </div>
  )
}

export default ManageEnrollment