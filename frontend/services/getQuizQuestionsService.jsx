export async function getQuizQuestions(id) {
  const response = await fetch('/api/StQuizQuestions.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve questions.');
  }

  return data;
}