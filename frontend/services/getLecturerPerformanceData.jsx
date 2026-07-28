/**
 * Analytics for the Monitor Performance page.
 *
 * courseId / quizId narrow the gradebook. Both are optional - omitting them
 * returns every enrolled student across all of the lecturer's courses.
 */
export async function getLecturerPerformanceData({ courseId, quizId } = {}) {
  const params = new URLSearchParams();

  // Only send a parameter when it has a real value: the backend treats an
  // empty string as "no filter", but leaving it out keeps the URL readable.
  if (courseId) {
    params.set('course_id', courseId);
  }
  if (quizId) {
    params.set('quiz_id', quizId);
  }

  const query = params.toString();
  const response = await fetch(`/api/LecPerformance.php${query ? `?${query}` : ''}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve performance analytics.');
  }

  return data;
}
