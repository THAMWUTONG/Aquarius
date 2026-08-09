import Sidebar from "../components/Sidebar.jsx"
import HeaderBar from "../components/HeaderBar.jsx"
import { useNavigate } from "react-router"
import { useAuth } from "../context/AuthContext.jsx"
import { useEffect } from "react"
import { FaChartBar, FaChartLine, FaClipboardList } from "react-icons/fa"
import CourseProgress from "../components/CourseProgress.jsx"
import ScoreHistoryEntry from "../components/ScoreHistoryEntry.jsx"
import ImprovementTrend from "../components/ImprovementTrend.jsx"

function PerformanceOverview(){
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/")
    }
  }, [user, navigate])
  
  if (!user || user.role !== "student") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <HeaderBar displayedTitle="Performance Overview" userName={ user.name } userRole={ user.role } />
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          {loading && (
            <div className="rounded-xl bg-white p-6 shadow-sm text-gray-600">Loading performance overview...</div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 border border-gray-300 rounded-xl bg-white space-y-4">
                <div className="flex items-center gap-2">
                  <FaChartBar className="text-sky-500"/>
                  <h2 className="text-lg font-bold">Course Progress</h2>
                </div>
                <hr className="text-gray-300"></hr>
                <div className="space-y-2">
                  <CourseProgress courseName={ "placeholder" } completionPercentage={ 45 } />
                  <CourseProgress courseName={ "placeholder" } completionPercentage={ 50 } />
                </div>
              </div>
              <div className="p-6 border border-gray-300 rounded-xl bg-white space-y-4">
                <div className="flex items-center gap-2">
                  <FaClipboardList className="text-sky-500"/>
                  <h2 className="text-lg font-bold">Score History</h2>
                </div>
                <hr className="text-gray-300"></hr>
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-center">
                    <thead>
                      <tr>
                        <th className="pb-1.5 text-sm font-bold">QUIZ TITLE</th>
                        <th className="pb-1.5 text-sm font-bold">ATTEMPTED AT</th>
                        <th className="pb-1.5 text-sm font-bold">SCORE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoreHistory.map((entry) => (
                        <ScoreHistoryEntry key={entry.attemptId} quizName={entry.quizTitle} attemptedAt={entry.attemptedAt} score={entry.score} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-6 border border-gray-300 rounded-xl bg-white space-y-4 sm:col-span-2">
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-sky-500"/>
                  <h2 className="text-lg font-bold">Improvement Trends</h2>
                </div>
                <hr className="text-gray-300"></hr>
                <table className="w-full text-center">
                  <thead>
                    <tr>
                      <th className="pb-1.5 text-sm font-bold">TOPIC</th>
                      <th className="pb-1.5 text-sm font-bold">ATTEMPTS</th>
                      <th className="pb-1.5 text-sm font-bold">FIRST VS LAST</th>
                      <th className="pb-1.5 text-sm font-bold">TREND</th>
                    </tr>
                  </thead>
                  <tbody>
                    <ImprovementTrend topicName={ "placeholder" } totalAttempts={ 3 } firstScore={ 75 } lastScore={ 100 } />
                    <ImprovementTrend topicName={ "placeholder" } totalAttempts={ 2 } firstScore={ 100 } lastScore={ 50 } />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default PerformanceOverview