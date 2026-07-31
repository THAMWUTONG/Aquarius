export async function getLecturerQuizzes() {
  const response = await fetch('/api/LecQuizzes.php');

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve quizzes.');
  }

  return data;
}
