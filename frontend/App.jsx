import { Routes, Route } from "react-router"
import Login from "./pages/Login.jsx"
import StudentDashboard from "./pages/StudentDashboard.jsx"
import StudyMaterials from "./pages/StudyMaterials.jsx"
import TakeQuizzes from "./pages/TakeQuizzes.jsx"
import PerformanceOverview from "./pages/PerformanceOverview.jsx"
import StudyCalendar from "./pages/StudyCalendar.jsx"
import Profile from "./pages/Profile.jsx"
import ChatbotBubble from "./components/ChatbotBubble.jsx"
import LecturerDashboard from "./lecturer/Dashboard.jsx"
import ManageQuizzes from "./lecturer/ManageQuizzes.jsx"
import ManageMaterials from "./lecturer/ManageMaterials.jsx"
import MonitorPerformance from "./lecturer/MonitorPerformance.jsx"
import LecturerProfile from "./lecturer/LecturerProfile.jsx"
import AdminDashboard from "./pages/AdminDashboard.jsx"
import ManageUsers from "./pages/ManageUsers.jsx"
import PlatformStatistics from "./pages/PlatformStatistics.jsx"
import PlatformRegulation from "./pages/PlatformRegulation.jsx"
import ManageEnrollment from "./pages/ManageEnrollment.jsx"
import AuditLog from "./pages/AuditLog.jsx"
import AdminProfile from "./pages/AdminProfile.jsx"


function App() {
  return (
    <>
      <Routes>
        <Route index element={<Login />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/study-materials" element={<StudyMaterials />} />
        <Route path="/take-quizzes" element={<TakeQuizzes />} />
        <Route path="/performance-overview" element={<PerformanceOverview />} />
        <Route path="/study-calendar" element={<StudyCalendar />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/manage-quizzes" element={<ManageQuizzes />} />
        <Route path="/manage-materials" element={<ManageMaterials />} />
        <Route path="/monitor-performance" element={<MonitorPerformance />} />
        <Route path="/lecturer-profile" element={<LecturerProfile />} />
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="/platform-statistics" element={<PlatformStatistics />} />
        <Route path="/platform-regulation" element={<PlatformRegulation />} />
        <Route path="/manage-enrollment" element={<ManageEnrollment />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
      </Routes>
      <ChatbotBubble />
    </>
  )
}

export default App
