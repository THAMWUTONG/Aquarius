import { FaBars } from "react-icons/fa"

function toggleSidebar() {
  const sideBarElement = document.getElementById("sidebar")
  sideBarElement.style.display = (sideBarElement.style.display === "none" || sideBarElement.style.display === "") ? "block" : "none"
}

function HeaderBar({ displayedTitle, userName, userRole}) {
  return (
    <header className="flex justify-between items-center shrink-0 border-b border-gray-300 px-8 bg-white h-16">
      <button className="relative z-10 sm:hidden text-gray-500 hover:text-gray-600 transition-all" type="button" onClick={toggleSidebar}><FaBars size={24}/></button>
      <h1 className="text-xl font-bold">{displayedTitle}</h1>
      <div>
        <h2 className="text-lg font-bold leading-tight">{userName}</h2>
        <p className="text-sm capitalize leading-tight">{userRole}</p>
      </div>
    </header>
  )
}

export default HeaderBar