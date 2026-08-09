export async function submitQuizAnswers(quizId, answers, feedback) {
  const response = await fetch('/api/SubmitQuiz.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quizId, answers, feedback })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit quiz answers.');
  }

  return data;
}
