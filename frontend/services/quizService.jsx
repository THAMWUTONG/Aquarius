/**
 * Fetches all quizzes (any regulation status) for the Platform Regulation table.
 * @returns {Promise<Array>} Resolves with an array of normalized quiz objects.
 * @throws {Error} If the request fails or the server returns a non-OK response.
 */
export async function fetchQuizzes() {
  let response;

  try {
    response = await fetch('/api/PlatformRegulation.php?action=all-quizzes', {
      method: 'GET',
      credentials: 'include',
    });
  } catch (networkError) {
    throw new Error('Unable to reach the server. Please check your connection.');
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('Received an invalid response from the server.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load quizzes');
  }

  return data.map((q) => ({
    id: q.id,
    title: q.title,
    courseName: q.course_title,
    status: q.regulation_status,
  }));
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

  let response;
  try {
    response = await fetch('/api/PlatformRegulation.php?action=regulate-quiz', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz_id: quizId, status }),
    });
  } catch (networkError) {
    throw new Error('Unable to reach the server. Please check your connection.');
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('Received an invalid response from the server.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update quiz status');
  }

  return data;
}