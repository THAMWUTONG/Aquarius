import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import { NavLink, useNavigate } from "react-router"
import { useEffect } from "react"
import { FaArrowRight, FaBookOpen, FaCalendar, FaExclamationTriangle, FaFileSignature, FaGraduationCap, FaRegCalendar } from "react-icons/fa";

function StudentDashboard(){
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/")
    }
  }, [user, navigate])
  
  if (!user || user.role !== "student") {
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
                <NavLink to="/study-materials" className="px-4 py-2 rounded-lg text-sm font-semibold text-sky-500 bg-white">
                  Review Material
                </NavLink>
                <NavLink to="/take-quizzes" className="px-4 py-2 rounded-lg text-sm font-semibold text-sky-500 bg-white hover:bg-gray-100 transition-all">
                  Take Quizzes
                </NavLink>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-4 rounded-xl border border-gray-300 shadow-md bg-white">
                <div className="flex justify-center items-center rounded-lg w-10 h-10 text-sky-500 bg-sky-100">
                  <FaBookOpen size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Enrolled Courses</p>
                  <strong className="text-lg font-bold">727</strong>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 rounded-xl border border-gray-300 shadow-md bg-white">
                <div className="flex justify-center items-center rounded-lg w-10 h-10 text-sky-500 bg-sky-100">
                  <FaGraduationCap size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Quizzes Completed</p>
                  <strong className="text-lg font-bold">9318054</strong>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 rounded-xl border border-gray-300 shadow-md bg-white">
                <div className="flex justify-center items-center rounded-lg w-10 h-10 text-sky-500 bg-sky-100">
                  <FaCalendar size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Next Event</p>
                  <strong className="text-lg font-bold">Consultation with Mr.Jarona</strong>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 p-6 rounded-xl border border-gray-300 shadow-md space-y-4 text-lg bg-white">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="text-sky-500" />
                  <h2 className="text-lg font-bold">Focus Areas</h2>
                </div>
                <hr className="text-gray-300"></hr>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    You have achieved less than 70% on average in these topics, we recommend you to focus on these areas.
                  </p>
                  <div class="flex justify-between items-center p-4 rounded-lg border border-sky-500 bg-sky-50">
                    <div>
                      <h3 className="text-sm font-bold">Title of topic</h3>
                      <p className="text-xs text-gray-400">Average score of quiz</p>
                    </div>
                    <NavLink to="/study-materials" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-sky-500">
                      Study<FaArrowRight />
                    </NavLink>
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-xl border border-gray-300 shadow-md space-y-4 text-lg bg-white">
                <div className="flex items-center gap-2">
                  <FaRegCalendar className="text-sky-500" />
                  <h2 className="font-bold">Upcoming Events</h2>
                </div>
                <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaFileSignature />
                  <div>
                    <h3 className="text-sm font-bold">Assignment is due</h3>
                    <p className="text-xs text-gray-400">2026-07-18 • Assignment</p>
                  </div>
                </div>
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