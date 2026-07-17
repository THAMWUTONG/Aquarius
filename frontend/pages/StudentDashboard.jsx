import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"

function StudentDashboard(){
  return (
    <div className="flex flex-row min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <HeaderBar displayedTitle="Student Dashboard" userName="John Doe" userRole="Student" />
      </main>
      
    </div>
  )
}

export default StudentDashboard