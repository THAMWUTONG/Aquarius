import { Routes, Route } from "react-router"
import Login from "./pages/Login.jsx"
import StudentDashboard from "./student/StudentDashboard.jsx"
import StudyMaterials from "./student/StudyMaterials.jsx"
import TakeQuizzes from "./student/TakeQuizzes.jsx"
import PerformanceOverview from "./student/PerformanceOverview.jsx"
import StudyCalendar from "./student/StudyCalendar.jsx"
import StudentProfile from "./student/StudentProfile.jsx"
import ChatbotBubble from "./components/ChatbotBubble.jsx"
import LecturerDashboard from "./lecturer/Dashboard.jsx"
import ManageQuizzes from "./lecturer/ManageQuizzes.jsx"
import ManageMaterials from "./lecturer/ManageMaterials.jsx"
import MonitorPerformance from "./lecturer/MonitorPerformance.jsx"
import LecturerProfile from "./lecturer/LecturerProfile.jsx"
import AdminDashboard from "./admin/AdminDashboard.jsx"
import ManageUsers from "./admin/ManageUsers.jsx"
import PlatformStatistics from "./admin/PlatformStatistics.jsx"
import PlatformRegulation from "./admin/PlatformRegulation.jsx"
import ManageEnrollment from "./admin/ManageEnrollment.jsx"
import AuditLog from "./admin/AuditLog.jsx"
import AdminProfile from "./admin/AdminProfile.jsx"
import Landing from "./pages/Landing.jsx"


function App() {
  return (
    <>
      <Routes>
        <Route index element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/study-materials" element={<StudyMaterials />} />
        <Route path="/take-quizzes" element={<TakeQuizzes />} />
        <Route path="/performance-overview" element={<PerformanceOverview />} />
        <Route path="/study-calendar" element={<StudyCalendar />} />
        <Route path="/profile" element={<StudentProfile />} />
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
