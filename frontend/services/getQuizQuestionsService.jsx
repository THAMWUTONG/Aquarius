export async function getQuizQuestions(id) {
  const response = await fetch(`/api/QuizQuestion.php?quizId=${encodeURIComponent(id)}`);
  
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve questions.');
  }

  return data.questionList || [];
}