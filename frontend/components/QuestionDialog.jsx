import { useState, useEffect } from "react"
import { submitQuizAnswers } from "../services/submitQuizAnswersService.jsx"

/**
 * Displays a dialog for students to answer questions in a quiz.
 * 
 * @param quizTitle the title of the quiz.
 * @param quizTopic the topic of the quiz.
 * @param durationInMinutes the time limit of the quiz, in minutes.
 * @param questionList the list of questions contained within the quiz.
 * @param quizId the id of the quiz being attempted.
 */
function QuestionDialog({ quizId, quizTitle, quizTopic, durationInMinutes, questionList, onClose }) {
  const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60)
  const [submitting, setSubmitting] = useState(false)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [answers, setAnswers] = useState([])
  const [explanationList, setExplanationList] = useState([])
  const [totalScorePercentage, setTotalScorePercentage] = useState(0)
  const timeLeftMinutesPart = String(Math.floor(timeLeft / 60)).padStart(2, "0")
  const timeLeftSecondsPart = String(timeLeft % 60).padStart(2, "0")

  useEffect(() => {
    const timer = setInterval(() => {
      if (quizSubmitted) {
        clearInterval(timer)
        return
      }

      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          document.getElementById("quizAttempt").requestSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const quizForm = e.target
    const formData = new FormData(quizForm)

    const submittedAnswers = questionList.map((question) => ({
      questionId: question.id,
      answerId: formData.get(`question-${question.id}`)
    }))

    setAnswers(submittedAnswers)

    try {
      const data = await submitQuizAnswers(quizId, submittedAnswers, formData.get("feedback"))
      setExplanationList(data.explanations || [])
      setTotalScorePercentage(data.result.percentage || 0)
      setQuizSubmitted(true)
    } catch (error) {
      alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="max-w-2xl mx-auto rounded-xl shadow bg-white">
        {quizSubmitted && (
          <>
            <div className="flex justify-between items-center p-4 rounded-t-xl text-white bg-sky-500">
              <div>
                <h2 className="text-lg font-bold">{quizTitle}</h2>
                <p className="text-xs">Review Answers</p>
              </div>
            </div>
            <div>
              <div className="max-h-96 p-6 space-y-4 overflow-auto">
                {questionList.map((question, index) => (
                  <div key={question.id}>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-sky-500">Question {index + 1}</p>
                      <p className="font-bold">{question.question}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 w-full p-2 border border-gray-300 rounded-lg bg-gray-100">
                        <input type="radio" name={`question-${question.id}`} value={question.answer1id} checked={answers[index].answerId == question.answer1id} readOnly/>
                          A {question.answer1}
                      </label>
                      <label className="flex items-center gap-2 w-full p-2 border border-gray-300 rounded-lg bg-gray-100">
                        <input type="radio" name={`question-${question.id}`} value={question.answer2id} checked={answers[index].answerId == question.answer2id} readOnly/>
                          B {question.answer2}
                      </label>
                      <label className="flex items-center gap-2 w-full p-2 border border-gray-300 rounded-lg bg-gray-100">
                        <input type="radio" name={`question-${question.id}`} value={question.answer3id} checked={answers[index].answerId == question.answer3id} readOnly/>
                          C {question.answer3}
                      </label>
                      <label className="flex items-center gap-2 w-full p-2 border border-gray-300 rounded-lg bg-gray-100">
                        <input type="radio" name={`question-${question.id}`} value={question.answer4id} checked={answers[index].answerId == question.answer4id} readOnly/>
                          D {question.answer4}
                      </label>
                      <p className="flex items-center gap-2 w-full p-2 border border-sky-500 rounded-lg bg-sky-100">{explanationList[index] ?? "No Explanations Provided."}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center p-4 rounded-b-xl text-white bg-sky-500">
                <p className="text-white font-bold">Score: {totalScorePercentage}%</p>
                <button className="px-4 py-2 rounded-lg text-sm font-bold text-sky-500 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all" type="button" disabled={submitting} onClick={() => onClose?.()}>
                  Close
                </button>
              </div>
            </div>
          </>
        )}

        {!quizSubmitted && (
          <>
            <div className="flex justify-between items-center p-4 rounded-t-xl text-white bg-sky-500">
              <div>
                <h2 className="text-lg font-bold">{quizTitle}</h2>
                <p className="text-xs">Topic: {quizTopic}</p>
              </div>
              <p>{timeLeftMinutesPart}:{timeLeftSecondsPart}</p>
            </div>
            <form id="quizAttempt" onSubmit={handleSubmit}>
              <div className="max-h-96 p-6 space-y-4 overflow-auto">
                {questionList.map((question, index) => (
                  <div key={question.id}>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-sky-500">Question {index + 1}</p>
                      <p className="font-bold">{question.question}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all">
                        <input type="radio" name={`question-${question.id}`} value={question.answer1id} />
                          A {question.answer1}
                      </label>
                      <label className="flex items-center gap-2 w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all">
                        <input type="radio" name={`question-${question.id}`} value={question.answer2id} />
                          B {question.answer2}
                      </label>
                      <label className="flex items-center gap-2 w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all">
                        <input type="radio" name={`question-${question.id}`} value={question.answer3id} />
                          C {question.answer3}
                      </label>
                      <label className="flex items-center gap-2 w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all">
                        <input type="radio" name={`question-${question.id}`} value={question.answer4id} />
                          D {question.answer4}
                      </label>
                    </div>
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400" htmlFor="feedback">Feedback (Optional)</label>
                  <textarea className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-2 focus:border-sky-500" name="feedback" placeholder="Provide feedback for the quiz..." />
                </div>
              </div>
              <div className="flex justify-end items-center p-4 rounded-b-xl text-white bg-sky-500">
                <button className="px-4 py-2 rounded-lg text-sm font-bold text-sky-500 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Answers'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default QuestionDialog