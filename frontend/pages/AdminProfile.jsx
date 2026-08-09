import { FaUserAlt, FaLock } from "react-icons/fa";
import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import ProfileInfoField from "../components/ProfileInfoField.jsx";
import Toast from "../components/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { changePassword } from "../services/passwordService.jsx";

/**
 * Admin's personal profile page. Shows account details and lets the admin
 * change their own password.
 */
function AdminProfile(){
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/")
    }
  }, [user, navigate])

  if (!user || user.role !== "admin") {
    return null;
  }
  else {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          <HeaderBar displayedTitle="Profile" userName={ user.name } userRole={ user.role }/>
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            <div className="p-6 rounded-xl border border-gray-300 shadow-md sm:mx-64 bg-white space-y-4">
              <div className="flex items-center gap-2">
                <FaUserAlt className="text-sky-500" />
                <h2 className="text-lg font-bold">Personal Information</h2>
              </div>
              <hr className="text-gray-300"></hr>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <ProfileInfoField label="Admin ID" displayedInformation={ user.adminId } />
                <ProfileInfoField label="Name" displayedInformation={ user.name } />
                <ProfileInfoField label="Email" displayedInformation={ user.email } />
                <ProfileInfoField label="Account Created At" displayedInformation={ user.createdAt } />
                <ProfileInfoField label="Role" displayedInformation={ user.role } />
              </div>
            </div>

            <ChangePasswordCard onSuccess={() => setToast({ type: "success", message: "Password updated successfully." })} onError={(msg) => setToast({ type: "error", message: msg })} />
          </div>
        </main>

        {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
      </div>
    )
  }
}

/**
 * Self-contained password-change form. Validates locally before calling the
 * service, clears its own fields on success, and reports outcome via callbacks.
 * @param {Object} props
 * @param {Function} props.onSuccess - Called with no arguments after a successful change.
 * @param {Function} props.onError - Called with the error message string on failure.
 */
function ChangePasswordCard({ onSuccess, onError }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  /**
   * Validates and submits the password-change form.
   * @param {React.FormEvent} e
   * @returns {Promise<void>}
   */
  async function handleSubmit(e) {
    e.preventDefault()
    // Input validation: catch empty/mismatched fields before calling the service.
    if (!currentPassword || !newPassword || !confirmPassword) {
      setFormError("All fields are required.")
      return
    }
    if (newPassword !== confirmPassword) {
      setFormError("New password and confirmation do not match.")
      return
    }
    if (newPassword.length < 6) {
      setFormError("New password must be at least 6 characters.")
      return
    }

    setFormError(null)
    setSubmitting(true)
    try {
      await changePassword(currentPassword, newPassword, confirmPassword)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      onSuccess()
    } catch (err) {
      onError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 rounded-xl border border-gray-300 shadow-md sm:mx-64 bg-white space-y-4">
      <div className="flex items-center gap-2">
        <FaLock className="text-sky-500" />
        <h2 className="text-lg font-bold">Change Password</h2>
      </div>
      <hr className="text-gray-300"></hr>
      <form className="space-y-4 max-w-md" onSubmit={handleSubmit}>
        {formError && <p className="text-sm text-red-500">{formError}</p>}
        <div className="flex flex-col gap-1">
          <label className="text-sm" htmlFor="current-password">Current Password</label>
          <input
            className="rounded-lg px-3 py-2 text-sm ring ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm" htmlFor="new-password">New Password</label>
          <input
            className="rounded-lg px-3 py-2 text-sm ring ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm" htmlFor="confirm-password">Confirm New Password</label>
          <input
            className="rounded-lg px-3 py-2 text-sm ring ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-sky-500 transition-all hover:bg-sky-600 disabled:opacity-50"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  )
}

export default AdminProfile
