/**
 * Fetches all quizzes for regulation review.
 * @returns {Promise<Array>}
 * @throws {Error} If the request fails.
 */
export async function fetchQuizzes() {
  const response = await fetch('/api/quizzes.php', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load quizzes');
  }
  return data;
}

/**
 * Updates a quiz's regulation status.
 * @param {number} quizId
 * @param {"approved"|"rejected"|"flagged"} status
 * @returns {Promise<Object>}
 * @throws {Error} If quizId/status is invalid or the request fails.
 */
export async function updateQuizStatus(quizId, status) {
  const validStatuses = ["approved", "rejected", "flagged"];
  if (!Number.isInteger(quizId) || quizId <= 0) {
    throw new Error('A valid quiz ID is required.');
  }
  if (!validStatuses.includes(status)) {
    throw new Error(`Status must be one of: ${validStatuses.join(", ")}`);
  }

  const response = await fetch(`/api/quizzes.php?id=${quizId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update quiz status');
  }
  return data;
}
