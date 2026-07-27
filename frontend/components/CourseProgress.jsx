function CourseProgress({ courseName, completionPercentage }) {
  return (
    <div>
      <div className="flex justify-between">
        <p className="text-sm">{ courseName }</p>
        <p className="text-sm font-bold text-sky-500">{ completionPercentage }%</p>
      </div>
      <div className="h-2 rounded-xl bg-gray-400">
        <div className="h-2 rounded-xl bg-sky-500" style={{width: `${completionPercentage}%`}}></div>
      </div>
    </div>
  )
}

export default CourseProgress