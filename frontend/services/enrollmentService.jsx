/**
 * Fetches all current student-course enrollments.
 * @returns {Promise<Array>} Resolves with an array of normalized enrollment objects.
 * @throws {Error} If the request fails or the server returns a non-OK response.
 */
export async function fetchEnrollments() {
  let response;

  try {
    response = await fetch('/api/EnrollmentManagement.php?action=enrollments', {
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
    throw new Error(data.message || 'Failed to load enrollments');
  }

  return data.map((e) => ({
    id: e.id,
    studentName: e.student_name,
    courseName: e.course_title,
    status: e.status,
  }));
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

  let response;
  try {
    response = await fetch('/api/EnrollmentManagement.php?action=enroll', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, course_id: courseId }),
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
    throw new Error(data.message || 'Failed to enroll student');
  }

  return data;
}

/**
 * Removes a student from a course by flipping their enrollment status to
 * 'disenrolled' (the schema has no hard-delete for enrollment records).
 * @param {number} enrollmentId
 * @returns {Promise<void>}
 * @throws {Error} If enrollmentId is invalid or the request fails.
 */
export async function disenrollStudent(enrollmentId) {
  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
    throw new Error('A valid enrollment ID is required.');
  }

  let response;
  try {
    response = await fetch('/api/EnrollmentManagement.php?action=update-enrollment', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollment_id: enrollmentId, status: 'disenrolled' }),
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
    throw new Error(data.message || 'Failed to disenroll student');
  }
}