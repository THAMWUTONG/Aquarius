import logo from "../assets/placeholder.png"
import { useAuth } from "../context/AuthContext.jsx"
import SidebarNavItems from "./SidebarNavItems.jsx"
import { FaHome, FaBook, FaGraduationCap, FaChartLine, FaCalendarAlt, FaUser, FaSignOutAlt } from "react-icons/fa";

function Sidebar() {
  const { user } = useAuth()

  function renderNavigationItems(user) {
    if (user && user.role === "student") {
      return (
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarNavItems displayedText="Dashboard" icon={ <FaHome /> } href="/student-dashboard" />
          <SidebarNavItems displayedText="Study Materials" icon={ <FaBook /> } href="/study-materials" />
          <SidebarNavItems displayedText="Quizzes" icon={ <FaGraduationCap /> } href="/take-quizzes" />
          <SidebarNavItems displayedText="Performance Overview" icon={ <FaChartLine /> } href="/performance-overview" />
          <SidebarNavItems displayedText="Study Calendar" icon={ <FaCalendarAlt /> } href="/study-calendar" />
          <SidebarNavItems displayedText="Profile" icon={ <FaUser /> } href="/profile" />
          <SidebarNavItems displayedText="Logout" icon={ <FaSignOutAlt /> } href="/" />
        </nav>
      )
    }
    else if (user && user.role === "lecturer") {
      return (
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          
        </nav>
      )
    }
    else if (user && user.role === "admin") {
      return (
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          
        </nav>

      )
    }
  }

  return (
    <div className="flex flex-col border-r border-gray-300 bg-white w-64">
      <div className="flex items-center gap-3 p-6">
        <img className="w-10 h-10" src={logo} alt="Aquarius Logo"/>
        <h1 className="text-2xl font-bold">Aquarius</h1>
      </div>
      <hr className="text-gray-300"/>
      {renderNavigationItems(user)}
      
    </div>
  )
}
export default Sidebar