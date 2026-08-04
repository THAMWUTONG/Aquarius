import Sidebar from "../components/Sidebar.jsx"
import HeaderBar from "../components/HeaderBar.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import StudyMaterialCard from "../components/StudyMaterialCard.jsx"
import { getStudyMaterials } from "../services/getStudyMaterialsService.jsx"

function StudyMaterials(){
  const { user } = useAuth()
  const navigate = useNavigate()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourseId, setSelectedCourseId] = useState("all")
  const [showBookmarked, setShowBookmarked] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/")
    }

    async function loadMaterials() {
      try {
        setLoading(true)
        const studyMaterialData = await getStudyMaterials()
        setMaterials(studyMaterialData.materials || [])
      } catch (error) {
        alert(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadMaterials()
  }, [user, navigate, showBookmarked])
  
  // For every retrieved material, construct an object with id and title property.
  // Filter out duplicates by verifying the indices.
  const courseOptions = materials.map((material) => ({ id: material.courseId, title: material.courseTitle })).filter((option, index, self) => self.findIndex((item) => item.id === option.id) === index)

  const trimmedQuery = searchQuery.trim().toLowerCase()
  const filteredMaterials = materials.filter((material) => {
    const title = material.title.toLowerCase()
    const topic = material.topicTitle.toLowerCase()
    const matchesSearch = !trimmedQuery || title.includes(trimmedQuery) || topic.includes(trimmedQuery)
    const matchesCourse = selectedCourseId === "all" || material.courseId.toString() === selectedCourseId
    return matchesSearch && matchesCourse && (showBookmarked ? material.isBookmarked : true)
  })
  
  if (!user || user.role !== "student") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <HeaderBar displayedTitle="Study Materials" userName={ user.name } userRole={ user.role } />
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-4 gap-3">
            <input className="col-span-2 p-2 border border-gray-300 focus:outline-none focus:border-2 focus:border-sky-500 rounded-xl bg-white" type="text" placeholder="Search by title or topic..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)}
            />
            <select className="w-full p-2 border border-gray-300 focus:outline-none focus:border-2 focus:border-sky-500 rounded-xl bg-white" value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)}>
              <option value="all">All Courses</option>
              {courseOptions.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
            <button className={`w-full p-2 rounded-xl transition-all ${showBookmarked ? "text-white bg-sky-500" : "border border-gray-300 bg-white hover:bg-gray-100"}`} onClick={() => setShowBookmarked(!showBookmarked)}>Show Bookmarked Materials</button>
          </div>

          {loading && (
            <div className="rounded-xl bg-white p-6 shadow-sm text-gray-600">Loading study materials...</div>
          )}

          {!loading && materials.length === 0 && (
            <div className="rounded-xl bg-white p-6 shadow-sm text-gray-600">No study materials available.</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {filteredMaterials.map((material) => (
              <StudyMaterialCard key={material.id} id={material.id} courseName={material.courseTitle} title={material.title} topicName={material.topicTitle} description={material.description} type={material.fileType} prerequisites={material.prerequisites} initialIsBookmarked={material.isBookmarked} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default StudyMaterials