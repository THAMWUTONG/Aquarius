import Sidebar from "../components/Sidebar.jsx"
import HeaderBar from "../components/HeaderBar.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import QuizCard from "../components/QuizCard.jsx"
import { getQuizData } from "../services/getQuizService.jsx"

function TakeQuizzes(){
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [quizData, setQuizData] = useState(null)

  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/")
    }
  }, [user, navigate])
  
  useEffect(() => {
    async function fetchQuizData() {
      try {
        const quizData = await getQuizData()
        setQuizData(quizData)
      }
      catch (error) {
        alert(error.message)
      }
      finally {
        setLoading(false)
      }
    }

    fetchQuizData()
  }, [user])

  if (!user || user.role !== "student" || loading) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <HeaderBar displayedTitle="Quizzes" userName={ user.name } userRole={ user.role } />
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <QuizCard courseName={ "Database Systems" } title={ "Introductory SQL Querying" } topicName={ "SQL Basics" } bestScore={ 50 } numberOfQuestions={ 2 } durationInMinutes={ 50 } />
            <QuizCard courseName={ "Database Systems" } title={ "Introductory SQL Querying" } topicName={ "SQL Basics" } bestScore={ 70 } numberOfQuestions={ 2 } durationInMinutes={ 50 } />
            <QuizCard courseName={ "Database Systems" } title={ "Introductory SQL Querying" } topicName={ "SQL Basics" } bestScore={ 100 } numberOfQuestions={ 2 } durationInMinutes={ 50 } />
          </div>
        </div>
      </main>
    </div>
  )
}

export default TakeQuizzes