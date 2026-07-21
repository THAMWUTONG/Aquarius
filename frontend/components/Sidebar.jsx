import logo from "../assets/placeholder.png"
import { useAuth } from "../context/AuthContext.jsx"
import SidebarNavItems from "./SidebarNavItems.jsx"
import { FaHome, FaBook, FaGraduationCap, FaChartLine, FaCalendarAlt, FaUser, FaSignOutAlt, FaFileAlt, FaCog } from "react-icons/fa";

function Sidebar() {
  const { user } = useAuth();

  function renderNavigationItems(user) {
    if (user && user.role === "student") {
      return (
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <SidebarNavItems displayedText="Dashboard" icon={ <FaHome /> } href="/student-dashboard" />
          <SidebarNavItems displayedText="Study Materials" icon={ <FaBook /> } href="/study-materials" />
          <SidebarNavItems displayedText="Quizzes" icon={ <FaGraduationCap /> } href="/take-quizzes" />
          <SidebarNavItems displayedText="Performance Overview" icon={ <FaChartLine /> } href="/performance-overview" />
          <SidebarNavItems displayedText="Study Calendar" icon={ <FaCalendarAlt /> } href="/study-calendar" />
          <SidebarNavItems displayedText="Profile" icon={ <FaUser /> } href="/profile" />
          <SidebarNavItems displayedText="Logout" icon={ <FaSignOutAlt /> } href="/" />
        </nav>
      );
    }
    else if (user && user.role === "lecturer") {
      return (
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <SidebarNavItems displayedText="Dashboard" icon={ <FaHome /> } href="/lecturer-dashboard" />
          <SidebarNavItems displayedText="Manage Quizzes" icon={ <FaGraduationCap /> } href="/manage-quizzes" />
          <SidebarNavItems displayedText="Manage Materials" icon={ <FaFileAlt /> } href="/study-materials" />
          <SidebarNavItems displayedText="Monitor Performance" icon={ <FaChartLine /> } href="/performance-overview" />
          <SidebarNavItems displayedText="Profile & Settings" icon={ <FaCog /> } href="/profile" />
          <SidebarNavItems displayedText="Logout" icon={ <FaSignOutAlt /> } href="/" />
        </nav>
      );
    }
  }

  return (
    // min-h-screen and shrink-0 force the sidebar to stay locked on the left
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo Section */}
      <div className="flex items-center gap-3 p-6">
        <img className="w-10 h-10 object-contain" src={logo} alt="Aquarius Logo"/>
        <div>
          <h1 className="text-xl font-bold leading-none text-slate-800">Aquarius</h1>
          <span className="text-[10px] text-sky-500 font-semibold tracking-wider uppercase">Study Platform</span>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* User Info Card (Dr. Sarah Lim style block) */}
      {user && (
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-slate-50/50">
          <div className="w-9 h-9 bg-sky-100 text-sky-600 font-bold rounded-full flex items-center justify-center text-xs shrink-0">
            {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'DSL'}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-semibold text-xs text-slate-800 truncate">{user.name || "Dr. Sarah Lim"}</h4>
            <p className="text-[11px] text-slate-400 capitalize">{user.role || "Lecturer"}</p>
          </div>
        </div>
      )}

      {/* Navigation Items placed right below the user info */}
      {renderNavigationItems(user)}
    </aside>
  );
}

export default Sidebar;