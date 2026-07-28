export async function getQuizData() {
  const response = await fetch('/api/StQuiz.php');

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
}