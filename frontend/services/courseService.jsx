/**
 * Fetches the full list of courses, used to populate the enroll-student
 * course dropdown on Manage Enrollment.
 * @returns {Promise<Array>} Resolves with an array of { id, title } course objects.
 * @throws {Error} If the request fails or the server returns a non-OK response.
 */
export async function fetchCourses() {
  let response;

  try {
    response = await fetch('/api/EnrollmentManagement.php?action=courses', {
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
    throw new Error(data.message || 'Failed to load courses');
  }

  return data;
}