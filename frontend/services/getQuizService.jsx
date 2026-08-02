export async function getQuizData() {
  const response = await fetch('/api/StQuizzes.php');

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve quizzes.');
  }

  return data;
}