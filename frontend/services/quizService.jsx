export async function fetchQuizzes() {
  const response = await fetch('/api/PlatformRegulation.php?action=all-quizzes', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load quizzes');
  }
  return data.map((q) => ({ id: q.id, title: q.title, courseName: q.course_title, status: q.regulation_status }));
}

export async function updateQuizStatus(quizId, status) {
  const validStatuses = ["approved", "rejected", "flagged"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Status must be one of: ${validStatuses.join(", ")}`);
  }

  const response = await fetch('/api/PlatformRegulation.php?action=regulate-quiz', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quiz_id: quizId, status }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update quiz status');
  }
  return data;
}
