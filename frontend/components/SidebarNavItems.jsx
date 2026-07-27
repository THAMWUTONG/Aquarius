import { NavLink } from "react-router"

function SidebarNavItems ({ displayedText, icon, href }) {
  return (
    <NavLink to={href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-base hover:bg-gray-100  [.active]:bg-sky-100 [.active]:text-sky-500 transition-all">
      {icon}
      <p>{displayedText}</p>
    </NavLink>
  )
}

export default SidebarNavItems