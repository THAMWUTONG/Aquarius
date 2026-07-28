/**
 * Fetches all current student-course enrollments.
 * @returns {Promise<Array>} Resolves with an array of { id, studentId, studentName, courseId, courseName }.
 * @throws {Error} If the request fails.
 */
export async function fetchEnrollments() {
  const response = await fetch('/api/enrollments.php', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load enrollments');
  }
  return data;
}

/**
 * Enrolls a student into a course.
 * @param {number} studentId
 * @param {number} courseId
 * @returns {Promise<Object>} Resolves with the created enrollment record.
 * @throws {Error} If studentId/courseId is invalid or the request fails.
 */
export async function enrollStudent(studentId, courseId) {
  if (!Number.isInteger(studentId) || studentId <= 0) {
    throw new Error('A valid student must be selected.');
  }
  if (!Number.isInteger(courseId) || courseId <= 0) {
    throw new Error('A valid course must be selected.');
  }

  const response = await fetch('/api/enrollments.php', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, courseId }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to enroll student');
  }
  return data;
}

/**
 * Removes a student from a course.
 * @param {number} enrollmentId
 * @returns {Promise<void>}
 * @throws {Error} If enrollmentId is invalid or the request fails.
 */
export async function disenrollStudent(enrollmentId) {
  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
    throw new Error('A valid enrollment ID is required.');
  }

  const response = await fetch(`/api/enrollments.php?id=${enrollmentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to disenroll student');
  }
}
