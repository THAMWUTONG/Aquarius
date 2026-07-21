import { Routes, Route } from "react-router"
import Login from "./pages/Login.jsx"
import ForgotPassword from "./pages/ForgotPassword.jsx"
import StudentDashboard from "./pages/StudentDashboard.jsx"
import StudyMaterials from "./pages/StudyMaterials.jsx"
import TakeQuizzes from "./pages/TakeQuizzes.jsx"
import PerformanceOverview from "./pages/PerformanceOverview.jsx"
import StudyCalendar from "./pages/StudyCalendar.jsx"
import Profile from "./pages/Profile.jsx"
import LecturerDashboard from "./lecturer/Dashboard.jsx"
import ManageQuizzes from "./lecturer/ManageQuizzes.jsx"
import ManageMaterials from "./lecturer/ManageMaterials.jsx"
import MonitorPerformance from "./lecturer/MonitorPerformance.jsx"

function App() {
  return (
    <Routes>
      <Route index element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />

      <Route path="/study-materials" element={<StudyMaterials />} />
      <Route path="/take-quizzes" element={<TakeQuizzes />} />
      <Route path="/performance-overview" element={<PerformanceOverview/>} />
      <Route path="/study-calendar" element={<StudyCalendar />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/manage-quizzes" element={<ManageQuizzes />} />
      <Route path="/manage-materials" element={<ManageMaterials />} />
      <Route path="/monitor-performance" element={<MonitorPerformance />} />

    </Routes>
  )
}

export default App
