import Sidebar from "../components/Sidebar.jsx"
import HeaderBar from "../components/HeaderBar.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from "react-router"
import { useEffect } from "react"
import StudyMaterialCard from "../components/StudyMaterialCard.jsx"

function StudyMaterials(){
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
          <HeaderBar displayedTitle="Study Materials" userName={ user.name } userRole={ user.role } />
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            <div className="grid grid-cols-4 gap-3">
              <input className="col-span-2 p-2 border border-gray-300 focus:outline-none focus:border-2 focus:border-sky-500 rounded-xl bg-white" type="text" placeholder="Search by title or topic..."/>
              <select className="w-full p-2 border border-gray-300 focus:outline-none focus:border-2 focus:border-sky-500 rounded-xl bg-white">
                <option value="all">All Courses</option>
              </select>
              <button className="w-full p-2 border border-gray-300 rounded-xl bg-white hover:bg-gray-100 transition-all"> Show Bookmarked Materials</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StudyMaterialCard courseName={"Introduction to Web Development"} title={"Getting Started with Semantic HTML5"} topicName={"HTML Basics"} description={"Semantic HTML uses HTML tags to convey the meaning of the content, like header, nav, main, footer, article, and section. This improves accessibility and SEO."} type={"PDF"} initialIsBookmarked={false}/>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default StudyMaterials