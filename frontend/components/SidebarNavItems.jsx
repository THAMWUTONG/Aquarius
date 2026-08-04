import { NavLink } from "react-router"
import { useAuth } from "../context/AuthContext"
import { logout } from "../services/authService.jsx"

function SidebarNavItems ({ displayedText, icon, href }) {
  const { setUser } = useAuth()

  // Logout is the only sidebar item pointing at "/" — clear local session
  // state immediately (don't block navigation on the network call) and best-
  // effort destroy the server-side session too.
  function handleLogout() {
    setUser(null)
    localStorage.removeItem("user")
    logout()
  }

  return (
    <NavLink
      to={href}
      onClick={href === "/" ? handleLogout : undefined}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100  [.active]:bg-sky-100 [.active]:text-sky-500 transition-all"
    >
      {icon}
      <p>{displayedText}</p>
    </NavLink>
  )
}

export default SidebarNavItems