import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from "react-router"
import { useEffect } from "react"
import { FaCalendarAlt } from "react-icons/fa"

function StudyCalendar(){
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/")
    }
  }, [user, navigate])
  
  if (!user || user.role !== "student") {
    return null;
  }
  else{
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          <HeaderBar displayedTitle="Study Calendar" userName={ user.name } userRole={ user.role } />
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            <div className="flex justify-end w-full">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-sky-500">&#43; Mark Important Events</button>
            </div>
            <div className="p-6 border border-gray-300 rounded-xl bg-white space-y-4">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-sky-500"/>
                <h2 className="text-lg font-bold"></h2>
              </div>
              <hr className="text-gray-300"></hr>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default StudyCalendar