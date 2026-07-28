import { FaArrowRight } from "react-icons/fa"
import QuestionDialog from "./QuestionDialog"
import { getQuizQuestions } from "../services/getQuizQuestionsService"

function QuizCard({ id, courseName, title, topicName, bestScore, durationInMinutes, numberOfQuestions }) {
  async function fetchQuestions() {
    try {
      const questionList = await getQuizQuestions(id)

      return (
        <QuestionDialog quizTitle={title} quizTopic={topicName} durationInMinutes={durationInMinutes} questionList={questionList}/>
      )
    }
    catch (error) {
      alert(error.message)
    }
  }
  return (
    <div className="p-6 border border-gray-300 rounded-xl shadow-md bg-white space-y-4">
      <p className="w-fit p-1 rounded-lg text-sm text-sky-500 bg-sky-100">{courseName}</p>
      <div>
        <h2 className="font-bold">{title}</h2>
        <p className="text-xs text-gray-400">Topic: {topicName}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <p className="text-sm">Best Score:</p>
        <div className="min-w-32 h-2 rounded-xl bg-gray-400">
          <div className={`h-2 rounded-xl ${bestScore < 70 ? "bg-red-500" : "bg-green-500"}`} style={{width: `${bestScore}%`}}></div>
        </div>
        <p className={`text-sm ${bestScore < 70 ? "text-red-500" : "text-green-500"}`}>{bestScore}%</p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-sky-500 font-bold">{numberOfQuestions} questions • {durationInMinutes} minutes</p>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600" onClick={fetchQuestions}>
          Start Quiz<FaArrowRight />
        </button>
      </div>
    </div>
  )
}

export default QuizCard