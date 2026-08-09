function StudentActiveCourses({ activeCoursesArray }) {
  if (activeCoursesArray.length === 0) {
    return (
      <p className="text-sm text-center">You currently do not have any active courses.</p>
    )
  }
  else {
    return (
      activeCoursesArray.map((course) => (
        <div key={course.id} className="flex justify-between">
          <h3 className="text-sm">{course.title}</h3>
          <h3 className="text-sm text-right">{course.enrolledAt}</h3> 
        </div>
      ))
    )
  }
}

export default StudentActiveCourses