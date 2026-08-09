import logo from "../assets/placeholder.png";
import { useAuth } from "../context/AuthContext.jsx";
import SidebarNavItems from "./SidebarNavItems.jsx";
import { FaHome, FaBook, FaGraduationCap, FaChartLine, FaCalendarAlt, FaUser, FaSignOutAlt, FaFileAlt, FaCog, FaUsersCog, FaChartBar, FaShieldAlt, FaUserGraduate, FaHistory } from "react-icons/fa";

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
      );
    }
    else if (user && user.role === "lecturer") {
      return (
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarNavItems displayedText="Dashboard" icon={ <FaHome /> } href="/lecturer-dashboard" />
          <SidebarNavItems displayedText="Manage Quizzes" icon={ <FaGraduationCap /> } href="/manage-quizzes" />
          <SidebarNavItems displayedText="Manage Materials" icon={ <FaFileAlt /> } href="/manage-materials" />
          <SidebarNavItems displayedText="Monitor Performance" icon={ <FaChartLine /> } href="/monitor-performance" />
          <SidebarNavItems displayedText="Profile & Settings" icon={ <FaCog /> } href="/lecturer-profile" />
          <SidebarNavItems displayedText="Logout" icon={ <FaSignOutAlt /> } href="/" />
        </nav>
      );
    }
    else if (user && user.role === "admin") {
      return (
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarNavItems displayedText="Dashboard" icon={ <FaHome /> } href="/admin-dashboard" />
          <SidebarNavItems displayedText="Manage Users" icon={ <FaUsersCog /> } href="/manage-users" />
          <SidebarNavItems displayedText="Platform Statistics" icon={ <FaChartBar /> } href="/platform-statistics" />
          <SidebarNavItems displayedText="Platform Regulation" icon={ <FaShieldAlt /> } href="/platform-regulation" />
          <SidebarNavItems displayedText="Manage Enrollment" icon={ <FaUserGraduate /> } href="/manage-enrollment" />
          <SidebarNavItems displayedText="Audit Log" icon={ <FaHistory /> } href="/audit-log" />
          <SidebarNavItems displayedText="Profile" icon={ <FaUser /> } href="/admin-profile" />
          <SidebarNavItems displayedText="Logout" icon={ <FaSignOutAlt /> } href="/" />
        </nav>
      )
    }
  }

  return (
    // min-h-screen and shrink-0 force the sidebar to stay locked on the left
    <aside className="fixed inset-0 sm:relative hidden sm:flex sm:flex-col sm:shrink-0 w-64 min-h-screen bg-white border-r border-gray-200" id="sidebar">
      {/* Logo Section */}
      <div className="flex items-center gap-3 mt-16 sm:mt-0 p-6">
        <img className="w-14 h-14" src={logo} alt="Aquarius Logo"/>
        <div>
          <h1 className="text-xl font-bold leading-none text-slate-800">Aquarius</h1>
          <span className="text-[10px] text-sky-500 font-semibold tracking-wider uppercase">Study Platform</span>
        </div>
      </div>
      <hr className="text-gray-300"/>
      {renderNavigationItems(user)}
      
    </div>
  );
}

export default Sidebar;
