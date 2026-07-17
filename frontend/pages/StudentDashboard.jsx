import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from "react-router"

function StudentDashboard(){
  const { navigate } = useNavigate()
  const { user } = useAuth()

  if (user.role != "student") {
    navigate("/")
  }
  else {
    return (
      <div className="flex flex-row min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          <HeaderBar displayedTitle="Student Dashboard" userName={ user.name } userRole={ user.role } />
        </main>
      </div>
    )
  }
}

export default StudentDashboard