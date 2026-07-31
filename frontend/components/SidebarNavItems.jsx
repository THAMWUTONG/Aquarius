import { NavLink } from "react-router"
import { useAuth } from "../context/AuthContext"

function SidebarNavItems ({ displayedText, icon, href }) {
  const { setUser } = useAuth()

  function handleLogOut() {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <NavLink to={href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100  [.active]:bg-sky-100 [.active]:text-sky-500 transition-all" onClick={href === "/" && handleLogOut}>
      {icon}
      <p>{displayedText}</p>
    </NavLink>
  )
}

export default SidebarNavItems