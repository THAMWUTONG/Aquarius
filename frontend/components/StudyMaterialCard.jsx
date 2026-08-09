import { useState } from "react"
import { FaBookmark, FaDownload } from "react-icons/fa"

function StudyMaterialCard({ id, courseName, title, topicName, description, type, tags = "", prerequisites = "", downloadPath, initialIsBookmarked }) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)

  function toggleBookmark() {
    setIsBookmarked(!isBookmarked)
  }

  return (
    <div className="p-6 border border-gray-300 rounded-xl bg-white space-y-4">
      <div className="flex justify-between items-center">
        <p className="p-1 rounded-lg text-sm text-sky-500 bg-sky-100">{courseName}</p>
        <div className="flex gap-2">
          <button className={`p-2 border border-gray-300 rounded-lg hover:bg-gray-100 ${isBookmarked ? "bg-sky-100 text-sky-500 hover:bg-sky-200" : "bg-white"}`} onClick={toggleBookmark}><FaBookmark /></button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100" onClick={toggleBookmark}><FaDownload /></button>
        </div>
      </div>
      <div>
        <h2 className="text-base font-bold">{title}</h2>
        <p className="text-xs text-gray-400">Topic: {topicName}</p>
      </div>
      <p className="text-sm">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags && tags.split(",").map((tag, index) => (
          <p key={index} className="p-1.5 rounded-2xl w-fit text-xs font-bold text-white bg-sky-500">{tag.trim()}</p>
        ))}
      </div>
      <p className="text-xs font-bold uppercase text-sky-500">{type}</p>
    </div>
  )
}

export default StudyMaterialCard