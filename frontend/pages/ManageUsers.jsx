import { useEffect, useState } from "react"
import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import Modal from "../components/Modal.jsx"
import ConfirmDialog from "../components/ConfirmDialog.jsx"
import Toast from "../components/Toast.jsx"
import Badge from "../components/Badge.jsx"
import { useRoleGuard } from "../hooks/useRoleGuard.jsx"
import { fetchUsers, createUser, updateUser, deleteUser } from "../services/userService.jsx"
import { FaPlus, FaEye, FaPen, FaTrash } from "react-icons/fa"

// NOTE: role values must match whatever is stored in the `users.role` column.
// Sidebar.jsx currently checks "teacher" while Login.jsx routes based on
// "lecturer" — confirm which one is authoritative before wiring the backend.
const ROLE_OPTIONS = ["student", "teacher", "admin"];

/**
 * Derives an "active"/"inactive" status label from a user's last_access
 * timestamp, purely for display purposes (7-day threshold, matches the
 * same rule used server-side for the dashboard's activeUsers count).
 * @param {string|null} lastAccess - ISO timestamp string, or null if never logged in.
 * @returns {"active"|"inactive"}
 */
function deriveUserStatus(lastAccess) {
  if (!lastAccess) {
    return "inactive";
  }
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return new Date(lastAccess).getTime() >= sevenDaysAgo ? "active" : "inactive";
}

/**
 * Admin page for managing user accounts: search/filter, add, view, edit, delete.
 */
function ManageUsers() {
  const { user, isAuthorized } = useRoleGuard(["admin"])

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const [viewingUser, setViewingUser] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState(null)

  useEffect(() => {
    if (!isAuthorized) return
    loadUsers()
  }, [isAuthorized])

  /**
   * Loads (or reloads) the user list from the server.
   * @returns {Promise<void>}
   */
  async function loadUsers() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchUsers()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Filters the loaded users by search term (name/email) and role.
   * @param {Array} allUsers
   * @returns {Array} The filtered subset to display in the table.
   */
  function getFilteredUsers(allUsers) {
    return allUsers.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }

  /**
   * Handles the Add User form submission.
   * @param {Object} formValues - { name, email, role }.
   * @returns {Promise<void>}
   */
  async function handleAddUser(formValues) {
    try {
      await createUser(formValues)
      setIsAddOpen(false)
      setToast({ type: "success", message: "User added successfully." })
      await loadUsers()
    } catch (err) {
      setToast({ type: "error", message: err.message })
    }
  }

  /**
   * Handles the Edit User form submission.
   * @param {Object} formValues - { name, email, role }.
   * @returns {Promise<void>}
   */
  async function handleEditUser(formValues) {
    try {
      await updateUser(editingUser.id, formValues)
      setEditingUser(null)
      setToast({ type: "success", message: "User updated successfully." })
      await loadUsers()
    } catch (err) {
      setToast({ type: "error", message: err.message })
    }
  }

  /**
   * Handles confirmed deletion of a user.
   * @returns {Promise<void>}
   */
  async function handleConfirmDelete() {
    try {
      await deleteUser(deletingUser.id)
      setDeletingUser(null)
      setToast({ type: "success", message: "User deleted." })
      await loadUsers()
    } catch (err) {
      setToast({ type: "error", message: err.message })
    }
  }

  if (!isAuthorized) return null

  const filteredUsers = getFilteredUsers(users)

  return (
    <div className="flex min-h-screen flex-row bg-gray-100">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <HeaderBar displayedTitle="Manage Users" userName={user.name} userRole={user.role} />

        <div className="space-y-4 p-8">
          {error && (
            <div className="rounded-lg p-4 text-sm text-red-600 bg-red-50 ring ring-red-200">
              Failed to load users: {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <input
                className="rounded-lg px-3 py-2 text-sm ring ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
              />
              <select
                className="rounded-lg px-3 py-2 text-sm ring ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <button
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white bg-sky-500 transition-all hover:bg-sky-600"
              onClick={() => setIsAddOpen(true)}
              type="button"
            >
              <FaPlus /> Add User
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl bg-white ring ring-gray-300">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500 bg-gray-50">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/*
                  Three render states for the table body, in priority order:
                  1. loading    → show a loading row
                  2. no matches → show an empty-state row (either no users at all, or the current search/filter matched nothing)
                  3. populated  → render one row per filtered user
                */}
                {loading ? (
                  <tr><td className="p-4 text-gray-400" colSpan={5}>Loading users...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td className="p-4 text-gray-400" colSpan={5}>No users match your search.</td></tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="p-4">{u.name}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4 capitalize">{u.role}</td>
                      <td className="p-4"><Badge status={deriveUserStatus(u.last_access)} /></td>
                      <td className="p-4">
                        <div className="flex gap-3 text-gray-500">
                          <button aria-label="View user" onClick={() => setViewingUser(u)} type="button"><FaEye /></button>
                          <button aria-label="Edit user" onClick={() => setEditingUser(u)} type="button"><FaPen /></button>
                          <button aria-label="Delete user" onClick={() => setDeletingUser(u)} className="hover:text-red-500" type="button"><FaTrash /></button>
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

      <Modal isOpen={isAddOpen} title="Add User" onClose={() => setIsAddOpen(false)}>
        <UserForm onSubmit={handleAddUser} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingUser} title="Edit User" onClose={() => setEditingUser(null)}>
        {editingUser && (
          <UserForm initialValues={editingUser} onSubmit={handleEditUser} onCancel={() => setEditingUser(null)} />
        )}
      </Modal>

      <Modal isOpen={!!viewingUser} title="User Details" onClose={() => setViewingUser(null)}>
        {viewingUser && (
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Name:</span> {viewingUser.name}</p>
            <p><span className="font-semibold">Email:</span> {viewingUser.email}</p>
            <p><span className="font-semibold">Role:</span> {viewingUser.role}</p>
            <p><span className="font-semibold">Last Access:</span> {viewingUser.last_access || "Never"}</p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingUser}
        title="Delete User?"
        message={`This will permanently remove ${deletingUser?.name}'s account. This cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingUser(null)}
      />

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </div>
  )
}

/**
 * Reusable Add/Edit form for a user record.
 * @param {Object} props
 * @param {Object} [props.initialValues] - Pre-fills the form when editing.
 * @param {Function} props.onSubmit - Called with { name, email, role } on submit.
 * @param {Function} props.onCancel - Called when the form is cancelled.
 */
function UserForm({ initialValues, onSubmit, onCancel }) {
  const [name, setName] = useState(initialValues?.name || "")
  const [email, setEmail] = useState(initialValues?.email || "")
  const [role, setRole] = useState(initialValues?.role || ROLE_OPTIONS[0])
  const [formError, setFormError] = useState(null)

  /**
   * Validates and submits the form.
   * @param {React.FormEvent} e
   */
  function handleSubmit(e) {
    e.preventDefault()
    // Input validation: catch empty/invalid fields before calling onSubmit.
    if (!name.trim() || !email.trim()) {
      setFormError("Name and email are required.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address.")
      return
    }
    setFormError(null)
    onSubmit({ name: name.trim(), email: email.trim(), role })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {formError && <p className="text-sm text-red-500">{formError}</p>}
      <div className="flex flex-col gap-1">
        <label className="text-sm" htmlFor="name">Name</label>
        <input
          className="rounded-lg px-3 py-2 text-sm ring ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          id="name" value={name} onChange={(e) => setName(e.target.value)} type="text"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm" htmlFor="email">Email</label>
        <input
          className="rounded-lg px-3 py-2 text-sm ring ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="text"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm" htmlFor="role">Role</label>
        <select
          className="rounded-lg px-3 py-2 text-sm ring ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          id="role" value={role} onChange={(e) => setRole(e.target.value)}
        >
          {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-3">
        <button className="rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:bg-gray-100" onClick={onCancel} type="button">Cancel</button>
        <button className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-sky-500 transition-all hover:bg-sky-600" type="submit">Save</button>
      </div>
    </form>
  )
}

export default ManageUsers