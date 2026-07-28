/**
 * Fetches the full list of courses (used by Manage Enrollment and
 * Platform Regulation dropdowns/tables).
 * @returns {Promise<Array>} Resolves with an array of course objects.
 * @throws {Error} If the request fails.
 */
export async function fetchCourses() {
  const response = await fetch('/api/courses.php', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load courses');
  }
  return data;
}

/**
 * Updates a course's regulation status.
 * @param {number} courseId
 * @param {"approved"|"rejected"|"flagged"} status
 * @returns {Promise<Object>}
 * @throws {Error} If courseId/status is invalid or the request fails.
 */
export async function updateCourseStatus(courseId, status) {
  const validStatuses = ["approved", "rejected", "flagged"];
  if (!Number.isInteger(courseId) || courseId <= 0) {
    throw new Error('A valid course ID is required.');
  }
  if (!validStatuses.includes(status)) {
    throw new Error(`Status must be one of: ${validStatuses.join(", ")}`);
  }

  const response = await fetch(`/api/courses.php?id=${courseId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update course status');
  }
  return data;
}
