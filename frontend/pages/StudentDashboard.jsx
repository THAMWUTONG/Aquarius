import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import { NavLink, useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { FaBookOpen, FaCalendar, FaExclamationTriangle, FaGraduationCap, FaRegCalendar } from "react-icons/fa";
import DashboardStatisticCard from "../components/DashboardStatisticCard.jsx"
import { getStudentDashboardData } from "../services/getStudentDashboardData.jsx"
import StudentDashboardUpcomingEvent from "../components/StudentDashboardUpcomingEvent.jsx"
import StudentDashboardWeakTopics from "../components/StudentDashboardWeakTopics.jsx"

function StudentDashboard(){
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [studentDashboardData, setStudentDashboardData] = useState(null)

  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/")
    }
  }, [user, navigate])
  
  useEffect(() => {
    async function fetchStudentDashboardData() {
      try {
        const studentDashboardData = await getStudentDashboardData()
        setStudentDashboardData(studentDashboardData)
      }
      catch (error) {
        alert(error.message)
      }
      finally {
        setLoading(false)
      }
    }
    
    fetchStudentDashboardData()
  }, [user])

  if (!user || user.role !== "student" || loading) {
    return null;
  }
  else {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          <HeaderBar displayedTitle="Student Dashboard" userName={ user.name } userRole={ user.role } />
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            <div className="flex justify-between items-center p-6 rounded-xl shadow-md bg-linear-to-r from-sky-400 to-sky-600">
              <div>
                <h2 className="text-2xl font-bold text-white">Good morning, { user.name }!</h2>
                <p className="text-white">Here's to another day of hardwork and dedication!</p>
              </div>
              <div className="flex gap-2">
                <NavLink to="/study-materials" className="px-4 py-2 rounded-lg text-sm font-bold text-sky-500 bg-white hover:bg-gray-100 transition-all">
                  Review Material
                </NavLink>
                <NavLink to="/take-quizzes" className="px-4 py-2 rounded-lg text-sm font-bold text-sky-500 bg-white hover:bg-gray-100 transition-all">
                  Take Quizzes
                </NavLink>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <DashboardStatisticCard icon={ <FaBookOpen /> } displayedTitle={ "Enrolled Courses" } displayedData={ studentDashboardData.enrolledCourses.length } />
              <DashboardStatisticCard icon={ <FaGraduationCap /> } displayedTitle={ "Quizzes Completed" } displayedData={ studentDashboardData.totalQuizzesAttempted } />
              <DashboardStatisticCard icon={ <FaCalendar /> } displayedTitle={ "Next Event" } displayedData={ studentDashboardData.upcomingEvents.length === 0 ? "None" : studentDashboardData.upcomingEvents[0].title } />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 p-6 rounded-xl border border-gray-300 shadow-md space-y-4 text-lg bg-white">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="text-sky-500" />
                  <h2 className="text-lg font-bold">Focus Areas</h2>
                </div>
                <hr className="text-gray-300"></hr>
                <div className="space-y-2">
                  <StudentDashboardWeakTopics weakTopicsArray={studentDashboardData.weakTopics} />
                </div>
              </div>
              <div className="p-6 rounded-xl border border-gray-300 shadow-md space-y-4 text-lg bg-white">
                <div className="flex items-center gap-2">
                  <FaRegCalendar className="text-sky-500" />
                  <h2 className="font-bold">Upcoming Events</h2>
                </div>
                <hr className="text-gray-300"></hr>
                <div className="space-y-4">
                  <StudentDashboardUpcomingEvent eventsArray={studentDashboardData.upcomingEvents} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default StudentDashboard