import { useState } from "react"
import { FaBookmark, FaDownload } from "react-icons/fa"
import { toggleBookmark } from "../services/bookmarkService.jsx"

function StudyMaterialCard({ id, courseName, title, topicName, description, type, prerequisites = "", initialIsBookmarked }) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (loading) return
    setLoading(true)
    try {
      const data = await toggleBookmark(id)
      setIsBookmarked(data.isBookmarked)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 border border-gray-300 rounded-xl shadow-md bg-white space-y-4">
      <div className="flex justify-between items-center">
        <p className="p-1 rounded-lg text-sm text-sky-500 bg-sky-100">{courseName}</p>
        <div className="flex gap-2">
          <button disabled={loading} className={`p-2 border border-gray-300 rounded-lg hover:bg-gray-100 ${isBookmarked ? "bg-sky-100 text-sky-500 hover:bg-sky-200" : "bg-white"} disabled:opacity-50`} onClick={handleToggle} disabled={loading}><FaBookmark /></button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"><FaDownload /></button>
        </div>
      </div>
      <div>
        <h2 className="font-bold">{title}</h2>
        <p className="text-xs text-gray-400">Topic: {topicName}</p>
        {prerequisites && <p className="text-xs text-gray-400">Requires: {prerequisites}</p>}
      </div>
      <p className="text-sm">{description}</p>
      <p className="text-xs font-bold uppercase text-sky-500">{type}</p>
    </div>
  )
}

export default StudyMaterialCard