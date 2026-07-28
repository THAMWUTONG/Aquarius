import { useState, useEffect } from "react"

/**
 * Displays a dialog for students to answer questions in a quiz.
 * 
 * @param quizTitle the title of the quiz.
 * @param quizTopic the topic of the quiz.
 * @param durationInMinutes the time limit of the quiz, in minutes.
 * @param questionList the list of questions contained within the quiz.
 */
function QuestionDialog({ quizTitle, quizTopic, durationInMinutes, questionList }) {
  const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60)
  const timeLeftMinutesPart = Math.floor(timeLeft / 60).toString.padStart(2, "0")
  const timeLeftSecondsPart = (timeLeft % 60).toString.padStart(2, "0")

  useEffect(() => {
    // Set an timer that counts down every 1000 miliseconds.
    // Runs cleanup after component unmounts/timer runs out.
    // Runs submission after timer runs out.
    const timer = setInterval(() => {
      setTimeLeft(prev => {
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

  function handleSubmit(e) {
    e.preventDefault()
    const quizForm = e.target
    const formData = new FormData(quizForm)

    const answers = questionList.map((question) => ({
      questionId: question.id,
      selected: formData.get(`question-${question.id}`)
    }))
  }

  return (
    <div className="absolute flex justify-center items-center min-w-screen min-h-screen bg-black/50">
      <div className="max-w-2xl mx-auto border border-gray-300 rounded-xl shadow-md bg-white">
        <div className="flex justify-between items-center p-4 rounded-t-xl text-white bg-sky-500">
          <div>
            <h2 className="text-sm font-bold">{quizTitle}</h2>
            <p className="text-xs">Topic: {quizTopic}</p>
          </div>
          <p>{timeLeftMinutesPart}:{timeLeftSecondsPart}</p>
        </div>
        <form id="quizAttempt" onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 overflow-auto">
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
          </div>
          <div className="flex justify-end items-center p-4 rounded-b-xl text-white bg-sky-500">
            <button className="px-4 py-2 rounded-lg text-sm font-bold text-sky-500 bg-white hover:bg-gray-100 transition-all" type="submit">Submit Answers</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuestionDialog