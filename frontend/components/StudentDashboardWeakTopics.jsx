import { FaArrowRight } from "react-icons/fa"
import { NavLink } from "react-router"

function StudentDashboardWeakTopics({ weakTopicsArray }) {
  if (weakTopicsArray.length === 0) {
    return (
      <p className="text-lg text-center">
        You currently do not have any weak topics!
      </p>
    )
  }
  else {
    return (
      <>
        <p className="text-sm text-gray-400">
          You have achieved less than 70% on average in these topics, we recommend you to focus on these areas.
        </p>
        {weakTopicsArray.map((weakTopic) => (
          <div key={weakTopic.id} class="flex justify-between items-center p-4 rounded-lg border border-sky-500 bg-sky-50">
            <div>
              <h3 className="text-sm font-bold">{weakTopic.topicTitle}</h3>
              <p className="text-xs text-gray-400">Average Score: {weakTopic.averagePercentage}%</p>
            </div>
            <NavLink to="/study-materials" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-sky-500">
              Study<FaArrowRight />
            </NavLink>
          </div>
        ))}
      </>
    )
  }
}
 
export default StudentDashboardWeakTopics