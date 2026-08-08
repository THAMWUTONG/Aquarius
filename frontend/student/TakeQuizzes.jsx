import Sidebar from "../components/Sidebar.jsx"
import HeaderBar from "../components/HeaderBar.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import QuizCard from "../components/QuizCard.jsx"
import QuestionDialog from "../components/QuestionDialog.jsx"
import { getQuizData } from "../services/getQuizService.jsx"
import { getQuizQuestions } from "../services/getQuizQuestionsService.jsx"

function TakeQuizzes(){
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [quizData, setQuizData] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [questionList, setQuestionList] = useState([])
  const [showQuestionDialog, setShowQuestionDialog] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/")
    }
  }, [user, navigate])
  
  useEffect(() => {
    async function fetchQuizData() {
      try {
        setLoading(true)
        const data = await getQuizData()
        setQuizData(data.quizzes || [])
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

  async function handleStartQuiz(quiz) {
    try {
      setLoading(true)
      const questions = await getQuizQuestions(quiz.id)
      setSelectedQuiz(quiz)
      setQuestionList(questions || [])
      setShowQuestionDialog(true)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  function closeQuestionDialog() {
    setShowQuestionDialog(false)
    setSelectedQuiz(null)
    setQuestionList([])
  }

  if (!user || user.role !== "student") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <HeaderBar displayedTitle="Quizzes" userName={ user.name } userRole={ user.role } />
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          {loading && (
            <div className="rounded-xl bg-white p-6 shadow-sm text-gray-600">Loading quizzes...</div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quizData.length > 0 ? (
                quizData.map((quiz) => (
                  <QuizCard key={quiz.id} id={quiz.id} courseName={quiz.courseName} title={quiz.title} topicName={quiz.topicName} bestScore={quiz.bestScore ?? 0} numberOfQuestions={quiz.numberOfQuestions} durationInMinutes={quiz.durationInMinutes} onStartQuiz={() => handleStartQuiz(quiz)} />
                ))
              ) : (
                <div className="rounded-xl bg-white p-6 shadow-sm text-gray-600 col-span-2">No quizzes available.</div>
              )}
            </div>
          )}

          {showQuestionDialog && selectedQuiz && (
            <QuestionDialog quizId={selectedQuiz.id} quizTitle={selectedQuiz.title} quizTopic={selectedQuiz.topicName} durationInMinutes={selectedQuiz.durationInMinutes} questionList={questionList} onClose={closeQuestionDialog} />
          )}
        </div>
      </main>
    </div>
  )
}

export default TakeQuizzes